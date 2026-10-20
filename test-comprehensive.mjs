import fs from 'fs';
import { runAcademicAudit, esMateriaIgnorada } from './src/services/auditEngine.js';
import { detectarModalidad, matchCourseRowsToModes } from './src/services/pdfParser.js';
import { isValidUnidEmail, getAccountEmail } from './src/authConfig.js';
import { getCarreras } from './src/services/neonService.js';
import { CARRERAS_LOCAL } from './src/data/carrerasData.js';

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
assert(carreras.length >= 14, `Catálogo contiene al menos 14 programas institucionales (detectados: ${carreras.length})`);

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
const alineacionFilas = matchCourseRowsToModes(
  [{ y: 100 }, { y: 85 }, { y: 70 }],
  [{ y: 100 }, { y: 70 }]
);
assert(
  alineacionFilas[0] === 0 && alineacionFilas[1] === null && alineacionFilas[2] === 1,
  'La ausencia de una calificación no desplaza la modalidad ni la nota de otros renglones'
);
const auditoriaCtco = runAcademicAudit(
  { matricula: 'CTCO-TEST', nombre: 'PRUEBA CTCO', programa: 'LIC-CTCO-18' },
  [],
  carreraCtco
);
assert(
  auditoriaCtco.resumen.totalMateriasMapa === 37 &&
  carreraCtco.requisitos_egreso.some(req => req.crse === 'EGCC1') &&
  !auditoriaCtco.coCurriculares.some(req => req.crse === '0001' || req.clave === 'TPEG-0001') &&
  auditoriaCtco.electivas.length === 10,
  'LIC-CTCO-18 conserva EGEL y excluye Taller de Pre-egreso de requisitos'
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

// Alumno D: Estudiante que reprobó en ordinario (5) pero acreditó en regularización RE (8.0)
const registrosD = [
  { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: '5', modalidad: 'RW' },
  { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: '8.0', modalidad: 'RE' }
];

const auditD = runAcademicAudit(
  { matricula: '00776655', nombre: 'ALUMNO RECUPERADO', programa: 'LIC-COFI-18' },
  registrosD,
  carreraCofi
);

const materiaHus01 = auditD.cuatrimestres[0].materias.find(m => m.crse === 'HUS01');
assert(
  auditD.resumen.adeudos === 0 &&
  auditD.resumen.totalAprobadas >= 1 &&
  materiaHus01?.audit?.estado === 'RE' &&
  materiaHus01?.audit?.estado !== 'ADEUDO',
  'Materia con reprobación histórica acreditada en RE nunca se clasifica como ADEUDO'
);

// Alumno E: Estudiante que reprobó en ordinario (NA) y acreditó en recursamiento posterior (9.0)
const registrosE = [
  { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202210', grde: 'NA', modalidad: 'RW' },
  { subj: 'LMFM', crse: 'HUS01', materia: 'SER HUMANO', periodo: '202220', grde: '9.0', modalidad: 'RW' }
];

const auditE = runAcademicAudit(
  { matricula: '00554433', nombre: 'ALUMNO RECURSAMIENTO', programa: 'LIC-COFI-18' },
  registrosE,
  carreraCofi
);

const materiaHus01Rec = auditE.cuatrimestres[0].materias.find(m => m.crse === 'HUS01');
assert(
  auditE.resumen.adeudos === 0 &&
  auditE.resumen.totalAprobadas >= 1 &&
  materiaHus01Rec?.audit?.estado === 'REC',
  'Materia acreditada en recursamiento se clasifica como REC y no genera adeudo'
);

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

// ----------------------------------------------------
// TEST SUITE 5: Compatibilidad del Motor con los 18 Mapas Curriculares (14 Licenciaturas + 4 Maestrías)
// ----------------------------------------------------
console.log('\n--- 5. Compatibilidad del Motor con los 18 Mapas Curriculares Institucionales ---');

assert(CARRERAS_LOCAL.length === 18, `CARRERAS_LOCAL contiene 18 programas completos (detectados: ${CARRERAS_LOCAL.length})`);

for (const car of CARRERAS_LOCAL) {
  const auditCarrera = runAcademicAudit(
    { matricula: '00000000', nombre: 'TEST CARRERA', programa: car.codigo },
    [],
    car
  );
  const minCuats = car.codigo.startsWith('MAE-') ? 5 : 8;
  assert(
    auditCarrera && auditCarrera.cuatrimestres && auditCarrera.cuatrimestres.length >= minCuats,
    `Motor calcula mapa curricular completo para ${car.codigo} (${car.nombre.substring(0, 25)}...)`
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
