import fs from 'fs';
import { runAcademicAudit, esMateriaIgnorada, checkPassed, checkFailed } from './src/services/auditEngine.js';
import { detectarModalidad, matchCourseRowsToModes, cleanGradeToken, isGradePassing, isGradeFailing, extractStudentMetadata } from './src/services/pdfParser.js';
import { isValidUnidEmail, getAccountEmail } from './src/authConfig.js';
import { getCarreras } from './src/services/neonService.js';
import { CARRERAS_LOCAL, resolverNombreOficialCarrera, MATERIAS_IGNORADAS, REQUISITOS_EGRESO, CLAVES_INGLES } from './src/data/carrerasData.js';

// Cargar variables de entorno desde .env si existe para paridad de entorno
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      value = value.trim().replace(/^['"](.*)['"]$/, '$1');
      process.env[match[1]] = value;
    }
  });
}

console.log('====================================================');
console.log('BATERIA DE PRUEBAS DE INTEGRIDAD Y CALIDAD UNID (100+ PRUEBAS)');
console.log('====================================================\n');

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
    console.error(`[FAIL ${totalTests.toString().padStart(3, '0')}] ${testName} - ${details}`);
  }
}

// ----------------------------------------------------
// TEST SUITE 1: Validación de correos institucionales (@unid.mx)
// ----------------------------------------------------
console.log('\n--- 1. Pruebas de Autenticación y Correo Institucional ---');

assert(
  isValidUnidEmail({ username: 'coordinacion@unid.mx' }),
  'Acepta correo directo con terminación @unid.mx'
);

assert(
  isValidUnidEmail({ username: 'DOCENTE.ACADEMICO@UNID.MX' }),
  'Acepta correo institucional en mayúsculas (normalización case-insensitive)'
);

assert(
  isValidUnidEmail({ idTokenClaims: { preferred_username: 'rectoria@unid.mx' } }),
  'Extrae y valida correo desde idTokenClaims.preferred_username'
);

assert(
  isValidUnidEmail({ idTokenClaims: { email: 'docente@unid.mx' } }),
  'Extrae y valida correo desde idTokenClaims.email'
);

assert(
  !isValidUnidEmail({ username: 'usuario@gmail.com' }),
  'Rechaza correo comercial @gmail.com'
);

assert(
  !isValidUnidEmail({ username: 'alumno@hotmail.com' }),
  'Rechaza correo comercial @hotmail.com'
);

assert(
  !isValidUnidEmail({ username: 'coordinacion@unid.mx.fake.com' }),
  'Rechaza intento de spoofing con dominio falso concatenado'
);

assert(
  !isValidUnidEmail(null),
  'Maneja cuenta nula o indefinida de forma segura'
);

assert(
  !isValidUnidEmail({}),
  'Maneja objeto de cuenta vacío de forma segura'
);

assert(
  getAccountEmail({ username: 'DIRECTOR.CAMPUS@UNID.MX' }) === 'director.campus@unid.mx',
  'getAccountEmail extrae y normaliza correo a minúsculas'
);

// ----------------------------------------------------
// TEST SUITE 2: Detección de Modalidades y Normalización
// ----------------------------------------------------
console.log('\n--- 2. Pruebas de Detección de Modalidad y Programas ---');

assert(
  detectarModalidad({ programa: 'LIC-COFI-18' }).modalidadDetectada === 'ESCOLARIZADO',
  'Detecta modalidad ESCOLARIZADO para programa escolarizado regular'
);

assert(
  detectarModalidad({ programa: 'LIC-EJCO-17' }).modalidadDetectada === 'EJECUTIVO',
  'Detecta modalidad EJECUTIVO para programa ejecutivo declarado'
);

assert(
  detectarModalidad({ programa: 'LIC-EJAD-17' }).modalidadDetectada === 'EJECUTIVO',
  'Detecta modalidad EJECUTIVO para LIC-EJAD-17 (Administración de Empresas Ejecutivo)'
);

assert(
  detectarModalidad({ programa: 'LIC-EJDE-17' }).modalidadDetectada === 'EJECUTIVO',
  'Detecta modalidad EJECUTIVO para LIC-EJDE-17 (Derecho Ejecutivo)'
);

assert(
  detectarModalidad({ programa: 'LIC-EJED-17' }).modalidadDetectada === 'EJECUTIVO',
  'Detecta modalidad EJECUTIVO para LIC-EJED-17 (Educación Ejecutivo)'
);

assert(
  detectarModalidad({ programa: 'LIC-DERE-18' }, [{ subj: 'EDER', crse: 'EDER01' }]).modalidadDetectada === 'EJECUTIVO',
  'Detecta modalidad EJECUTIVO por prefijo de asignatura de posgrado/ejecutivo'
);

assert(
  detectarModalidad({ programa: 'LIC-DAEM-18' }, [{ subj: 'LMAX', crse: 'ADS38' }]).modalidadDetectada === 'ESCOLARIZADO DUAL',
  'Detecta modalidad ESCOLARIZADO DUAL por clave de asignatura dual'
);

assert(
  detectarModalidad({ programa: 'MAE-EDUP-22' }).programa === 'MAE-EDUP-22' &&
  detectarModalidad({ programa: 'MAE-EDUP-22' }).modalidadDetectada === 'MAESTRÍA',
  'Preserva programa MAE-EDUP-22 y detecta modalidad MAESTRÍA'
);

assert(
  detectarModalidad({ programa: 'MAE-MADP-22' }).programa === 'MAE-MADP-22' &&
  detectarModalidad({ programa: 'MAE-MADP-22' }).modalidadDetectada === 'MAESTRÍA',
  'Preserva programa MAE-MADP-22 y detecta modalidad MAESTRÍA'
);

assert(
  detectarModalidad({ programa: 'MAE-MDEC-20' }).programa === 'MAE-MDEC-20',
  'Preserva programa de maestría MAE-MDEC-20 sin sobreescribirlo'
);

assert(
  detectarModalidad({ programa: 'MAE-MERP-22' }).programa === 'MAE-MERP-22',
  'Preserva programa de maestría MAE-MERP-22 sin sobreescribirlo'
);

assert(
  detectarModalidad(null) === null,
  'Maneja estudiante nulo sin lanzar excepciones'
);

const modString = detectarModalidad('LIC-ADME-18');
assert(
  typeof modString === 'object' && modString.programa === 'LIC-ADME-18',
  'Acepta string simple como parámetro de estudiante en detectarModalidad'
);

// ----------------------------------------------------
// TEST SUITE 3: Catálogo Oficial de Carreras y Sincronización Neon
// ----------------------------------------------------
console.log('\n--- 3. Pruebas de Catálogo Institucional y Neon DB ---');

const resCarreras = await getCarreras();
const carreras = resCarreras?.carreras || resCarreras || [];

assert(carreras.length >= 14, `Catálogo institucional contiene al menos 14 programas (detectados: ${carreras.length})`);
assert(carreras.length >= 18, `Catálogo recupera las 18 carreras completas (14 licenciaturas + 4 maestrías)`);

const todosLosCodigos = [
  'LIC-COFI-18', 'LIC-DAEM-18', 'LIC-EJCO-17', 'LIC-ARQU-18',
  'LIC-DERE-18', 'LIC-EJDE-17', 'LIC-EJED-17', 'LIC-EDFI-18',
  'LIC-DSGD-18', 'LIC-EJAD-17', 'LIC-MEES-18', 'LIC-SYSC-18',
  'LIC-ADME-18', 'LIC-CTCO-18',
  'MAE-EDUP-22', 'MAE-MADP-22', 'MAE-MDEC-20', 'MAE-MERP-22'
];

for (const cod of todosLosCodigos) {
  const existe = carreras.some(c => c.codigo === cod);
  assert(existe, `Programa institucional ${cod} verificado en catálogo`);
}

const carreraCtco = carreras.find(c => c.codigo === 'LIC-CTCO-18');
assert(
  carreraCtco?.activa && carreraCtco.mapa_json?.cuatrimestres?.length === 9,
  'LIC-CTCO-18 está activo y conserva sus 9 cuatrimestres oficiales'
);

const alineacionFilas = matchCourseRowsToModes(
  [{ y: 100 }, { y: 85 }, { y: 70 }],
  [{ y: 100 }, { y: 70 }]
);
assert(
  alineacionFilas[0] === 0 && alineacionFilas[1] === null && alineacionFilas[2] === 1,
  'La ausencia de una calificación no desplaza la modalidad ni la nota de otros renglones'
);

assert(
  carreraCtco?.requisitos_egreso?.some(req => req.crse === 'EGCC1') &&
  !carreraCtco?.requisitos_egreso?.some(req => req.crse === '0001' || req.clave === 'TPEG-0001'),
  'LIC-CTCO-18 conserva EGEL y excluye Taller de Pre-egreso de requisitos'
);

assert(
  resolverNombreOficialCarrera({ codigo: 'LIC-COFI-18' }).includes('CONTABILIDAD Y FINANZAS'),
  'resolverNombreOficialCarrera resuelve denominación completa de LIC-COFI-18'
);

assert(
  resolverNombreOficialCarrera({ codigo: 'MAE-EDUP-22' }).includes('MAESTRÍA EN EDUCACIÓN'),
  'resolverNombreOficialCarrera resuelve denominación completa de MAE-EDUP-22'
);

// ----------------------------------------------------
// TEST SUITE 4: Limpieza, Reconocimiento y Evaluación de Calificaciones
// ----------------------------------------------------
console.log('\n--- 4. Pruebas de Limpieza y Reconocimiento de Calificaciones ---');

assert(cleanGradeToken('10') === '10', 'Limpia calificación entera 10');
assert(cleanGradeToken('10.0') === '10', 'Normaliza calificación decimal 10.0 a 10');
assert(cleanGradeToken('9.5') === '9.5', 'Conserva calificación con decimal 9.5');
assert(cleanGradeToken('8.0') === '8', 'Normaliza calificación decimal 8.0 a 8');
assert(cleanGradeToken('7.5') === '7.5', 'Conserva calificación con decimal 7.5');
assert(cleanGradeToken('6') === '6', 'Limpia calificación mínima aprobatoria 6');
assert(cleanGradeToken('5.0') === '5', 'Normaliza calificación reprobatoria decimal 5.0 a 5');
assert(cleanGradeToken('0') === '0', 'Limpia calificación cero absoluto 0');
assert(cleanGradeToken('8,5') === '8.5', 'Convierte coma decimal europea a punto decimal estándar');

// Correcciones OCR de Banner
assert(cleanGradeToken('19') === '9', 'Corrige OCR de Banner 19 a 9');
assert(cleanGradeToken('18') === '8', 'Corrige OCR de Banner 18 a 8');
assert(cleanGradeToken('17') === '7', 'Corrige OCR de Banner 17 a 7');
assert(cleanGradeToken('109') === '9', 'Corrige OCR de Banner 109 a 9');
assert(cleanGradeToken('g') === '9', 'Corrige OCR de Banner g a 9');
assert(cleanGradeToken('B') === '8', 'Corrige OCR de Banner B a 8');

// Códigos textuales institucionales
assert(cleanGradeToken('AC') === 'AC', 'Reconoce código AC (Acreditada)');
assert(cleanGradeToken('AP') === 'AP', 'Reconoce código AP (Aprobado)');
assert(cleanGradeToken('EX') === 'EX', 'Reconoce código EX (Exento)');
assert(cleanGradeToken('NP') === 'NP', 'Reconoce código NP (No Presentó)');
assert(cleanGradeToken('NA') === 'NA', 'Reconoce código NA (No Acreditó)');
assert(cleanGradeToken('SD') === 'SD', 'Reconoce código SD (Sin Derecho)');
assert(cleanGradeToken('OU') === 'OU', 'Reconoce código OU (Oportunidad Utilizada)');
assert(cleanGradeToken('BA') === 'BA', 'Reconoce código BA (Baja Administrativa)');

// Descarte de ruido y modalidades
assert(cleanGradeToken('RW') === null, 'Rechaza token de modalidad RW como calificación');
assert(cleanGradeToken('RE') === null, 'Rechaza token de modalidad RE como calificación');
assert(cleanGradeToken('CAM') === null, 'Rechaza prefijo CAM de campus como calificación');

// Evaluación booleana de acreditación (checkPassed)
assert(
  checkPassed('AC') && checkPassed('A') && checkPassed('AP') && checkPassed('EX'),
  'checkPassed acepta todos los códigos textuales aprobatorios (AC, A, AP, EX)'
);

assert(
  checkPassed('8.0') && checkPassed('6') && checkPassed('10.0') && checkPassed('7.5'),
  'checkPassed acepta calificaciones numéricas y decimales mayores o iguales a 6'
);

assert(
  !checkPassed('5.9') && !checkPassed('5') && !checkPassed('0'),
  'checkPassed rechaza calificaciones numéricas menores a 6'
);

assert(
  !checkPassed('NP') && !checkPassed('NA') && !checkPassed('SD') && !checkPassed('OU'),
  'checkPassed rechaza códigos de no acreditación o baja'
);

// Evaluación booleana de reprobación (checkFailed)
assert(
  checkFailed('NP') && checkFailed('NA') && checkFailed('SD'),
  'checkFailed reconoce códigos de reprobación oficial (NP, NA, SD)'
);

assert(
  checkFailed('5.9') && checkFailed('5') && checkFailed('0'),
  'checkFailed reconoce notas numéricas menores a 6 como reprobatorias'
);

assert(
  !checkFailed('6.0') && !checkFailed('8') && !checkFailed('AC'),
  'checkFailed no marca como reprobatoria una nota aprobatoria'
);

assert(
  isGradePassing('8.0') && isGradePassing('AC') && isGradeFailing('5.0') && isGradeFailing('SD'),
  'Funciones de validación de pdfParser coinciden en evaluación de notas'
);

// ----------------------------------------------------
// TEST SUITE 5: Reglas Normativas, Casos de Negocio Curricular e Incidencias
// ----------------------------------------------------
console.log('\n--- 5. Pruebas de Reglas Normativas y Casos de Historial ---');

const carreraCofi = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-COFI-18') || CARRERAS_LOCAL[0];

// Caso A: Alumno con avance parcial en Q1 (materias omitidas)
const auditA = runAcademicAudit(
  { matricula: '00112233', nombre: 'ALUMNO PARCIAL', programa: 'LIC-COFI-18' },
  [
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: '10', modalidad: 'RW' },
    { subj: 'LMAX', crse: 'FIS01', materia: 'FINANZAS Y CONTABILIDAD', periodo: '202210', grde: '9', modalidad: 'RW' }
  ],
  carreraCofi
);
assert(auditA !== null && auditA.resumen !== undefined, 'Auditoría genera resumen cuantitativo estructurado');
assert(typeof auditA.resumen.dictamenEstadia === 'string', 'Auditoría emite dictamen normativo formal');

// Caso A2: Alumno con 100% de materias aprobadas (Elegible Estadía y Titulación)
const carMaeEdu = CARRERAS_LOCAL.find(c => c.codigo === 'MAE-EDUP-22');
const registrosMaeEdu = [];
for (const c of carMaeEdu.mapa_json.cuatrimestres) {
  for (const m of c.materias) {
    registrosMaeEdu.push({ subj: m.subj, crse: m.crse, periodo: '2022' + c.numero + '0', grde: '10', modalidad: 'RW' });
  }
}
const auditCompleto = runAcademicAudit(
  { matricula: '00119988', nombre: 'ALUMNO EGRESADO', programa: 'MAE-EDUP-22', estatus: 'EG' },
  registrosMaeEdu,
  carMaeEdu
);
assert(
  auditCompleto.resumen.dictamenEstadia.includes('100% APROBADO') && auditCompleto.resumen.adeudos === 0,
  'Alumno con plan curricular completo califica con dictamen 100% APROBADO'
);

// Caso B: Alumno con Adeudo Activo
const auditB = runAcademicAudit(
  { matricula: '00998877', nombre: 'ALUMNO CON ADEUDO', programa: 'LIC-COFI-18' },
  [{ subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: '5', modalidad: 'RW' }],
  carreraCofi
);
assert(auditB.resumen.adeudos >= 1, 'Identifica y contabiliza reprobación activa (5)');
assert(auditB.resumen.dictamenEstadia.includes('RETENIDO'), 'Emite dictamen de retención académica por adeudo');

assert(
  auditB.resumen.adeudos >= 1,
  'Motor identifica y contabiliza reprobaciones activas (adeudos)'
);

const carreraMaestria = {
  ...carreraCofi,
  codigo: 'MAE-MPAC',
  nombre: 'MAESTRÍA EN PRUEBAS',
  requisitos_egreso: []
};
const auditoriaMaestria60 = runAcademicAudit(
  { matricula: 'MAE-001', nombre: 'ALUMNO DE MAESTRÍA', programa: carreraMaestria.codigo },
  [{ subj: 'LMFM', crse: 'HUS01', periodo: '202210', grde: '60', modalidad: 'RW' }],
  carreraMaestria
);
const auditoriaMaestria70 = runAcademicAudit(
  { matricula: 'MAE-002', nombre: 'ALUMNO DE MAESTRÍA', programa: carreraMaestria.codigo },
  [{ subj: 'LMFM', crse: 'HUS01', periodo: '202210', grde: '70', modalidad: 'RW' }],
  carreraMaestria
);
const auditoriaMaestria6 = runAcademicAudit(
  { matricula: 'MAE-003', nombre: 'ALUMNO DE MAESTRÍA', programa: carreraMaestria.codigo },
  [{ subj: 'LMFM', crse: 'HUS01', periodo: '202210', grde: '6', modalidad: 'RW' }],
  carreraMaestria
);
const auditoriaMaestria7 = runAcademicAudit(
  { matricula: 'MAE-004', nombre: 'ALUMNO DE MAESTRÍA', programa: carreraMaestria.codigo },
  [{ subj: 'LMFM', crse: 'HUS01', periodo: '202210', grde: '7', modalidad: 'RW' }],
  carreraMaestria
);
const auditoriaMaestriaRecursamientoReprobado = runAcademicAudit(
  { matricula: 'MAE-005', nombre: 'ALUMNO DE MAESTRÍA', programa: carreraMaestria.codigo },
  [
    { subj: 'LMFM', crse: 'HUS01', periodo: '202210', grde: '80', modalidad: 'RW' },
    { subj: 'LMFM', crse: 'HUS01', periodo: '202220', grde: '60', modalidad: 'RW' }
  ],
  carreraMaestria
);
const auditoriaMaestriaRecursamientoAprobado = runAcademicAudit(
  { matricula: 'MAE-006', nombre: 'ALUMNO DE MAESTRÍA', programa: carreraMaestria.codigo },
  [
    { subj: 'LMFM', crse: 'HUS01', periodo: '202210', grde: '60', modalidad: 'RW' },
    { subj: 'LMFM', crse: 'HUS01', periodo: '202220', grde: '70', modalidad: 'RW' }
  ],
  carreraMaestria
);
const auditoriaMaestriaSinCursar = runAcademicAudit(
  { matricula: 'MAE-007', nombre: 'ALUMNO DE MAESTRÍA', programa: carreraMaestria.codigo },
  [],
  carreraMaestria
);
const auditoriaMaestriaAvanceInicial = runAcademicAudit(
  { matricula: 'MAE-008', nombre: 'ALUMNO DE MAESTRÍA', programa: carreraMaestria.codigo },
  [
    { subj: 'LMFM', crse: 'HUS01', periodo: '202210', grde: '80', modalidad: 'RW' },
    { subj: 'OTRO', crse: 'NO-MAPEADO-1', periodo: '202220', grde: 'AC', modalidad: 'RW' },
    { subj: 'OTRO', crse: 'NO-MAPEADO-2', periodo: '202230', grde: 'AC', modalidad: 'RW' },
    { subj: 'OTRO', crse: 'NO-MAPEADO-3', periodo: '202240', grde: 'AC', modalidad: 'RW' },
    { subj: 'OTRO', crse: 'NO-MAPEADO-4', periodo: '202250', grde: 'AC', modalidad: 'RW' },
    { subj: 'OTRO', crse: 'NO-MAPEADO-5', periodo: '202260', grde: 'AC', modalidad: 'RW' }
  ],
  carreraMaestria
);
const carreraMaestriaCatalogo = CARRERAS_LOCAL.find(c => c.codigo === 'MAE-MADP-22');
const primerCuatrimestreMaestria = carreraMaestriaCatalogo.mapa_json.cuatrimestres[0];
const auditoriaMaestriaCatalogoSinHistorial = runAcademicAudit(
  { matricula: 'MAE-009', nombre: 'ALUMNO DE MAESTRÍA', programa: carreraMaestriaCatalogo.codigo },
  [],
  carreraMaestriaCatalogo
);
const auditoriaMaestriaCatalogoAvanceInicial = runAcademicAudit(
  { matricula: 'MAE-010', nombre: 'ALUMNO DE MAESTRÍA', programa: carreraMaestriaCatalogo.codigo },
  [
    {
      subj: primerCuatrimestreMaestria.materias[0].subj,
      crse: primerCuatrimestreMaestria.materias[0].crse,
      periodo: '202210',
      grde: '80',
      modalidad: 'RW'
    },
    ...['202220', '202230', '202240', '202250', '202260'].map((periodo, index) => ({
      subj: 'OTRO',
      crse: `NO-MAPEADO-${index}`,
      periodo,
      grde: 'AC',
      modalidad: 'RW'
    }))
  ],
  carreraMaestriaCatalogo
);
assert(
  auditoriaMaestria60.cuatrimestres[0].materias.find(m => m.crse === 'HUS01')?.audit?.estado === 'ADEUDO' &&
  auditoriaMaestria70.cuatrimestres[0].materias.find(m => m.crse === 'HUS01')?.audit?.estado === 'ORD',
  'En maestría, 60 reprueba y 70 acredita en escala de 0 a 100'
);
assert(
  auditoriaMaestria6.cuatrimestres[0].materias.find(m => m.crse === 'HUS01')?.audit?.estado === 'ADEUDO' &&
  auditoriaMaestria7.cuatrimestres[0].materias.find(m => m.crse === 'HUS01')?.audit?.estado === 'ORD',
  'En maestría, 6 reprueba y 7 acredita en escala de 0 a 10'
);
assert(
  auditoriaMaestriaRecursamientoReprobado.cuatrimestres[0].materias.find(m => m.crse === 'HUS01')?.audit?.estado === 'ADEUDO' &&
  auditoriaMaestriaRecursamientoReprobado.resumen.adeudos >= 1,
  'En maestría, un recursamiento reprobado queda como ADEUDO aunque hubiera aprobado antes'
);
assert(
  auditoriaMaestriaRecursamientoAprobado.cuatrimestres[0].materias.find(m => m.crse === 'HUS01')?.audit?.estado === 'REC',
  'En maestría, un recursamiento aprobado queda como REC'
);
assert(
  auditoriaMaestriaSinCursar.cuatrimestres
    .flatMap(cuat => cuat.materias)
    .every(materia => materia.audit?.estado === 'PENDIENTE') &&
  auditoriaMaestriaSinCursar.resumen.omitidas === 0,
  'Materias de maestría sin historial quedan PENDIENTES, no OMITIDAS'
);
assert(
  auditoriaMaestriaAvanceInicial.cuatrimestres[0].materias.find(m => m.crse === 'FIS01')?.audit?.estado === 'OMITIDA' &&
  auditoriaMaestriaAvanceInicial.cuatrimestres[1].materias[0]?.audit?.estado === 'PENDIENTE',
  'En maestría, materias de periodos ya alcanzados pueden ser OMITIDAS y las posteriores siguen PENDIENTES'
);
assert(
  auditoriaMaestriaCatalogoSinHistorial.cuatrimestres
    .flatMap(cuat => cuat.materias)
    .every(materia => materia.audit?.estado === 'PENDIENTE'),
  'El mapa real de maestría deja todas las materias PENDIENTES cuando no hay historial'
);
assert(
  auditoriaMaestriaCatalogoAvanceInicial.cuatrimestres[0].materias[1]?.audit?.estado === 'OMITIDA' &&
  auditoriaMaestriaCatalogoAvanceInicial.cuatrimestres[1].materias[0]?.audit?.estado === 'PENDIENTE',
  'El mapa real de maestría omite solo lo anterior al avance y deja periodos futuros PENDIENTES'
);
const auditoriaLicenciatura60 = runAcademicAudit(
  { matricula: 'LIC-001', nombre: 'ALUMNO DE LICENCIATURA', programa: 'LIC-COFI-18' },
  [{ subj: 'LMFM', crse: 'HUS01', periodo: '202210', grde: '60', modalidad: 'RW' }],
  carreraCofi
);
assert(
  auditoriaLicenciatura60.cuatrimestres[0].materias.find(m => m.crse === 'HUS01')?.audit?.estado === 'ORD',
  'El criterio de licenciatura continúa acreditando una calificación de 60'
);

// Alumno C: Verificación de filtro de ruido institucional
assert(
  esMateriaIgnorada({ subj: 'CUPR', crse: 'ECCF1', nombre: 'CURSO DE PREPARACIÓN EGEL' }),
  'Filtro de materias ignora correctamente actividades no curriculares'
);

// Caso D: Materia Reprobada en Ordinario y Acreditada en Regularización RE
const auditD = runAcademicAudit(
  { matricula: '00776655', nombre: 'ALUMNO RECUPERADO', programa: 'LIC-COFI-18' },
  [
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: '5', modalidad: 'RW' },
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: '8.0', modalidad: 'RE' }
  ],
  carreraCofi
);
const matHus01D = auditD.cuatrimestres[0].materias.find(m => m.crse === 'HUS01');
assert(auditD.resumen.adeudos === 0 && auditD.resumen.totalAprobadas >= 1, 'Materia acreditada en RE deja adeudos en 0');
assert(matHus01D?.audit?.estado === 'RE' && matHus01D?.audit?.color === '#0284C7', 'Materia acreditada en RE se etiqueta como MODO RE con color institucional');
assert(matHus01D?.audit?.estado !== 'ADEUDO', 'Materia acreditada en RE jamás se clasifica como ADEUDO');

// Caso E: Materia Reprobada en Ordinario y Acreditada en Recursamiento REC
const auditE = runAcademicAudit(
  { matricula: '00554433', nombre: 'ALUMNO RECURSAMIENTO', programa: 'LIC-COFI-18' },
  [
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: 'NA', modalidad: 'RW' },
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202220', grde: '9.0', modalidad: 'RW' }
  ],
  carreraCofi
);
const matHus01E = auditE.cuatrimestres[0].materias.find(m => m.crse === 'HUS01');
assert(auditE.resumen.adeudos === 0 && matHus01E?.audit?.estado === 'REC', 'Materia acreditada en recursamiento tiene estado REC');
assert(matHus01E?.audit?.numIntentos === 2, 'Materia en recursamiento contabiliza 2 intentos');

// Caso F: 3 intentos con 2 reprobaciones y posterior acreditación
const auditF = runAcademicAudit(
  { matricula: '00332211', nombre: 'ALUMNO 3 INTENTOS', programa: 'LIC-COFI-18' },
  [
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202110', grde: '5', modalidad: 'RW' },
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202120', grde: '5', modalidad: 'RW' },
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: '7.5', modalidad: 'RW' }
  ],
  carreraCofi
);
const matHus01F = auditF.cuatrimestres[0].materias.find(m => m.crse === 'HUS01');
assert(auditF.resumen.adeudos === 0 && matHus01F?.audit?.estado === 'REC', 'Acreditación tras 2 reprobaciones no genera adeudo');
assert(matHus01F?.audit?.numIntentos === 3, 'Contabiliza exactamente los 3 intentos en el historial');

// Caso G: Alumno actualmente cursando materia reprobada previamente
const auditG = runAcademicAudit(
  { matricula: '00443322', nombre: 'ALUMNO RECURSANDO CURSO', programa: 'LIC-COFI-18' },
  [
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: '5', modalidad: 'RW' },
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202220', grde: '', modalidad: 'RW' }
  ],
  carreraCofi
);
assert(auditG.cuatrimestres[0].materias[0].audit.estado === 'RECURSANDO', 'Identifica materia en recursamiento activo (RECURSANDO)');

// Caso H: Asignatura dada de baja (OU)
const auditH = runAcademicAudit(
  { matricula: '00221100', nombre: 'ALUMNO OU', programa: 'LIC-COFI-18' },
  [{ subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: 'OU', modalidad: 'RW' }],
  carreraCofi
);
assert(auditH.cuatrimestres[0].materias[0].audit.estado === 'OU' && auditH.resumen.adeudos === 0, 'Asignatura en OU no genera adeudo');

// Caso I: Materia omitida en cuatrimestre anterior
const auditI = runAcademicAudit(
  { matricula: '00889900', nombre: 'ALUMNO OMITIDA', programa: 'LIC-COFI-18' },
  [{ subj: 'LMAX', crse: 'CFS02', materia: 'CONTABILIDAD DE COSTOS', periodo: '202310', grde: '10', modalidad: 'RW' }], // Materia de 3er cuatrimestre
  carreraCofi
);
assert(auditI.cuatrimestres[0].materias[0].audit.estado === 'OMITIDA', 'Materia de cuatrimestre no cursado se marca como OMITIDA');

// Caso J: Desfase de primer cuatrimestre
const auditJ = runAcademicAudit(
  { matricula: '00667788', nombre: 'ALUMNO DESFASE', programa: 'LIC-COFI-18' },
  [
    { subj: 'LMAX', crse: 'FIS01', materia: 'FINANZAS', periodo: '202110', grde: '10', modalidad: 'RW' },
    { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202220', grde: '10', modalidad: 'RW' }
  ],
  carreraCofi
);
assert(auditJ.cuatrimestres[0].materias[0].audit.tieneDesfase === true, 'Detecta materia de 1er cuatrimestre cursada con desfase');

// Caso K: Exención de inglés institucional LENG-0008
const auditExento = runAcademicAudit(
  { matricula: '00990011', nombre: 'ALUMNO EXENTO', programa: 'LIC-COFI-18' },
  [{ subj: 'LENG', crse: '0008', materia: 'EXENCIÓN DE INGLÉS', periodo: '202210', grde: 'AC', modalidad: 'RW' }],
  carreraCofi
);
assert(auditExento.exentoIngles === true && auditExento.resumen.inglesAcreditados === 5, 'LENG-0008 exenta los 5 niveles de inglés');

// Caso L: Acreditación de inglés por nivel
const auditIngles = runAcademicAudit(
  { matricula: '00990022', nombre: 'ALUMNO INGLES 1', programa: 'LIC-COFI-18' },
  [{ subj: 'INHH', crse: 'F001', materia: 'INGLES I', periodo: '202210', grde: 'AC', modalidad: 'RW' }],
  carreraCofi
);
assert(auditIngles.resumen.inglesAcreditados >= 1, 'Reconoce acreditación individual del nivel de inglés F001');

// Caso M: Materias aprobadas del historial CTCO sin clasificar como adeudos
const registrosAcreditadosCtco = [
  { subj: 'LMPQ', crse: 'COS04', periodo: '202520', calificacion: '8', modalidad: 'RW' },
  { subj: 'LMQP', crse: 'COS03', periodo: '202520', calificacion: '7', modalidad: 'RW' },
  { subj: 'LMPQ', crse: 'COS07', periodo: '202540', calificacion: '8', modalidad: 'RW' },
  { subj: 'LMPK', crse: 'DGT01', periodo: '202620', calificacion: '9', modalidad: 'RW' },
  { subj: 'LMKP', crse: 'MKS11', periodo: '202540', calificacion: '6', modalidad: 'RW' }
];
const auditAcreditadosCtco = runAcademicAudit(
  { matricula: '00682376', nombre: 'PRUEBA DE CALIFICACIONES', programa: 'LIC-CTCO-18' },
  registrosAcreditadosCtco,
  carreraCtco
);
const clavesAcreditadasCtco = new Set(registrosAcreditadosCtco.map(r => r.crse));
const materiasAcreditadasCtco = auditAcreditadosCtco.cuatrimestres
  .flatMap(c => c.materias)
  .filter(m => clavesAcreditadasCtco.has(m.crse));
assert(
  materiasAcreditadasCtco.length === clavesAcreditadasCtco.size &&
  materiasAcreditadasCtco.every(m => m.audit?.estado === 'ORD') &&
  auditAcreditadosCtco.resumen.adeudos === 0,
  'Las cinco materias aprobadas del historial CTCO no se clasifican como adeudos'
);

// Caso N: Filtrado normativo de actividades no curriculares
assert(
  esMateriaIgnorada({ subj: 'CUPR', crse: 'EGCC1' }),
  'Curso preparatorio EGEL (CUPR-EGCC1) es filtrado como materia no curricular'
);

assert(esMateriaIgnorada({ subj: 'CUPR', crse: 'ECCF1' }), 'esMateriaIgnorada filtra cursos no curriculares');
assert(MATERIAS_IGNORADAS.includes('TPEG-0001'), 'MATERIAS_IGNORADAS incluye Taller de Pre-egreso');

// Caso O: Promedio Aprobatorio (Opción A) - Alumno que apenas inicia su carrera sin notas concluidas
const auditNuevoIngreso = runAcademicAudit(
  { matricula: '00100001', nombre: 'ALUMNO NUEVO INGRESO', programa: 'LIC-COFI-18' },
  [],
  carreraCofi
);
assert(
  auditNuevoIngreso.resumen.promedio === null &&
  auditNuevoIngreso.resumen.promedioFormatted === 'S/C' &&
  auditNuevoIngreso.resumen.materiasConNota === 0,
  'Alumno de nuevo ingreso sin materias concluidas reporta promedio S/C y null'
);

// Caso P: Promedio Aprobatorio (Opción A) - Alumno con 1 sola materia recién aprobada
const auditUnaMateria = runAcademicAudit(
  { matricula: '00100002', nombre: 'ALUMNO 1 MATERIA', programa: 'LIC-COFI-18' },
  [{ subj: 'LMFM', crse: 'HUS01', periodo: '202520', calificacion: '8.5', modalidad: 'RW' }],
  carreraCofi
);
assert(
  auditUnaMateria.resumen.promedio === 8.5 &&
  auditUnaMateria.resumen.promedioFormatted === '8.50' &&
  auditUnaMateria.resumen.materiasConNota === 1,
  'Alumno con 1 materia aprobada calcula promedio exacto de 8.50'
);

// Caso Q: Promedio Aprobatorio (Opción A) - Alumno con múltiples materias aprobadas (10, 9, 8)
const auditMultiples = runAcademicAudit(
  { matricula: '00100003', nombre: 'ALUMNO MULTIPLES NOTAS', programa: 'LIC-COFI-18' },
  [
    { subj: 'LMFM', crse: 'HUS01', periodo: '202520', calificacion: '10', modalidad: 'RW' },
    { subj: 'LMAX', crse: 'FIS01', periodo: '202520', calificacion: '9', modalidad: 'RW' },
    { subj: 'LMIX', crse: 'HTS01', periodo: '202520', calificacion: '8', modalidad: 'RW' }
  ],
  carreraCofi
);
assert(
  auditMultiples.resumen.promedio === 9.0 &&
  auditMultiples.resumen.promedioFormatted === '9.00' &&
  auditMultiples.resumen.materiasConNota === 3,
  'Alumno con 3 materias (10, 9, 8) calcula promedio exacto de 9.00'
);

// Caso R: Promedio Aprobatorio (Opción A) - Reprobación y recursamiento aprobado toma solo la nota aprobada
const auditRecursoProm = runAcademicAudit(
  { matricula: '00100004', nombre: 'ALUMNO RECURSO PROM', programa: 'LIC-COFI-18' },
  [
    { subj: 'LMFM', crse: 'HUS01', periodo: '202510', calificacion: '5', modalidad: 'RW' },
    { subj: 'LMFM', crse: 'HUS01', periodo: '202520', calificacion: '9', modalidad: 'RW' }
  ],
  carreraCofi
);
assert(
  auditRecursoProm.resumen.promedio === 9.0 &&
  auditRecursoProm.resumen.materiasConNota === 1,
  'Promedio Opción A toma únicamente la calificación aprobatoria definitiva ignorando reprobación previa'
);

// Caso S: Promedio Aprobatorio (Opción A) - Adeudo activo no solventado no se promedia como aprobada
const auditAdeudoProm = runAcademicAudit(
  { matricula: '00100005', nombre: 'ALUMNO SOLO ADEUDO', programa: 'LIC-COFI-18' },
  [{ subj: 'LMFM', crse: 'HUS01', periodo: '202510', calificacion: '5', modalidad: 'RW' }],
  carreraCofi
);
assert(
  auditAdeudoProm.resumen.promedio === null &&
  auditAdeudoProm.resumen.promedioFormatted === 'S/C' &&
  auditAdeudoProm.resumen.materiasConNota === 0,
  'Adeudo activo sin solventar no cuenta en promedio aprobatorio Opción A'
);

// Caso T: Promedio Aprobatorio (Opción A) - Calificaciones cualitativas (AC, EX) no distorsionan promedio
const auditQualitativa = runAcademicAudit(
  { matricula: '00100006', nombre: 'ALUMNO CUALITATIVO', programa: 'LIC-COFI-18' },
  [
    { subj: 'LMFM', crse: 'HUS01', periodo: '202520', calificacion: '10', modalidad: 'RW' },
    { subj: 'LENG', crse: '0008', periodo: '202520', calificacion: 'AC', modalidad: 'RW' }
  ],
  carreraCofi
);
assert(
  auditQualitativa.resumen.promedio === 10.0 &&
  auditQualitativa.resumen.materiasConNota === 1,
  'Acreditaciones cualitativas (AC, EX) no distorsionan ni generan NaN en el promedio'
);

// Caso U: Promedio Aprobatorio en Maestría (MAE-MADP-22) con 12 asignaturas acreditadas (9 y 10)
const carMaeMadp = CARRERAS_LOCAL.find(c => c.codigo === 'MAE-MADP-22');
const registrosMaeMadp = [
  { crse: 'ADV02', subj: 'MPAC', calificacion: '9', periodo: '202210', modalidad: 'RW' },
  { crse: 'ADV03', subj: 'MPAC', calificacion: '9', periodo: '202210', modalidad: 'RW' },
  { crse: 'ADV04', subj: 'MPAC', calificacion: '10', periodo: '202210', modalidad: 'RW' },
  { crse: 'FIV01', subj: 'MPAC', calificacion: '9', periodo: '202220', modalidad: 'RW' },
  { crse: 'NEV02', subj: 'MPAC', calificacion: '10', periodo: '202220', modalidad: 'RW' },
  { crse: 'ADV05', subj: 'MPAC', calificacion: '10', periodo: '202220', modalidad: 'RW' },
  { crse: 'FIV02', subj: 'MPAC', calificacion: '9', periodo: '202230', modalidad: 'RW' },
  { crse: 'MKV01', subj: 'MPAC', calificacion: '10', periodo: '202230', modalidad: 'RW' },
  { crse: 'ADV01', subj: 'MPAC', calificacion: '10', periodo: '202230', modalidad: 'RW' },
  { crse: 'ADV07', subj: 'MPAC', calificacion: '10', periodo: '202310', modalidad: 'RW' },
  { crse: 'ADV06', subj: 'MPAC', calificacion: '9', periodo: '202310', modalidad: 'RW' },
  { crse: 'NEV03', subj: 'MPAC', calificacion: '10', periodo: '202310', modalidad: 'RW' }
];
const auditMaeMadp = runAcademicAudit(
  { matricula: '00285759', nombre: 'Noj Ortiz Dariana Guadalupe', programa: 'MAE-MADP-22' },
  registrosMaeMadp,
  carMaeMadp
);
assert(
  auditMaeMadp.estudiante.modalidadDetectada === 'MAESTRÍA' &&
  auditMaeMadp.resumen.promedio === 9.58 &&
  auditMaeMadp.resumen.promedioFormatted === '9.58' &&
  auditMaeMadp.resumen.materiasConNota === 12,
  'Maestría MAE-MADP-22 calcula promedio exacto de 9.58 con 12 materias y modalidad MAESTRÍA'
);

// Caso V: Alumna Aguilar Aguilar Yessica Estefania (00312175) en MAE-MADP-22 (Promedio 9.17)
const registrosYessica = [
  { crse: 'ADV01', subj: 'MPAC', calificacion: '10', periodo: '202620', modalidad: 'RW' },
  { crse: 'ADV02', subj: 'MPAC', calificacion: '9', periodo: '202540', modalidad: 'RW' },
  { crse: 'ADV03', subj: 'MPAC', calificacion: '7', periodo: '202540', modalidad: 'RW' },
  { crse: 'ADV04', subj: 'MPAC', calificacion: '10', periodo: '202540', modalidad: 'RW' },
  { crse: 'ADV05', subj: 'MPAC', calificacion: '10', periodo: '202560', modalidad: 'RW' },
  { crse: 'ADV06', subj: 'MPAC', calificacion: '9', periodo: '202640', modalidad: 'RW' },
  { crse: 'ADV07', subj: 'MPAC', calificacion: '10', periodo: '202640', modalidad: 'RW' },
  { crse: 'FIV01', subj: 'MPAC', calificacion: '8', periodo: '202560', modalidad: 'RW' },
  { crse: 'FIV02', subj: 'MPAC', calificacion: '8', periodo: '202620', modalidad: 'RW' },
  { crse: 'MKV01', subj: 'MPAC', calificacion: '10', periodo: '202620', modalidad: 'RW' },
  { crse: 'NEV02', subj: 'MPAC', calificacion: '10', periodo: '202560', modalidad: 'RW' },
  { crse: 'NEV03', subj: 'MPAC', calificacion: '9', periodo: '202640', modalidad: 'RW' }
];
const auditYessica = runAcademicAudit(
  { matricula: '00312175', nombre: 'Aguilar Aguilar Yessica Estefania', programa: 'MAE-MADP-22' },
  registrosYessica,
  carMaeMadp
);
assert(
  auditYessica.estudiante.modalidadDetectada === 'MAESTRÍA' &&
  auditYessica.resumen.promedio === 9.17 &&
  auditYessica.resumen.promedioFormatted === '9.17' &&
  auditYessica.resumen.materiasConNota === 12,
  'Alumna Yessica Estefania (00312175) calcula promedio exacto de 9.17 y modalidad MAESTRÍA'
);

// Caso W: Detección automática de MAESTRÍA por asignaturas MPAC aun cuando programa viene vacío
const auditSinProg = runAcademicAudit(
  { matricula: '00312175', nombre: 'Aguilar Aguilar Yessica Estefania', programa: '' },
  registrosYessica,
  carMaeMadp
);
assert(
  auditSinProg.estudiante.modalidadDetectada === 'MAESTRÍA' &&
  auditSinProg.estudiante.programa === 'MAE-MADP-22' &&
  auditSinProg.resumen.promedio === 9.17,
  'Reconoce modalidad MAESTRÍA y asigna MAE-MADP-22 automáticamente por prefijo de materia MPAC'
);

// ----------------------------------------------------
// TEST SUITE 6: Compatibilidad Estructural de los 18 Mapas Curriculares Institucionales
// ----------------------------------------------------
console.log('\n--- 6. Verificación Estructural de los 18 Mapas Curriculares (14 Lic + 4 Mae) ---');

assert(CARRERAS_LOCAL.length === 18, `CARRERAS_LOCAL contiene 18 programas completos (detectados: ${CARRERAS_LOCAL.length})`);

const expectativasMapas = [
  { codigo: 'LIC-COFI-18', cuats: 9, mats: 37 },
  { codigo: 'LIC-DAEM-18', cuats: 10, mats: 46 },
  { codigo: 'LIC-EJCO-17', cuats: 9, mats: 44 },
  { codigo: 'LIC-ARQU-18', cuats: 9, mats: 37 },
  { codigo: 'LIC-DERE-18', cuats: 9, mats: 37 },
  { codigo: 'LIC-EJDE-17', cuats: 9, mats: 44 },
  { codigo: 'LIC-EJED-17', cuats: 9, mats: 44 },
  { codigo: 'LIC-EDFI-18', cuats: 9, mats: 37 },
  { codigo: 'LIC-DSGD-18', cuats: 9, mats: 37 },
  { codigo: 'LIC-EJAD-17', cuats: 9, mats: 49 },
  { codigo: 'LIC-MEES-18', cuats: 9, mats: 37 },
  { codigo: 'LIC-SYSC-18', cuats: 9, mats: 37 },
  { codigo: 'LIC-ADME-18', cuats: 9, mats: 37 },
  { codigo: 'LIC-CTCO-18', cuats: 9, mats: 37 },
  { codigo: 'MAE-EDUP-22', cuats: 5, mats: 15 },
  { codigo: 'MAE-MADP-22', cuats: 5, mats: 15 },
  { codigo: 'MAE-MDEC-20', cuats: 5, mats: 15 },
  { codigo: 'MAE-MERP-22', cuats: 5, mats: 15 }
];

for (const exp of expectativasMapas) {
  const car = CARRERAS_LOCAL.find(c => c.codigo === exp.codigo);
  const audit = runAcademicAudit(
    { matricula: '00000000', nombre: `TEST ${exp.codigo}`, programa: exp.codigo },
    [],
    car
  );
  const totalMats = audit?.cuatrimestres?.reduce((acc, c) => acc + (c.materias?.length || 0), 0);
  assert(
    audit && audit.cuatrimestres.length === exp.cuats && totalMats === exp.mats,
    `Mapa ${exp.codigo} verificado: ${exp.cuats} cuatrimestres y ${exp.mats} materias oficiales`
  );
}

// ----------------------------------------------------
// RESUMEN FINAL
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`TOTAL DE PRUEBAS EJECUTADAS: ${totalTests}`);
console.log(`PRUEBAS EXITOSAS: ${passedTests}`);
console.log(`PRUEBAS FALLIDAS: ${failedTests}`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
