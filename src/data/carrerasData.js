// Datos institucionales oficiales de Carreras y Mapa Curricular UNID
// Incluye respaldo local para funcionamiento inmediato y sincronización con Neon

export const CARRERAS_LOCAL = [
  {
    id: 1,
    codigo: 'LIC-COFI-18',
    nombre: 'LICENCIATURA EN CONTABILIDAD Y FINANZAS (MIXTO) - FEDERAL',
    encabezado_plan: 'MAPA DE EJECUCIÓN PARA EL PLAN 2018',
    ultima_actualizacion_cpa: '31-julio-2026',
    sede: 'CAM',
    coordinadora: 'Coordinación de Licenciaturas',
    activa: true,
    total_materias: 37,
    niveles_ingles: 5,
    mapa_json: {
      cuatrimestres: [
        {
          numero: 1,
          nombre: '1.er Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'F001',
          materias: [
            { clave: 'LMFM-HUS01', subj: 'LMFM', crse: 'HUS01', nombre: 'SER HUMANO', conecta: false, creditos: 3 },
            { clave: 'LMAX-FIS01', subj: 'LMAX', crse: 'FIS01', nombre: 'FINANZAS Y CONTABILIDAD', conecta: false, creditos: 3 },
            { clave: 'LMIX-HTS01', subj: 'LMIX', crse: 'HTS01', nombre: 'HERRAMIENTAS TECNOLÓGICAS DE PRODUCTIVIDAD', conecta: false, creditos: 3 },
            { clave: 'LMAX-CFS01', subj: 'LMAX', crse: 'CFS01', nombre: 'FUNDAMENTOS DE CONTABILIDAD', conecta: false, creditos: 3 },
            { clave: 'LMDX-EDS01', subj: 'LMDX', crse: 'EDS01', nombre: 'ESTRATEGIAS PARA LA AUTONOMÍA EN EL APRENDIZAJE', conecta: false, creditos: 3 },
          ]
        },
        {
          numero: 2,
          nombre: '2.º Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'F002',
          materias: [
            { clave: 'LMFM-HUS02', subj: 'LMFM', crse: 'HUS02', nombre: 'SEMINARIO DE VALORES EN LO PERSONAL', conecta: false, creditos: 3 },
            { clave: 'LMPX-CMS01', subj: 'LMPX', crse: 'CMS01', nombre: 'COMUNICACIÓN', conecta: false, creditos: 3 },
            { clave: 'LMAN-MTS06', subj: 'LMAN', crse: 'MTS06', nombre: 'MATEMÁTICAS FINANCIERAS', conecta: false, creditos: 3 },
            { clave: 'LMAX-ADS07', subj: 'LMAX', crse: 'ADS07', nombre: 'PROCESO ADMINISTRATIVO', conecta: false, creditos: 3 },
            { clave: 'LMAX-FIS02', subj: 'LMAX', crse: 'FIS02', nombre: 'FUNDAMENTOS TEÓRICOS DEL ANÁLISIS FINANCIERO', conecta: false, creditos: 3 },
          ]
        },
        {
          numero: 3,
          nombre: '3.er Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'F003',
          materias: [
            { clave: 'LMFM-HUS03', subj: 'LMFM', crse: 'HUS03', nombre: 'SEMINARIO DE VALORES EN LO COMÚN', conecta: true, creditos: 3 },
            { clave: 'LMAX-CFS02', subj: 'LMAX', crse: 'CFS02', nombre: 'CONTABILIDAD DE COSTOS', conecta: false, creditos: 3 },
            { clave: 'LMAX-FIS03', subj: 'LMAX', crse: 'FIS03', nombre: 'CONTABILIDAD FINANCIERA INTERNACIONAL', conecta: false, creditos: 3 },
            { clave: 'LMJA-DES08', subj: 'LMJA', crse: 'DES08', nombre: 'DERECHO FISCAL', conecta: false, creditos: 3 },
            { clave: 'LMEI-MTS02', subj: 'LMEI', crse: 'MTS02', nombre: 'ESTADÍSTICA', conecta: false, creditos: 3 },
          ]
        },
        {
          numero: 4,
          nombre: '4.º Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'F004',
          materias: [
            { clave: 'LMFM-HUS05', subj: 'LMFM', crse: 'HUS05', nombre: 'ÉTICA PROFESIONAL', conecta: false, creditos: 3 },
            { clave: 'LMAX-FIS04', subj: 'LMAX', crse: 'FIS04', nombre: 'ADMINISTRACIÓN FINANCIERA', conecta: false, creditos: 3 },
            { clave: 'LMBX-IVS01', subj: 'LMBX', crse: 'IVS01', nombre: 'METODOLOGÍA DE LA INVESTIGACIÓN', conecta: true, creditos: 3 },
            { clave: 'LMAX-CFT01', subj: 'LMAX', crse: 'CFT01', nombre: 'ANÁLISIS DE COSTOS', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES12', subj: 'LMJX', crse: 'DES12', nombre: 'DERECHO TRIBUTARIO SUSTANTIVO', conecta: false, creditos: 3 },
          ]
        },
        {
          numero: 5,
          nombre: '5.º Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'P001',
          materias: [
            { clave: 'LMFX-HUS04', subj: 'LMFX', crse: 'HUS04', nombre: 'FE Y MUNDO CONTEMPORÁNEO', conecta: true, creditos: 3 },
            { clave: 'LMAX-CFS03', subj: 'LMAX', crse: 'CFS03', nombre: 'AUDITORÍA CONTABLE', conecta: false, creditos: 3 },
            { clave: 'LMAX-FIS05', subj: 'LMAX', crse: 'FIS05', nombre: 'ANÁLISIS Y EVALUACIÓN DE ESTADOS FINANCIEROS', conecta: false, creditos: 3 },
            { clave: 'LMAX-CFT05', subj: 'LMAX', crse: 'CFT05', nombre: 'COSTOS Y CONTROL', conecta: false, creditos: 3 },
            { clave: 'LMAJ-CFS04', subj: 'LMAJ', crse: 'CFS04', nombre: 'RÉGIMEN FISCAL DE PERSONAS FÍSICAS Y MORALES', conecta: false, creditos: 3 },
          ]
        },
        {
          numero: 6,
          nombre: '6.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMAX-FIS06', subj: 'LMAX', crse: 'FIS06', nombre: 'ESTRUCTURA DE LAS FINANZAS CORPORATIVAS', conecta: false, creditos: 3 },
            { clave: 'LMAD-EES01', subj: 'LMAD', crse: 'EES01', nombre: 'PROYECTO DE TRANSFORMACIÓN', conecta: true, creditos: 3 },
            { clave: 'LMAX-FIS07', subj: 'LMAX', crse: 'FIS07', nombre: 'PLANEACIÓN DE LA AUDITORÍA FINANCIERA', conecta: false, creditos: 3 },
            { clave: 'LMAX-CFT08', subj: 'LMAX', crse: 'CFT08', alias_corregir: 'CFTD8', nombre: 'PLANEACIÓN Y CONTROL DE PRESUPUESTOS', conecta: false, creditos: 3 },
            { clave: 'LMAX-ADS13', subj: 'LMAX', crse: 'ADS13', nombre: 'PLANEACIÓN DE LA AUDITORÍA ADMINISTRATIVA', conecta: false, creditos: 3 },
          ]
        },
        {
          numero: 7,
          nombre: '7.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMAD-EES02', subj: 'LMAD', crse: 'EES02', nombre: 'ESTADÍA EMPRESARIAL', conecta: false, creditos: 5, es_estadia: true, bloque_completo: true },
          ]
        },
        {
          numero: 8,
          nombre: '8.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMAJ-HUS06', subj: 'LMAJ', crse: 'HUS06', nombre: 'RESPONSABILIDAD SOCIAL', conecta: false, creditos: 3 },
            { clave: 'LMAX-CFS05', subj: 'LMAX', crse: 'CFS05', nombre: 'CONTABILIDAD DE ORGANIZACIONES PÚBLICAS', conecta: false, creditos: 3 },
            { clave: 'LMKA-FIS08', subj: 'LMKA', crse: 'FIS08', nombre: 'ESTUDIO DE MERCADO E INVERSIÓN', conecta: false, creditos: 3 },
            { clave: 'LMAX-FIT04', subj: 'LMAX', crse: 'FIT04', nombre: 'CARTERA DE INVERSIÓN', conecta: false, creditos: 3 },
            { clave: 'LMHA-ADS02', subj: 'LMHA', crse: 'ADS02', nombre: 'GESTIÓN DE PROYECTOS PRODUCTIVOS', conecta: true, creditos: 3 },
          ]
        },
        {
          numero: 9,
          nombre: '9.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMHV-EES03', subj: 'LMHV', crse: 'EES03', nombre: 'ESTADÍA EMPRESARIAL PARA EL ÉNFASIS PROFESIONAL', conecta: false, creditos: 5, es_estadia: true, bloque_completo: true },
          ]
        }
      ],
      niveles_ingles: [
        { cuatrimestre: 1, nivel: 1, clave_default: 'F001', nombre: 'INGLÉS I' },
        { cuatrimestre: 2, nivel: 2, clave_default: 'F002', nombre: 'INGLÉS II' },
        { cuatrimestre: 3, nivel: 3, clave_default: 'F003', nombre: 'INGLÉS III' },
        { cuatrimestre: 4, nivel: 4, clave_default: 'F004', nombre: 'INGLÉS IV' },
        { cuatrimestre: 5, nivel: 5, clave_default: 'P001', nombre: 'INGLÉS V' },
      ],
      electivas_multidisciplinares: [
        { clave: 'LMJX-DES22', subj: 'LMJX', crse: 'DES22', nombre: 'DERECHO ADUANERO' },
        { clave: 'LMAX-NES03', subj: 'LMAX', crse: 'NES03', nombre: 'DIRECCIÓN ESTRATÉGICA DE NEGOCIOS GLOBALES' },
        { clave: 'LMAX-NES04', subj: 'LMAX', crse: 'NES04', nombre: 'MACROAMBIENTE DE NEGOCIOS INTERNACIONALES' },
        { clave: 'LMAJ-CFT07', subj: 'LMAJ', crse: 'CFT07', nombre: 'GRAVÁMENES INTERNACIONALES' },
        { clave: 'LMAX-FIT15', subj: 'LMAX', crse: 'FIT15', nombre: 'SISTEMA FINANCIERO INTERNACIONAL' },
        { clave: 'LMIK-SIS01', subj: 'LMIK', crse: 'SIS01', nombre: 'INNOVACIÓN Y TECNOLOGÍA' },
        { clave: 'LMAX-NES01', subj: 'LMAX', crse: 'NES01', nombre: 'DESARROLLO DE NUEVOS NEGOCIOS' },
        { clave: 'LMAX-ADS03', subj: 'LMAX', crse: 'ADS03', nombre: 'COMPETITIVIDAD ESTRATÉGICA EMPRESARIAL' },
        { clave: 'LMAX-ADT15', subj: 'LMAX', crse: 'ADT15', nombre: 'ESTRATEGIAS DIRECTIVAS Y DE NEGOCIACIÓN' },
        { clave: 'LMAX-NET06', subj: 'LMAX', crse: 'NET06', nombre: 'GESTIÓN DE NEGOCIOS Y ADMINISTRACIÓN DE PROYECTOS' },
      ]
    }
  },
  {
    id: 2,
    codigo: 'LIC-ADE-18',
    nombre: 'LICENCIATURA EN ADMINISTRACIÓN Y DIRECCIÓN EMPRESARIAL (MIXTO) - FEDERAL',
    encabezado_plan: 'MAPA DE EJECUCIÓN PARA EL PLAN 2018',
    ultima_actualizacion_cpa: '15-agosto-2026',
    sede: 'CAM',
    coordinadora: 'Coordinación de Licenciaturas',
    activa: false,
    mapa_json: null
  },
  {
    id: 3,
    codigo: 'LIC-COF-18',
    nombre: 'LICENCIATURA EN CONTABILIDAD FINANCIERA (MIXTO) - FEDERAL',
    encabezado_plan: 'MAPA DE EJECUCIÓN PARA EL PLAN 2018',
    ultima_actualizacion_cpa: '10-septiembre-2026',
    sede: 'CAM',
    coordinadora: 'Coordinación de Licenciaturas',
    activa: false,
    mapa_json: null
  }
];

// Materias co-curriculares que deben ignorarse totalmente (ninguna de las obligatorias)
export const MATERIAS_IGNORADAS = [];

// Requisitos Co-Curriculares y de Titulación / Egreso obligatorios UNID
export const REQUISITOS_EGRESO = [
  { clave: 'MPD-CMS02', subj: 'MPD', crse: 'CMS02', nombre: 'ORTOGRAFÍA' },
  { clave: 'MPD-CMS03', subj: 'MPD', crse: 'CMS03', nombre: 'COMPRENSIÓN LECTORA' },
  { clave: 'CUPR-EGCF1', subj: 'CUPR', crse: 'EGCF1', nombre: 'CURSO DE PREPARACIÓN EGEL I' },
  { clave: 'TPEG-0001', subj: 'TPEG', crse: '0001', nombre: 'TALLER DE PRE-EGRESO' }
];

// Claves de inglés reconocidas
export const CLAVES_INGLES = ['F001', 'F002', 'F003', 'F004', 'P001', 'LENG-0008', '0008'];

