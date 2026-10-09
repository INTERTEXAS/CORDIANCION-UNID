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
    coordinadora: 'LAURA ANGELICA ARA ANGULO',
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
    codigo: 'LIC-DAEM-18',
    nombre: 'LICENCIATURA EN ADMINISTRACIÓN Y DIRECCIÓN EMPRESARIAL - PLAN 2018 DUAL',
    encabezado_plan: 'MAPA DE EJECUCIÓN PARA EL PLAN 2018',
    ultima_actualizacion_cpa: '15-agosto-2026',
    sede: 'CAM',
    coordinadora: 'LAURA ANGELICA ARA ANGULO',
    activa: true,
    mapa_json: {
        cuatrimestres: [
            {
                numero: 1,
                nombre: '1.º Cuatrimestre',
                con_ingles: true,
                clave_ingles_sugerida: 'F001',
                materias: [
                    {
                        clave: 'LMAD-HUS01',
                        subj: 'LMAD',
                        crse: 'HUS01',
                        nombre: 'MATERIA HUS01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-HTS01',
                        subj: 'LMAD',
                        crse: 'HTS01',
                        nombre: 'MATERIA HTS01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-CMT01',
                        subj: 'LMAD',
                        crse: 'CMT01',
                        nombre: 'MATERIA CMT01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS38',
                        subj: 'LMAD',
                        crse: 'ADS38',
                        nombre: 'MATERIA ADS38',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ECS01',
                        subj: 'LMAD',
                        crse: 'ECS01',
                        nombre: 'MATERIA ECS01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-MKT26',
                        subj: 'LMAD',
                        crse: 'MKT26',
                        nombre: 'MATERIA MKT26',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS07',
                        subj: 'LMAD',
                        crse: 'ADS07',
                        nombre: 'MATERIA ADS07',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 2,
                nombre: '2.º Cuatrimestre',
                con_ingles: true,
                clave_ingles_sugerida: 'F002',
                materias: [
                    {
                        clave: 'LMAD-HUS02',
                        subj: 'LMAD',
                        crse: 'HUS02',
                        nombre: 'MATERIA HUS02',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADT16',
                        subj: 'LMAD',
                        crse: 'ADT16',
                        nombre: 'MATERIA ADT16',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS39',
                        subj: 'LMAD',
                        crse: 'ADS39',
                        nombre: 'MATERIA ADS39',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS27',
                        subj: 'LMAD',
                        crse: 'ADS27',
                        nombre: 'MATERIA ADS27',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS40',
                        subj: 'LMAD',
                        crse: 'ADS40',
                        nombre: 'MATERIA ADS40',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-CFS01',
                        subj: 'LMAD',
                        crse: 'CFS01',
                        nombre: 'MATERIA CFS01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-DET30',
                        subj: 'LMAD',
                        crse: 'DET30',
                        nombre: 'MATERIA DET30',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 3,
                nombre: '3.º Cuatrimestre',
                con_ingles: true,
                clave_ingles_sugerida: 'F003',
                materias: [
                    {
                        clave: 'LMAD-HUT03',
                        subj: 'LMAD',
                        crse: 'HUT03',
                        nombre: 'MATERIA HUT03',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-MTS02',
                        subj: 'LMAD',
                        crse: 'MTS02',
                        nombre: 'MATERIA MTS02',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-MKS28',
                        subj: 'LMAD',
                        crse: 'MKS28',
                        nombre: 'MATERIA MKS28',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-MKS29',
                        subj: 'LMAD',
                        crse: 'MKS29',
                        nombre: 'MATERIA MKS29',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-MKT02',
                        subj: 'LMAD',
                        crse: 'MKT02',
                        nombre: 'MATERIA MKT02',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS42',
                        subj: 'LMAD',
                        crse: 'ADS42',
                        nombre: 'MATERIA ADS42',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS41',
                        subj: 'LMAD',
                        crse: 'ADS41',
                        nombre: 'MATERIA ADS41',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 4,
                nombre: '4.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'LMAD-EES11',
                        subj: 'LMAD',
                        crse: 'EES11',
                        nombre: 'ESTADIA EES11',
                        conecta: false,
                        creditos: 5,
                        es_estadia: true,
                        bloque_completo: true
                    }
                ]
            },
            {
                numero: 5,
                nombre: '5.º Cuatrimestre',
                con_ingles: true,
                clave_ingles_sugerida: 'P001',
                materias: [
                    {
                        clave: 'LMAD-HUT05',
                        subj: 'LMAD',
                        crse: 'HUT05',
                        nombre: 'MATERIA HUT05',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS45',
                        subj: 'LMAD',
                        crse: 'ADS45',
                        nombre: 'MATERIA ADS45',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS43',
                        subj: 'LMAD',
                        crse: 'ADS43',
                        nombre: 'MATERIA ADS43',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS44',
                        subj: 'LMAD',
                        crse: 'ADS44',
                        nombre: 'MATERIA ADS44',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-INT01',
                        subj: 'LMAD',
                        crse: 'INT01',
                        nombre: 'MATERIA INT01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-CFS06',
                        subj: 'LMAD',
                        crse: 'CFS06',
                        nombre: 'MATERIA CFS06',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-CFT08',
                        subj: 'LMAD',
                        crse: 'CFT08',
                        nombre: 'MATERIA CFT08',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 6,
                nombre: '6.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'LMAD-EES12',
                        subj: 'LMAD',
                        crse: 'EES12',
                        nombre: 'ESTADIA EES12',
                        conecta: false,
                        creditos: 5,
                        es_estadia: true,
                        bloque_completo: true
                    }
                ]
            },
            {
                numero: 7,
                nombre: '7.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'LMAD-HUS04',
                        subj: 'LMAD',
                        crse: 'HUS04',
                        nombre: 'MATERIA HUS04',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-IVT01',
                        subj: 'LMAD',
                        crse: 'IVT01',
                        nombre: 'MATERIA IVT01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS47',
                        subj: 'LMAD',
                        crse: 'ADS47',
                        nombre: 'MATERIA ADS47',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-FIS08',
                        subj: 'LMAD',
                        crse: 'FIS08',
                        nombre: 'MATERIA FIS08',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-MTS06',
                        subj: 'LMAD',
                        crse: 'MTS06',
                        nombre: 'MATERIA MTS06',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS46',
                        subj: 'LMAD',
                        crse: 'ADS46',
                        nombre: 'MATERIA ADS46',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS48',
                        subj: 'LMAD',
                        crse: 'ADS48',
                        nombre: 'MATERIA ADS48',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 8,
                nombre: '8.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'LMAD-EES10',
                        subj: 'LMAD',
                        crse: 'EES10',
                        nombre: 'ESTADIA EES10',
                        conecta: false,
                        creditos: 5,
                        es_estadia: true,
                        bloque_completo: true
                    }
                ]
            },
            {
                numero: 9,
                nombre: '9.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'LMAD-HUT06',
                        subj: 'LMAD',
                        crse: 'HUT06',
                        nombre: 'MATERIA HUT06',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS52',
                        subj: 'LMAD',
                        crse: 'ADS52',
                        nombre: 'MATERIA ADS52',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS50',
                        subj: 'LMAD',
                        crse: 'ADS50',
                        nombre: 'MATERIA ADS50',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS34',
                        subj: 'LMAD',
                        crse: 'ADS34',
                        nombre: 'MATERIA ADS34',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS49',
                        subj: 'LMAD',
                        crse: 'ADS49',
                        nombre: 'MATERIA ADS49',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADS51',
                        subj: 'LMAD',
                        crse: 'ADS51',
                        nombre: 'MATERIA ADS51',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'LMAD-ADT35',
                        subj: 'LMAD',
                        crse: 'ADT35',
                        nombre: 'MATERIA ADT35',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 10,
                nombre: '10.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'LMAD-EES09',
                        subj: 'LMAD',
                        crse: 'EES09',
                        nombre: 'ESTADIA EES09',
                        conecta: false,
                        creditos: 5,
                        es_estadia: true,
                        bloque_completo: true
                    }
                ]
            }
        ],
        niveles_ingles: [
            {
                cuatrimestre: 1,
                nivel: 1,
                clave_default: 'F001',
                nombre: 'INGLÉS I'
            },
            {
                cuatrimestre: 2,
                nivel: 2,
                clave_default: 'F002',
                nombre: 'INGLÉS II'
            },
            {
                cuatrimestre: 3,
                nivel: 3,
                clave_default: 'F003',
                nombre: 'INGLÉS III'
            },
            {
                cuatrimestre: 4,
                nivel: 4,
                clave_default: 'F004',
                nombre: 'INGLÉS IV'
            },
            {
                cuatrimestre: 5,
                nivel: 5,
                clave_default: 'P001',
                nombre: 'INGLÉS V'
            }
        ],
        electivas_multidisciplinares: []
    }
  },
  {
    id: 3,
    codigo: 'LIC-EJCO-17',
    nombre: 'LICENCIATURA EN CONTABILIDAD FINANCIERA - PLAN 202160 EJECUTIVO MODULAR',
    encabezado_plan: 'MAPA DE EJECUCIÓN PARA EL PLAN EJECUTIVO MODULAR',
    ultima_actualizacion_cpa: '10-septiembre-2026',
    sede: 'CAM',
    coordinadora: 'LAURA ANGELICA ARA ANGULO',
    activa: true,
    mapa_json: {
        cuatrimestres: [
            {
                numero: 1,
                nombre: '1.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'EMAD-HUR01',
                        subj: 'EMAD',
                        crse: 'HUR01',
                        nombre: 'MATERIA HUR01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-DER01',
                        subj: 'EMAD',
                        crse: 'DER01',
                        nombre: 'MATERIA DER01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-HTR01',
                        subj: 'EMAD',
                        crse: 'HTR01',
                        nombre: 'MATERIA HTR01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-ADR05',
                        subj: 'EMAD',
                        crse: 'ADR05',
                        nombre: 'MATERIA ADR05',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR02',
                        subj: 'EMAD',
                        crse: 'CFR02',
                        nombre: 'MATERIA CFR02',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 2,
                nombre: '2.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'EMAD-HUR03',
                        subj: 'EMAD',
                        crse: 'HUR03',
                        nombre: 'MATERIA HUR03',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR01',
                        subj: 'EMAD',
                        crse: 'CFR01',
                        nombre: 'MATERIA CFR01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-MTR04',
                        subj: 'EMAD',
                        crse: 'MTR04',
                        nombre: 'MATERIA MTR04',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-IVR01',
                        subj: 'EMAD',
                        crse: 'IVR01',
                        nombre: 'MATERIA IVR01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CMR01',
                        subj: 'EMAD',
                        crse: 'CMR01',
                        nombre: 'MATERIA CMR01',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 3,
                nombre: '3.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'EMAD-HUR02',
                        subj: 'EMAD',
                        crse: 'HUR02',
                        nombre: 'MATERIA HUR02',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-FIR12',
                        subj: 'EMAD',
                        crse: 'FIR12',
                        nombre: 'MATERIA FIR12',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-FIR02',
                        subj: 'EMAD',
                        crse: 'FIR02',
                        nombre: 'MATERIA FIR02',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-ADR02',
                        subj: 'EMAD',
                        crse: 'ADR02',
                        nombre: 'MATERIA ADR02',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-MTR02',
                        subj: 'EMAD',
                        crse: 'MTR02',
                        nombre: 'MATERIA MTR02',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 4,
                nombre: '4.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'EMAD-HUR05',
                        subj: 'EMAD',
                        crse: 'HUR05',
                        nombre: 'MATERIA HUR05',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-DER04',
                        subj: 'EMAD',
                        crse: 'DER04',
                        nombre: 'MATERIA DER04',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-DER03',
                        subj: 'EMAD',
                        crse: 'DER03',
                        nombre: 'MATERIA DER03',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-FIR03',
                        subj: 'EMAD',
                        crse: 'FIR03',
                        nombre: 'MATERIA FIR03',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-ECR01',
                        subj: 'EMAD',
                        crse: 'ECR01',
                        nombre: 'MATERIA ECR01',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 5,
                nombre: '5.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'EMAD-HUR04',
                        subj: 'EMAD',
                        crse: 'HUR04',
                        nombre: 'MATERIA HUR04',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR10',
                        subj: 'EMAD',
                        crse: 'CFR10',
                        nombre: 'MATERIA CFR10',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR05',
                        subj: 'EMAD',
                        crse: 'CFR05',
                        nombre: 'MATERIA CFR05',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-FIR07',
                        subj: 'EMAD',
                        crse: 'FIR07',
                        nombre: 'MATERIA FIR07',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR06',
                        subj: 'EMAD',
                        crse: 'CFR06',
                        nombre: 'MATERIA CFR06',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 6,
                nombre: '6.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'EMAD-ADR03',
                        subj: 'EMAD',
                        crse: 'ADR03',
                        nombre: 'MATERIA ADR03',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-EER01',
                        subj: 'EMAD',
                        crse: 'EER01',
                        nombre: 'MATERIA EER01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR04',
                        subj: 'EMAD',
                        crse: 'CFR04',
                        nombre: 'MATERIA CFR04',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-FIR05',
                        subj: 'EMAD',
                        crse: 'FIR05',
                        nombre: 'MATERIA FIR05',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR08',
                        subj: 'EMAD',
                        crse: 'CFR08',
                        nombre: 'MATERIA CFR08',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 7,
                nombre: '7.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'EMAD-FIR06',
                        subj: 'EMAD',
                        crse: 'FIR06',
                        nombre: 'MATERIA FIR06',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-FIR04',
                        subj: 'EMAD',
                        crse: 'FIR04',
                        nombre: 'MATERIA FIR04',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR11',
                        subj: 'EMAD',
                        crse: 'CFR11',
                        nombre: 'MATERIA CFR11',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-EER02',
                        subj: 'EMAD',
                        crse: 'EER02',
                        nombre: 'ESTADIA EER02',
                        conecta: false,
                        creditos: 5,
                        es_estadia: true
                    }
                ]
            },
            {
                numero: 8,
                nombre: '8.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'EMAD-HUR06',
                        subj: 'EMAD',
                        crse: 'HUR06',
                        nombre: 'MATERIA HUR06',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-FIR08',
                        subj: 'EMAD',
                        crse: 'FIR08',
                        nombre: 'MATERIA FIR08',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR03',
                        subj: 'EMAD',
                        crse: 'CFR03',
                        nombre: 'MATERIA CFR03',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-FIR09',
                        subj: 'EMAD',
                        crse: 'FIR09',
                        nombre: 'MATERIA FIR09',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR07',
                        subj: 'EMAD',
                        crse: 'CFR07',
                        nombre: 'MATERIA CFR07',
                        conecta: false,
                        creditos: 3
                    }
                ]
            },
            {
                numero: 9,
                nombre: '9.º Cuatrimestre',
                con_ingles: false,
                materias: [
                    {
                        clave: 'EMAD-FIR01',
                        subj: 'EMAD',
                        crse: 'FIR01',
                        nombre: 'MATERIA FIR01',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-ADR06',
                        subj: 'EMAD',
                        crse: 'ADR06',
                        nombre: 'MATERIA ADR06',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-CFR09',
                        subj: 'EMAD',
                        crse: 'CFR09',
                        nombre: 'MATERIA CFR09',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-ADR04',
                        subj: 'EMAD',
                        crse: 'ADR04',
                        nombre: 'MATERIA ADR04',
                        conecta: false,
                        creditos: 3
                    },
                    {
                        clave: 'EMAD-FIR10',
                        subj: 'EMAD',
                        crse: 'FIR10',
                        nombre: 'MATERIA FIR10',
                        conecta: false,
                        creditos: 3
                    }
                ]
            }
        ],
        niveles_ingles: 0,
        electivas_multidisciplinares: []
    }
  },
  {
    id: 4,
    codigo: 'LIC-ARQU-18',
    nombre: 'Licenciatura en Arquitectura',
    encabezado_plan: 'MAPA DE EJECUCIÓN PARA EL PLAN 2018',
    ultima_actualizacion_cpa: '31-julio-2026',
    sede: 'CAM',
    activa: true,
    total_materias: 39,
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
            { clave: 'LMDX-EDS01', subj: 'LMDX', crse: 'EDS01', nombre: 'ESTRATEGIAS PARA LA AUTONOMÍA EN EL APRENDIZAJE', conecta: false, creditos: 3 },
            { clave: 'LMIX-HTS01', subj: 'LMIX', crse: 'HTS01', nombre: 'HERRAMIENTAS TECNOLÓGICAS DE PRODUCTIVIDAD', conecta: false, creditos: 3 },
            { clave: 'LMEI-MTS10', subj: 'LMEI', crse: 'MTS10', nombre: 'MATEMÁTICAS UNIVERSITARIAS', conecta: false, creditos: 3 },
            { clave: 'LMQX-AQS01', subj: 'LMQX', crse: 'AQS01', nombre: 'ORIGEN DE LOS ESTILOS ARQUITECTÓNICOS', conecta: false, creditos: 3 },
            { clave: 'LMPD-CMS02', subj: 'LMPD', crse: 'CMS02', nombre: 'ORTOGRAFÍA', conecta: false, creditos: 3 }
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
            { clave: 'LMEQ-MTS08', subj: 'LMEQ', crse: 'MTS08', nombre: 'GEOMETRÍA DESCRIPTIVA', conecta: false, creditos: 3 },
            { clave: 'LMQH-DGS13', subj: 'LMQH', crse: 'DGS13', nombre: 'DIBUJO DIGITAL ARQUITECTÓNICO', conecta: false, creditos: 3 },
            { clave: 'LMQI-AQS02', subj: 'LMQI', crse: 'AQS02', nombre: 'MATERIALES Y ELEMENTOS CONSTRUCTIVOS', conecta: false, creditos: 3 },
            { clave: 'LMPD-CMS03', subj: 'LMPD', crse: 'CMS03', nombre: 'COMPRENSIÓN LECTORA', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 3,
          nombre: '3.er Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'F003',
          materias: [
            { clave: 'LMFM-HUS03', subj: 'LMFM', crse: 'HUS03', nombre: 'SEMINARIO DE VALORES EN LO COMÚN', conecta: true, creditos: 3 },
            { clave: 'LMEI-MTS02', subj: 'LMEI', crse: 'MTS02', nombre: 'ESTADÍSTICA', conecta: false, creditos: 3 },
            { clave: 'LMQH-AQS03', subj: 'LMQH', crse: 'AQS03', nombre: 'MAQUETAS Y MODELOS', conecta: false, creditos: 3 },
            { clave: 'LMIE-MTS03', subj: 'LMIE', crse: 'MTS03', nombre: 'CÁLCULO DIFERENCIAL E INTEGRAL', conecta: false, creditos: 3 },
            { clave: 'LMHQ-AQS05', subj: 'LMHQ', crse: 'AQS05', nombre: 'PROCESOS Y TÉCNICAS DE CONSTRUCCIÓN', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 4,
          nombre: '4.º Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'F004',
          materias: [
            { clave: 'LMFM-HUS05', subj: 'LMFM', crse: 'HUS05', nombre: 'ÉTICA PROFESIONAL', conecta: false, creditos: 3 },
            { clave: 'LMHE-INS19', subj: 'LMHE', crse: 'INS19', nombre: 'ESTÁTICA Y RESISTENCIA DE MATERIALES', conecta: false, creditos: 3 },
            { clave: 'LMBX-IVS01', subj: 'LMBX', crse: 'IVS01', nombre: 'METODOLOGÍA DE LA INVESTIGACIÓN', conecta: true, creditos: 3 },
            { clave: 'LMQH-DGT03', subj: 'LMQH', crse: 'DGT03', nombre: 'DISEÑO DE LA VIVIENDA RESIDENCIAL', conecta: false, creditos: 3 },
            { clave: 'LMQX-AQS06', subj: 'LMQX', crse: 'AQS06', nombre: 'ESTRUCTURAS DE CONCRETO', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 5,
          nombre: '5.º Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'P001',
          materias: [
            { clave: 'LMFX-HUS04', subj: 'LMFX', crse: 'HUS04', nombre: 'FE Y MUNDO CONTEMPORÁNEO', conecta: true, creditos: 3 },
            { clave: 'LMQX-DGS16', subj: 'LMQX', crse: 'DGS16', nombre: 'DISEÑO DE LA EDIFICACIÓN', conecta: false, creditos: 3 },
            { clave: 'LMHQ-AQS07', subj: 'LMHQ', crse: 'AQS07', nombre: 'ESTRUCTURAS DE ACERO', conecta: false, creditos: 3 },
            { clave: 'LMQX-DGS15', subj: 'LMQX', crse: 'DGS15', nombre: 'DISEÑO DE INSTALACIONES', conecta: false, creditos: 3 },
            { clave: 'LMQH-AQT01', subj: 'LMQH', crse: 'AQT01', nombre: 'PLANIFICACIÓN URBANA', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 6,
          nombre: '6.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMHQ-ADS26', subj: 'LMHQ', crse: 'ADS26', nombre: 'ADMINISTRACIÓN DE LA OBRA DE EDIFICACIÓN', conecta: false, creditos: 3 },
            { clave: 'LMAD-EES01', subj: 'LMAD', crse: 'EES01', nombre: 'PROYECTO DE TRANSFORMACIÓN', conecta: true, creditos: 3 },
            { clave: 'LMQX-DGS17', subj: 'LMQX', crse: 'DGS17', nombre: 'DISEÑO DE INTERIORES', conecta: false, creditos: 3 },
            { clave: 'LMQA-AQS08', subj: 'LMQA', crse: 'AQS08', nombre: 'CONTROL DE PRESUPUESTOS EN OBRAS', conecta: false, creditos: 3 },
            { clave: 'LMQX-AQT02', subj: 'LMQX', crse: 'AQT02', nombre: 'REGENERACIÓN ARQUITECTÓNICA', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 7,
          nombre: '7.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMAD-EES02', subj: 'LMAD', crse: 'EES02', nombre: 'ESTADÍA EMPRESARIAL', conecta: false, creditos: 5, es_estadia: true, bloque_completo: true }
          ]
        },
        {
          numero: 8,
          nombre: '8.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMAJ-HUS06', subj: 'LMAJ', crse: 'HUS06', nombre: 'RESPONSABILIDAD SOCIAL', conecta: false, creditos: 3 },
            { clave: 'LMQX-AQT03', subj: 'LMQX', crse: 'AQT03', nombre: 'PROSPECTIVA PROFESIONAL DEL ARQUITECTO', conecta: false, creditos: 3 },
            { clave: 'LMQH-AQS09', subj: 'LMQH', crse: 'AQS09', nombre: 'PROYECTO ARQUITECTÓNICO INTEGRAL', conecta: false, creditos: 3 },
            { clave: 'LMHA-ADS02', subj: 'LMHA', crse: 'ADS02', nombre: 'GESTIÓN DE PROYECTOS PRODUCTIVOS', conecta: true, creditos: 3 },
            { clave: 'LMHQ-AQS10', subj: 'LMHQ', crse: 'AQS10', nombre: 'SISTEMAS CONSTRUCTIVOS', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 9,
          nombre: '9.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMHV-EES03', subj: 'LMHV', crse: 'EES03', nombre: 'ESTADÍA EMPRESARIAL PARA EL ÉNFASIS PROFESIONAL', conecta: false, creditos: 5, es_estadia: true, bloque_completo: true }
          ]
        }
      ],
      niveles_ingles: [
        { cuatrimestre: 1, nivel: 1, clave_default: 'F001', nombre: 'INGLÉS I' },
        { cuatrimestre: 2, nivel: 2, clave_default: 'F002', nombre: 'INGLÉS II' },
        { cuatrimestre: 3, nivel: 3, clave_default: 'F003', nombre: 'INGLÉS III' },
        { cuatrimestre: 4, nivel: 4, clave_default: 'F004', nombre: 'INGLÉS IV' },
        { cuatrimestre: 5, nivel: 5, clave_default: 'P001', nombre: 'INGLÉS V' }
      ],
      electivas_multidisciplinares: [
        { clave: 'LMFM-HUS03', subj: 'LMFM', crse: 'HUS03', nombre: 'SEMINARIO DE VALORES EN LO COMÚN' },
        { clave: 'LMAX-ADT15', subj: 'LMAX', crse: 'ADT15', nombre: 'ESTRATEGIAS DIRECTIVAS Y DE NEGOCIACIÓN' },
        { clave: 'LMAX-NES01', subj: 'LMAX', crse: 'NES01', nombre: 'DESARROLLO DE NUEVOS NEGOCIOS' },
        { clave: 'LMAX-NET06', subj: 'LMAX', crse: 'NET06', nombre: 'GESTIÓN DE NEGOCIOS Y ADMINISTRACIÓN DE PROYECTOS' },
        { clave: 'LMAX-ADS03', subj: 'LMAX', crse: 'ADS03', nombre: 'COMPETITIVIDAD ESTRATÉGICA EMPRESARIAL' },
        { clave: 'LMQH-AQT05', subj: 'LMQH', crse: 'AQT05', nombre: 'PARADIGMAS EN ARQUITECTURA SUSTENTABLE' },
        { clave: 'LMHO-AQT04', subj: 'LMHO', crse: 'AQT04', nombre: 'IMPACTO AMBIENTAL DE LA URBANIZACIÓN' },
        { clave: 'LMHQ-DGS18', subj: 'LMHQ', crse: 'DGS18', nombre: 'DISEÑO SUSTENTABLE GLOBAL' },
        { clave: 'LMQI-AQS11', subj: 'LMQI', crse: 'AQS11', nombre: 'EDIFICIOS INTELIGENTES' },
        { clave: 'LMHQ-AQS12', subj: 'LMHQ', crse: 'AQS12', nombre: 'INNOVACIÓN TÉCNICA PARA EL DESARROLLO SUSTENTABLE' },
        { clave: 'LMIK-SIS01', subj: 'LMIK', crse: 'SIS01', nombre: 'INNOVACIÓN Y TECNOLOGÍA' }
      ]
    }
  },
  {
    id: 5,
    codigo: 'LIC-DERE-18',
    nombre: 'Lic. Derecho y Ciencias Jurid',
    encabezado_plan: 'MAPA DE EJECUCIÓN PARA EL PLAN 2018',
    ultima_actualizacion_cpa: '31-julio-2026',
    sede: 'CAM',
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
            { clave: 'LMJX-DES02', subj: 'LMJX', crse: 'DES02', nombre: 'DERECHO ROMANO', conecta: false, creditos: 3 },
            { clave: 'LMIX-HTS01', subj: 'LMIX', crse: 'HTS01', nombre: 'HERRAMIENTAS TECNOLÓGICAS DE PRODUCTIVIDAD', conecta: false, creditos: 3 },
            { clave: 'LMDX-EDS01', subj: 'LMDX', crse: 'EDS01', nombre: 'ESTRATEGIAS PARA LA AUTONOMÍA EN EL APRENDIZAJE', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES01', subj: 'LMJX', crse: 'DES01', nombre: 'DERECHO CONSTITUCIONAL', conecta: false, creditos: 3 }
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
            { clave: 'LMJX-DES04', subj: 'LMJX', crse: 'DES04', nombre: 'FUNDAMENTOS DEL PROCESO PENAL ACUSATORIO', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES06', subj: 'LMJX', crse: 'DES06', nombre: 'TEORÍA GENERAL DEL DERECHO', conecta: false, creditos: 3 },
            { clave: 'LMJT-DES03', subj: 'LMJT', crse: 'DES03', nombre: 'DERECHOS HUMANOS Y GARANTÍAS', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 3,
          nombre: '3.er Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'F003',
          materias: [
            { clave: 'LMFM-HUS03', subj: 'LMFM', crse: 'HUS03', nombre: 'SEMINARIO DE VALORES EN LO COMÚN', conecta: true, creditos: 3 },
            { clave: 'LMJA-DES08', subj: 'LMJA', crse: 'DES08', nombre: 'DERECHO FISCAL', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES10', subj: 'LMJX', crse: 'DES10', nombre: 'TEORÍA GENERAL DEL PROCESO', conecta: false, creditos: 3 },
            { clave: 'LMEI-MTS02', subj: 'LMEI', crse: 'MTS02', nombre: 'ESTADÍSTICA', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES07', subj: 'LMJX', crse: 'DES07', nombre: 'DERECHO CIVIL, PERSONAS Y FAMILIA', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 4,
          nombre: '4.º Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'F004',
          materias: [
            { clave: 'LMFM-HUS05', subj: 'LMFM', crse: 'HUS05', nombre: 'ÉTICA PROFESIONAL', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES11', subj: 'LMJX', crse: 'DES11', nombre: 'DERECHO CIVIL, BIENES Y SUCESIONES', conecta: false, creditos: 3 },
            { clave: 'LMBX-IVS01', subj: 'LMBX', crse: 'IVS01', nombre: 'METODOLOGÍA DE LA INVESTIGACIÓN', conecta: true, creditos: 3 },
            { clave: 'LMJA-DET03', subj: 'LMJA', crse: 'DET03', nombre: 'DERECHO ADMINISTRATIVO', conecta: false, creditos: 3 },
            { clave: 'LMJU-DES13', subj: 'LMJU', crse: 'DES13', nombre: 'TEORÍA DEL CASO Y DELITOS EN PARTICULAR', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 5,
          nombre: '5.º Cuatrimestre',
          con_ingles: true,
          clave_ingles_sugerida: 'P001',
          materias: [
            { clave: 'LMFX-HUS04', subj: 'LMFX', crse: 'HUS04', nombre: 'FE Y MUNDO CONTEMPORÁNEO', conecta: true, creditos: 3 },
            { clave: 'LMJX-DES15', subj: 'LMJX', crse: 'DES15', nombre: 'LAS OBLIGACIONES Y CONTRATOS EN DERECHO CIVIL', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES14', subj: 'LMJX', crse: 'DES14', nombre: 'DERECHO DEL TRABAJO', conecta: false, creditos: 3 },
            { clave: 'LMJA-DET11', subj: 'LMJA', crse: 'DET11', nombre: 'DERECHO FINANCIERO', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES16', subj: 'LMJX', crse: 'DES16', nombre: 'PROCESO ORAL Y ARGUMENTACIÓN JURÍDICA', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 6,
          nombre: '6.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMJX-DES18', subj: 'LMJX', crse: 'DES18', nombre: 'SISTEMA PENAL ACUSATORIO Y DE JUSTICIA ORAL', conecta: false, creditos: 3 },
            { clave: 'LMAD-EES01', subj: 'LMAD', crse: 'EES01', nombre: 'PROYECTO DE TRANSFORMACIÓN', conecta: true, creditos: 3 },
            { clave: 'LMJX-DES17', subj: 'LMJX', crse: 'DES17', nombre: 'PRÁCTICA PROCESAL LABORAL', conecta: false, creditos: 3 },
            { clave: 'LMJA-DET01', subj: 'LMJA', crse: 'DET01', nombre: 'CONTRATOS, TÍTULOS Y OPERACIONES DE CRÉDITO', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES19', subj: 'LMJX', crse: 'DES19', nombre: 'SOCIEDADES Y PRÁCTICA PROCESAL EN DERECHO MERCANTIL', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 7,
          nombre: '7.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMAD-EES02', subj: 'LMAD', crse: 'EES02', nombre: 'ESTADÍA EMPRESARIAL', conecta: false, creditos: 5, es_estadia: true, bloque_completo: true }
          ]
        },
        {
          numero: 8,
          nombre: '8.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMAJ-HUS06', subj: 'LMAJ', crse: 'HUS06', nombre: 'RESPONSABILIDAD SOCIAL', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES20', subj: 'LMJX', crse: 'DES20', nombre: 'DERECHO Y JUICIO DE AMPARO', conecta: false, creditos: 3 },
            { clave: 'LMHA-ADS02', subj: 'LMHA', crse: 'ADS02', nombre: 'GESTIÓN DE PROYECTOS PRODUCTIVOS', conecta: true, creditos: 3 },
            { clave: 'LMJT-DET14', subj: 'LMJT', crse: 'DET14', nombre: 'DERECHO INTERNACIONAL PÚBLICO Y PRIVADO', conecta: false, creditos: 3 },
            { clave: 'LMJX-DES21', subj: 'LMJX', crse: 'DES21', nombre: 'PRÁCTICA PROCESAL ADMINISTRATIVA Y FISCAL', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 9,
          nombre: '9.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'LMHV-EES03', subj: 'LMHV', crse: 'EES03', nombre: 'ESTADÍA EMPRESARIAL PARA EL ÉNFASIS PROFESIONAL', conecta: false, creditos: 5, es_estadia: true, bloque_completo: true }
          ]
        }
      ],
      niveles_ingles: [
        { cuatrimestre: 1, nivel: 1, clave_default: 'F001', nombre: 'INGLÉS I' },
        { cuatrimestre: 2, nivel: 2, clave_default: 'F002', nombre: 'INGLÉS II' },
        { cuatrimestre: 3, nivel: 3, clave_default: 'F003', nombre: 'INGLÉS III' },
        { cuatrimestre: 4, nivel: 4, clave_default: 'F004', nombre: 'INGLÉS IV' },
        { cuatrimestre: 5, nivel: 5, clave_default: 'P001', nombre: 'INGLÉS V' }
      ],
      electivas_multidisciplinares: [
        { clave: 'LMBX-IVS01', subj: 'LMBX', crse: 'IVS01', nombre: 'METODOLOGÍA DE LA INVESTIGACIÓN' },
        { clave: 'LMJT-DES23', subj: 'LMJT', crse: 'DES23', nombre: 'ESTUDIO FORENSE' },
        { clave: 'LMJM-DES24', subj: 'LMJM', crse: 'DES24', nombre: 'FILOLOGÍA Y GRAFOSCOPÍA' },
        { clave: 'LMMJ-PSS08', subj: 'LMMJ', crse: 'PSS08', nombre: 'PSICOLOGÍA CRIMINAL' },
        { clave: 'LMJX-CRT02', subj: 'LMJX', crse: 'CRT02', nombre: 'CONTROL SOCIAL Y CRIMINALIDAD EN UN MUNDO GLOBALIZADO' },
        { clave: 'LMJX-CRT17', subj: 'LMJX', crse: 'CRT17', nombre: 'CRIMINALIDAD EN POLÍTICA CRIMINAL' },
        { clave: 'LMIK-SIS01', subj: 'LMIK', crse: 'SIS01', nombre: 'INNOVACIÓN Y TECNOLOGÍA' },
        { clave: 'LMAX-NES01', subj: 'LMAX', crse: 'NES01', nombre: 'DESARROLLO DE NUEVOS NEGOCIOS' },
        { clave: 'LMAX-ADS03', subj: 'LMAX', crse: 'ADS03', nombre: 'COMPETITIVIDAD ESTRATÉGICA EMPRESARIAL' },
        { clave: 'LMAX-ADT15', subj: 'LMAX', crse: 'ADT15', nombre: 'ESTRATEGIAS DIRECTIVAS Y DE NEGOCIACIÓN' },
        { clave: 'LMAX-NET06', subj: 'LMAX', crse: 'NET06', nombre: 'GESTIÓN DE NEGOCIOS Y ADMINISTRACIÓN DE PROYECTOS' }
      ]
    }
  },
  {
    id: 6,
    codigo: 'LIC-EJDE-17',
    nombre: 'Licenciatura en Derecho',
    encabezado_plan: 'MAPA DE EJECUCIÓN PARA EL PLAN 202160 (Ejecutivo - Modular)',
    ultima_actualizacion_cpa: '31-julio-2026',
    sede: 'CAM',
    activa: true,
    total_materias: 44,
    niveles_ingles: 0,
    mapa_json: {
      cuatrimestres: [
        {
          numero: 1,
          nombre: '1.er Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMFM-HUR01', subj: 'EMFM', crse: 'HUR01', nombre: 'SER HUMANO', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER33', subj: 'EMJX', crse: 'DER33', nombre: 'DERECHO ROMANO', conecta: false, creditos: 3 },
            { clave: 'EMIX-HTR01', subj: 'EMIX', crse: 'HTR01', nombre: 'HERRAMIENTAS TECNOLÓGICAS DE PRODUCTIVIDAD', conecta: false, creditos: 3 },
            { clave: 'EMJT-DER13', subj: 'EMJT', crse: 'DER13', nombre: 'PROCURACIÓN DE JUSTICIA EN MÉXICO', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER36', subj: 'EMJX', crse: 'DER36', nombre: 'DERECHO CONSTITUCIONAL', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 2,
          nombre: '2.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMFM-HUR03', subj: 'EMFM', crse: 'HUR03', nombre: 'VALORES EN LO PERSONAL', conecta: false, creditos: 3 },
            { clave: 'EMJT-DER11', subj: 'EMJT', crse: 'DER11', nombre: 'METODOLOGÍA DE LA INVESTIGACIÓN JURÍDICA', conecta: false, creditos: 3 },
            { clave: 'EMJU-DER15', subj: 'EMJU', crse: 'DER15', nombre: 'TEORÍA DEL DELITO', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER26', subj: 'EMJX', crse: 'DER26', nombre: 'TEORÍA GENERAL DEL DERECHO', conecta: false, creditos: 3 },
            { clave: 'EMPX-CMR01', subj: 'EMPX', crse: 'CMR01', nombre: 'COMUNICACIÓN', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 3,
          nombre: '3.er Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMFM-HUR02', subj: 'EMFM', crse: 'HUR02', nombre: 'VALORES EN LO COMÚN', conecta: true, creditos: 3 },
            { clave: 'EMJX-DER35', subj: 'EMJX', crse: 'DER35', nombre: 'DERECHO CIVIL, PERSONAS Y FAMILIA', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER17', subj: 'EMJX', crse: 'DER17', nombre: 'FUNDAMENTOS DEL PROCESO PENAL ACUSATORIO', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER37', subj: 'EMJX', crse: 'DER37', nombre: 'TEORÍA GENERAL DEL PROCESO', conecta: false, creditos: 3 },
            { clave: 'EMJA-DER28', subj: 'EMJA', crse: 'DER28', nombre: 'DERECHO ADMINISTRATIVO', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 4,
          nombre: '4.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMFM-HUR05', subj: 'EMFM', crse: 'HUR05', nombre: 'ÉTICA PROFESIONAL', conecta: false, creditos: 3 },
            { clave: 'EMJA-DER03', subj: 'EMJA', crse: 'DER03', nombre: 'DERECHO FISCAL', conecta: true, creditos: 3 },
            { clave: 'EMJT-DER34', subj: 'EMJT', crse: 'DER34', nombre: 'DERECHOS HUMANOS Y GARANTÍAS', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER29', subj: 'EMJX', crse: 'DER29', nombre: 'DERECHO CIVIL, BIENES Y SUCESIONES', conecta: false, creditos: 3 },
            { clave: 'EMJU-DER14', subj: 'EMJU', crse: 'DER14', nombre: 'TEORÍA DEL CASO Y DELITOS EN PARTICULAR', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 5,
          nombre: '5.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMFX-HUR04', subj: 'EMFX', crse: 'HUR04', nombre: 'FE Y MUNDO CONTEMPORÁNEO', conecta: true, creditos: 3 },
            { clave: 'EMJA-DER22', subj: 'EMJA', crse: 'DER22', nombre: 'DERECHO FINANCIERO', conecta: false, creditos: 3 },
            { clave: 'EMJT-DER19', subj: 'EMJT', crse: 'DER19', nombre: 'LAS OBLIGACIONES EN DERECHO CIVIL', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER21', subj: 'EMJX', crse: 'DER21', nombre: 'PRÁCTICA PROCESAL, ADMINISTRATIVA Y FISCAL', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER12', subj: 'EMJX', crse: 'DER12', nombre: 'PROCESO ORAL Y ARGUMENTACIÓN JURÍDICA', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 6,
          nombre: '6.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMJX-DER02', subj: 'EMJX', crse: 'DER02', nombre: 'DERECHO DE AMPARO', conecta: false, creditos: 3 },
            { clave: 'EMAD-EER01', subj: 'EMAD', crse: 'EER01', nombre: 'PROYECTO DE TRANSFORMACIÓN', conecta: true, creditos: 3 },
            { clave: 'EMJT-DER20', subj: 'EMJT', crse: 'DER20', nombre: 'LOS CONTRATOS EN DERECHO CIVIL', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER09', subj: 'EMJX', crse: 'DER09', nombre: 'DERECHO DEL TRABAJO', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER16', subj: 'EMJX', crse: 'DER16', nombre: 'SISTEMA PENAL ACUSATORIO Y DE JUSTICIA ORAL', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 7,
          nombre: '7.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMAD-EER02', subj: 'EMAD', crse: 'EER02', nombre: 'ESTADÍA EMPRESARIAL', conecta: false, creditos: 5, es_estadia: true, bloque_completo: true },
            { clave: 'EMJX-DER18', subj: 'EMJX', crse: 'DER18', nombre: 'PRÁCTICA PROCESAL LABORAL', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER23', subj: 'EMJX', crse: 'DER23', nombre: 'SOCIEDADES EN DERECHO MERCANTIL', conecta: true, creditos: 3 },
            { clave: 'EMJX-DER27', subj: 'EMJX', crse: 'DER27', nombre: 'TÉCNICAS DE LITIGACIÓN ORAL', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 8,
          nombre: '8.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMAJ-HUR06', subj: 'EMAJ', crse: 'HUR06', nombre: 'RESPONSABILIDAD SOCIAL', conecta: false, creditos: 3 },
            { clave: 'EMJU-DER08', subj: 'EMJU', crse: 'DER08', nombre: 'DERECHO INTERNACIONAL PÚBLICO', conecta: false, creditos: 3 },
            { clave: 'EMJT-DER32', subj: 'EMJT', crse: 'DER32', nombre: 'DERECHO NOTARIAL Y REGISTRAL', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER06', subj: 'EMJX', crse: 'DER06', nombre: 'JUICIO DE AMPARO', conecta: false, creditos: 3 },
            { clave: 'EMJA-DER24', subj: 'EMJA', crse: 'DER24', nombre: 'CONTRATOS, TÍTULOS Y OPERACIONES DE CRÉDITO', conecta: true, creditos: 3 }
          ]
        },
        {
          numero: 9,
          nombre: '9.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMJX-DER31', subj: 'EMJX', crse: 'DER31', nombre: 'DERECHO ADUANERO', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER07', subj: 'EMJX', crse: 'DER07', nombre: 'DERECHO INFORMÁTICO', conecta: true, creditos: 3 },
            { clave: 'EMJT-DER10', subj: 'EMJT', crse: 'DER10', nombre: 'DERECHO INTERNACIONAL PRIVADO', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER30', subj: 'EMJX', crse: 'DER30', nombre: 'JUSTICIA ALTERNATIVA, GENERAL Y PENAL', conecta: false, creditos: 3 },
            { clave: 'EMJX-DER25', subj: 'EMJX', crse: 'DER25', nombre: 'PRÁCTICA PROCESAL CIVIL Y MERCANTIL', conecta: false, creditos: 3 }
          ]
        }
      ],
      niveles_ingles: 0,
      electivas_multidisciplinares: []
    }
  },
  {
    id: 7,
    codigo: 'LIC-EJED-17',
    nombre: 'Lic. en Educ. Tec. para el Apr',
    encabezado_plan: 'MAPA DE EJECUCIÓN PARA EL PLAN 202160 (Ejecutivo - Modular)',
    ultima_actualizacion_cpa: '31-julio-2026',
    sede: 'CAM',
    activa: true,
    total_materias: 44,
    niveles_ingles: 0,
    mapa_json: {
      cuatrimestres: [
        {
          numero: 1,
          nombre: '1.er Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMFM-HUR01', subj: 'EMFM', crse: 'HUR01', nombre: 'SER HUMANO', conecta: false, creditos: 3 },
            { clave: 'EMDX-EDR16', subj: 'EMDX', crse: 'EDR16', nombre: 'ANÁLISIS CRÍTICO DE LA PRÁCTICA DOCENTE', conecta: false, creditos: 3 },
            { clave: 'EMIX-HTR01', subj: 'EMIX', crse: 'HTR01', nombre: 'HERRAMIENTAS TECNOLÓGICAS DE PRODUCTIVIDAD', conecta: false, creditos: 3 },
            { clave: 'EMDI-EDR12', subj: 'EMDI', crse: 'EDR12', nombre: 'TECNOLOGÍA EDUCATIVA', conecta: false, creditos: 3 },
            { clave: 'EMDX-EDR06', subj: 'EMDX', crse: 'EDR06', nombre: 'TENDENCIAS EN POLÍTICA EDUCATIVA', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 2,
          nombre: '2.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMFM-HUR03', subj: 'EMFM', crse: 'HUR03', nombre: 'VALORES EN LO PERSONAL', conecta: false, creditos: 3 },
            { clave: 'EMFD-EDR01', subj: 'EMFD', crse: 'EDR01', nombre: 'FILOSOFÍA EDUCATIVA', conecta: false, creditos: 3 },
            { clave: 'EMDA-EDR03', subj: 'EMDA', crse: 'EDR03', nombre: 'FUNCIÓN SOCIAL Y ECONÓMICA DE LA EDUCACIÓN', conecta: false, creditos: 3 },
            { clave: 'EMDX-EDR19', subj: 'EMDX', crse: 'EDR19', nombre: 'METODOLÓGIA DE LA INVESTIGACIÓN EDUCATIVA', conecta: false, creditos: 3 },
            { clave: 'EMPX-CMR01', subj: 'EMPX', crse: 'CMR01', nombre: 'COMUNICACIÓN', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 3,
          nombre: '3.er Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMFM-HUR02', subj: 'EMFM', crse: 'HUR02', nombre: 'VALORES EN LO COMÚN', conecta: true, creditos: 3 },
            { clave: 'EMDM-PSR02', subj: 'EMDM', crse: 'PSR02', nombre: 'PSICOLOGÍA EDUCATIVA', conecta: false, creditos: 3 },
            { clave: 'EMDM-EDR09', subj: 'EMDM', crse: 'EDR09', nombre: 'TEORÍA DEL CONOCIMIENTO', conecta: false, creditos: 3 },
            { clave: 'EMMD-PSR01', subj: 'EMMD', crse: 'PSR01', nombre: 'TEORÍAS PSICOLÓGICAS DEL DESARROLLO', conecta: false, creditos: 3 },
            { clave: 'EMEI-MTR02', subj: 'EMEI', crse: 'MTR02', nombre: 'ESTADÍSTICA', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 4,
          nombre: '4.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMFM-HUR05', subj: 'EMFM', crse: 'HUR05', nombre: 'ÉTICA PROFESIONAL', conecta: false, creditos: 3 },
            { clave: 'EMEI-MTR03', subj: 'EMEI', crse: 'MTR03', nombre: 'ESTADÍSTICA INFERENCIAL', conecta: false, creditos: 3 },
            { clave: 'EMDX-PER01', subj: 'EMDX', crse: 'PER01', nombre: 'CORRIENTES PEDAGÓGICAS', conecta: false, creditos: 3 },
            { clave: 'EMDX-PER02', subj: 'EMDX', crse: 'PER02', nombre: 'MEDICACIÓN PEDAGÓGICA', conecta: false, creditos: 3 },
            { clave: 'EMDX-EDR04', subj: 'EMDX', crse: 'EDR04', nombre: 'POLÍTICAS PÚBLICAS EN EDUCACIÓN', conecta: true, creditos: 3 }
          ]
        },
        {
          numero: 5,
          nombre: '5.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMFX-HUR04', subj: 'EMFX', crse: 'HUR04', nombre: 'FE Y MUNDO CONTEMPORÁNEO', conecta: true, creditos: 3 },
            { clave: 'EMDX-EDR02', subj: 'EMDX', crse: 'EDR02', nombre: 'DIDÁCTICA CONTEMPORÁNEA', conecta: false, creditos: 3 },
            { clave: 'EMDM-EDR21', subj: 'EMDM', crse: 'EDR21', nombre: 'DESARROLLO COGNITIVO APLICADO A LAS TIC', conecta: false, creditos: 3 },
            { clave: 'EMDX-EDR05', subj: 'EMDX', crse: 'EDR05', nombre: 'EVALUACIÓN EDUCATIVA', conecta: false, creditos: 3 },
            { clave: 'EMDI-EDR15', subj: 'EMDI', crse: 'EDR15', nombre: 'TENDENCIAS DE LA EDUCACIÓN EN LÍNEA Y A DISTANCIA', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 6,
          nombre: '6.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMDX-EDR18', subj: 'EMDX', crse: 'EDR18', nombre: 'DISEÑO INSTRUCCIONAL', conecta: false, creditos: 3 },
            { clave: 'EMAD-EER01', subj: 'EMAD', crse: 'EER01', nombre: 'PROYECTO DE TRANSFORMACIÓN', conecta: true, creditos: 3 },
            { clave: 'EMDX-PER03', subj: 'EMDX', crse: 'PER03', nombre: 'MEDIACIÓN PEDAGÓGICA EN LÍNEA', conecta: false, creditos: 3 },
            { clave: 'EMDX-EDR11', subj: 'EMDX', crse: 'EDR11', nombre: 'PLANEACIÓN DIDÁCTICA', conecta: false, creditos: 3 },
            { clave: 'EMDX-EDR10', subj: 'EMDX', crse: 'EDR10', nombre: 'DISEÑO Y EVALUACIÓN CURRICULAR', conecta: false, creditos: 3 }
          ]
        },
        {
          numero: 7,
          nombre: '7.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMAD-EER02', subj: 'EMAD', crse: 'EER02', nombre: 'ESTADÍA EMPRESARIAL', conecta: false, creditos: 5, es_estadia: true, bloque_completo: true },
            { clave: 'EMDI-EDR17', subj: 'EMDI', crse: 'EDR17', nombre: 'DISEÑO DE AMBIENTES VIRTUALES DE APRENDIZAJE', conecta: false, creditos: 3 },
            { clave: 'EMMD-PER04', subj: 'EMMD', crse: 'PER04', nombre: 'DISEÑO DE PLANES Y PROGRAMAS DE CAPACITACIÓN', conecta: false, creditos: 3 },
            { clave: 'EMDI-EDR23', subj: 'EMDI', crse: 'EDR23', nombre: 'RECURSOS TECNOLÓGICOS DE APRENDIZAJE', conecta: true, creditos: 3 }
          ]
        },
        {
          numero: 8,
          nombre: '8.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMAJ-HUR06', subj: 'EMAJ', crse: 'HUR06', nombre: 'RESPONSABILIDAD SOCIAL', conecta: false, creditos: 3 },
            { clave: 'EMDX-EDR22', subj: 'EMDX', crse: 'EDR22', nombre: 'DISEÑO Y EVALUACIÓN DE RECURSOS EDUCATIVOS VIRTUALES', conecta: false, creditos: 3 },
            { clave: 'EMDX-PER06', subj: 'EMDX', crse: 'PER06', nombre: 'FUENTES PEDAGÓGICAS DE LA ORIENTACIÓN EDUCATIVA', conecta: false, creditos: 3 },
            { clave: 'EMDI-EDR07', subj: 'EMDI', crse: 'EDR07', nombre: 'REDES SOCIALES EN EDUCACIÓN FORMAL', conecta: false, creditos: 3 },
            { clave: 'EMAX-NER02', subj: 'EMAX', crse: 'NER02', nombre: 'DESARROLLO DE NUEVOS NEGOCIOS', conecta: true, creditos: 3 }
          ]
        },
        {
          numero: 9,
          nombre: '9.º Cuatrimestre',
          con_ingles: false,
          materias: [
            { clave: 'EMDX-EDR14', subj: 'EMDX', crse: 'EDR14', nombre: 'ADMINISTRACIÓN DE CENTROS DE TECNOLOGÍA EDUCATIVA', conecta: false, creditos: 3 },
            { clave: 'EMDQ-EDR20', subj: 'EMDQ', crse: 'EDR20', nombre: 'ANIMACIÓN DIGITAL DE RECURSOS EDUCATIVOS', conecta: false, creditos: 3 },
            { clave: 'EMIX-EDR08', subj: 'EMIX', crse: 'EDR08', nombre: 'GESTIÓN DE CONTENIDOS EN PLATAFORMAS TECNOLÓGICAS', conecta: true, creditos: 3 },
            { clave: 'EMJX-DER05', subj: 'EMJX', crse: 'DER05', nombre: 'MARCO JURÍDICO DE LA PROPIEDAD INTELECTUAL E INDUSTRIAL', conecta: true, creditos: 3 },
            { clave: 'EMDQ-EDR13', subj: 'EMDQ', crse: 'EDR13', nombre: 'PRODUCCIÓN EDUCATIVA EN MULTIMEDIOS', conecta: false, creditos: 3 }
          ]
        }
      ],
      niveles_ingles: 0,
      electivas_multidisciplinares: []
    }
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
