import { neon } from '@neondatabase/serverless';
import { verifyAdminAssistantToken } from './academic-assistant-auth.js';

const MAX_QUESTION_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 8;
const APP_TOPIC_PATTERN = /\b(unid|coordinaci[oó]n|sistema|plataforma|auditor[ií]a|auditar|k[aá]rdex|curr[ií]cul|carreras?|licenciatura|maestr[ií]a|doctorado|posgrado|alumn[oa]s?|estudiantes?|matr[ií]cula|expediente|materias?|asignaturas?|adeudos?|elegibilidad|elegible|estad[ií]a|estadias?|cuatrimestre|cuatrimestral(?:es)?|ciclo|ciclos?|grupo|grupos?|generaci[oó]n|c[eé]dula|pdf|reporte|reportes?|neon|demo|login|iniciar\s+sesi[oó]n|cerrar\s+sesi[oó]n|sesi[oó]n|subir|cargar|guardar|consulta|ayuda|hola|buenos?\s+d[ií]as?|buenas?\s+tardes?|qu[eé]\s+puedes\s+hacer|base\s+de\s+datos|datos|busca|buscar|encontrar|informaci[oó]n|listado|lista|todos|quienes|qui[eé]nes|inscrit[oa]s?|matriculad[oa]s?|resumen|general|completo|completa|titulaci[oó]n|titularse|cr[eé]ditos|servicio\s+social|recursar|recursamiento|extraordinario|ordinario|promedio|egreso|egresar|egresad[oa]s?|pre-egreso|ingl[eé]s|idiomas?|campus|sede|mapa|coordinador[a-z]*|normativa|reglamento|requisitos?|calificaci[oó]n|calificaciones|reprobad[oa]s?|aprobaci[oó]n|s[aá]bana|horarios?|plan|planes|malla|ret[ií]cula|funciones?|c[oó]mo\s+funciona|qu[eé]\s+hace|widgets?|dictamen|dict[aá]menes|condicionad[oa]|instrucciones?|equivalencias?|revalidaci[oó]n|revalidaciones|bajas?|temporal|definitiva|calendario|(?:LIC|MAE|DOC)[-\w]+)\b/i;
const STUDENT_TOPIC_PATTERN = /\b(alumn[oa]s?|estudiantes?|matr[ií]cula|expediente|materias?|asignaturas?|adeudos?|deudas?|pendientes?|omitidas?|aprobadas?|elegibilidad|elegible|estad[ií]a|auditor[ií]a(?:\s+individual|\s+grupal)?|busca|buscar|encuentra|encontrar|listado|lista|todos|quienes|qui[eé]nes|inscrit[oa]s?|matriculad[oa]s?|resumen|general|completo|completa|promedio|calificaciones|k[aá]rdex|s[aá]bana|grupo|(?:LIC|MAE|DOC)[-\w]+)\b/i;
const GROUP_TOPIC_PATTERN = /\b(alumn[oa]s?|estudiantes?|grupo|generaci[oó]n|ciclo|registros|guardad[oa]s?|hist[oó]ric[oa]s?|auditor[ií]a|resumen|informaci[oó]n|base de datos|datos)\b/i;
const DATABASE_TOPIC_PATTERN = /\b(base\s+de\s+datos|datos|carreras?|programas?|registros|guardad[oa]s?|hist[oó]ric[oa]s?|resumen|informaci[oó]n)\b/i;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify(payload));
}

function redactIdentifiers(text) {
  return text
    .replace(/\b\d{5,12}\b/g, '[matrícula]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[correo]')
    .replace(/\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3}\b/g, '[nombre]');
}

function isStudentLookupHistoryMessage(message) {
  if (message.role === 'user') return STUDENT_TOPIC_PATTERN.test(message.content);
  return /\bmatr[ií]cula\s*(?::|\d)|alumnos con auditor[ií]as guardadas|encontr[eé] \d+ registro/i
    .test(message.content);
}

async function getRequestBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16000) throw new RangeError('Request body too large.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function getStudentContext(record) {
  let saved = record?.datos_completos;
  if (typeof saved === 'string') {
    try {
      saved = JSON.parse(saved);
    } catch {
      return null;
    }
  }
  const audit = saved?.auditData || saved?.audit_data || saved;
  const summary = audit?.resumen;
  if (!summary || typeof summary !== 'object') return null;

  const allowedSummaryFields = [
    'totalMateriasMapa',
    'nivelesIngles',
    'inglesAcreditados',
    'requisitosEgresoTotal',
    'coCurricularesAcreditados',
    'aprobadasOrd',
    'aprobadasRec',
    'aprobadasRe',
    'totalAprobadas',
    'adeudos',
    'omitidas',
    'cursando',
    'pendientes',
    'adeudosQ1toQ6',
    'omitidasQ1toQ6',
    'adeudosReqEgreso',
    'omitidasReqEgreso',
    'esElegibleEstadia',
    'dictamenEstadia'
  ];
  const safeSummary = Object.fromEntries(
    allowedSummaryFields
      .filter((key) => summary[key] !== undefined)
      .map((key) => [key, summary[key]])
  );

  const outstandingSubjects = [];
  for (const term of Array.isArray(audit.cuatrimestres) ? audit.cuatrimestres : []) {
    for (const subject of Array.isArray(term.materias) ? term.materias : []) {
      const status = subject.audit?.estado;
      if (!['ADEUDO', 'OMITIDA', 'PENDIENTE', 'RECURSANDO', 'CURSANDO', 'RE', 'OU'].includes(status)) continue;
      outstandingSubjects.push({
        cuatrimestre: term.numero,
        clave: subject.clave,
        materia: subject.nombre,
        estado: status
      });
      if (outstandingSubjects.length >= 40) break;
    }
    if (outstandingSubjects.length >= 40) break;
  }

  return {
    resumen: safeSummary,
    materiasPorAtender: outstandingSubjects,
    ciclo: record.ciclo_escolar,
    carrera: record.carrera_codigo
  };
}

function formatStudentReply(record) {
  const context = getStudentContext(record);
  const summary = context?.resumen || {};
  const lines = [
    `Alumno: ${record.nombre || 'Nombre no disponible'} (${record.matricula})`,
    `Programa: ${record.carrera_codigo || 'No especificada'} · Ciclo: ${record.ciclo_escolar || 'No especificado'}`,
    `Dictamen de estadía: ${record.estatus_estadia || summary.dictamenEstadia || 'Sin dictamen guardado'}`
  ];

  const metrics = [];
  if (summary.totalAprobadas !== undefined) metrics.push(`Aprobadas: ${summary.totalAprobadas}/${summary.totalMateriasMapa || '?'}`);
  if (summary.adeudos !== undefined) metrics.push(`Adeudos: ${summary.adeudos}`);
  if (summary.omitidas !== undefined) metrics.push(`Omitidas: ${summary.omitidas}`);
  if (summary.pendientes !== undefined) metrics.push(`Pendientes: ${summary.pendientes}`);
  if (metrics.length) lines.push(metrics.join(' · '));

  if (typeof summary.esElegibleEstadia === 'boolean') {
    lines.push(`Elegibilidad para estadía: ${summary.esElegibleEstadia ? 'Sí' : 'No'}`);
  }

  const subjects = context?.materiasPorAtender?.slice(0, 3) || [];
  if (subjects.length) {
    lines.push('Materias por atender:');
    for (const subject of subjects) {
      lines.push(`• ${subject.materia || subject.clave || 'Materia'} — ${subject.estado}`);
    }
    const remaining = (context?.materiasPorAtender?.length || 0) - subjects.length;
    if (remaining > 0) {
      lines.push(`• (... y ${remaining} materia(s) más)`);
    }
  }
  return lines.join('\n');
}

function getStudentRequestedInfo(question) {
  if (/\b(adeud[oa]s?|deudas?|pendientes?|omitidas?)\b/i.test(question)) return 'debts';
  if (/\b(materias?|asignaturas?)\b/i.test(question) && /\b(aprobadas?|acreditadas?)\b/i.test(question)) return 'approved';
  if (/\b(materias?|asignaturas?|claves?)\b/i.test(question)) return 'subjects';
  if (/\b(estad[ií]a|elegibilidad|elegible|dictamen|estatus|status)\b/i.test(question)) return 'status';
  if (/\b(carrera|programa|ciclo|generaci[oó]n)\b/i.test(question)) return 'program';
  if (/\b(resumen|todo|toda|completo|completa|general)\b/i.test(question)) return 'summary';
  return null;
}

function formatStudentInfoPrompt(record) {
  return [
    `Encontré a ${record.nombre || 'un alumno'}${record.matricula ? ` (matrícula ${record.matricula})` : ''}.`,
    '¿Qué información necesitas consultar?',
    '• Resumen general',
    '• Adeudos y materias pendientes',
    '• Materias aprobadas',
    '• Estatus o elegibilidad de estadía',
    '• Carrera y ciclo escolar'
  ].join('\n');
}

function formatRequestedStudentInfo(record, requestedInfo) {
  const context = getStudentContext(record);
  const summary = context?.resumen || {};
  const subjectLines = (context?.materiasPorAtender || []).slice(0, 8).map((subject) =>
    `• ${subject.materia || subject.clave || 'Materia'} — ${subject.estado}`
  );
  const student = `Alumno: ${record.nombre || 'Nombre no disponible'} · Matrícula: ${record.matricula}`;

  if (requestedInfo === 'debts') {
    const lines = [
      student,
      `Adeudos: ${summary.adeudos ?? 'Sin dato en la auditoría'}`,
      `Omitidas: ${summary.omitidas ?? 'Sin dato en la auditoría'}`,
      `Pendientes: ${summary.pendientes ?? 'Sin dato en la auditoría'}`
    ];
    if (subjectLines.length) lines.push('Materias por atender:', ...subjectLines);
    return lines.join('\n');
  }
  if (requestedInfo === 'approved') {
    return [
      student,
      `Materias aprobadas: ${summary.totalAprobadas ?? 'Sin dato en la auditoría'}`,
      `Aprobadas ordinarias: ${summary.aprobadasOrd ?? 'Sin dato en la auditoría'}`,
      `Aprobadas en recuperación: ${summary.aprobadasRec ?? 'Sin dato en la auditoría'}`,
      `Aprobadas por equivalencia: ${summary.aprobadasRe ?? 'Sin dato en la auditoría'}`
    ].join('\n');
  }
  if (requestedInfo === 'subjects') {
    return [
      student,
      `Materias del mapa: ${summary.totalMateriasMapa ?? 'Sin dato en la auditoría'}`,
      ...(subjectLines.length ? ['Materias por atender:', ...subjectLines] : ['No hay materias por atender registradas en el resumen guardado.'])
    ].join('\n');
  }
  if (requestedInfo === 'status') {
    return [
      student,
      `Estatus de estadía: ${record.estatus_estadia || summary.dictamenEstadia || 'Sin dato en la auditoría'}`,
      `Elegibilidad: ${typeof summary.esElegibleEstadia === 'boolean' ? (summary.esElegibleEstadia ? 'Sí' : 'No') : 'Sin dato en la auditoría'}`
    ].join('\n');
  }
  if (requestedInfo === 'program') {
    return [
      student,
      `Carrera: ${record.carrera_codigo || 'Sin dato'}`,
      `Ciclo escolar: ${record.ciclo_escolar || 'Sin dato'}`
    ].join('\n');
  }
  return formatStudentReply(record);
}

function getStudentSearchTerm(question, studentMatch) {
  if (studentMatch) return '';
  const searchMatch = question.match(
    /\b(?:busca|buscar|encuentra|encontrar|abre|abrir|muestra|mostrar|ver|carga|cargar)\s+(?:(?:el|la|los|las|un|una)\s+)?(?:k[aá]rdex|expediente|mapa|c[eé]dula|alumn[oa]s?|estudiantes?)?\s*(?:(?:de|a|al)\s+)?(?:(?:(?:el|la|los|las|un|una)\s+)?(?:alumn[oa]s?|estudiantes?)\s+)?(?:(?:por|de)\s+nombre\s+)?(?:llamad[oa]s?\s+)?([\p{L}][\p{L}'-]*(?:\s+[\p{L}][\p{L}'-]*){0,3})/iu
  ) || question.match(
    /\b(?:alumn[oa]s?|estudiantes?|expediente)\s+(?:(?:llamad[oa]s?|de nombre)\s+)?([\p{L}][\p{L}'-]*(?:\s+[\p{L}][\p{L}'-]*){0,3})/iu
  ) || question.match(
    /\btiene\s+(?!(?:el|la|los|las|un|una|sus|adeud[oa]s?|deudas?|pendientes?|omitidas?|materias?|asignaturas?|estatus|estad[ií]a)\b)([\p{L}][\p{L}'-]*(?:\s+[\p{L}][\p{L}'-]*){0,2})/iu
  );
  const searchTerm = (searchMatch?.[1] || '')
    .replace(/\s+(?:(?:y|con)\s+)?(?:(?:dime|indica|consulta|revisa|quiero saber)\s+)?(?:(?:sus|los|las|el|la)\s+)?(?:adeud[oa]s?|deudas?|pendientes?|omitidas?|aprobadas?|materias?|asignaturas?|estatus|estad[ií]a|dictamen)\b.*$/i, '')
    .trim();
  return /^(alumn[oa]s?|estudiantes?|todos?|todas?|alumnos|estudiantes|hay|son|por|de|la|el|los|las|un|una|matr[ií]cula|carrera|programa|grupo|s[aá]bana|k[aá]rdex|expediente)$/i.test(searchTerm)
    ? ''
    : searchTerm.length >= 3
      ? searchTerm.slice(0, 100)
      : '';
}

function getCareerSearchTerm(question) {
  const codeMatch = question.match(/\b((?:LIC|MAE|DOC)[-\w]+)/i);
  if (codeMatch) return codeMatch[1].trim();

  const match = question.match(
    /\b(?:de|en)\s+(?:(?:la|el)\s+)?(?:carrera|licenciatura|programa|maestr[ií]a|doctorado)\s+(.+?)\s*$/i
  ) || question.match(
    /\b(?:carrera|licenciatura|programa|maestr[ií]a|doctorado)\s+([A-Za-z0-9-]+)/i
  );
  const term = match?.[1]?.trim().replace(/[?.!,;]+$/, '') || '';
  return term.length >= 2 ? term.slice(0, 100) : '';
}

function getRecentStudentReference(history) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const message = history[index];
    const text = message.content || '';
    const matches = [...text.matchAll(/\b(\d{5,12})\b/g)].map((m) => m[1]);
    const valid = matches.filter((m) => !/^202[0-9]$/.test(m));
    if (valid.length === 1) {
      return { matricula: valid[0], ambiguous: false };
    }
    if (valid.length > 1) {
      return { matricula: null, ambiguous: true };
    }
  }
  return { matricula: null, ambiguous: false };
}

function formatStudentList(rows, searchTerm = '') {
  if (!rows.length) {
    return searchTerm
      ? `No encontré alumnos cuyo nombre coincida con “${searchTerm}”. Revisa la escritura o prueba con su matrícula.`
      : 'No hay auditorías de alumnos guardadas en la base de datos.';
  }

  const title = searchTerm
    ? `Encontré ${rows.length} registro(s) que coinciden con “${searchTerm}”:`
    : `Alumnos con auditorías guardadas (mostrando ${rows.length} registros recientes):`;

  if (rows.length <= 4) {
    const entries = rows.map((row) =>
      `• ${row.nombre || 'Nombre no disponible'} (${row.matricula})`
    );
    return [
      title,
      ...entries,
      '',
      rows.length === 1
        ? '¿Qué información necesitas consultar de este alumno: resumen, adeudos, materias aprobadas, estatus de estadía o carrera y ciclo?'
        : 'Indica la matrícula del alumno y qué información necesitas consultar.'
    ].join('\n');
  }

  const topRows = rows.slice(0, 3);
  const entries = topRows.map((row) =>
    `• ${row.nombre || 'Nombre no disponible'} (${row.matricula})`
  );
  return [
    title,
    ...entries,
    `• ... y ${rows.length - 3} alumnos más en este grupo.`,
    '',
    'Puedes cargar la auditoría grupal completa en pantalla o seleccionar un alumno específico.'
  ].join('\n');
}

function formatDatabaseOverview(rows) {
  if (!rows.length) return 'La base de datos todavía no tiene auditorías de alumnos guardadas.';
  const total = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const lines = [`Hay ${total} auditoría(s) guardadas en ${rows.length} combinación(es) de carrera y ciclo:`];
  for (const row of rows) {
    lines.push(
      `• ${row.carrera_codigo || 'Sin carrera'} · ${row.ciclo_escolar || 'Sin ciclo'}: ${row.total} alumno(s), ${row.elegibles} elegible(s), ${row.requieren_revision} por revisar`
    );
  }
  return lines.join('\n');
}

function formatCareersReply(rows) {
  if (!rows.length) return 'No encontré carreras registradas en el catálogo de la base de datos.';
  return [
    `Carreras registradas (${rows.length}):`,
    ...rows.map((row) =>
      `• ${row.nombre || row.codigo}${row.nombre ? ` (${row.codigo})` : ''} — ${Number(row.total_auditorias || 0)} auditoría(s) guardada(s)`
    )
  ].join('\n');
}

async function getInstitutionalUser(accessToken) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) return null;
  const profile = await response.json();
  const email = String(profile.mail || profile.userPrincipalName || '').toLowerCase().trim();
  return email.endsWith('@unid.mx') ? email : null;
}

async function getGeminiReply({ question, history, context }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    if (/\b(ayuda|hola|qu[eé]\s+puedes|funciones|c[oó]mo\s+funciona|qu[eé]\s+hace)\b/i.test(question)) {
      return [
        'Soy el Asistente Académico de la plataforma institucional UNID.',
        'Puedo asistirte en las siguientes tareas:',
        '• Consultar la base de datos de auditorías y ciclos escolares guardados.',
        '• Buscar alumnos por nombre o matrícula y revisar su avance o dictamen de estadía.',
        '• Cargar kárdex individuales o auditorías grupales directamente en tu pantalla.',
        '• Orientar sobre los requisitos normativos de los planes de estudio.',
        '',
        'Puedes probar preguntando: “¿Qué hay en la base de datos?”, “Busca alumnos” o indicando una matrícula como “00112233”.'
      ].join('\n');
    }
    if (/\b(estad[ií]a|requisito|reglamento|normativa)\b/i.test(question)) {
      return [
        'Normativa institucional para Estadía Empresarial:',
        '• El alumno no debe tener adeudos ni asignaturas omitidas en cuatrimestres 1.° a 6.°. Debe contar con el 100% de materias aprobadas en dicho rango.',
        '• Debe cumplir con los requisitos curriculares de inglés (según el plan y modalidad) y materias co-curriculares de formación integral.',
        '• Si el alumno tiene asignaturas pendientes en 1.°-6.°, el dictamen se emitirá como: RETENIDO POR ADEUDO ACADÉMICO.'
      ].join('\n');
    }
    return [
      'Puedo ayudarte a consultar información académica institucional y de expedientes en Neon DB.',
      'Puedes solicitarme:',
      '• “¿Qué hay en la base de datos?” para ver ciclos y carreras con auditorías.',
      '• “Busca alumnos” o ingresar una matrícula directamente.',
      '• Cargar un expediente específico en pantalla escribiendo “abre el kárdex de [matrícula]”.'
    ].join('\n');
  }
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  if (!/^[a-z0-9.-]+$/i.test(model)) throw new Error('El modelo de Gemini configurado no es válido.');

  const systemInstruction = [
    'Eres el asistente virtual institucional de la plataforma de coordinación académica UNID.',
    'Responde siempre en español, de forma clara, breve, profesional y ejecutiva.',
    'REGLA ESTRICTA: NO utilices emojis en tus respuestas bajo ninguna circunstancia. Usa exclusivamente texto plano profesional y viñetas estándar con punto (•) o guiones.',
    'Responde en un máximo de 2 a 4 párrafos breves o listas concisas sin saturar al usuario.',
    'La plataforma permite: seleccionar carreras del catálogo, cargar kárdex individuales en PDF, revisar el mapa curricular interactivo y la cédula de auditoría, procesar reportes grupales consolidados (sábanas de grupo), exportar dictámenes oficiales en PDF y consultar auditorías históricas guardadas en la base de datos Neon.',
    'Orienta con naturalidad sobre el uso de la plataforma, auditorías de kárdex, carreras, expedientes académicos, materias, adeudos, créditos y dictámenes de estadía.',
    'Si la pregunta no está relacionada con la plataforma ni con la coordinación académica, indícalo con amabilidad y ofrece ayuda con los servicios del sistema.',
    'No inventes datos de alumnos ni dictámenes oficiales. Remite decisiones finales al personal autorizado de coordinación académica.',
    'Si falta información, indícalo de manera directa y pide el dato necesario.',
    'No tienes herramientas para modificar, guardar o borrar expedientes directamente.',
    `Contexto autorizado de esta consulta (puede estar vacío): ${JSON.stringify(context)}`
  ].join('\n');

  const contents = history.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: redactIdentifiers(message.content) }]
  }));
  contents.push({ role: 'user', parts: [{ text: redactIdentifiers(question) }] });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 }
      })
    }
  );
  if (!response.ok) {
    console.error('[AcademicAssistant] Gemini API respondió con estado:', response.status);
    throw new Error('El servicio de IA no pudo completar la consulta. Inténtalo más tarde.');
  }
  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();
  if (!text) throw new Error('Gemini no devolvió una respuesta. Reformula la pregunta e inténtalo de nuevo.');
  return text;
}

export default async function handler(req, res, options = {}) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Método no permitido.' });
  }

  const authorization = req.headers.authorization || '';
  const accessToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  const adminToken = authorization.match(/^Dev\s+(.+)$/i)?.[1];
  const allowLocalAuthBypass = options.allowLocalAuthBypass === true;
  if (!allowLocalAuthBypass && !accessToken && !adminToken) {
    return sendJson(res, 401, { error: 'Inicia sesión con tu cuenta institucional o de administrador para continuar.' });
  }

  try {
    if (!allowLocalAuthBypass) {
      if (adminToken) {
        if (!verifyAdminAssistantToken(adminToken)) {
          return sendJson(res, 403, { error: 'La sesión de administrador no es válida o expiró. Vuelve a iniciar sesión.' });
        }
      } else if (!await getInstitutionalUser(accessToken)) {
        return sendJson(res, 403, { error: 'Solo cuentas institucionales @unid.mx o administradores autorizados pueden usar el asistente.' });
      }
    }

    const body = await getRequestBody(req);
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    const history = Array.isArray(body?.history) ? body.history.slice(-MAX_HISTORY_MESSAGES) : [];
    if (!question || question.length > MAX_QUESTION_LENGTH) {
      return sendJson(res, 400, { error: 'La pregunta debe tener entre 1 y 1000 caracteres.' });
    }
    const safeHistory = history
      .filter((message) => ['user', 'assistant'].includes(message?.role) && typeof message.content === 'string')
      .map((message) => ({ role: message.role, content: message.content.slice(0, MAX_QUESTION_LENGTH) }));
    const firstUserMessage = safeHistory.findIndex((message) => message.role === 'user');
    const conversationHistory = firstUserMessage < 0 ? [] : safeHistory.slice(firstUserMessage);
    const studentMatch = question.match(/\b\d{4,12}\b/);

    if (!APP_TOPIC_PATTERN.test(question) && !studentMatch) {
      return sendJson(res, 200, {
        reply: 'Puedo ayudar únicamente con esta plataforma, carreras, auditorías y expedientes académicos. ¿Qué necesitas revisar?'
      });
    }

    const careerSearchTerm = getCareerSearchTerm(question);
    const searchTerm = getStudentSearchTerm(question, studentMatch);
    const studentSearchRequest = /\b(busca|buscar|encuentra|encontrar|lista|listado|muestra|mostrar)\b/i.test(question)
      || Boolean(careerSearchTerm)
      || Boolean(searchTerm);
    const isHowToOrGeneralQuery = /\b(c[oó]mo|qu[eé]\s+es|qu[eé]\s+significa|para\s+qu[eé]|explica|pasos|tutorial|instrucciones|gu[ií]a|puedo|d[oó]nde|cu[aá]les\s+son)\b/i.test(question);

    const requestedInfo = getStudentRequestedInfo(question);
    const previousStudent = !studentMatch && !studentSearchRequest && !isHowToOrGeneralQuery
      ? getRecentStudentReference(safeHistory)
      : { matricula: null, ambiguous: false };
    const requestedMatricula = studentMatch?.[0] || (requestedInfo ? previousStudent.matricula : null);

    const isPureCareerQuery = /\b(carreras?|licenciaturas?|programas?)\b/i.test(question)
      && !requestedMatricula
      && !/\b(alumn[oa]s?|estudiantes?|matr[ií]cula|expedientes?)\b/i.test(question);
    const isPureDatabaseQuery = /\b(base\s+de\s+datos|neon|ciclos?\s+escolar(?:es)?|ciclos?)\b/i.test(question)
      && !requestedMatricula
      && !/\b(alumn[oa]s?|estudiantes?|matr[ií]cula|expedientes?)\b/i.test(question);

    const studentQuestion = !isPureCareerQuery && !isPureDatabaseQuery && (Boolean(studentMatch) || Boolean(requestedMatricula) || STUDENT_TOPIC_PATTERN.test(question));
    const databaseQuestion = isPureDatabaseQuery || DATABASE_TOPIC_PATTERN.test(question);
    const careerQuestion = isPureCareerQuery || (
      /\b(carreras?|licenciaturas?|programas?)\b/i.test(question)
      && !studentMatch
      && !requestedMatricula
      && !/\b(alumn[oa]s?|estudiantes?|matr[ií]cula|expediente)\b/i.test(question)
    );
    let context = null;
    if (studentQuestion || databaseQuestion || careerQuestion) {
      const databaseUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;
      if (!databaseUrl) {
        return sendJson(res, 503, { error: 'El asistente no tiene configurada la variable DATABASE_URL en el servidor.' });
      }

      const sql = options.sqlClient || neon(databaseUrl);
      if (previousStudent.ambiguous && !studentMatch) {
        return sendJson(res, 200, {
          reply: 'La búsqueda anterior mostró varios alumnos. Indica la matrícula del que quieres revisar para no confundir sus expedientes.'
        });
      }

      const isOpenKardexRequest = /\b(abre|abrir|muestra|mostrar|ver|carga|cargar)\s+(?:(?:el|la|los|las|un|una)\s+)?(?:k[aá]rdex|expediente|mapa|c[eé]dula)/i.test(question);
      const isOpenGroupRequest = /\b(abre|abrir|muestra|mostrar|ver|carga|cargar)\s+(?:(?:el|la|los|las|un|una)\s+)?(?:grupo|s[aá]bana|k[aá]rdex\s+completo|auditor[ií]a\s+de\s+grupo|auditor[ií]a\s+grupal|lote)/i.test(question)
        || (/\b(abre|abrir|carga|cargar|ver|muestra|mostrar)\s+(?:(?:el|la|los|las|un|una)\s+)?(?:k[aá]rdex|expediente|grupo|auditor[ií]a|s[aá]bana)\b/i.test(question) && Boolean(careerSearchTerm))
        || (/\b(k[aá]rdex\s+completo|grupo\s+completo|s[aá]bana\s+completa)\b/i.test(question) && Boolean(careerSearchTerm));

      if (requestedMatricula) {
        const matricula = requestedMatricula;
        const rows = await sql`
          SELECT matricula, nombre, carrera_codigo, ciclo_escolar, estatus_estadia, datos_completos
          FROM auditorias_estudiantes
          WHERE matricula = ${matricula}
          ORDER BY creado_en DESC
          LIMIT 5
        `;
        if (!rows.length) {
          return sendJson(res, 200, {
            reply: 'No encontré una auditoría guardada con esa matrícula. Verifica el número e inténtalo de nuevo.'
          });
        }

        const targetRow = rows[0];
        let fullAuditData = targetRow.datos_completos;
        if (typeof fullAuditData === 'string') {
          try {
            fullAuditData = JSON.parse(fullAuditData);
          } catch {
            fullAuditData = null;
          }
        }
        const studentAudit = fullAuditData?.auditData || fullAuditData?.audit_data || fullAuditData;

        if (isOpenKardexRequest && studentAudit) {
          return sendJson(res, 200, {
            reply: `Cargando el kárdex de ${targetRow.nombre || 'estudiante'} (${targetRow.matricula}) en la plataforma...`,
            action: 'LOAD_STUDENT_AUDIT',
            studentData: {
              estudiante: {
                matricula: targetRow.matricula,
                nombre: targetRow.nombre,
                programa: targetRow.carrera_codigo,
                sede: studentAudit.estudiante?.sede || 'CAMPUS',
                ciclo: targetRow.ciclo_escolar
              },
              auditData: studentAudit,
              carreraCodigo: targetRow.carrera_codigo
            }
          });
        }

        const reply = requestedInfo
          ? rows.map((row) => formatRequestedStudentInfo(row, requestedInfo)).join('\n\n---\n\n')
          : rows.length === 1
            ? formatStudentInfoPrompt(rows[0])
            : `${rows.map(formatStudentReply).join('\n\n---\n\n')}\n\nIndica qué información necesitas y de cuál matrícula.`;
        
        return sendJson(res, 200, {
          reply,
          studentAuditSummary: rows.length === 1 && studentAudit ? {
            matricula: targetRow.matricula,
            nombre: targetRow.nombre,
            carreraCodigo: targetRow.carrera_codigo,
            auditData: studentAudit
          } : null
        });
      }

      if (careerQuestion) {
        const rows = await sql`
          SELECT
            c.codigo,
            c.nombre,
            COALESCE(a.total_auditorias, 0)::int AS total_auditorias
          FROM carreras c
          LEFT JOIN (
            SELECT carrera_codigo, COUNT(*)::int AS total_auditorias
            FROM auditorias_estudiantes
            GROUP BY carrera_codigo
          ) a ON a.carrera_codigo = c.codigo
          ORDER BY c.codigo
          LIMIT 100
        `;
        return sendJson(res, 200, { reply: formatCareersReply(rows) });
      }

      if (isPureDatabaseQuery) {
        const rows = await sql`
          WITH resumenes_por_ciclo AS (
            SELECT
              carrera_codigo,
              ciclo_escolar,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE estatus_estadia ILIKE '%APROBADO / ELEGIBLE%')::int AS elegibles,
              COUNT(*) FILTER (WHERE estatus_estadia NOT ILIKE '%APROBADO / ELEGIBLE%')::int AS requieren_revision,
              MAX(creado_en) AS ultimo_registro
            FROM auditorias_estudiantes
            GROUP BY carrera_codigo, ciclo_escolar
          ),
          ciclos_recientes AS (
            SELECT
              carrera_codigo,
              ciclo_escolar,
              total,
              elegibles,
              requieren_revision,
              ROW_NUMBER() OVER (PARTITION BY carrera_codigo ORDER BY ultimo_registro DESC) AS posicion
            FROM resumenes_por_ciclo
          )
          SELECT carrera_codigo, ciclo_escolar, total, elegibles, requieren_revision
          FROM ciclos_recientes
          WHERE posicion <= 8
          ORDER BY carrera_codigo, posicion
          LIMIT 100
        `;
        return sendJson(res, 200, { reply: formatDatabaseOverview(rows) });
      }

      if (studentQuestion && !studentSearchRequest && !previousStudent.matricula && !isHowToOrGeneralQuery) {
        return sendJson(res, 200, {
          reply: '¿De qué alumno necesitas información? Indica su matrícula o escribe su nombre. Después te preguntaré qué dato necesitas consultar.'
        });
      }

      if (studentQuestion && !isHowToOrGeneralQuery) {
        const rows = careerSearchTerm
          ? await sql`
            SELECT matricula, nombre, carrera_codigo, ciclo_escolar, estatus_estadia, datos_completos
            FROM (
              SELECT DISTINCT ON (a.matricula)
                a.matricula, a.nombre, a.carrera_codigo, a.ciclo_escolar, a.estatus_estadia, a.datos_completos, a.creado_en
              FROM auditorias_estudiantes a
              LEFT JOIN carreras c ON c.codigo = a.carrera_codigo
              WHERE a.carrera_codigo ILIKE ${`%${careerSearchTerm.replace(/[%_\\]/g, '')}%`}
                OR c.nombre ILIKE ${`%${careerSearchTerm.replace(/[%_\\]/g, '')}%`}
              ORDER BY a.matricula, a.creado_en DESC
            ) alumnos_recientes
            ORDER BY nombre ASC
            LIMIT 50
          `
          : searchTerm
          ? await sql`
            SELECT matricula, nombre, carrera_codigo, ciclo_escolar, estatus_estadia, datos_completos
            FROM (
              SELECT DISTINCT ON (matricula)
                matricula, nombre, carrera_codigo, ciclo_escolar, estatus_estadia, datos_completos, creado_en
              FROM auditorias_estudiantes
              WHERE nombre ILIKE ${`%${searchTerm.replace(/[%_\\]/g, '')}%`}
              ORDER BY matricula, creado_en DESC
            ) alumnos_recientes
            ORDER BY creado_en DESC
            LIMIT 10
          `
          : await sql`
            SELECT matricula, nombre, carrera_codigo, ciclo_escolar, estatus_estadia, datos_completos
            FROM (
              SELECT DISTINCT ON (matricula)
                matricula, nombre, carrera_codigo, ciclo_escolar, estatus_estadia, datos_completos, creado_en
              FROM auditorias_estudiantes
              ORDER BY matricula, creado_en DESC
            ) alumnos_recientes
            ORDER BY creado_en DESC
            LIMIT 10
          `;
        if (!rows.length) return sendJson(res, 200, { reply: formatStudentList(rows, careerSearchTerm ? `carrera ${careerSearchTerm}` : searchTerm) });

        if (careerSearchTerm && rows.length > 0) {
          if (isOpenGroupRequest) {
            const batchAlumnos = rows.map((r) => {
              let dc = r.datos_completos;
              if (typeof dc === 'string') {
                try { dc = JSON.parse(dc); } catch { dc = null; }
              }
              if (dc && typeof dc === 'object') {
                return {
                  ...dc,
                  estudiante: dc.estudiante || {
                    matricula: r.matricula,
                    nombre: r.nombre,
                    programa: r.carrera_codigo,
                    ciclo: r.ciclo_escolar
                  },
                  carreraCodigo: r.carrera_codigo
                };
              }
              return {
                estudiante: {
                  matricula: r.matricula,
                  nombre: r.nombre,
                  programa: r.carrera_codigo,
                  ciclo: r.ciclo_escolar
                },
                carreraCodigo: r.carrera_codigo
              };
            });
            const matchedCarrera = rows[0]?.carrera_codigo || careerSearchTerm;

            return sendJson(res, 200, {
              reply: `Cargando la auditoría grupal de ${matchedCarrera} (${rows.length} expedientes) en pantalla...`,
              action: 'LOAD_BATCH_AUDIT',
              batchData: {
                carreraCodigo: matchedCarrera,
                totalAlumnos: rows.length,
                alumnos: batchAlumnos
              }
            });
          }

          return sendJson(res, 200, {
            reply: formatStudentList(rows, `carrera ${careerSearchTerm}`),
            groupSummary: {
              carreraCodigo: rows[0]?.carrera_codigo || careerSearchTerm,
              total: rows.length,
              alumnos: rows.map((r) => ({ matricula: r.matricula, nombre: r.nombre }))
            }
          });
        }

        if (rows.length === 1 && !careerSearchTerm) {
          const targetRow = rows[0];
          let fullAuditData = targetRow.datos_completos;
          if (typeof fullAuditData === 'string') {
            try {
              fullAuditData = JSON.parse(fullAuditData);
            } catch {
              fullAuditData = null;
            }
          }
          const studentAudit = fullAuditData?.auditData || fullAuditData?.audit_data || fullAuditData;

          if (isOpenKardexRequest && studentAudit) {
            return sendJson(res, 200, {
              reply: `Cargando el kárdex de ${targetRow.nombre || 'estudiante'} (${targetRow.matricula}) en la plataforma...`,
              action: 'LOAD_STUDENT_AUDIT',
              studentData: {
                estudiante: {
                  matricula: targetRow.matricula,
                  nombre: targetRow.nombre,
                  programa: targetRow.carrera_codigo,
                  sede: studentAudit.estudiante?.sede || 'CAMPUS',
                  ciclo: targetRow.ciclo_escolar
                },
                auditData: studentAudit,
                carreraCodigo: targetRow.carrera_codigo
              }
            });
          }

          return sendJson(res, 200, {
            reply: requestedInfo
              ? formatRequestedStudentInfo(targetRow, requestedInfo)
              : formatStudentInfoPrompt(targetRow),
            studentAuditSummary: studentAudit ? {
              matricula: targetRow.matricula,
              nombre: targetRow.nombre,
              carreraCodigo: targetRow.carrera_codigo,
              auditData: studentAudit
            } : null
          });
        }
        return sendJson(res, 200, {
          reply: formatStudentList(rows, searchTerm)
        });
      }

      if (databaseQuestion || GROUP_TOPIC_PATTERN.test(question)) {
        const rows = await sql`
          WITH resumenes_por_ciclo AS (
            SELECT
              carrera_codigo,
              ciclo_escolar,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE estatus_estadia ILIKE '%APROBADO / ELEGIBLE%')::int AS elegibles,
              COUNT(*) FILTER (WHERE estatus_estadia NOT ILIKE '%APROBADO / ELEGIBLE%')::int AS requieren_revision,
              MAX(creado_en) AS ultimo_registro
            FROM auditorias_estudiantes
            GROUP BY carrera_codigo, ciclo_escolar
          ),
          ciclos_recientes AS (
            SELECT
              carrera_codigo,
              ciclo_escolar,
              total,
              elegibles,
              requieren_revision,
              ROW_NUMBER() OVER (PARTITION BY carrera_codigo ORDER BY ultimo_registro DESC) AS posicion
            FROM resumenes_por_ciclo
          )
          SELECT carrera_codigo, ciclo_escolar, total, elegibles, requieren_revision
          FROM ciclos_recientes
          WHERE posicion <= 8
          ORDER BY carrera_codigo, posicion
          LIMIT 100
        `;
        return sendJson(res, 200, { reply: formatDatabaseOverview(rows) });
      }
    }

    const geminiHistory = conversationHistory.filter((message) => !isStudentLookupHistoryMessage(message));
    const reply = await getGeminiReply({ question, history: geminiHistory, context });
    return sendJson(res, 200, { reply });
  } catch (error) {
    if (error instanceof SyntaxError) return sendJson(res, 400, { error: 'El cuerpo de la solicitud no es JSON válido.' });
    if (error instanceof RangeError) return sendJson(res, 413, { error: 'La solicitud excede el tamaño permitido.' });
    if (error.message?.includes('ACADEMIC_ASSISTANT_ADMIN_SECRET')) {
      return sendJson(res, 503, { error: 'El acceso administrativo del asistente no está configurado en el servidor.' });
    }
    if (error.message?.includes('GEMINI_API_KEY')) {
      console.error('[AcademicAssistant] Falta configuración de la API key de Gemini.');
      return sendJson(res, 503, { error: 'El asistente aún no está configurado en el servidor.' });
    }
    console.error('[AcademicAssistant] Error al procesar consulta:', error);
    return sendJson(res, 500, { error: 'No se pudo procesar la consulta. Inténtalo de nuevo más tarde.' });
  }
}
