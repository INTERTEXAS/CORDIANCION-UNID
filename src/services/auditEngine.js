// src/services/auditEngine.js
import { CARRERAS_LOCAL, REQUISITOS_EGRESO } from '../data/carrerasData.js';

function checkPassed(calif) {
  if (!calif) return false;
  const s = String(calif).trim().toUpperCase();
  if (s === 'AC') return true;
  const n = parseFloat(s);
  return !isNaN(n) && n >= 6;
}

function checkFailed(calif) {
  if (!calif) return false;
  const s = String(calif).trim().toUpperCase();
  if (s === 'NP' || s === 'NA') return true;
  const n = parseFloat(s);
  return !isNaN(n) && n < 6;
}
import { detectarModalidad } from './pdfParser.js';

export function runAcademicAudit(estudiante, registros = [], carrera = CARRERAS_LOCAL[0]) {
  // Asegurarnos de detectar la modalidad si no viene calculada
  if (!estudiante.modalidadDetectada) {
    detectarModalidad(estudiante, registros);
  }
  
  // Asignar dinámicamente la carrera basada en el programa detectado, si existe en local/neon
  let carreraEfectiva = carrera;
  if (estudiante.programa && carrera.codigo !== estudiante.programa) {
    const c = CARRERAS_LOCAL.find(c => c.codigo === estudiante.programa);
    if (c) carreraEfectiva = c;
  }

  const mapa = carreraEfectiva.mapa_json || CARRERAS_LOCAL[0].mapa_json;
  const cuatrimestresRaw = mapa.cuatrimestres || [];
  const electivasRaw = mapa.electivas_multidisciplinares || [];

  // Normalizar la estructura del mapa (compatible tanto con Neon DB como con respaldo local)
  const cuatrimestres = cuatrimestresRaw.map(c => ({
    ...c,
    numero: c.numero,
    nombre: c.nombre || `${c.numero}.º Cuat.`,
    con_ingles: c.con_ingles !== undefined ? c.con_ingles : Boolean(c.ingles),
    materias: (c.materias || []).map(m => {
      const subj = (m.subj || (m.clave ? m.clave.split('-')[0] : 'LMAX')).toUpperCase();
      const crse = (m.crse || (m.clave ? m.clave.split('-')[1] : '')).toUpperCase();
      return {
        ...m,
        subj,
        crse,
        clave: m.clave || `${subj}-${crse}`,
        conecta: m.conecta !== undefined ? m.conecta : Boolean(m.cc),
        creditos_bh: m.creditos_bh || m.bh || 1,
        es_estadia: Boolean(m.es_estadia)
      };
    })
  }));

  const electivasMultidisciplinares = electivasRaw.map(el => {
    const subj = (el.subj || (el.clave ? el.clave.split('-')[0] : 'LMAX')).toUpperCase();
    const crse = (el.crse || (el.clave ? el.clave.split('-')[1] : '')).toUpperCase();
    return {
      ...el,
      subj,
      crse,
      clave: el.clave || `${subj}-${crse}`
    };
  });

  // 1. Normalizar registros extraídos del PDF
  const normalizedRecords = registros.map(r => {
    let crse = (r.crse || '').toUpperCase().trim();
    if (crse === 'CFTD8') crse = 'CFT08';
    if (crse === 'MT02' || crse === 'MT 02') crse = 'MTS02';
    const subj = (r.subj || '').toUpperCase().trim();
    const calif = r.calificacion !== undefined && r.calificacion !== null ? String(r.calificacion).trim() : '';
    const esAprob = checkPassed(calif);
    const esReprob = checkFailed(calif);
    const estaCurs = !calif || calif === '';
    return {
      ...r,
      crse,
      subj,
      claveCompleta: `${subj}-${crse}`,
      calificacion: calif,
      modalidad: (r.modalidad || 'RW').toUpperCase(),
      esAprobada: esAprob,
      esReprobada: esReprob,
      estaCursando: estaCurs
    };
  });

  // Ordenar cronológicamente por periodo
  normalizedRecords.sort((a, b) => (parseInt(a.periodo, 10) || 0) - (parseInt(b.periodo, 10) || 0));

  const primerPeriodoAlumno = normalizedRecords.length > 0 ? normalizedRecords[0].periodo : null;

  // 2. Comprobar exención de inglés LENG-0008 (AC)
  const exentoIngles = normalizedRecords.some(r =>
    (r.crse === '0008' || r.crse === 'LENG-0008') && (r.calificacion === 'AC' || parseFloat(r.calificacion) >= 6)
  );

  // 3. Mapear cada una de las 37 materias del mapa por su CRSE único
  let maxCuatrimestreAlcanzado = 1;
  const periodosCursados = [...new Set(normalizedRecords.map(r => r.periodo).filter(Boolean))].sort();

  const subjectMapAttempts = new Map();
  for (const c of cuatrimestres) {
    for (const mat of c.materias) {
      const attempts = normalizedRecords.filter(r =>
        r.crse === mat.crse ||
        r.claveCompleta === mat.clave ||
        (mat.alias_corregir && r.crse === mat.alias_corregir)
      );
      if (attempts.length > 0 && c.numero > maxCuatrimestreAlcanzado) {
        maxCuatrimestreAlcanzado = c.numero;
      }
      // Usar mat.crse como llave única garantizada
      subjectMapAttempts.set(mat.crse, attempts);
    }
  }

  if (periodosCursados.length >= 6) {
    maxCuatrimestreAlcanzado = Math.max(maxCuatrimestreAlcanzado, 6);
  }
  if (estudiante.estatus === 'EG') {
    maxCuatrimestreAlcanzado = cuatrimestres.length;
  }

  // 4. Evaluar cada asignatura del mapa curricular oficial
  const auditedCuatrimestres = [];
  const incidencias = [];
  let totalAprobadasOrd = 0;
  let totalAprobadasRec = 0;
  let totalAprobadasRe = 0;
  let totalAdeudos = 0;
  let totalOmitidas = 0;
  let totalCursando = 0;
  let totalPendientes = 0;

  const adeudosQ1toQ6 = [];
  const omitidasQ1toQ6 = [];

  for (const cuat of cuatrimestres) {
    const auditedMaterias = [];

    for (const materia of cuat.materias) {
      const attempts = subjectMapAttempts.get(materia.crse) || [];
      const auditResult = evaluateSubjectAttempts(
        materia,
        attempts,
        cuat.numero,
        maxCuatrimestreAlcanzado,
        primerPeriodoAlumno
      );

      switch (auditResult.estado) {
        case 'ORD':
          totalAprobadasOrd++;
          break;
        case 'REC':
          totalAprobadasRec++;
          break;
        case 'RE':
          totalAprobadasRe++;
          break;
        case 'ADEUDO':
          totalAdeudos++;
          if (cuat.numero <= 6) {
            adeudosQ1toQ6.push({ ...materia, ...auditResult, cuatrimestre: cuat.numero });
          }
          break;
        case 'OMITIDA':
          totalOmitidas++;
          if (cuat.numero <= 6) {
            omitidasQ1toQ6.push({ ...materia, ...auditResult, cuatrimestre: cuat.numero });
          }
          break;
        case 'CURSANDO':
        case 'RECURSANDO':
          totalCursando++;
          break;
        case 'PENDIENTE':
          totalPendientes++;
          break;
      }

      if (['REC', 'RE', 'ADEUDO', 'OMITIDA', 'RECURSANDO'].includes(auditResult.estado) || auditResult.tieneDesfase) {
        incidencias.push({
          cuatrimestre: cuat.numero,
          clave: materia.clave,
          nombre: materia.nombre,
          conecta: materia.conecta,
          esEstadia: materia.es_estadia || false,
          estado: auditResult.estado,
          etiquetaCorta: auditResult.etiquetaCorta,
          intentosTotal: auditResult.numIntentos,
          vecesRecurso: auditResult.vecesRecurso,
          historialTexto: auditResult.historialTexto,
          intentosDetalle: attempts,
          tieneDesfase: auditResult.tieneDesfase,
          motivoIncidencia: auditResult.motivoIncidencia
        });
      }

      auditedMaterias.push({
        ...materia,
        audit: auditResult
      });
    }

    auditedCuatrimestres.push({
      numero: cuat.numero,
      nombre: cuat.nombre,
      con_ingles: cuat.con_ingles,
      materias: auditedMaterias
    });
  }

  // 5. Evaluar niveles de inglés (Cuatrimestres 1 a 5: F001, F002, F003, F004, P001)
  const auditedIngles = [];
  const nivelesInglesArr = mapa.niveles_ingles === 0 ? [] : (mapa.niveles_ingles || [
    { nivel: 1, cuatrimestre: 1, claveSugerida: 'F001', nombre: 'INGLÉS I' },
    { nivel: 2, cuatrimestre: 2, claveSugerida: 'F002', nombre: 'INGLÉS II' },
    { nivel: 3, cuatrimestre: 3, claveSugerida: 'F003', nombre: 'INGLÉS III' },
    { nivel: 4, cuatrimestre: 4, claveSugerida: 'F004', nombre: 'INGLÉS IV' },
    { nivel: 5, cuatrimestre: 5, claveSugerida: 'P001', nombre: 'INGLÉS V' },
  ]);

  let inglesAcreditados = 0;
  for (const item of nivelesInglesArr) {
    let claveSugerida = item.claveSugerida || item.clave_default;
    if (exentoIngles) {
      auditedIngles.push({
        nivel: item.nivel,
        cuatrimestre: item.cuatrimestre,
        clave: claveSugerida,
        nombre: item.nombre,
        estado: 'ORD',
        etiquetaCorta: 'EXENTO',
        calificacion: 'AC',
        modalidad: 'RW',
        numIntentos: 1,
        historialTexto: 'Acreditado mediante Exención Institucional (LENG-0008)',
        color: '#059669',
        bgColor: '#ECFDF5'
      });
      inglesAcreditados++;
    } else {
      const attempts = normalizedRecords.filter(r => r.crse === claveSugerida);
      const evalIngles = evaluateSubjectAttempts(
        { clave: `LENG-${claveSugerida}`, crse: claveSugerida, nombre: item.nombre },
        attempts,
        item.cuatrimestre,
        maxCuatrimestreAlcanzado,
        primerPeriodoAlumno
      );

      if (['ORD', 'REC', 'RE'].includes(evalIngles.estado)) {
        inglesAcreditados++;
      } else if (evalIngles.estado === 'ADEUDO') {
        adeudosQ1toQ6.push({
          clave: `LENG-${claveSugerida}`,
          nombre: item.nombre,
          cuatrimestre: item.cuatrimestre,
          ...evalIngles
        });
      }

      if (['REC', 'RE', 'ADEUDO', 'OMITIDA'].includes(evalIngles.estado)) {
        incidencias.push({
          cuatrimestre: item.cuatrimestre,
          clave: `LENG-${claveSugerida}`,
          nombre: item.nombre,
          conecta: false,
          esEstadia: false,
          estado: evalIngles.estado,
          etiquetaCorta: evalIngles.etiquetaCorta,
          intentosTotal: evalIngles.numIntentos,
          vecesRecurso: evalIngles.vecesRecurso,
          historialTexto: evalIngles.historialTexto,
          intentosDetalle: attempts,
          tieneDesfase: false,
          motivoIncidencia: evalIngles.motivoIncidencia
        });
      }

      auditedIngles.push({
        nivel: item.nivel,
        cuatrimestre: item.cuatrimestre,
        clave: claveSugerida,
        nombre: item.nombre,
        ...evalIngles
      });
    }
  }

  // 6. Evaluar Electivas Multidisciplinares
  const auditedElectivas = electivasMultidisciplinares.map(elec => {
    const attempts = normalizedRecords.filter(r => r.crse === elec.crse);
    const estaCursada = attempts.some(a => a.esAprobada);
    const estaCursando = attempts.some(a => a.estaCursando);
    const ultimoIntento = attempts[attempts.length - 1];
    return {
      ...elec,
      cursada: estaCursada,
      cursando: estaCursando,
      calificacion: ultimoIntento ? ultimoIntento.calificacion : '',
      periodo: ultimoIntento ? ultimoIntento.periodo : ''
    };
  });

  // 7. Evaluar Requisitos Co-Curriculares y de Titulación / Egreso
  const auditedCoCurriculares = [];
  const adeudosReqEgreso = [];
  const omitidasReqEgreso = [];
  let coCurricularesAcreditados = 0;

  for (const req of (REQUISITOS_EGRESO || [])) {
    const reqCrse = (req.crse || (req.clave ? req.clave.split('-')[1] : '')).toUpperCase();
    const attempts = normalizedRecords.filter(r => r.crse === reqCrse);

    if (attempts.length > 0) {
      const evalReq = evaluateSubjectAttempts(req, attempts, 9, maxCuatrimestreAlcanzado, primerPeriodoAlumno);

      if (['ORD', 'REC', 'RE'].includes(evalReq.estado)) {
        coCurricularesAcreditados++;
      } else if (evalReq.estado === 'ADEUDO') {
        adeudosReqEgreso.push({ ...req, ...evalReq, cuatrimestre: 'EGR' });
        totalAdeudos++;
      }

      if (['REC', 'RE', 'ADEUDO'].includes(evalReq.estado)) {
        incidencias.push({
          cuatrimestre: 'EGR',
          clave: req.clave,
          nombre: req.nombre,
          conecta: false,
          esEstadia: false,
          estado: evalReq.estado,
          etiquetaCorta: evalReq.etiquetaCorta,
          intentosTotal: evalReq.numIntentos,
          vecesRecurso: evalReq.vecesRecurso || 0,
          historialTexto: evalReq.historialTexto,
          intentosDetalle: attempts,
          tieneDesfase: false,
          motivoIncidencia: evalReq.estado === 'ADEUDO'
            ? 'Adeudo activo en requisito de titulación / egreso (EGEL / Co-curricular)'
            : 'Requisito de egreso acreditado con observación'
        });
      }

      auditedCoCurriculares.push({
        ...req,
        ...evalReq
      });
    } else {
      const esEgresadoOAvanzado = (estudiante.estatus === 'EG' || maxCuatrimestreAlcanzado >= 6);

      if (esEgresadoOAvanzado) {
        const auditOmitida = {
          estado: 'OMITIDA',
          etiquetaCorta: 'OMITIDA',
          calificacion: 'NO CURSÓ',
          modalidad: '--',
          numIntentos: 0,
          vecesRecurso: 0,
          color: '#EA580C',
          bgColor: '#FFF7ED',
          icono: 'AlertTriangle',
          historialTexto: 'No registra inscripción en kárdex oficial',
          intentosDetalle: [],
          tieneDesfase: false,
          motivoIncidencia: 'Requisito obligatorio omitido / no cursado'
        };

        omitidasReqEgreso.push({ ...req, ...auditOmitida, cuatrimestre: 'EGR' });
        totalOmitidas++;

        incidencias.push({
          cuatrimestre: 'EGR',
          clave: req.clave,
          nombre: req.nombre,
          conecta: false,
          esEstadia: false,
          estado: 'OMITIDA',
          etiquetaCorta: 'OMITIDA',
          intentosTotal: 0,
          vecesRecurso: 0,
          historialTexto: 'No registra inscripción en kárdex oficial',
          intentosDetalle: [],
          tieneDesfase: false,
          motivoIncidencia: 'Requisito obligatorio omitido / no cursado'
        });

        auditedCoCurriculares.push({
          ...req,
          ...auditOmitida
        });
      } else {
        auditedCoCurriculares.push({
          ...req,
          estado: 'PENDIENTE',
          etiquetaCorta: 'PEND.',
          calificacion: '--',
          modalidad: '--',
          numIntentos: 0,
          color: '#64748B',
          bgColor: '#F8FAFC',
          historialTexto: 'Pendiente de cursar'
        });
      }
    }
  }

  // 8. Dictamen Normativo Institucional y de Estadía
  const tieneAdeudosQ1toQ6 = (adeudosQ1toQ6.length > 0 || omitidasQ1toQ6.length > 0);
  const tieneAdeudosEgreso = (adeudosReqEgreso.length > 0 || omitidasReqEgreso.length > 0);

  let esElegibleEstadia = false;
  let dictamenEstadia = '';

  if (tieneAdeudosEgreso) {
    dictamenEstadia = 'NO ACREDITADO / ADEUDO EN REQUISITOS DE EGRESO (EGEL / CO-CURRICULAR)';
    esElegibleEstadia = false;
  } else if (tieneAdeudosQ1toQ6) {
    dictamenEstadia = 'RETENIDO POR ADEUDO ACADÉMICO';
    esElegibleEstadia = false;
  } else {
    dictamenEstadia = '100% APROBADO / ELEGIBLE PARA ESTADÍA Y TITULACIÓN';
    esElegibleEstadia = true;
  }

  const materiasPrioritarias = [
    ...adeudosQ1toQ6,
    ...omitidasQ1toQ6,
    ...adeudosReqEgreso,
    ...omitidasReqEgreso
  ].map(m => ({
    clave: m.clave,
    nombre: m.nombre,
    cuatrimestre: m.cuatrimestre,
    tipo: m.estado === 'ADEUDO' ? 'Adeudo Activo' : 'Materia Omitida',
    conecta: Boolean(m.conecta)
  }));

  // === ANÁLISIS DE COHERENCIA CURRICULAR ===
  const excludeClavesComunes = ['LENG', 'INHH', 'CIAN', 'PROP', 'TUPR', 'TPEG', 'HUS01', 'HUS02', 'HUS03', 'HUS04', 'HUS05', 'HUS06', 'HTS01', 'EDS01', 'CMS01', 'CMS02', 'CMS03'];
  const clavesMapaActual = new Set();
  cuatrimestres.forEach(c => c.materias.forEach(m => clavesMapaActual.add(m.crse)));
  electivasMultidisciplinares.forEach(e => clavesMapaActual.add(e.crse));

  let materiasCoincidentes = 0;
  const materiasHuerfanas = [];

  registros.forEach(r => {
    if (excludeClavesComunes.includes(r.subj) || excludeClavesComunes.includes(r.crse)) return;
    if (clavesMapaActual.has(r.crse)) {
      materiasCoincidentes++;
    } else {
      materiasHuerfanas.push(r);
    }
  });

  let alertaCarreraAjena = null;
  const huerfanasCrse = materiasHuerfanas.map(m => m.crse);
  
  if (huerfanasCrse.some(c => c.startsWith('EDR') || c.startsWith('PER') || c.startsWith('PSR'))) alertaCarreraAjena = 'Educación';
  else if (huerfanasCrse.some(c => c.startsWith('DES'))) alertaCarreraAjena = 'Derecho';
  else if (huerfanasCrse.some(c => c.startsWith('MKS') || c.startsWith('MKT'))) alertaCarreraAjena = 'Mercadotecnia';

  // carreraSugerida se infiere del programa detectado previamente
  const carreraSugerida = estudiante.programa;

  return {
    estudiante,
    carrera,
    cuatrimestres: auditedCuatrimestres,
    ingles: auditedIngles,
    coCurriculares: auditedCoCurriculares,
    exentoIngles,
    electivas: auditedElectivas,
    resumen: {
      totalMateriasMapa: cuatrimestres.reduce((acc, cuat) => acc + cuat.materias.length, 0),
      nivelesIngles: mapa.niveles_ingles === 0 ? 0 : (mapa.niveles_ingles ? mapa.niveles_ingles.length : 5),
      inglesAcreditados,
      requisitosEgresoTotal: 4,
      coCurricularesAcreditados,
      aprobadasOrd: totalAprobadasOrd,
      aprobadasRec: totalAprobadasRec,
      aprobadasRe: totalAprobadasRe,
      totalAprobadas: totalAprobadasOrd + totalAprobadasRec + totalAprobadasRe,
      adeudos: totalAdeudos,
      omitidas: totalOmitidas,
      cursando: totalCursando,
      pendientes: totalPendientes,
      adeudosQ1toQ6: adeudosQ1toQ6.length,
      omitidasQ1toQ6: omitidasQ1toQ6.length,
      adeudosReqEgreso: adeudosReqEgreso.length,
      omitidasReqEgreso: omitidasReqEgreso.length,
      esElegibleEstadia,
      dictamenEstadia
    },
    incidencias,
    materiasPrioritarias,
    coherencia: {
      materiasCoincidentes,
      materiasHuerfanas,
      alertaCarreraAjena,
      carreraSugerida
    },
    fechaConsulta: new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  };
}

function evaluateSubjectAttempts(materia, attempts, cuatrimestreNum, maxCuatrimestreAlcanzado, primerPeriodoAlumno) {
  if (!attempts || attempts.length === 0) {
    if (cuatrimestreNum <= maxCuatrimestreAlcanzado) {
      return {
        estado: 'OMITIDA',
        etiquetaCorta: 'OMITIDA',
        calificacion: 'NO CURSÓ',
        modalidad: '--',
        numIntentos: 0,
        vecesRecurso: 0,
        color: '#EA580C',
        bgColor: '#FFF7ED',
        icono: 'AlertTriangle',
        historialTexto: `No se cargó en su cuatrimestre curricular (${cuatrimestreNum}.º)`,
        tieneDesfase: false,
        motivoIncidencia: 'Asignatura no cursada en el periodo correspondiente'
      };
    }
    return {
      estado: 'PENDIENTE',
      etiquetaCorta: 'PEND.',
      calificacion: '--',
      modalidad: '--',
      numIntentos: 0,
      vecesRecurso: 0,
      color: '#64748B',
      bgColor: '#FFFFFF',
      icono: 'Clock',
      historialTexto: 'Por cursar en cuatrimestre posterior',
      tieneDesfase: false,
      motivoIncidencia: null
    };
  }

  const numIntentos = attempts.length;
  const ultimoIntento = attempts[numIntentos - 1];
  const primerIntento = attempts[0];
  const penultimoIntento = numIntentos > 1 ? attempts[numIntentos - 2] : null;

  const calif = (ultimoIntento.calificacion || '').trim().toUpperCase();
  const esAprobada = checkPassed(calif);
  const esReprobada = checkFailed(calif);
  const estaCursando = !calif || calif === '';

  // Detectar si una materia de 1.º cuatrimestre se cargó con desfase en periodos posteriores
  const tieneDesfase = Boolean(
    cuatrimestreNum === 1 &&
    primerPeriodoAlumno &&
    primerIntento.periodo &&
    primerIntento.periodo > primerPeriodoAlumno &&
    numIntentos === 1
  );

  const historialTexto = attempts.map((at, idx) =>
    `Intento ${idx + 1} (${at.periodo}): ${at.calificacion || 'Cursando'} [${at.modalidad || 'RW'}]`
  ).join(' -> ');

  if (estaCursando) {
    const esRec = numIntentos > 1;
    return {
      estado: esRec ? 'RECURSANDO' : 'CURSANDO',
      etiquetaCorta: esRec ? 'REC · CURSO' : 'CURSANDO',
      calificacion: 'EN CURSO',
      modalidad: ultimoIntento.modalidad || 'RW',
      numIntentos,
      vecesRecurso: numIntentos - 1,
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      icono: 'Clock',
      historialTexto,
      tieneDesfase,
      motivoIncidencia: esRec ? `Recursando tras reprobar intento anterior (${penultimoIntento?.calificacion || 'NP'})` : null
    };
  }

  if (esAprobada && (ultimoIntento.modalidad === 'RE' || attempts.some(a => a.modalidad === 'RE' && checkPassed(a.calificacion)))) {
    return {
      estado: 'RE',
      etiquetaCorta: 'MODO RE',
      calificacion: ultimoIntento.calificacion,
      modalidad: 'RE',
      numIntentos,
      vecesRecurso: Math.max(0, numIntentos - 1),
      color: '#0284C7',
      bgColor: '#F0F9FF',
      icono: 'FileCheck',
      historialTexto,
      tieneDesfase,
      motivoIncidencia: 'Acreditada mediante examen de regularización / extraordinario (Modo RE)'
    };
  }

  if (esAprobada && numIntentos >= 2) {
    return {
      estado: 'REC',
      etiquetaCorta: `REC · ${numIntentos}`,
      calificacion: ultimoIntento.calificacion,
      modalidad: ultimoIntento.modalidad || 'RW',
      numIntentos,
      vecesRecurso: numIntentos - 1,
      color: '#D97706',
      bgColor: '#FFFBEB',
      icono: 'RotateCw',
      historialTexto,
      tieneDesfase,
      motivoIncidencia: `Aprobada en recursamiento tras ${numIntentos - 1} intento(s) fallido(s)`
    };
  }

  if (esAprobada && numIntentos === 1) {
    return {
      estado: 'ORD',
      etiquetaCorta: 'ORD',
      calificacion: ultimoIntento.calificacion,
      modalidad: 'RW',
      numIntentos: 1,
      vecesRecurso: 0,
      color: '#059669',
      bgColor: '#ECFDF5',
      icono: 'CheckCircle2',
      historialTexto,
      tieneDesfase,
      motivoIncidencia: tieneDesfase ? `Materia de 1.º cuatrimestre cursada con desfase en el periodo ${primerIntento.periodo}` : null
    };
  }

  if (esReprobada) {
    return {
      estado: 'ADEUDO',
      etiquetaCorta: 'ADEUDO',
      calificacion: ultimoIntento.calificacion,
      modalidad: ultimoIntento.modalidad || 'RW',
      numIntentos,
      vecesRecurso: numIntentos - 1,
      color: '#DC2626',
      bgColor: '#FEF2F2',
      icono: 'XCircle',
      historialTexto,
      tieneDesfase,
      motivoIncidencia: `Adeudo activo: reprobada con ${ultimoIntento.calificacion} en su último intento (${ultimoIntento.periodo})`
    };
  }

  return {
    estado: 'PENDIENTE',
    etiquetaCorta: 'PEND.',
    calificacion: ultimoIntento.calificacion || '--',
    modalidad: ultimoIntento.modalidad || '--',
    numIntentos,
    vecesRecurso: 0,
    color: '#64748B',
    bgColor: '#FFFFFF',
    icono: 'Clock',
    historialTexto,
    tieneDesfase: false,
    motivoIncidencia: null
  };
}