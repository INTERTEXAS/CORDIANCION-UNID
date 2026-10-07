import { CARRERAS_LOCAL } from './src/data/carrerasData.js';
import { runAcademicAudit } from './src/services/auditEngine.js';
const daem = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-DAEM-18');
const est = { programa: 'LIC-DAEM-18', matricula: '123' };
const regs = [];
try {
  runAcademicAudit(est, regs, daem);
  console.log('SUCCESS');
} catch(e) {
  console.log('ERROR:', e);
}
