import { runAcademicAudit, esMateriaIgnorada } from './src/services/auditEngine.js';
import { detectarModalidad } from './src/services/pdfParser.js';
import { isValidUnidEmail, getAccountEmail } from './src/authConfig.js';
import { getCarreras } from './src/services/neonService.js';
import { CARRERAS_LOCAL } from './src/data/carrerasData.js';

console.log('====================================================');
console.log('REVISIÓN Y TESTEO INTEGRAL DEL SISTEMA UNID');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${testName} - ${details}`);
  }
}

// ----------------------------------------------------
// TEST SUITE 1: Validación de correos institucionales (@unid.mx)
// ----------------------------------------------------
console.log('\n--- 1. Pruebas de Validación de Correo (@unid.mx) ---');

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

// ----------------------------------------------------
// TEST SUITE 2: Detección de Modalidad en Kárdex
// ----------------------------------------------------
console.log('\n--- 2. Pruebas de Detección de Modalidad ---');

assert(
  detectarModalidad({ programa: 'LIC-COFI-18' }).modalidadDetectada === 'ESCOLARIZADO',
  'Detecta modalidad ESCOLARIZADO para programa regular'
);

assert(
  detectarModalidad({ programa: 'LIC-EJCO-17' }).modalidadDetectada === 'EJECUTIVO',
  'Detecta modalidad EJECUTIVO para programa ejecutivo'
);

assert(
  detectarModalidad({ programa: 'LIC-DERE-18' }, [{ subj: 'EDER', crse: 'EDER01' }]).modalidadDetectada === 'EJECUTIVO',
  'Detecta modalidad EJECUTIVO por prefijo de asignatura de posgrado/ejecutivo'
);

// ----------------------------------------------------
// TEST SUITE 3: Catálogo de Carreras (14 Programas)
// ----------------------------------------------------
console.log('\n--- 3. Pruebas de Catálogo Oficial de Carreras ---');

const resCarreras = await getCarreras();
const carreras = resCarreras?.carreras || resCarreras || [];
assert(carreras.length === 14, `Catálogo contiene exactamente 14 programas (detectados: ${carreras.length})`);

const codigosEsperados = [
  'LIC-COFI-18', 'LIC-DAEM-18', 'LIC-EJCO-17', 'LIC-ARQU-18',
  'LIC-DERE-18', 'LIC-EJDE-17', 'LIC-EJED-17', 'LIC-EDFI-18',
  'LIC-DSGD-18', 'LIC-EJAD-17', 'LIC-MEES-18', 'LIC-SYSC-18',
  'LIC-ADME-18', 'LIC-CTCO-18'
];

for (const cod of codigosEsperados) {
  const existe = carreras.some(c => c.codigo === cod);
  assert(existe, `Carrera ${cod} presente y activa en el catálogo`);
}

const carreraCtco = carreras.find(c => c.codigo === 'LIC-CTCO-18');
assert(
  carreraCtco?.activa && carreraCtco.mapa_json?.cuatrimestres?.length === 9,
  'LIC-CTCO-18 está activo y conserva sus 9 cuatrimestres'
);
const modalidadCtco = detectarModalidad({ programa: 'LIC-CTCO-18' });
assert(
  modalidadCtco.programa === 'LIC-CTCO-18' && modalidadCtco.modalidadDetectada === 'ESCOLARIZADO',
  'LIC-CTCO-18 se reconoce como programa escolarizado'
);
const auditoriaCtco = runAcademicAudit(
  { matricula: 'CTCO-TEST', nombre: 'PRUEBA CTCO', programa: 'LIC-CTCO-18' },
  [],
  carreraCtco
);
assert(
  auditoriaCtco.resumen.totalMateriasMapa === 37 &&
  carreraCtco.requisitos_egreso.some(req => req.crse === 'EGCC1') &&
  auditoriaCtco.coCurriculares.some(req => req.crse === '0001') &&
  auditoriaCtco.electivas.length === 10,
  'LIC-CTCO-18 conserva EGEL y procesa mapa, electivas y Taller de Pre-egreso'
);

// ----------------------------------------------------
// TEST SUITE 4: Motor de Auditoría Académica y Reglas Normativas
// ----------------------------------------------------
console.log('\n--- 4. Pruebas del Motor de Auditoría Curricular ---');

const carreraCofi = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-COFI-18') || CARRERAS_LOCAL[0];

// Alumno A: Estudiante con materias aprobadas
const registrosA = [
  { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: '10', modalidad: 'RW' },
  { subj: 'LMAX', crse: 'FIS01', materia: 'FINANZAS Y CONTABILIDAD', periodo: '202210', grde: '9', modalidad: 'RW' }
];

const auditA = runAcademicAudit(
  { matricula: '00112233', nombre: 'ALUMNO REGULAR', programa: 'LIC-COFI-18' },
  registrosA,
  carreraCofi
);

assert(auditA !== null, 'Motor genera objeto de auditoría estructurado');
assert(auditA.resumen !== undefined, 'Auditoría incluye resumen cuantitativo');
assert(typeof auditA.resumen.dictamenEstadia === 'string', 'Auditoría emite dictamen normativo formal');
assert(auditA.cuatrimestres && auditA.cuatrimestres.length === 9, 'Mapa cuenta con los 9 cuatrimestres oficiales');

// Alumno B: Estudiante con reprobación activa (adeudo)
const registrosB = [
  { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: '5', modalidad: 'RW' }
];

const auditB = runAcademicAudit(
  { matricula: '00998877', nombre: 'ALUMNO CON ADEUDO', programa: 'LIC-COFI-18' },
  registrosB,
  carreraCofi
);

assert(
  auditB.resumen.adeudos >= 1,
  'Motor identifica y contabiliza reprobaciones activas (adeudos)'
);

// Alumno C: Verificación de filtro de ruido institucional
assert(
  esMateriaIgnorada({ subj: 'CUPR', crse: 'ECCF1', nombre: 'CURSO DE PREPARACIÓN EGEL' }),
  'Filtro de materias ignora correctamente actividades no curriculares'
);

// ----------------------------------------------------
// TEST SUITE 5: Compatibilidad del Motor con las 13 Carreras
// ----------------------------------------------------
console.log('\n--- 5. Compatibilidad del Motor con los 14 Mapas Curriculares ---');

for (const car of CARRERAS_LOCAL) {
  const auditCarrera = runAcademicAudit(
    { matricula: '00000000', nombre: 'TEST CARRERA', programa: car.codigo },
    [],
    car
  );
  assert(
    auditCarrera && auditCarrera.cuatrimestres && auditCarrera.cuatrimestres.length >= 8,
    `Motor calcula mapa curricular completo para ${car.codigo} (${car.nombre.substring(0, 20)}...)`
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
