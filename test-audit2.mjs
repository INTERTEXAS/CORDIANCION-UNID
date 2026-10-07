import fs from 'fs';
import { CARRERAS_LOCAL, REQUISITOS_EGRESO } from './src/data/carrerasData.js';
const code = fs.readFileSync('./src/services/auditEngine.js', 'utf8');
const safeCode = code.replace("import { detectarModalidad } from './pdfParser.js';", "const detectarModalidad = (e, r) => e;");
fs.writeFileSync('./src/services/auditEngine-temp.js', safeCode);

import { runAcademicAudit } from './src/services/auditEngine-temp.js';
const daem = CARRERAS_LOCAL.find(c => c.codigo === 'LIC-DAEM-18');
const est = { programa: 'LIC-DAEM-18', matricula: '123' };
const regs = [];
try {
  runAcademicAudit(est, regs, daem);
  console.log('SUCCESS');
} catch(e) {
  console.log('ERROR:', e.stack);
}
