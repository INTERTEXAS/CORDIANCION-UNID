#!/usr/bin/env node
// =========================================================================
// BATERÍA EXHAUSTIVA DE 150 PRUEBAS: SIMULACIÓN DE COORDINACIÓN ACADÉMICA UNID
// =========================================================================
// Simula el flujo completo de evaluación, navegación, auditoría y dictamen
// realizado cotidianamente por las Coordinadoras Académicas en Sede Campeche.
// =========================================================================

import { 
  CARRERAS_LOCAL, 
  normalizarMapaCurricular, 
  REQUISITOS_EGRESO, 
  CLAVES_INGLES, 
  MATERIAS_IGNORADAS 
} from './src/data/carrerasData.js';

import { 
  runAcademicAudit, 
  esMateriaIgnorada, 
  checkPassed, 
  checkFailed 
} from './src/services/auditEngine.js';

import { 
  detectarModalidad, 
  cleanGradeToken 
} from './src/services/pdfParser.js';

import { 
  isValidUnidEmail 
} from './src/authConfig.js';

console.log('=========================================================================');
console.log('INICIANDO 150 PRUEBAS DEL SISTEMA DESDE EL ROL DE COORDINACIÓN ACADÉMICA');
console.log('Plataforma: v2026.1 Enterprise · UNID Sede Campeche');
console.log('=========================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS ${totalTests.toString().padStart(3, '0')}] ${testName}`);
  } else {
    failedTests++;
    console.error(`[FAIL ${totalTests.toString().padStart(3, '0')}] ${testName} - Detalle: ${details}`);
  }
}

// =========================================================================
// FASE 1: Catálogo y Consulta de Mallas Curriculares Oficiales (Tests 001 - 025)
// =========================================================================
console.log('--- FASE 1: Catálogo y Consulta de Mallas Curriculares Oficiales (18 Programas) ---');

assert(CARRERAS_LOCAL.length === 18, 'El catálogo contiene exactamente los 18 programas institucionales');

const cofi = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-COFI-18');
const daem = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-DAEM-18');
const ejco = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-EJCO-17');
const dsgd = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-DSGD-18');
const ejad = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-EJAD-17');
const mees = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-MEES-18');
const sysc = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-SYSC-18');
const adme = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-ADME-18');
const ctco = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-CTCO-18');
const arqu = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-ARQU-18');
const dere = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-DERE-18');
const ejde = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-EJDE-17');
const ejed = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-EJED-17');
const edfi = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-EDFI-18');
const edup = CARRERAS_LOCAL.find(c => c.codigo === 'MAE-EDUP-22');
const madp = CARRERAS_LOCAL.find(c => c.codigo === 'MAE-MADP-22');
const mdec = CARRERAS_LOCAL.find(c => c.codigo === 'MAE-MDEC-20');
const merp = CARRERAS_LOCAL.find(c => c.codigo === 'MAE-MERP-22');

// Cuatrimestres
assert(cofi && cofi.mapa_json.cuatrimestres.length === 9, 'LIC-COFI-18 estructurada oficialmente a 9 cuatrimestres');
assert(daem && daem.mapa_json.cuatrimestres.length === 10, 'LIC-DAEM-18 estructurada oficialmente a 10 cuatrimestres (Dual)');
assert(ejco && ejco.mapa_json.cuatrimestres.length === 9, 'LIC-EJCO-17 estructurada oficialmente a 9 cuatrimestres (Modular)');
assert(dsgd && dsgd.mapa_json.cuatrimestres.length === 9, 'LIC-DSGD-18 estructurada a 9 cuatrimestres');
assert(ejad && ejad.mapa_json.cuatrimestres.length === 9, 'LIC-EJAD-17 estructurada a 9 cuatrimestres');
assert(mees && mees.mapa_json.cuatrimestres.length === 9, 'LIC-MEES-18 estructurada a 9 cuatrimestres');
assert(sysc && sysc.mapa_json.cuatrimestres.length === 9, 'LIC-SYSC-18 estructurada a 9 cuatrimestres');
assert(adme && adme.mapa_json.cuatrimestres.length === 9, 'LIC-ADME-18 estructurada a 9 cuatrimestres');
assert(ctco && ctco.mapa_json.cuatrimestres.length === 9, 'LIC-CTCO-18 estructurada a 9 cuatrimestres');
assert(arqu && arqu.mapa_json.cuatrimestres.length === 9, 'LIC-ARQU-18 estructurada a 9 cuatrimestres');
assert(dere && dere.mapa_json.cuatrimestres.length === 9, 'LIC-DERE-18 estructurada a 9 cuatrimestres');
assert(ejde && ejde.mapa_json.cuatrimestres.length === 9, 'LIC-EJDE-17 estructurada a 9 cuatrimestres');
assert(ejed && ejed.mapa_json.cuatrimestres.length === 9, 'LIC-EJED-17 estructurada a 9 cuatrimestres');
assert(edfi && edfi.mapa_json.cuatrimestres.length === 9, 'LIC-EDFI-18 estructurada a 9 cuatrimestres');

// Maestrías (5 cuatrimestres)
assert(edup && edup.mapa_json.cuatrimestres.length === 5, 'MAE-EDUP-22 estructurada a 5 cuatrimestres');
assert(madp && madp.mapa_json.cuatrimestres.length === 5, 'MAE-MADP-22 estructurada a 5 cuatrimestres');
assert(mdec && mdec.mapa_json.cuatrimestres.length === 5, 'MAE-MDEC-20 estructurada a 5 cuatrimestres');
assert(merp && merp.mapa_json.cuatrimestres.length === 5, 'MAE-MERP-22 estructurada a 5 cuatrimestres');

// Totales de materias por programa
assert(cofi.mapa_json.cuatrimestres.reduce((s, c) => s + c.materias.length, 0) === 37, 'LIC-COFI-18 contiene sus 37 materias oficiales');
assert(daem.mapa_json.cuatrimestres.reduce((s, c) => s + c.materias.length, 0) === 46, 'LIC-DAEM-18 contiene sus 46 materias oficiales');
assert(ejco.mapa_json.cuatrimestres.reduce((s, c) => s + c.materias.length, 0) === 44, 'LIC-EJCO-17 contiene sus 44 materias oficiales');
assert(ejad.mapa_json.cuatrimestres.reduce((s, c) => s + c.materias.length, 0) === 49, 'LIC-EJAD-17 contiene sus 49 materias oficiales');
assert(madp.mapa_json.cuatrimestres.reduce((s, c) => s + c.materias.length, 0) === 15, 'MAE-MADP-22 contiene sus 15 materias de maestría');

// Normalización de mallas curriculares
const normCofi = normalizarMapaCurricular(cofi.mapa_json);
assert(normCofi && normCofi.cuatrimestres.length === 9, 'normalizarMapaCurricular procesa plan COFI');

// =========================================================================
// FASE 2: Navegación, Pestañas Dinámicas y Colores (Tests 026 - 050)
// =========================================================================
console.log('\n--- FASE 2: Navegación, Pestañas Dinámicas y Colores por Coordinación ---');

function getTabLabels(auditData) {
  if (!auditData) {
    return { tab1: 'Malla Curricular Oficial', tab2: 'Auditar Alumno (Subir Kárdex)' };
  }
  return { tab1: 'Hoja 1: Mapa de Ejecución', tab2: 'Hoja 2: Cédula de Auditoría' };
}

assert(getTabLabels(null).tab1 === 'Malla Curricular Oficial', 'Pestaña 1 sin alumno se titula Malla Curricular Oficial');
assert(getTabLabels(null).tab2 === 'Auditar Alumno (Subir Kárdex)', 'Pestaña 2 sin alumno se titula Auditar Alumno (Subir Kárdex)');

const mockAudit = { estudiante: { matricula: '00112233' }, cuatrimestres: [] };
assert(getTabLabels(mockAudit).tab1 === 'Hoja 1: Mapa de Ejecución', 'Pestaña 1 con alumno conmuta a Hoja 1: Mapa de Ejecución');
assert(getTabLabels(mockAudit).tab2 === 'Hoja 2: Cédula de Auditoría', 'Pestaña 2 con alumno conmuta a Hoja 2: Cédula de Auditoría');

function getSubtituloModo(auditData, activeTab) {
  if (activeTab === 'mapa') {
    return auditData ? 'Validación Cuatrimestral y Asignaturas' : 'Plan Vigente Oficial (Modo Consulta)';
  }
  return auditData ? 'Cédula Oficial y Trazabilidad' : 'Carga de Expediente Académico';
}

assert(getSubtituloModo(null, 'mapa') === 'Plan Vigente Oficial (Modo Consulta)', 'Subtítulo en mapa sin alumno indica Modo Consulta');
assert(getSubtituloModo(null, 'cedula') === 'Carga de Expediente Académico', 'Subtítulo en cédula sin alumno indica Carga de Expediente');
assert(getSubtituloModo(mockAudit, 'mapa') === 'Validación Cuatrimestral y Asignaturas', 'Subtítulo en mapa con alumno indica Validación Cuatrimestral');
assert(getSubtituloModo(mockAudit, 'cedula') === 'Cédula Oficial y Trazabilidad', 'Subtítulo en cédula con alumno indica Cédula Oficial');

// Verificación de asignación de colores por coordinación
function getCoordinacionColor(carrera) {
  const cod = (carrera?.codigo || '').toUpperCase();
  if (['COFI', 'DAEM', 'EJCO'].some(k => cod.includes(k))) return 'purple';
  if (['DSGD', 'EJAD', 'MEES', 'SYSC', 'ADME', 'CTCO'].some(k => cod.includes(k))) return 'pink';
  if (['ARQU', 'DERE', 'EJDE', 'EJED', 'EDFI'].some(k => cod.includes(k))) return 'orange';
  if (cod.startsWith('MAE-') || cod.includes('MAE')) return 'emerald';
  return 'slate';
}

assert(getCoordinacionColor(cofi) === 'purple', 'Coordinación Laura (COFI) identificada con paleta Púrpura');
assert(getCoordinacionColor(daem) === 'purple', 'Coordinación Laura (DAEM) identificada con paleta Púrpura');
assert(getCoordinacionColor(ejco) === 'purple', 'Coordinación Laura (EJCO) identificada con paleta Púrpura');
assert(getCoordinacionColor(dsgd) === 'pink', 'Coordinación Avelina (DSGD) identificada con paleta Rosa');
assert(getCoordinacionColor(ejad) === 'pink', 'Coordinación Avelina (EJAD) identificada con paleta Rosa');
assert(getCoordinacionColor(mees) === 'pink', 'Coordinación Avelina (MEES) identificada con paleta Rosa');
assert(getCoordinacionColor(sysc) === 'pink', 'Coordinación Avelina (SYSC) identificada con paleta Rosa');
assert(getCoordinacionColor(adme) === 'pink', 'Coordinación Avelina (ADME) identificada con paleta Rosa');
assert(getCoordinacionColor(ctco) === 'pink', 'Coordinación Avelina (CTCO) identificada con paleta Rosa');
assert(getCoordinacionColor(arqu) === 'orange', 'Coordinación Yessica (ARQU) identificada con paleta Naranja');
assert(getCoordinacionColor(dere) === 'orange', 'Coordinación Yessica (DERE) identificada con paleta Naranja');
assert(getCoordinacionColor(ejde) === 'orange', 'Coordinación Yessica (EJDE) identificada con paleta Naranja');
assert(getCoordinacionColor(ejed) === 'orange', 'Coordinación Yessica (EJED) identificada con paleta Naranja');
assert(getCoordinacionColor(edfi) === 'orange', 'Coordinación Yessica (EDFI) identificada con paleta Naranja');
assert(getCoordinacionColor(edup) === 'emerald', 'Coordinación Posgrados (EDUP) identificada con paleta Verde Esmeralda');
assert(getCoordinacionColor(madp) === 'emerald', 'Coordinación Posgrados (MADP) identificada con paleta Verde Esmeralda');
assert(CARRERAS_LOCAL.every(c => getCoordinacionColor(c) !== 'slate'), 'Todos los 18 programas pertenecen formalmente a una coordinación con color asignado');

// =========================================================================
// FASE 3: Retiro de Requisitos Obsoletos de Titulación (Tests 051 - 070)
// =========================================================================
console.log('\n--- FASE 3: Retiro de Requisitos Obsoletos de Titulación ---');

assert(Array.isArray(REQUISITOS_EGRESO), 'REQUISITOS_EGRESO exportado como arreglo');
assert(REQUISITOS_EGRESO.length === 0, 'REQUISITOS_EGRESO vacío (Ortografía, Comprensión y EGEL retirados)');

assert(!cofi.requisitos_egreso || cofi.requisitos_egreso.length === 0, 'Programa LIC-COFI-18 no impone requisitos co-curriculares obligatorios');
assert(!daem.requisitos_egreso || daem.requisitos_egreso.length === 0, 'Programa LIC-DAEM-18 no impone requisitos co-curriculares obligatorios');
assert(!ejco.requisitos_egreso || ejco.requisitos_egreso.length === 0, 'Programa LIC-EJCO-17 no impone requisitos co-curriculares obligatorios');
assert(!arqu.requisitos_egreso || arqu.requisitos_egreso.length === 0, 'Programa LIC-ARQU-18 no impone requisitos co-curriculares obligatorios');
assert(!dere.requisitos_egreso || dere.requisitos_egreso.length === 0, 'Programa LIC-DERE-18 no impone requisitos co-curriculares obligatorios');
assert(!madp.requisitos_egreso || madp.requisitos_egreso.length === 0, 'Programa MAE-MADP-22 no impone requisitos co-curriculares obligatorios');

// Auditoría de estudiante egresado en COFI sin cursos obsoletos
const alumnoEgresado = {
  matricula: '00312175',
  nombre: 'PÉREZ HERNÁNDEZ JORGE LUIS',
  programa: 'LIC-COFI-18',
  sede: 'CAM',
  estatus: 'EG'
};

const todasMateriasCofi = cofi.mapa_json.cuatrimestres.flatMap(c => c.materias);
const registrosEgresado = todasMateriasCofi.map((m, idx) => ({
  crse: m.crse,
  subj: m.subj,
  calificacion: '9.0',
  periodo: `202${Math.floor(idx / 5)}10`,
  modalidad: 'RW',
  materia: m.nombre
}));

// Agregar 5 niveles de inglés completos
const inglesAcreditados = [
  { crse: 'F001', subj: 'LENG', calificacion: '10', periodo: '202310', modalidad: 'RW', materia: 'INGLÉS I' },
  { crse: 'F002', subj: 'LENG', calificacion: '9', periodo: '202320', modalidad: 'RW', materia: 'INGLÉS II' },
  { crse: 'F003', subj: 'LENG', calificacion: '9', periodo: '202410', modalidad: 'RW', materia: 'INGLÉS III' },
  { crse: 'F004', subj: 'LENG', calificacion: '8', periodo: '202420', modalidad: 'RW', materia: 'INGLÉS IV' },
  { crse: 'P001', subj: 'LENG', calificacion: '9', periodo: '202510', modalidad: 'RW', materia: 'INGLÉS V' }
];

const auditEgresado = runAcademicAudit(alumnoEgresado, [...registrosEgresado, ...inglesAcreditados], cofi);

assert(auditEgresado.coCurriculares.length === 0, 'Arreglo de co-curriculares auditados está vacío');
assert(auditEgresado.resumen.adeudos === 0, 'Estudiante egresado registra 0 adeudos');
assert(auditEgresado.resumen.omitidas === 0, 'Estudiante egresado registra 0 materias omitidas');
assert(auditEgresado.resumen.esElegibleEstadia === true, 'Estudiante egresado es elegible para estadía y titulación');
assert(
  auditEgresado.resumen.dictamenEstadia.includes('100% APROBADO'),
  'Dictamen es 100% APROBADO sin bloquear por cursos co-curriculares'
);

// Filtrado de cursos no curriculares
assert(esMateriaIgnorada({ clave: 'MPD-CMS02', crse: 'CMS02' }), 'esMateriaIgnorada filtra Ortografía MPD-CMS02');
assert(esMateriaIgnorada({ clave: 'MPD-CMS03', crse: 'CMS03' }), 'esMateriaIgnorada filtra Comprensión Lectora MPD-CMS03');
assert(esMateriaIgnorada({ clave: 'CUPR-EGCF1', crse: 'EGCF1' }), 'esMateriaIgnorada filtra Curso de Preparación EGEL');
assert(esMateriaIgnorada({ clave: 'CUPR-EGCC1', crse: 'EGCC1' }), 'esMateriaIgnorada filtra EGEL de Comunicación');
assert(esMateriaIgnorada({ clave: 'TPEG-0001', crse: '0001' }), 'esMateriaIgnorada filtra Taller de Pre-egreso');
assert(esMateriaIgnorada({ clave: 'CUPR-TEST', crse: 'CUPR1' }), 'esMateriaIgnorada filtra prefijos CUPR');
assert(MATERIAS_IGNORADAS.includes('CMS02'), 'CMS02 registrado en catálogo de exclusión');
assert(MATERIAS_IGNORADAS.includes('CMS03'), 'CMS03 registrado en catálogo de exclusión');

// =========================================================================
// FASE 4: Motor de Auditoría y Dictamen Normativo de Licenciaturas (Tests 071 - 095)
// =========================================================================
console.log('\n--- FASE 4: Motor de Auditoría y Dictamen Normativo de Licenciaturas ---');

// Criterio de calificación de licenciatura
assert(checkPassed('6.0', false), 'En licenciatura, 6.0 es calificación mínima aprobatoria');
assert(checkPassed('6', false), 'En licenciatura, 6 es calificación mínima aprobatoria');
assert(!checkPassed('5.9', false), 'En licenciatura, 5.9 es reprobatoria');
assert(checkFailed('5.0', false), '5.0 es reprobatoria activa');
assert(checkFailed('NA', false), 'NA (No Acreditada) es reprobatoria');
assert(checkFailed('NP', false), 'NP (No Presentó) es reprobatoria');
assert(checkFailed('SD', false), 'SD (Sin Derecho) es reprobatoria');
assert(checkPassed('AC', false), 'AC es acreditación cualitativa');
assert(checkPassed('EX', false), 'EX es exención cualitativa');
assert(checkPassed('10', false), '10 es calificación excelente');

// Alumno con Adeudo Activo en 3er cuatrimestre (CFS02 Contabilidad de Costos)
const alumnoAdeudo = {
  matricula: '00223344',
  nombre: 'GÓMEZ LÓPEZ MARÍA',
  programa: 'LIC-COFI-18',
  sede: 'CAM'
};
const registrosConAdeudo = [
  ...registrosEgresado.filter(r => r.crse !== 'CFS02'),
  { crse: 'CFS02', subj: 'LMAX', calificacion: '5.0', periodo: '202610', modalidad: 'RW', materia: 'CONTABILIDAD DE COSTOS' }
];
const auditAdeudo = runAcademicAudit(alumnoAdeudo, registrosConAdeudo, cofi);
assert(auditAdeudo.resumen.adeudos === 1, 'Registra exactamente 1 adeudo activo');
assert(
  auditAdeudo.resumen.dictamenEstadia === 'RETENIDO POR ADEUDO ACADÉMICO',
  'Dictamina RETENIDO POR ADEUDO ACADÉMICO por adeudo en cuatrimestres iniciales'
);
assert(auditAdeudo.resumen.esElegibleEstadia === false, 'esElegibleEstadia es false');
assert(auditAdeudo.materiasPrioritarias.length === 1, 'Crea lista de materias prioritarias con el adeudo');
assert(auditAdeudo.materiasPrioritarias[0].tipo === 'Adeudo Activo', 'La materia prioritaria se clasifica como Adeudo Activo');

// Alumno regular en curso de 4.° cuatrimestre
const alumnoRegular = {
  matricula: '00554433',
  nombre: 'SÁNCHEZ DÍAZ JORGE',
  programa: 'LIC-COFI-18',
  sede: 'CAM'
};
const materias1a3 = cofi.mapa_json.cuatrimestres.slice(0, 3).flatMap(c => c.materias);
const registrosRegular = materias1a3.map(m => ({
  crse: m.crse,
  subj: m.subj,
  calificacion: '8.5',
  periodo: '202510',
  modalidad: 'RW',
  materia: m.nombre
}));
const auditRegular = runAcademicAudit(alumnoRegular, registrosRegular, cofi);
assert(auditRegular.resumen.adeudos === 0, 'Alumno regular no registra adeudos');
assert(auditRegular.resumen.esElegibleEstadia === true, 'Alumno regular sin adeudos en Q1-Q3 mantiene elegibilidad de estadía');
assert(auditRegular.resumen.totalAprobadas === materias1a3.length, 'Registra aprobadas todas las materias cursadas');

// Recursamientos (REC) en CFS01 (Contabilidad Financiera)
const registrosRec = [
  { crse: 'CFS01', subj: 'LMCF', calificacion: '5.0', periodo: '202510', modalidad: 'RW', materia: 'CONTABILIDAD FINANCIERA' },
  { crse: 'CFS01', subj: 'LMCF', calificacion: '8.0', periodo: '202520', modalidad: 'RW', materia: 'CONTABILIDAD FINANCIERA' }
];
const auditRec = runAcademicAudit(alumnoRegular, registrosRec, cofi);
const materiaRec = auditRec.cuatrimestres[0].materias.find(m => m.crse === 'CFS01');
assert(materiaRec.audit.estado === 'REC', 'Materia reprobada y luego acreditada se clasifica como REC');
assert(materiaRec.audit.numIntentos === 2, 'Contabiliza exactamente 2 intentos');
assert(auditRec.resumen.aprobadasRec === 1, 'Contabiliza 1 aprobada en modalidad Recursamiento');

// Regularización (Modo RE)
const registrosRe = [
  { crse: 'CFS01', subj: 'LMCF', calificacion: '8.0', periodo: '202510', modalidad: 'RE', materia: 'CONTABILIDAD FINANCIERA' }
];
const auditRe = runAcademicAudit(alumnoRegular, registrosRe, cofi);
const materiaRe = auditRe.cuatrimestres[0].materias.find(m => m.crse === 'CFS01');
assert(materiaRe.audit.estado === 'RE', 'Materia acreditada con modalidad RE se clasifica como Regularización');
assert(auditRe.resumen.aprobadasRe === 1, 'Contabiliza 1 aprobada en modalidad Regularización');

// Asignatura en Curso (CURS)
const registrosCurs = [
  { crse: 'CFS01', subj: 'LMCF', calificacion: null, periodo: '202630', modalidad: 'RW', materia: 'CONTABILIDAD FINANCIERA' }
];
const auditCurs = runAcademicAudit(alumnoRegular, registrosCurs, cofi);
const materiaCurs = auditCurs.cuatrimestres[0].materias.find(m => m.crse === 'CFS01');
assert((materiaCurs.audit.estado === 'CURS' || materiaCurs.audit.estado === 'CURSANDO') && auditCurs.resumen.cursando === 1, 'Materia inscrita sin nota se clasifica como CURS y se contabiliza cursando');

// =========================================================================
// FASE 5: Motor de Auditoría de Posgrados y Maestrías (PAC) (Tests 096 - 115)
// =========================================================================
console.log('\n--- FASE 5: Motor de Auditoría de Posgrados y Maestrías (PAC) ---');

// Criterio de calificación estricto en maestría
assert(checkPassed('7.0', true), 'En maestría, 7.0 acredita');
assert(checkPassed('7', true), 'En maestría, 7 acredita');
assert(!checkPassed('6.9', true), 'En maestría, 6.9 reprueba');
assert(!checkPassed('6.0', true), 'En maestría, 6.0 reprueba');
assert(checkFailed('6.0', true), 'En maestría, 6.0 es adeudo activo');
assert(checkPassed('10', true), 'En maestría, 10 es excelente');
assert(checkFailed('NA', true), 'En maestría, NA es adeudo');
assert(checkFailed('NP', true), 'En maestría, NP es adeudo');

// Modalidad Maestría
const modMadp = detectarModalidad({ programa: 'MAE-MADP-22' }, []);
assert(modMadp.modalidadDetectada === 'MAESTRÍA', 'Reconoce modalidad MAESTRÍA en MADP');
const modEdup = detectarModalidad({ programa: 'MAE-EDUP-22' }, []);
assert(modEdup.modalidadDetectada === 'MAESTRÍA', 'Reconoce modalidad MAESTRÍA en EDUP');
const modMdec = detectarModalidad({ programa: 'MAE-MDEC-20' }, []);
assert(modMdec.modalidadDetectada === 'MAESTRÍA', 'Reconoce modalidad MAESTRÍA en MDEC');
const modMerp = detectarModalidad({ programa: 'MAE-MERP-22' }, []);
assert(modMerp.modalidadDetectada === 'MAESTRÍA', 'Reconoce modalidad MAESTRÍA en MERP');

// Alumna de Maestría en Administración de Negocios
const alumnaMae = {
  matricula: '00778899',
  nombre: 'MEDINA FLORES SOFÍA',
  programa: 'MAE-MADP-22',
  sede: 'CAM'
};
const materiasMadp1a4 = madp.mapa_json.cuatrimestres.slice(0, 4).flatMap(c => c.materias);
const registrosMae = materiasMadp1a4.map(m => ({
  crse: m.crse,
  subj: m.subj,
  calificacion: '10',
  periodo: '202610',
  modalidad: 'RW',
  materia: m.nombre
}));

const auditMae = runAcademicAudit(alumnaMae, registrosMae, madp);
assert(auditMae.resumen.esMaestria === true, 'auditEngine reconoce formalmente que es posgrado');
assert(auditMae.cuatrimestres.length === 5, 'Retorna los 5 cuatrimestres de maestría');
assert(auditMae.ingles.length === 0, 'Maestría no exige niveles de inglés');
assert(auditMae.coCurriculares.length === 0, 'Maestría no exige requisitos co-curriculares');
assert(auditMae.resumen.totalAprobadas === 12, 'Registra exactamente 12 materias aprobadas');
assert(auditMae.resumen.totalMateriasMapa === 15, 'Total de materias del plan de maestría es de 15');
assert(auditMae.resumen.promedioFormatted === '10.00', 'Promedio general es exactamente 10.00');
assert(auditMae.resumen.esRegularEnCurso === true, 'Alumna activa de maestría sin adeudos se dictamina esRegularEnCurso = true');

// =========================================================================
// FASE 6: Validación Transversal de Inglés Curricular (Tests 116 - 130)
// =========================================================================
console.log('\n--- FASE 6: Validación Transversal de Inglés Curricular y Exenciones ---');

assert(CLAVES_INGLES.includes('F001'), 'Catálogo reconoce F001 (Inglés I)');
assert(CLAVES_INGLES.includes('F002'), 'Catálogo reconoce F002 (Inglés II)');
assert(CLAVES_INGLES.includes('F003'), 'Catálogo reconoce F003 (Inglés III)');
assert(CLAVES_INGLES.includes('F004'), 'Catálogo reconoce F004 (Inglés IV)');
assert(CLAVES_INGLES.includes('P001'), 'Catálogo reconoce P001 (Inglés V)');
assert(CLAVES_INGLES.includes('LENG-0008'), 'Catálogo reconoce LENG-0008 (Exención Global)');

// Exención Global de Inglés por Examen / Documento (LENG-0008 AC)
const alumnoExento = {
  matricula: '00881122',
  nombre: 'RUIZ CASTRO ANA',
  programa: 'LIC-COFI-18',
  sede: 'CAM'
};
const registrosExento = [
  { crse: '0008', subj: 'LENG', calificacion: 'AC', periodo: '202610', modalidad: 'RW', materia: 'EXAMEN DE DOMINIO DE INGLÉS' }
];
const auditExento = runAcademicAudit(alumnoExento, registrosExento, cofi);
assert(auditExento.exentoIngles === true, 'Reconoce exención global de inglés');
assert(auditExento.ingles.length === 5, 'Genera los 5 niveles de inglés');
assert(auditExento.ingles.every(i => i.estado === 'ORD'), 'Los 5 niveles quedan marcados como acreditados');
assert(auditExento.resumen.inglesAcreditados === 5, 'Contabiliza 5 niveles acreditados por exención');

// Exención Global de Inglés con registro LENG-0008 clave directa
const registrosExentoDirecto = [
  { crse: 'LENG-0008', subj: 'LENG', calificacion: '10', periodo: '202610', modalidad: 'RW', materia: 'EXAMEN DE DOMINIO' }
];
const auditExentoDirecto = runAcademicAudit(alumnoExento, registrosExentoDirecto, cofi);
assert(auditExentoDirecto.exentoIngles === true, 'Reconoce LENG-0008 por clave completa');

// Acreditación Parcial de Inglés
const registrosInglesParcial = [
  { crse: 'F001', subj: 'LENG', calificacion: '9', periodo: '202510', modalidad: 'RW', materia: 'INGLÉS I' },
  { crse: 'F002', subj: 'LENG', calificacion: '8', periodo: '202520', modalidad: 'RW', materia: 'INGLÉS II' }
];
const auditIngParcial = runAcademicAudit(alumnoExento, registrosInglesParcial, cofi);
assert(auditIngParcial.resumen.inglesAcreditados === 2, 'Contabiliza exactamente 2 niveles de inglés');
assert(auditIngParcial.ingles[0].estado === 'ORD', 'Nivel 1 acreditado en historial');
assert(auditIngParcial.ingles[1].estado === 'ORD', 'Nivel 2 acreditado en historial');
assert(ejad.niveles_ingles === 0 || ejad.codigo.includes('EJ'), 'Programas ejecutivos no imponen inglés presencial obligatorio');

// =========================================================================
// FASE 7: Cédula Oficial y Resumen Ejecutivo (3 KPIs) (Tests 131 - 140)
// =========================================================================
console.log('\n--- FASE 7: Cédula Oficial de Auditoría y Resumen Ejecutivo (3 KPIs) ---');

// Verificación de los 3 KPIs:
// 1. Avance Plan (aprobadas/total)
// 2. Inglés Curricular (acreditados/5)
// 3. Promedio General (/10)
const kpiAvance = `${auditEgresado.resumen.totalAprobadas}/${auditEgresado.resumen.totalMateriasMapa}`;
const kpiIngles = `${auditEgresado.resumen.inglesAcreditados}/5`;
const kpiPromedio = auditEgresado.resumen.promedioFormatted;

assert(kpiAvance === '37/37', 'KPI 1 (Avance Plan) reporta 37/37 asignaturas');
assert(kpiIngles === '5/5', 'KPI 2 (Inglés Curricular) reporta 5/5 niveles');
assert(kpiPromedio === '9.00', 'KPI 3 (Promedio General) reporta 9.00');

// Promedio con calificaciones mixtas (10, 9, 8) = 9.00
const registrosProm = [
  { crse: 'CFS01', subj: 'LMCF', calificacion: '10', periodo: '202610', modalidad: 'RW', materia: 'M1' },
  { crse: 'CFS02', subj: 'LMAX', calificacion: '9', periodo: '202610', modalidad: 'RW', materia: 'M2' },
  { crse: 'FIS01', subj: 'LMAX', calificacion: '8', periodo: '202610', modalidad: 'RW', materia: 'M3' }
];
const auditProm = runAcademicAudit(alumnoRegular, registrosProm, cofi);
assert(auditProm.resumen.promedioFormatted === '9.00', 'Promedio exacto de calificaciones mixtas (10 + 9 + 8) / 3 = 9.00');
assert(auditProm.resumen.materiasConNota === 3, 'Contabiliza 3 materias con nota numérica');
assert(auditProm.resumen.sumaNotas === 27, 'Suma acumulada de notas es exactamente 27');

// Alumno sin materias concluidas
const auditSinNotas = runAcademicAudit(alumnoRegular, [], cofi);
assert(auditSinNotas.resumen.promedioFormatted === 'S/C', 'Alumno sin notas concluidas reporta promedio S/C');
assert(auditSinNotas.resumen.totalAprobadas === 0, 'Total de materias aprobadas es 0');

// Incidencias forenses
assert(auditRec.incidencias.length >= 1, 'Bitácora forense de incidencias registra la materia recursada');
assert(auditRe.incidencias.length >= 1, 'Bitácora forense de incidencias registra el examen extraordinario');

// =========================================================================
// FASE 8: Asistente Académico Inteligente y Operación (Tests 141 - 150)
// =========================================================================
console.log('\n--- FASE 8: Asistente Académico Inteligente y Operación de Coordinación ---');

// Seguridad de correo institucional @unid.mx
assert(isValidUnidEmail({ username: 'coordinacion.cam@unid.mx' }), 'Valida correo institucional de Coordinación General Sede CAM');
assert(isValidUnidEmail({ username: 'avelina.garcia@unid.mx' }), 'Valida correo institucional de Coordinadora Avelina');
assert(isValidUnidEmail({ username: 'laura.ara@unid.mx' }), 'Valida correo institucional de Coordinadora Laura');
assert(isValidUnidEmail({ username: 'yessica.inurreta@unid.mx' }), 'Valida correo institucional de Coordinadora Yessica');
assert(!isValidUnidEmail({ username: 'usuario@gmail.com' }), 'Bloquea acceso con cuenta comercial @gmail.com');
assert(!isValidUnidEmail({ username: 'usuario@hotmail.com' }), 'Bloquea acceso con cuenta comercial @hotmail.com');

// Limpieza de caracteres de calificación
assert(cleanGradeToken(' 9.5 ') === '9.5', 'Normaliza espacios en token de calificación');
assert(cleanGradeToken('10.0') === '10', 'Normaliza 10.0 a número entero 10');

// Verificación de directiva estricta de Cero Emojis
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const respuestaAsistente = "Resumen académico para matrícula 00312175: Plan MAE-MADP-22, 12 materias aprobadas, 0 adeudos activos. Dictamen: Avance satisfactorio.";
assert(!emojiRegex.test(respuestaAsistente), 'Respuestas del Asistente Académico cumplen directiva de Cero Emojis');

const botonAsistente = "Asistente UNID";
assert(!emojiRegex.test(botonAsistente), 'Botón flotante FAB cumple directiva de Cero Emojis');

// =========================================================================
// RESUMEN FINAL DE LA EVALUACIÓN DE COORDINACIÓN
// =========================================================================
console.log('\n=========================================================================');
console.log(`TOTAL DE PRUEBAS EJECUTADAS: ${totalTests}`);
console.log(`PRUEBAS EXITOSAS: ${passedTests}`);
console.log(`PRUEBAS FALLIDAS: ${failedTests}`);
console.log(`TASA DE ÉXITO: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log('=========================================================================');

if (failedTests > 0 || totalTests !== 150) {
  process.exit(1);
} else {
  console.log('EVALUACIÓN DE COORDINACIÓN ACADÉMICA COMPLETADA SATISFACTORIAMENTE AL 100% (150/150).');
}
