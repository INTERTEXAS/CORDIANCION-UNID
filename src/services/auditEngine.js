// src/services/auditEngine.js
import { CARRERAS_LOCAL, REQUISITOS_EGRESO, normalizarMapaCurricular } from '../data/carrerasData.js';

function getDefaultNivelesIngles() {
  return [
    { nivel: 1, cuatrimestre: 1, claveSugerida: 'F001', nombre: 'INGLÉS I' },
    { nivel: 2, cuatrimestre: 2, claveSugerida: 'F002', nombre: 'INGLÉS II' },
    { nivel: 3, cuatrimestre: 3, claveSugerida: 'F003', nombre: 'INGLÉS III' },
    { nivel: 4, cuatrimestre: 4, claveSugerida: 'F004', nombre: 'INGLÉS IV' },
    { nivel: 5, cuatrimestre: 5, claveSugerida: 'P001', nombre: 'INGLÉS V' },
  ];
}

function resolveNivelesIngles(carrera, mapa) {
  const candidates = [
    mapa?.niveles_ingles,
    mapa?.nivelesIngles,
    carrera?.niveles_ingles,
    carrera?.nivelesIngles,
    mapa?.niveles_ingles ?? (mapa && typeof mapa === 'object' ? mapa.niveles_ingles : undefined)
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) return value;
    if (value === 0 || value === '0') return [];
    if (typeof value === 'number' && value > 0) {
      return getDefaultNivelesIngles().slice(0, Math.min(value, 5));
    }
    const numericValue = Number(value);
    if (Number.isFinite(numericValue) && numericValue > 0) {
      return getDefaultNivelesIngles().slice(0, Math.min(numericValue, 5));
    }
  }

  return getDefaultNivelesIngles();
}

function checkPassed(calif) {
  if (!calif) return false;
  const s = String(calif).trim().toUpperCase();
  if (s === 'AC' || s === 'A' || s === 'AP' || s === 'EX') return true;
  const n = parseFloat(s);
  return !isNaN(n) && n >= 6;
}

function checkFailed(calif) {
  if (!calif) return false;
  const s = String(calif).trim().toUpperCase();
  if (s === 'NP' || s === 'NA' || s === 'SD') return true;
  const n = parseFloat(s);
  return !isNaN(n) && n < 6;
}

export function detectarModalidad(estudiante, registros = [], carreras = CARRERAS_LOCAL) {
  if (!estudiante) return estudiante;
  if (typeof estudiante === 'string') {
    estudiante = { programa: estudiante };
  }
  let conteoEjecutivo = 0;
  let conteoEscolarizado = 0;
  
  const dualClaves = ['ADS38', 'ADS39', 'ADS40', 'MKT26', 'MKS28', 'EES11', 'EES12'];
  let tieneDual = false;
  const catalogo = Array.isArray(carreras) && carreras.length > 0 ? carreras : CARRERAS_LOCAL;
  const programaDeclarado = Boolean(estudiante.programa && (
    catalogo.some(carrera => carrera?.codigo === estudiante.programa) ||
    estudiante.programa.startsWith('LIC-') ||
    estudiante.programa.startsWith('MAE-')
  ));

  for (const r of (registros || [])) {
    const subj = r?.subj || '';
    const crse = r?.crse || '';
    
    if (subj.startsWith('E') || /^[A-Z]{2}R\d{2}$/.test(crse)) {
      conteoEjecutivo++;
    } else if (subj.startsWith('L') || /^[A-Z]{2}[ST]\d{2}$/.test(crse)) {
      conteoEscolarizado++;
    }
    
    if (dualClaves.includes(crse)) {
      tieneDual = true;
    }
  }

  if (conteoEjecutivo > conteoEscolarizado || estudiante.programa === 'LIC-EJCO-17' || (estudiante.programa && estudiante.programa.includes('EJ'))) {
    estudiante.modalidadDetectada = 'EJECUTIVO';
    if (!programaDeclarado) estudiante.programa = 'LIC-EJCO-17';
  } else if (conteoEscolarizado >= conteoEjecutivo && tieneDual) {
    estudiante.modalidadDetectada = 'ESCOLARIZADO DUAL';
    if (!programaDeclarado) estudiante.programa = 'LIC-DAEM-18';
  } else {
    estudiante.modalidadDetectada = 'ESCOLARIZADO';
    if (!programaDeclarado) estudiante.programa = 'LIC-COFI-18';
  }
  
  return estudiante;
}

/**
 * Regla de exclusión: filtra e ignora por completo materias de relleno y cursos de preparación EGEL:
 * - Ortografía (claves típicas CMS02, LMPD-CMS02, MPD-CMS02).
 * - Comprensión Lectora (claves típicas CMS03, LMPD-CMS03, MPD-CMS03).
 * - CURSO DE PREPARACIÓN EGEL I (clave CUPR-ECCF1, CUPR-EGCF1 o cualquier prefijo/clave CUPR).
 * No se suman al total del mapa, no se marcan en rojo como omitidas ni afectan el avance.
 */
export function esMateriaIgnorada(item) {
  if (!item) return false;
  const clave = String(item.clave || item.claveCompleta || '').toUpperCase().trim();
  const crse = String(item.crse || '').toUpperCase().trim();
  const subj = String(item.subj || '').toUpperCase().trim();
  const nombre = String(item.nombre || '').toUpperCase().trim();

  // 1. Ortografía
  if (crse === 'CMS02' || clave.includes('CMS02') || nombre.includes('ORTOGRAF')) {
    return true;
  }

  // 2. Comprensión Lectora
  if (crse === 'CMS03' || clave.includes('CMS03') || nombre.includes('COMPRENSI')) {
    return true;
  }

  // 3. CURSO DE PREPARACIÓN EGEL I (o cualquier prefijo CUPR / ECCF1 / EGCF1)
  if (
    subj === 'CUPR' ||
    subj.startsWith('CUPR') ||
    crse.startsWith('CUPR') ||
    clave.startsWith('CUPR') ||
    clave.includes('CUPR') ||
    crse === 'ECCF1' ||
    crse === 'EGCF1' ||
    clave.includes('ECCF1') ||
    clave.includes('EGCF1') ||
    nombre.includes('PREPARACIÓN EGEL') ||
    nombre.includes('PREPARACION EGEL') ||
    nombre.includes('CURSO DE PREPARACIÓN EGEL') ||
    nombre.includes('CURSO DE PREPARACION EGEL') ||
    nombre.includes('PREPARACIÓN EVIPE') ||
    nombre.includes('PREPARACION EVIPE')
  ) {
    return true;
  }

  // 4. Taller de Pre-egreso (TPEG)
  if (
    subj === 'TPEG' ||
    subj.startsWith('TPEG') ||
    clave.startsWith('TPEG') ||
    clave.includes('TPEG') ||
    nombre.includes('PRE-EGRESO') ||
    nombre.includes('PREEGRESO')
  ) {
    return true;
  }

  return false;
}

export function runAcademicAudit(estudiante, registros = [], carrera = CARRERAS_LOCAL[0]) {
  // Asegurarnos de detectar la modalidad si no viene calculada, aportando la carrera recibida como contexto
  if (!estudiante.modalidadDetectada) {
    const catalogoContexto = carrera ? [carrera, ...CARRERAS_LOCAL] : CARRERAS_LOCAL;
    detectarModalidad(estudiante, registros, catalogoContexto);
  }
  
  // Asignar dinámicamente la carrera basada en el programa detectado, si existe en local/neon
  let carreraEfectiva = carrera;
  if (estudiante.programa && carrera?.codigo !== estudiante.programa) {
    const c = CARRERAS_LOCAL.find(c => c.codigo === estudiante.programa);
    if (c) carreraEfectiva = c;
  }
  if (!carreraEfectiva && carrera) {
    carreraEfectiva = carrera;
  }

  // Normalizar el mapa curricular (soporta tanto objeto con cuatrimestres como arreglo plano de materias)
  let mapa = normalizarMapaCurricular(carreraEfectiva?.mapa_json);

  // Si aún no tiene cuatrimestres válidos, buscar en CARRERAS_LOCAL por código de programa
  if (!Array.isArray(mapa?.cuatrimestres) || mapa.cuatrimestres.length === 0) {
    const codProg = carreraEfectiva?.codigo || estudiante?.programa;
    const localFallback = CARRERAS_LOCAL.find(c => c.codigo === codProg || (c.codigo && c.codigo.replace(/0/g, 'O') === (codProg || '').replace(/0/g, 'O')));
    if (localFallback?.mapa_json) {
      mapa = normalizarMapaCurricular(localFallback.mapa_json);
      carreraEfectiva = { ...carreraEfectiva, mapa_json: mapa };
    }
  }

  if (!Array.isArray(mapa?.cuatrimestres) || mapa.cuatrimestres.length === 0) {
    throw new Error(`No hay un mapa curricular cargado para ${carreraEfectiva?.codigo || estudiante?.programa || 'el programa seleccionado'}.`);
  }
  const cuatrimestresRaw = Array.isArray(mapa.cuatrimestres) ? mapa.cuatrimestres : [];
  const electivasRaw = Array.isArray(mapa.electivas_multidisciplinares) ? mapa.electivas_multidisciplinares : [];
  const nivelesInglesArr = resolveNivelesIngles(carreraEfectiva, mapa);

  // Normalizar la estructura del mapa (compatible tanto con Neon DB como con respaldo local)
  // Filtrar e ignorar por completo materias de relleno y EGEL del mapa curricular
  const cuatrimestres = cuatrimestresRaw.map(c => ({
    ...c,
    numero: c.numero,
    nombre: c.nombre || `${c.numero}.º Cuat.`,
    con_ingles: c.con_ingles !== undefined ? c.con_ingles : Boolean(c.ingles),
    materias: (c.materias || [])
      .filter(m => !esMateriaIgnorada(m))
      .map(m => {
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

  const electivasMultidisciplinares = electivasRaw
    .filter(el => !esMateriaIgnorada(el))
    .map(el => {
      const subj = (el.subj || (el.clave ? el.clave.split('-')[0] : 'LMAX')).toUpperCase();
      const crse = (el.crse || (el.clave ? el.clave.split('-')[1] : '')).toUpperCase();
      return {
        ...el,
        subj,
        crse,
        clave: el.clave || `${subj}-${crse}`
      };
    });

  // 1. Filtrar e ignorar registros de relleno/EGEL y normalizar registros extraídos del PDF
  const registrosFiltrados = (registros || []).filter(r => !esMateriaIgnorada(r));
  const normalizedRecords = registrosFiltrados.map(r => {
    let crse = (r.crse || '').toUpperCase().trim();
    if (crse === 'CFTD8') crse = 'CFT08';
    const subj = (r.subj || '').toUpperCase().trim();
    const rawCalif = r.calificacion !== undefined && r.calificacion !== null ? r.calificacion : r.grde;
    const calif = rawCalif !== undefined && rawCalif !== null ? String(rawCalif).trim() : '';
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

  // Ordenar cronológicamente por periodo y por secuencia académica dentro del mismo periodo
  normalizedRecords.sort((a, b) => {
    const pA = parseInt(a.periodo, 10) || 0;
    const pB = parseInt(b.periodo, 10) || 0;
    if (pA !== pB) return pA - pB;

    // En el mismo periodo, el cursamiento ordinario (RW) ocurre antes del examen de regularización (RE)
    if (a.modalidad === 'RW' && b.modalidad === 'RE') return -1;
    if (a.modalidad === 'RE' && b.modalidad === 'RW') return 1;

    // Si uno reprobó y otro aprobó en el mismo periodo, el aprobado es el definitivo resolutivo
    if (a.esReprobada && b.esAprobada) return -1;
    if (a.esAprobada && b.esReprobada) return 1;

    return 0;
  });

  const primerPeriodoAlumno = normalizedRecords.length > 0 ? normalizedRecords[0].periodo : null;

  // 2. Comprobar exención de inglés LENG-0008 (AC)
  const exentoIngles = normalizedRecords.some(r =>
    (r.crse === '0008' || r.crse === 'LENG-0008') && (r.calificacion === 'AC' || parseFloat(r.calificacion) >= 6)
  );

  // 3. Mapear cada una de las 37 materias del mapa por su CRSE único
  let maxCuatrimestreAlcanzado = 1;
  const periodosCursados = [...new Set(normalizedRecords.map(r => r.periodo).filter(Boolean))].sort();

  // Un mismo CRSE puede repetirse en un mapa (p.ej. materia LM- y su variante EC- de 14 semanas).
  // Para esos CRSE ambiguos el emparejamiento debe usar la clave completa (SUBJ-CRSE), no solo el CRSE.
  const clavesPorCrse = new Map();
  for (const c of cuatrimestres) {
    for (const mat of c.materias) {
      if (!clavesPorCrse.has(mat.crse)) clavesPorCrse.set(mat.crse, new Set());
      clavesPorCrse.get(mat.crse).add(mat.clave);
    }
  }
  const esCrseAmbiguo = (crse) => (clavesPorCrse.get(crse)?.size || 0) > 1;

  const subjectMapAttempts = new Map();
  for (const c of cuatrimestres) {
    for (const mat of c.materias) {
      const attempts = normalizedRecords.filter(r => {
        if (esCrseAmbiguo(mat.crse)) {
          // CRSE repetido: exigir que coincida también el prefijo de.subject
          if (r.claveCompleta === mat.clave) return true;
          if (mat.alias_corregir && r.crse === mat.alias_corregir) return true;
          return false;
        }
        return (
          r.crse === mat.crse ||
          r.claveCompleta === mat.clave ||
          (mat.alias_corregir && r.crse === mat.alias_corregir)
        );
      });
      if (attempts.length > 0 && c.numero > maxCuatrimestreAlcanzado) {
        maxCuatrimestreAlcanzado = c.numero;
      }
      subjectMapAttempts.set(mat.clave, attempts);
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
      const attempts = subjectMapAttempts.get(materia.clave) || [];
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

      if (['REC', 'RE', 'ADEUDO', 'OMITIDA', 'RECURSANDO', 'OU'].includes(auditResult.estado) || auditResult.tieneDesfase) {
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

  const auditedIngles = [];

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
      const codigoInglesHistorico = `000${item.nivel}`;
      const attempts = normalizedRecords.filter(r =>
        r.crse === claveSugerida ||
        (r.crse === codigoInglesHistorico && ['LENG', 'INHH'].includes(r.subj))
      );

      const tuvoAcreditacionHistorica = attempts.some(r => checkPassed((r.calificacion || '').trim().toUpperCase()));
      const evalIngles = tuvoAcreditacionHistorica
        ? {
            estado: 'ORD',
            etiquetaCorta: 'AC',
            calificacion: 'AC',
            modalidad: 'RW',
            numIntentos: attempts.length,
            vecesRecurso: Math.max(0, attempts.length - 1),
            color: '#059669',
            bgColor: '#ECFDF5',
            icono: 'CheckCircle2',
            historialTexto: attempts.map((at, idx) =>
              `Intento ${idx + 1} (${at.periodo}): ${at.calificacion || 'Cursando'} [${at.modalidad || 'RW'}]`
            ).join(' -> '),
            tieneDesfase: false,
            motivoIncidencia: 'Acreditado por historial previo de inglés; se considera nivel cubierto aunque el último intento haya sido reprobado.'
          }
        : evaluateSubjectAttempts(
            { clave: `LENG-${claveSugerida}`, crse: claveSugerida, nombre: item.nombre },
            attempts,
            item.cuatrimestre,
            maxCuatrimestreAlcanzado,
            primerPeriodoAlumno
          );

      if (['ORD', 'REC', 'RE'].includes(evalIngles.estado) || tuvoAcreditacionHistorica) {
        inglesAcreditados++;
      } else if (evalIngles.estado === 'ADEUDO') {
        adeudosQ1toQ6.push({
          clave: `LENG-${claveSugerida}`,
          nombre: item.nombre,
          cuatrimestre: item.cuatrimestre,
          ...evalIngles
        });
      }

      if (['REC', 'RE', 'ADEUDO', 'OMITIDA', 'OU'].includes(evalIngles.estado)) {
        incidencias.push({
          cuatrimestre: item.cuatrimestre,
          clave: `LENG-${claveSugerida}`,
          nombre: item.nombre,
          conecta: false,
          esEstadia: false,
          estado: tuvoAcreditacionHistorica ? 'ORD' : evalIngles.estado,
          etiquetaCorta: tuvoAcreditacionHistorica ? 'AC' : evalIngles.etiquetaCorta,
          intentosTotal: attempts.length,
          vecesRecurso: Math.max(0, attempts.length - 1),
          historialTexto: evalIngles.historialTexto,
          intentosDetalle: attempts,
          tieneDesfase: false,
          motivoIncidencia: tuvoAcreditacionHistorica ? 'Nivel de inglés acreditado por historial previo.' : evalIngles.motivoIncidencia
        });
      }

      auditedIngles.push({
        nivel: item.nivel,
        cuatrimestre: item.cuatrimestre,
        clave: claveSugerida,
        nombre: item.nombre,
        ...evalIngles,
        ...(tuvoAcreditacionHistorica ? { estado: 'ORD', etiquetaCorta: 'AC', calificacion: 'AC', motivoIncidencia: 'Nivel de inglés acreditado por historial previo.' } : {})
      });
    }
  }

  // 6. Evaluar Electivas Multidisciplinares
  // Si el CRSE también existe como materia de cuatrimestre, exigir la clave completa
  // para no marcar como cursada una electiva que el alumno nunca tomó.
  const crsesDeMateria = new Set();
  for (const c of cuatrimestres) for (const m of c.materias) crsesDeMateria.add(m.crse);

  const auditedElectivas = electivasMultidisciplinares.map(elec => {
    const attempts = normalizedRecords.filter(r => {
      if (crsesDeMateria.has(elec.crse)) return r.claveCompleta === elec.clave;
      return r.crse === elec.crse;
    });
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

  // 7. Evaluar Requisitos Co-Curriculares y de Titulación / Egreso (excluyendo materias ignoradas)
  const reqEgresoBase = Array.isArray(carreraEfectiva?.requisitos_egreso) && carreraEfectiva.requisitos_egreso.length > 0
    ? carreraEfectiva.requisitos_egreso
    : (REQUISITOS_EGRESO || []);
  const reqEgresoFiltrados = reqEgresoBase.filter(req => !esMateriaIgnorada(req));

  const auditedCoCurriculares = [];
  const adeudosReqEgreso = [];
  const omitidasReqEgreso = [];
  let coCurricularesAcreditados = 0;

  for (const req of reqEgresoFiltrados) {
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

      if (['REC', 'RE', 'ADEUDO', 'OU'].includes(evalReq.estado)) {
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
          motivoIncidencia: evalReq.estado === 'OU'
            ? 'Oportunidad utilizada: el requisito se dio de baja. No se cuenta como acreditado.'
            : evalReq.estado === 'ADEUDO'
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
  const excludeClavesComunes = [
    'LENG', 'INHH', 'CIAN', 'PROP', 'TUPR', 'TPEG', 'CUPR',
    'HUS01', 'HUS02', 'HUS03', 'HUS04', 'HUS05', 'HUS06',
    'HTS01', 'EDS01', 'CMS01', 'CMS02', 'CMS03', 'ECCF1', 'EGCF1'
  ];
  const clavesMapaActual = new Set();
  cuatrimestres.forEach(c => c.materias.forEach(m => clavesMapaActual.add(m.crse)));
  electivasMultidisciplinares.forEach(e => clavesMapaActual.add(e.crse));

  let materiasCoincidentes = 0;
  const materiasHuerfanas = [];

  registrosFiltrados.forEach(r => {
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
      nivelesIngles: nivelesInglesArr.length,
      inglesAcreditados,
      requisitosEgresoTotal: reqEgresoFiltrados.length,
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
  const primerIntento = attempts[0];
  const ultimoIntento = attempts[numIntentos - 1];

  // Comprobar si la materia fue acreditada en CUALQUIERA de sus intentos registrados
  const intentosAprobados = attempts.filter(a => checkPassed(a.calificacion));
  const tieneAprobada = intentosAprobados.length > 0;

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

  // 1. SI LA MATERIA FUE ACREDITADA (en RE, Recursamiento u Ordinario)
  if (tieneAprobada) {
    const intentoExitoso = intentosAprobados[intentosAprobados.length - 1];
    const esModoRE = intentoExitoso.modalidad === 'RE' || attempts.some(a => a.modalidad === 'RE' && checkPassed(a.calificacion));

    if (esModoRE) {
      return {
        estado: 'RE',
        etiquetaCorta: 'MODO RE',
        calificacion: intentoExitoso.calificacion,
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

    if (numIntentos >= 2) {
      return {
        estado: 'REC',
        etiquetaCorta: `REC · ${numIntentos}`,
        calificacion: intentoExitoso.calificacion,
        modalidad: intentoExitoso.modalidad || 'RW',
        numIntentos,
        vecesRecurso: numIntentos - 1,
        color: '#D97706',
        bgColor: '#FFFBEB',
        icono: 'RotateCw',
        historialTexto,
        tieneDesfase,
        motivoIncidencia: `Aprobada en recursamiento tras ${numIntentos - 1} intento(s) previo(s)`
      };
    }

    return {
      estado: 'ORD',
      etiquetaCorta: 'ORD',
      calificacion: intentoExitoso.calificacion,
      modalidad: intentoExitoso.modalidad || 'RW',
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

  // 2. NO ESTÁ ACREDITADA EN NINGÚN INTENTO
  const ultimaCalif = (ultimoIntento.calificacion || '').trim().toUpperCase();
  const estaCursando = !ultimaCalif || ultimaCalif === '';

  if (ultimaCalif === 'OU') {
    return {
      estado: 'OU',
      etiquetaCorta: 'OU',
      calificacion: 'OU',
      modalidad: ultimoIntento.modalidad || 'RW',
      numIntentos,
      vecesRecurso: Math.max(0, numIntentos - 1),
      color: '#7E22CE',
      bgColor: '#FAF5FF',
      icono: 'AlertCircle',
      historialTexto,
      tieneDesfase,
      motivoIncidencia: 'Oportunidad utilizada: la materia se dio de baja. No se cuenta como aprobada ni como reprobada.'
    };
  }

  if (estaCursando) {
    const esRec = numIntentos > 1;
    const penultimoIntento = numIntentos > 1 ? attempts[numIntentos - 2] : null;
    return {
      estado: esRec ? 'RECURSANDO' : 'CURSANDO',
      etiquetaCorta: esRec ? 'REC · CURSO' : 'CURSANDO',
      calificacion: 'EN CURSO',
      modalidad: ultimoIntento.modalidad || 'RW',
      numIntentos,
      vecesRecurso: numIntentos - 1,
      color: '#DB2777',
      bgColor: '#FDF2F8',
      icono: 'Clock',
      historialTexto,
      tieneDesfase,
      motivoIncidencia: esRec ? `Recursando tras reprobar intento anterior (${penultimoIntento?.calificacion || 'NP'})` : null
    };
  }

  const esReprobada = checkFailed(ultimaCalif);
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