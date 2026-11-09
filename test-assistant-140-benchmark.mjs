import assert from 'node:assert/strict';
import handler from './api/academic-assistant.js';

process.env.DATABASE_URL = 'postgresql://localhost/test';
process.env.ACADEMIC_ASSISTANT_ADMIN_SECRET = 'test-secret-with-more-than-thirty-two-characters';
process.env.GEMINI_API_KEY = 'test-api-key';

const mockStudents = [
  { matricula: '00678988', nombre: 'Balam Gonzalez Mishelle', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'REVISIÓN' },
  { matricula: '00312175', nombre: 'Aguilar Aguilar Yessica', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00206526', nombre: 'Benitez Camara Jessica', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'REVISIÓN' },
  { matricula: '00699707', nombre: 'Cedillo Quezada Isis', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00924230', nombre: 'Chan Matu Jair Eduardo', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00900801', nombre: 'Chavarria Mora Rodrigo', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00217980', nombre: 'Chi Salavarria Martha', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'REVISIÓN' },
  { matricula: '00896582', nombre: 'Cruz Balan Marily Elizabeth', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00667555', nombre: 'Flores Garma Schmilyh', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00923254', nombre: 'Garcia Sandoval Jose Alonso', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00903282', nombre: 'Gonzalez Peralta Fabio', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00893393', nombre: 'Hernandez Sanchez Jaime', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00317389', nombre: 'Mendez Tejero Christopher', carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00112233', nombre: 'Perez Gomez Ana', carrera_codigo: 'LIC-COFI-18', ciclo_escolar: '2026-1', estatus_estadia: 'APROBADO / ELEGIBLE' },
  { matricula: '00445566', nombre: 'Lopez Diaz Carlos', carrera_codigo: 'LIC-DAEM-18', ciclo_escolar: '2026-1', estatus_estadia: 'REVISIÓN' }
];

const sqlClient = async (strings, ...values) => {
  const query = strings.join('$');
  if (query.includes('WHERE matricula =')) {
    const mat = values[0];
    const found = mockStudents.find(s => s.matricula === mat);
    if (!found) return [];
    return [{
      ...found,
      datos_completos: {
        auditData: {
          resumen: {
            totalMateriasMapa: 15,
            totalAprobadas: 12,
            adeudos: 2,
            omitidas: 1,
            pendientes: 0,
            esElegibleEstadia: false,
            dictamenEstadia: '4 Adeudos'
          },
          cuatrimestres: [{
            numero: 5,
            materias: [{ clave: 'FIN-501', nombre: 'Finanzas Corporativas', audit: { estado: 'ADEUDO' } }]
          }]
        }
      }
    }];
  }

  if (query.includes('c.codigo = a.carrera_codigo') || query.includes('a.carrera_codigo ILIKE')) {
    const val = (values[0] || '').replace(/%/g, '');
    const filtered = mockStudents.filter(s => s.carrera_codigo.includes(val) || val.includes(s.carrera_codigo));
    return filtered.map(s => ({
      ...s,
      datos_completos: {
        estudiante: { matricula: s.matricula, nombre: s.nombre, programa: s.carrera_codigo },
        auditData: { resumen: { dictamenEstadia: s.estatus_estadia, totalMateriasMapa: 15, totalAprobadas: 12 } }
      }
    }));
  }

  if (query.includes('WHERE nombre ILIKE')) {
    const val = (values[0] || '').replace(/%/g, '').toLowerCase();
    const filtered = mockStudents.filter(s => s.nombre.toLowerCase().includes(val));
    return filtered.map(s => ({
      ...s,
      datos_completos: {
        auditData: { resumen: { dictamenEstadia: s.estatus_estadia, totalMateriasMapa: 15, totalAprobadas: 12 } }
      }
    }));
  }

  if (query.includes('FROM carreras c')) {
    return [
      { codigo: 'MAE-MADP-22', nombre: 'Maestría en Administración de Negocios', total_auditorias: 13 },
      { codigo: 'LIC-COFI-18', nombre: 'Contabilidad y Finanzas', total_auditorias: 1 },
      { codigo: 'LIC-DAEM-18', nombre: 'Administración de Empresas', total_auditorias: 1 }
    ];
  }

  if (query.includes('WITH resumenes_por_ciclo')) {
    return [
      { carrera_codigo: 'MAE-MADP-22', ciclo_escolar: '2026-1', total: 13, elegibles: 11, requieren_revision: 2 },
      { carrera_codigo: 'LIC-COFI-18', ciclo_escolar: '2026-1', total: 1, elegibles: 1, requieren_revision: 0 }
    ];
  }

  if (query.includes('DISTINCT ON (matricula)')) {
    return mockStudents.slice(0, 10).map(s => ({
      ...s,
      datos_completos: { auditData: { resumen: { dictamenEstadia: s.estatus_estadia } } }
    }));
  }

  return [];
};

// Mock fetch for Gemini API
globalThis.fetch = async (url, options) => {
  return {
    ok: true,
    json: async () => ({
      candidates: [{
        content: {
          parts: [{ text: 'Respuesta institucional breve sobre los procesos del sistema académico UNID.' }]
        }
      }]
    })
  };
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
  return res.body;
}

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

// 140 queries divididas en categorías
const testCases = [
  // 1-15: Peticiones de apertura de grupo / kárdex completo
  { q: 'abre el kardex completo de MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'abre el grupo de MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'abrir sábana de MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'muestra el grupo completo de MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'ver auditoria de grupo de MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'carga el grupo de MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'abrir grupo MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'muestra la sábana de MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'cargar lote de MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'abrir expediente grupal de MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'ver sábana completa de MAE-MADP-22', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'abre el kardex completo de LIC-COFI-18', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'cargar grupo LIC-COFI-18', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'ver grupo de LIC-DAEM-18', expectAction: 'LOAD_BATCH_AUDIT' },
  { q: 'abrir auditoría grupal de LIC-DAEM-18', expectAction: 'LOAD_BATCH_AUDIT' },

  // 16-30: Peticiones de apertura individual
  { q: 'abre el kardex de 00678988', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'abrir expediente de 00678988', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'cargar kardex de 00312175', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'muestra el kardex de 00206526', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'ver kardex de 00699707', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'abre la cédula de 00924230', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'muestra mapa curricular de 00900801', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'abrir expediente de 00217980', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'ver expediente de 00896582', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'abre el kardex de 00667555', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'abrir kardex de 00923254', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'ver kardex de 00903282', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'cargar expediente de 00893393', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'abre el kardex de 00317389', expectAction: 'LOAD_STUDENT_AUDIT' },
  { q: 'abre el kardex de Balam Gonzalez', expectAction: 'LOAD_STUDENT_AUDIT' },

  // 31-45: Consultas individuales por matrícula y seguimiento de contexto
  { q: 'Revisa la matrícula 00678988', expectReplyMatch: /¿Qué información necesitas consultar\?/ },
  { q: 'Resumen general', history: [{ role: 'user', content: 'Revisa la matrícula 00678988' }, { role: 'assistant', content: 'Encontré a Balam Gonzalez Mishelle (matrícula 00678988).' }], expectReplyMatch: /Balam Gonzalez Mishelle/ },
  { q: 'Adeudos y materias pendientes', history: [{ role: 'user', content: 'Revisa la matrícula 00678988' }, { role: 'assistant', content: 'Encontré a Balam Gonzalez Mishelle (matrícula 00678988).' }], expectReplyMatch: /Adeudos:/ },
  { q: 'Materias aprobadas', history: [{ role: 'user', content: 'Revisa la matrícula 00678988' }, { role: 'assistant', content: 'Encontré a Balam Gonzalez Mishelle (matrícula 00678988).' }], expectReplyMatch: /Materias aprobadas:/ },
  { q: 'Estatus y elegibilidad de estadía', history: [{ role: 'user', content: 'Revisa la matrícula 00678988' }, { role: 'assistant', content: 'Encontré a Balam Gonzalez Mishelle (matrícula 00678988).' }], expectReplyMatch: /Estatus de estadía:/ },
  { q: 'Carrera y ciclo escolar', history: [{ role: 'user', content: 'Revisa la matrícula 00678988' }, { role: 'assistant', content: 'Encontré a Balam Gonzalez Mishelle (matrícula 00678988).' }], expectReplyMatch: /Carrera:/ },
  { q: '¿Qué adeudos tiene 00678988?', expectReplyMatch: /Adeudos:/ },
  { q: '¿Cuántas materias aprobadas tiene 00678988?', expectReplyMatch: /Materias aprobadas:/ },
  { q: '¿Es elegible para estadía 00678988?', expectReplyMatch: /Elegibilidad:/ },
  { q: '¿Cuál es el dictamen de 00678988?', expectReplyMatch: /Estatus de estadía:/ },
  { q: 'dame el resumen de 00312175', expectReplyMatch: /Aguilar Aguilar/ },
  { q: 'materias pendientes de 00312175', expectReplyMatch: /Adeudos:/ },
  { q: 'información completa de 00206526', expectReplyMatch: /Benitez Camara/ },
  { q: 'revisa 00699707', expectReplyMatch: /¿Qué información necesitas consultar\?/ },
  { q: 'situación académica de 00924230', expectReplyMatch: /Chan Matu/ },

  // 46-60: Búsqueda de alumnos y grupos sin saturación
  { q: 'Busca alumnos de MAE-MADP-22', expectGroupSummary: true },
  { q: 'Lista alumnos de MAE-MADP-22', expectGroupSummary: true },
  { q: '¿Quiénes están en MAE-MADP-22?', expectGroupSummary: true },
  { q: 'alumnos inscritos en MAE-MADP-22', expectGroupSummary: true },
  { q: 'consulta el grupo de MAE-MADP-22', expectGroupSummary: true },
  { q: 'Busca a Balam', expectReplyMatch: /Balam/ },
  { q: 'Busca a Aguilar', expectReplyMatch: /Aguilar/ },
  { q: 'Busca a Benitez', expectReplyMatch: /Benitez/ },
  { q: 'Busca a Cedillo', expectReplyMatch: /Cedillo/ },
  { q: 'Busca a Flores', expectReplyMatch: /Flores/ },
  { q: 'Busca a Garcia', expectReplyMatch: /Garcia/ },
  { q: 'Busca a Gonzalez', expectReplyMatch: /Gonzalez/ },
  { q: 'Busca a Hernandez', expectReplyMatch: /Hernandez/ },
  { q: 'Busca a Mendez', expectReplyMatch: /Mendez/ },
  { q: 'Busca alumnos', expectReplyMatch: /Alumnos con auditorías/ },

  // 61-80: Catálogo de carreras y base de datos
  { q: '¿Qué hay en la base de datos?', expectReplyMatch: /auditoría/i },
  { q: '¿Qué carreras tienen auditorías guardadas?', expectReplyMatch: /Carreras registradas/ },
  { q: '¿Cuáles carreras están registradas?', expectReplyMatch: /Carreras registradas/ },
  { q: 'Lista de carreras', expectReplyMatch: /Carreras registradas/ },
  { q: 'carreras disponibles', expectReplyMatch: /Carreras registradas/ },
  { q: 'programas académicos en el sistema', expectReplyMatch: /Carreras registradas/ },
  { q: 'resumen de la base de datos', expectReplyMatch: /auditoría/i },
  { q: 'estado de la base de datos', expectReplyMatch: /auditoría/i },
  { q: 'cuántas auditorías hay guardadas', expectReplyMatch: /auditoría/i },
  { q: 'información de la base de datos', expectReplyMatch: /auditoría/i },
  { q: 'registros guardados en neon', expectReplyMatch: /auditoría/i },
  { q: 'histórico de auditorías', expectReplyMatch: /auditoría/i },
  { q: 'ciclos escolares guardados', expectReplyMatch: /auditoría/i },
  { q: '¿Qué información guarda el sistema?', expectNoRoboticBlock: true },
  { q: '¿Cómo se conecta a la base de datos Neon?', expectNoRoboticBlock: true },
  { q: 'catálogo de planes de estudio', expectNoRoboticBlock: true },
  { q: 'mostrar programas de posgrado', expectNoRoboticBlock: true },
  { q: 'mostrar licenciaturas', expectNoRoboticBlock: true },
  { q: 'auditorías de maestría', expectNoRoboticBlock: true },
  { q: 'datos consolidados de ciclos', expectReplyMatch: /auditoría/i },

  // 81-110: Uso del sistema, procesos y guías (no deben ser bloqueadas como "fuera de tema")
  { q: '¿Cómo cargo un kárdex en PDF?', expectNoRoboticBlock: true },
  { q: '¿Cómo subo un reporte grupal consolidado?', expectNoRoboticBlock: true },
  { q: '¿Cómo exportar el dictamen en PDF?', expectNoRoboticBlock: true },
  { q: '¿Qué es el mapa curricular interactivo?', expectNoRoboticBlock: true },
  { q: '¿Qué es la cédula de auditoría?', expectNoRoboticBlock: true },
  { q: '¿Para qué sirve el botón de imprimir sábana?', expectNoRoboticBlock: true },
  { q: '¿Cómo cambio de carrera seleccionada?', expectNoRoboticBlock: true },
  { q: '¿Cómo guardar las auditorías en la base de datos?', expectNoRoboticBlock: true },
  { q: '¿Cómo funciona la auditoría de grupo?', expectNoRoboticBlock: true },
  { q: '¿Qué filtros de asignaturas existen?', expectNoRoboticBlock: true },
  { q: '¿Cómo funciona el modo oscuro y modo claro?', expectNoRoboticBlock: true },
  { q: '¿Qué puedo hacer en el panel de widgets?', expectNoRoboticBlock: true },
  { q: '¿Quiénes son las coordinadoras académicas?', expectNoRoboticBlock: true },
  { q: '¿Cómo ver el historial de alumnos recientes?', expectNoRoboticBlock: true },
  { q: '¿Qué pasa si el programa del PDF no coincide con la carrera?', expectNoRoboticBlock: true },
  { q: '¿Cómo cargar los datos de demostración?', expectNoRoboticBlock: true },
  { q: '¿Cómo funciona la sesión de super admin?', expectNoRoboticBlock: true },
  { q: '¿Dónde veo los adeudos de un cuatrimestre?', expectNoRoboticBlock: true },
  { q: '¿Cómo buscar un alumno por su nombre?', expectNoRoboticBlock: true },
  { q: '¿Qué es un reporte consolidado de grupo?', expectNoRoboticBlock: true },
  { q: 'pasos para auditar a un alumno', expectNoRoboticBlock: true },
  { q: 'tutorial de la plataforma', expectNoRoboticBlock: true },
  { q: 'guía de uso del sistema', expectNoRoboticBlock: true },
  { q: 'ayuda con la cédula', expectNoRoboticBlock: true },
  { q: 'funciones del asistente académico', expectNoRoboticBlock: true },
  { q: '¿Puedo auditar sin conexión a internet?', expectNoRoboticBlock: true },
  { q: '¿Qué hacer si un kárdex no se puede leer?', expectNoRoboticBlock: true },
  { q: '¿Cómo se interpretan los colores del mapa?', expectNoRoboticBlock: true },
  { q: 'instrucciones para generar el dictamen oficial', expectNoRoboticBlock: true },
  { q: '¿Cómo cerrar sesión institucional?', expectNoRoboticBlock: true },

  // 111-135: Normativa y conceptos académicos institucionales (ampliación de vocabulario)
  { q: '¿Cuáles son los requisitos para titularse?', expectNoRoboticBlock: true },
  { q: '¿Qué requisitos hay para iniciar estadía?', expectNoRoboticBlock: true },
  { q: '¿Qué significa cuando un alumno tiene materias omitidas?', expectNoRoboticBlock: true },
  { q: '¿Qué es una materia de recursamiento?', expectNoRoboticBlock: true },
  { q: '¿Cómo se calculan los créditos de la carrera?', expectNoRoboticBlock: true },
  { q: '¿Cuántas materias puede reprobar un estudiante?', expectNoRoboticBlock: true },
  { q: '¿Cómo funciona la acreditación del idioma inglés?', expectNoRoboticBlock: true },
  { q: '¿Cuáles son los requisitos de egreso y pre-egreso?', expectNoRoboticBlock: true },
  { q: '¿Cómo se libera el servicio social?', expectNoRoboticBlock: true },
  { q: '¿Qué es un examen extraordinario?', expectNoRoboticBlock: true },
  { q: '¿Qué promedio mínimo se requiere para titulación directa?', expectNoRoboticBlock: true },
  { q: 'normativa de permanencia escolar', expectNoRoboticBlock: true },
  { q: 'reglamento de calificaciones UNID', expectNoRoboticBlock: true },
  { q: '¿Qué significa dictamen condicionado?', expectNoRoboticBlock: true },
  { q: '¿Cómo se manejan las equivalencias y revalidaciones?', expectNoRoboticBlock: true },
  { q: '¿Qué es la baja temporal o definitiva?', expectNoRoboticBlock: true },
  { q: '¿Cómo se computa el promedio generacional del grupo?', expectNoRoboticBlock: true },
  { q: 'materias co-curriculares y requisitos institucionales', expectNoRoboticBlock: true },
  { q: 'horas de servicio social requeridas', expectNoRoboticBlock: true },
  { q: 'niveles de inglés requeridos para titulación', expectNoRoboticBlock: true },
  { q: 'diferencia entre materia omitida y adeudada', expectNoRoboticBlock: true },
  { q: 'estatus de alumno en riesgo académico', expectNoRoboticBlock: true },
  { q: 'criterio de elegibilidad de estadía empresarial', expectNoRoboticBlock: true },
  { q: 'calendario y ciclos cuatrimestrales', expectNoRoboticBlock: true },
  { q: 'plan de estudios 2018 vs 2022', expectNoRoboticBlock: true },

  // 136-140: Saludos, ayuda general y rechazos justificados fuera de tema
  { q: 'Hola, ¿qué puedes hacer?', expectNoRoboticBlock: true },
  { q: 'Buenos días, necesito ayuda', expectNoRoboticBlock: true },
  { q: 'Buenas tardes asistente', expectNoRoboticBlock: true },
  { q: 'dame la receta de un pastel de chocolate', expectRoboticBlock: true }, // Off-topic: debe rechazarse
  { q: 'cuánto cuesta el bitcoin hoy', expectRoboticBlock: true }             // Off-topic: debe rechazarse
];

console.log(`Iniciando suite de 140 pruebas exhaustivas del asistente académico...\n`);

let passedTests = 0;
let saturatedResponses = 0;
let emojiViolations = 0;
let falseRejections = 0;
const results = [];

for (let i = 0; i < testCases.length; i++) {
  const tc = testCases[i];
  const num = i + 1;
  const res = await ask(tc.q, tc.history || []);
  const reply = res.reply || '';

  // 1. Verificación de Emojis
  const hasEmoji = EMOJI_REGEX.test(reply);
  if (hasEmoji) emojiViolations++;

  // 2. Verificación de Saturación (más de 650 caracteres o más de 12 líneas)
  const lineCount = reply.split('\n').length;
  const isSaturated = reply.length > 650 || lineCount > 12;
  if (isSaturated) saturatedResponses++;

  // 3. Verificación de Rechazo Robótico
  const isBlocked = reply.includes('Puedo ayudar únicamente con esta plataforma');
  if (tc.expectNoRoboticBlock && isBlocked) falseRejections++;

  // 4. Verificación de Acciones
  let actionOk = true;
  if (tc.expectAction && res.action !== tc.expectAction) {
    actionOk = false;
  }

  // 5. Verificación de Group Summary
  let groupSummaryOk = true;
  if (tc.expectGroupSummary && (!res.groupSummary || !res.groupSummary.carreraCodigo)) {
    groupSummaryOk = false;
  }

  // 6. Verificación de Regex en respuesta
  let matchOk = true;
  if (tc.expectReplyMatch && !tc.expectReplyMatch.test(reply)) {
    matchOk = false;
  }

  if (tc.expectRoboticBlock && !isBlocked) {
    matchOk = false;
  }

  const testPassed = !hasEmoji && !isSaturated && actionOk && groupSummaryOk && matchOk && (!tc.expectNoRoboticBlock || !isBlocked);
  if (testPassed) {
    passedTests++;
  } else {
    results.push({
      num,
      q: tc.q,
      hasEmoji,
      isSaturated,
      actionOk,
      groupSummaryOk,
      matchOk,
      isBlocked,
      replyPreview: reply.slice(0, 100).replace(/\n/g, ' ')
    });
  }
}

console.log('='.repeat(60));
console.log(`RESULTADOS DE LAS 140 PRUEBAS:`);
console.log(`Total pruebas ejecutadas: ${testCases.length}`);
console.log(`Pruebas superadas al 100%: ${passedTests}/${testCases.length} (${((passedTests/testCases.length)*100).toFixed(1)}%)`);
console.log(`Violaciones de emojis: ${emojiViolations}`);
console.log(`Respuestas saturadas (>650 chars o >12 líneas): ${saturatedResponses}`);
console.log(`Rechazos falsos positivos en preguntas institucionales: ${falseRejections}`);
console.log('='.repeat(60));

if (results.length > 0) {
  console.log('\nDetalles de fallos:');
  for (const r of results) {
    console.log(`[#${r.num}] "${r.q}" -> actionOk:${r.actionOk}, matchOk:${r.matchOk}, isBlocked:${r.isBlocked}, isSaturated:${r.isSaturated}`);
    console.log(`   Reply: ${r.replyPreview}`);
  }
}

assert.equal(emojiViolations, 0, 'No debe haber emojis en ninguna respuesta');
assert.equal(saturatedResponses, 0, 'No debe haber saturación de texto en ninguna respuesta');
assert.equal(falseRejections, 0, 'No debe haber falsos positivos en preguntas académicas');
assert.equal(passedTests, 140, 'Todas las 140 pruebas deben pasar');

console.log('\n¡TODAS LAS 140 PRUEBAS PASARON EXITOSAMENTE!');
