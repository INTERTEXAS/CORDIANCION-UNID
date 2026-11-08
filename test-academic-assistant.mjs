import assert from 'node:assert/strict';
import handler from './api/academic-assistant.js';
import adminSessionHandler from './api/academic-assistant-admin-session.js';

process.env.DATABASE_URL = 'postgresql://localhost/test';
process.env.ACADEMIC_ASSISTANT_ADMIN_SECRET = 'test-secret-with-more-than-thirty-two-characters';

const queries = [];
const student = {
  matricula: '12345678',
  nombre: 'ANA PRUEBA',
  carrera_codigo: 'LIC-DAEM-18',
  ciclo_escolar: '2026',
  estatus_estadia: 'EN REVISIÓN',
  datos_completos: {
    auditData: {
      resumen: { totalMateriasMapa: 30, totalAprobadas: 25, adeudos: 2, omitidas: 1, pendientes: 3, esElegibleEstadia: false },
      cuatrimestres: [{
        numero: 4,
        materias: [{ clave: 'MAT-04', nombre: 'Matemáticas', audit: { estado: 'ADEUDO' } }]
      }]
    }
  }
};

const sqlClient = async (strings, ...values) => {
  const query = strings.join('$');
  queries.push({ query, values });

  if (query.includes('FROM usuarios')) {
    const email = values[0];
    return [{
      email,
      password_hash: 'correct-password',
      rol: email === 'admin@unid.mx' ? 'ADMIN_SISTEMA' : 'DOCENTE'
    }];
  }
  if (query.includes('WHERE matricula =')) return [{ ...student }];
  if (query.includes('LEFT JOIN carreras c')) {
    return [{
      matricula: student.matricula,
      nombre: student.nombre,
      carrera_codigo: student.carrera_codigo,
      ciclo_escolar: student.ciclo_escolar,
      estatus_estadia: student.estatus_estadia
    }];
  }
  if (query.includes('WHERE nombre ILIKE') && values.includes('%Rios%')) {
    return [
      { matricula: '11111111', nombre: 'ANA RIOS', carrera_codigo: 'LIC-DAEM-18', ciclo_escolar: '2026', estatus_estadia: 'EN REVISIÓN' },
      { matricula: '22222222', nombre: 'LUIS RIOS', carrera_codigo: 'LIC-EJCO-17', ciclo_escolar: '2025', estatus_estadia: 'PENDIENTE' }
    ];
  }
  if (query.includes('WHERE nombre ILIKE')) return [{ ...student }];
  if (query.includes('DISTINCT ON (matricula)')) return [{ ...student }];
  if (query.includes('FROM carreras c')) {
    return [{ codigo: 'LIC-DAEM-18', nombre: 'Administración', total_auditorias: 3 }];
  }
  if (query.includes('WITH resumenes_por_ciclo')) {
    return [{ carrera_codigo: 'LIC-DAEM-18', ciclo_escolar: '2026', total: 3, elegibles: 1, requieren_revision: 2 }];
  }
  throw new Error(`Consulta SQL inesperada en prueba: ${query}`);
};

function createResponse() {
  return {
    setHeader() {},
    end(body) {
      this.body = JSON.parse(body);
    }
  };
}

async function ask(question, history = []) {
  const res = createResponse();
  await handler(
    { method: 'POST', headers: {}, body: { question, history } },
    res,
    { allowLocalAuthBypass: true, sqlClient }
  );
  return res;
}

let passed = 0;
async function test(name, run) {
  await run();
  passed += 1;
  console.log(`PASS ${passed}/5 ${name}`);
}

await test('rechaza solicitudes sin autenticación institucional', async () => {
  const res = createResponse();
  await handler(
    { method: 'POST', headers: {}, body: { question: '¿Qué hay en la base de datos?' } },
    res
  );
  assert.equal(res.statusCode, 401);
});

await test('al recibir una matrícula pregunta qué dato académico se necesita', async () => {
  const res = await ask('Revisa la matrícula 12345678');
  assert.match(res.body.reply, /¿Qué información necesitas consultar\?/);
  assert.match(res.body.reply, /Adeudos y materias pendientes/);
  assert.doesNotMatch(res.body.reply, /Adeudos: 2/);
});

await test('usa la matrícula de la conversación para responder el dato solicitado', async () => {
  const prompt = await ask('Revisa la matrícula 12345678');
  const followUp = await ask('Quiero saber sus adeudos y pendientes', [
    { role: 'user', content: 'Revisa la matrícula 12345678' },
    { role: 'assistant', content: prompt.body.reply }
  ]);
  assert.match(followUp.body.reply, /Adeudos: 2/);
  assert.match(followUp.body.reply, /Pendientes: 3/);
  assert.match(followUp.body.reply, /Matemáticas — ADEUDO/);
  assert(queries.some(({ query, values }) => query.includes('WHERE matricula =') && values.includes('12345678')));
});

await test('busca por nombre y lista alumnos filtrados por carrera', async () => {
  const byName = await ask('Busca al alumno Ana Prueba');
  assert.match(byName.body.reply, /ANA PRUEBA/);
  assert.match(byName.body.reply, /¿Qué información necesitas consultar/);

  const namedDebtLookup = await ask('¿Qué adeudos tiene Ana Prueba?');
  assert.match(namedDebtLookup.body.reply, /Adeudos: 2/);

  const byCareer = await ask('Lista alumnos de la carrera LIC-DAEM-18');
  assert.match(byCareer.body.reply, /LIC-DAEM-18/);
  assert(queries.some(({ query, values }) => query.includes('LEFT JOIN carreras c') && values.includes('%LIC-DAEM-18%')));
});

await test('responde carreras y resumen de base, y no envía datos de alumnos a Gemini', async () => {
  const careers = await ask('¿Qué carreras hay?');
  assert.match(careers.body.reply, /Administración \(LIC-DAEM-18\)/);
  const overview = await ask('¿Qué hay en la base de datos?');
  assert.match(overview.body.reply, /3 alumno/);

  process.env.GEMINI_API_KEY = 'test-key';
  let geminiPayload;
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /generativelanguage\.googleapis\.com/);
    geminiPayload = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'Respuesta de ayuda' }] } }] })
    };
  };
  const help = await ask('¿Cómo reviso un kardex PDF?', [
    { role: 'user', content: 'Busca al alumno Ana Prueba' },
    { role: 'assistant', content: 'Encontré a ANA PRUEBA (matrícula 12345678). ¿Qué información necesitas consultar?' }
  ]);
  assert.equal(help.body.reply, 'Respuesta de ayuda');
  assert.doesNotMatch(JSON.stringify(geminiPayload.contents), /ANA PRUEBA|12345678/);

  const adminSession = createResponse();
  await adminSessionHandler(
    { method: 'POST', headers: {}, body: { email: 'admin@unid.mx', password: 'correct-password' } },
    adminSession,
    { sqlClient }
  );
  assert.equal(adminSession.statusCode, 200);
  assert.ok(adminSession.body.token);

  const adminRequest = createResponse();
  await handler(
    { method: 'POST', headers: { authorization: `Dev ${adminSession.body.token}` }, body: { question: 'Busca alumnos' } },
    adminRequest,
    { sqlClient }
  );
  assert.equal(adminRequest.statusCode, 200);
  assert.match(adminRequest.body.reply, /ANA PRUEBA/);

  const forgedAdminRequest = createResponse();
  await handler(
    { method: 'POST', headers: { authorization: 'Dev admin@unid.mx::ADMIN_SISTEMA' }, body: { question: 'Busca alumnos' } },
    forgedAdminRequest,
    { sqlClient }
  );
  assert.equal(forgedAdminRequest.statusCode, 403);

  const nonAdminSession = createResponse();
  await adminSessionHandler(
    { method: 'POST', headers: {}, body: { email: 'docente@unid.mx', password: 'correct-password' } },
    nonAdminSession,
    { sqlClient }
  );
  assert.equal(nonAdminSession.statusCode, 403);
});

assert.equal(passed, 5);
console.log('5 pruebas del API académico completadas correctamente.');
