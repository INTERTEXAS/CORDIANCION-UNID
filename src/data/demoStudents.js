// Datos de prueba institucionales para verificación inmediata y demostraciones

export const ALUMNOS_DEMO = [
  {
    id: 'demo-maria',
    label: 'Expediente A (00112233) - Adeudo en Egreso (EGEL / Omitida)',
    matricula: '00112233',
    nombre: 'HERNÁNDEZ LÓPEZ, VALERIA',
    programa: 'LIC-COFI-18',
    sede: 'CAM',
    estatus: 'EG',
    ultimoPeriodo: '202620',
    registros: [
      // Cuatrimestre 1: HUS01 (5 -> 10 REC), CFS01 (NP -> 8 REC)
      { periodo: '202520', crn: '10101', subj: 'LMFM', crse: 'HUS01', modalidad: 'RW', calificacion: '5' },
      { periodo: '202560', crn: '10102', subj: 'LMFM', crse: 'HUS01', modalidad: 'RW', calificacion: '10' },
      { periodo: '202320', crn: '10103', subj: 'LMAX', crse: 'FIS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202320', crn: '10104', subj: 'LMIX', crse: 'HTS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202420', crn: '10105', subj: 'LMAX', crse: 'CFS01', modalidad: 'RW', calificacion: 'NP' },
      { periodo: '202460', crn: '10106', subj: 'LMAX', crse: 'CFS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202320', crn: '10107', subj: 'LMDX', crse: 'EDS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202320', crn: '10108', subj: 'INHH', crse: 'F001', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 2
      { periodo: '202330', crn: '10201', subj: 'LMFM', crse: 'HUS02', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '10202', subj: 'LMPX', crse: 'CMS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202330', crn: '10203', subj: 'LMAN', crse: 'MTS06', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '10204', subj: 'LMAX', crse: 'ADS07', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '10205', subj: 'LMAX', crse: 'FIS02', modalidad: 'RW', calificacion: '7' },
      { periodo: '202330', crn: '10206', subj: 'NHH', crse: 'F002', modalidad: 'RW', calificacion: '8' },

      // Cuatrimestre 3: MTS02 en Modo RE (10 RE)
      { periodo: '202410', crn: '10301', subj: 'LMFM', crse: 'HUS03', modalidad: 'RW', calificacion: '9' },
      { periodo: '202410', crn: '10302', subj: 'LMAX', crse: 'CFS02', modalidad: 'RW', calificacion: '8' },
      { periodo: '202410', crn: '10303', subj: 'LMAX', crse: 'FIS03', modalidad: 'RW', calificacion: '8' },
      { periodo: '202410', crn: '10304', subj: 'LMJA', crse: 'DES08', modalidad: 'RW', calificacion: '8' },
      { periodo: '202440', crn: '10305', subj: 'LMEI', crse: 'MTS02', modalidad: 'RE', calificacion: '10' },
      { periodo: '202410', crn: '10306', subj: 'NHH', crse: 'F003', modalidad: 'RW', calificacion: '8' },

      // Cuatrimestre 4
      { periodo: '202420', crn: '10401', subj: 'LMFM', crse: 'HUS05', modalidad: 'RW', calificacion: '9' },
      { periodo: '202420', crn: '10402', subj: 'LMAX', crse: 'FIS04', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '10403', subj: 'LMBX', crse: 'IVS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '10404', subj: 'LMAX', crse: 'CFT01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '10405', subj: 'LMJX', crse: 'DES12', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '10406', subj: 'INHH', crse: 'F004', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 5
      { periodo: '202430', crn: '10501', subj: 'LMFX', crse: 'HUS04', modalidad: 'RW', calificacion: '9' },
      { periodo: '202430', crn: '10502', subj: 'LMAX', crse: 'CFS03', modalidad: 'RW', calificacion: '8' },
      { periodo: '202430', crn: '10503', subj: 'LMAX', crse: 'FIS05', modalidad: 'RW', calificacion: '9' },
      { periodo: '202430', crn: '10504', subj: 'LMAX', crse: 'CFT05', modalidad: 'RW', calificacion: '8' },
      { periodo: '202430', crn: '10505', subj: 'LMAJ', crse: 'CFS04', modalidad: 'RW', calificacion: '8' },
      { periodo: '202430', crn: '10506', subj: 'INHH', crse: 'P001', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 6
      { periodo: '202510', crn: '10601', subj: 'LMAX', crse: 'FIS06', modalidad: 'RW', calificacion: '8' },
      { periodo: '202510', crn: '10602', subj: 'LMAD', crse: 'EES01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202510', crn: '10603', subj: 'LMAX', crse: 'FIS07', modalidad: 'RW', calificacion: '8' },
      { periodo: '202510', crn: '10604', subj: 'LMAX', crse: 'CFT08', modalidad: 'RW', calificacion: '8' },
      { periodo: '202510', crn: '10605', subj: 'LMAX', crse: 'ADS13', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 7
      { periodo: '202520', crn: '10701', subj: 'LMAD', crse: 'EES02', modalidad: 'RW', calificacion: '10' },

      // Cuatrimestre 8
      { periodo: '202530', crn: '10801', subj: 'LMAJ', crse: 'HUS06', modalidad: 'RW', calificacion: '9' },
      { periodo: '202530', crn: '10802', subj: 'LMAX', crse: 'CFS05', modalidad: 'RW', calificacion: '8' },
      { periodo: '202530', crn: '10803', subj: 'LMKA', crse: 'FIS08', modalidad: 'RW', calificacion: '8' },
      { periodo: '202530', crn: '10804', subj: 'LMAX', crse: 'FIT04', modalidad: 'RW', calificacion: '8' },
      { periodo: '202530', crn: '10805', subj: 'LMHA', crse: 'ADS02', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 9
      { periodo: '202610', crn: '10901', subj: 'LMHV', crse: 'EES03', modalidad: 'RW', calificacion: '9' },

      // Requisitos de Egreso: MPD-CMS02 OMITIDA (no cursó), CUPR-EGCF1 reprobada con 5 en 202620
      { periodo: '202510', crn: '99002', subj: 'MPD', crse: 'CMS03', modalidad: 'RW', calificacion: '8' },
      { periodo: '202620', crn: '99003', subj: 'CUPR', crse: 'EGCF1', modalidad: 'RW', calificacion: '5' },
      { periodo: '202620', crn: '99004', subj: 'TPEG', crse: '0001', modalidad: 'RW', calificacion: 'AC' }
    ]
  },
  {
    id: 'demo-yareli',
    label: 'Expediente B (00445566) - Dictamen 100% Aprobado',
    matricula: '00445566',
    nombre: 'GARCÍA MORALES, SANTIAGO',
    programa: 'LIC-COFI-18',
    sede: 'CAM',
    estatus: 'EG',
    ultimoPeriodo: '202620',
    registros: [
      // Cuatrimestre 1
      { periodo: '202320', crn: '10101', subj: 'LMFM', crse: 'HUS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202320', crn: '10102', subj: 'LMAX', crse: 'FIS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202320', crn: '10103', subj: 'LMIX', crse: 'HTS01', modalidad: 'RW', calificacion: '10' },
      { periodo: '202320', crn: '10104', subj: 'LMAX', crse: 'CFS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202320', crn: '10105', subj: 'LMDX', crse: 'EDS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202320', crn: '10106', subj: 'INHH', crse: 'F001', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 2
      { periodo: '202330', crn: '10201', subj: 'LMFM', crse: 'HUS02', modalidad: 'RW', calificacion: '9' },
      { periodo: '202330', crn: '10202', subj: 'LMPX', crse: 'CMS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202330', crn: '10203', subj: 'LMAN', crse: 'MTS06', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '10204', subj: 'LMAX', crse: 'ADS07', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '10205', subj: 'LMAX', crse: 'FIS02', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '10206', subj: 'NHH', crse: 'F002', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 3: MTS02 recursada (202440: 5 -> 202540: 10)
      { periodo: '202410', crn: '10301', subj: 'LMFM', crse: 'HUS03', modalidad: 'RW', calificacion: '9' },
      { periodo: '202410', crn: '10302', subj: 'LMAX', crse: 'CFS02', modalidad: 'RW', calificacion: '9' },
      { periodo: '202410', crn: '10303', subj: 'LMAX', crse: 'FIS03', modalidad: 'RW', calificacion: '9' },
      { periodo: '202410', crn: '10304', subj: 'LMJA', crse: 'DES08', modalidad: 'RW', calificacion: '8' },
      { periodo: '202440', crn: '10305', subj: 'LMEI', crse: 'MTS02', modalidad: 'RW', calificacion: '5' },
      { periodo: '202540', crn: '10306', subj: 'LMEI', crse: 'MTS02', modalidad: 'RW', calificacion: '10' },
      { periodo: '202410', crn: '10307', subj: 'NHH', crse: 'F003', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 4
      { periodo: '202420', crn: '10401', subj: 'LMFM', crse: 'HUS05', modalidad: 'RW', calificacion: '10' },
      { periodo: '202420', crn: '10402', subj: 'LMAX', crse: 'FIS04', modalidad: 'RW', calificacion: '9' },
      { periodo: '202420', crn: '10403', subj: 'LMBX', crse: 'IVS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202420', crn: '10404', subj: 'LMAX', crse: 'CFT01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '10405', subj: 'LMJX', crse: 'DES12', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '10406', subj: 'INHH', crse: 'F004', modalidad: 'RW', calificacion: '10' },

      // Cuatrimestre 5
      { periodo: '202430', crn: '10501', subj: 'LMFX', crse: 'HUS04', modalidad: 'RW', calificacion: '9' },
      { periodo: '202430', crn: '10502', subj: 'LMAX', crse: 'CFS03', modalidad: 'RW', calificacion: '9' },
      { periodo: '202430', crn: '10503', subj: 'LMAX', crse: 'FIS05', modalidad: 'RW', calificacion: '9' },
      { periodo: '202430', crn: '10504', subj: 'LMAX', crse: 'CFT05', modalidad: 'RW', calificacion: '9' },
      { periodo: '202430', crn: '10505', subj: 'LMAJ', crse: 'CFS04', modalidad: 'RW', calificacion: '9' },
      { periodo: '202430', crn: '10506', subj: 'INHH', crse: 'P001', modalidad: 'RW', calificacion: '10' },

      // Cuatrimestre 6
      { periodo: '202510', crn: '10601', subj: 'LMAX', crse: 'FIS06', modalidad: 'RW', calificacion: '9' },
      { periodo: '202510', crn: '10602', subj: 'LMAD', crse: 'EES01', modalidad: 'RW', calificacion: '10' },
      { periodo: '202510', crn: '10603', subj: 'LMAX', crse: 'FIS07', modalidad: 'RW', calificacion: '9' },
      { periodo: '202510', crn: '10604', subj: 'LMAX', crse: 'CFT08', modalidad: 'RW', calificacion: '9' },
      { periodo: '202510', crn: '10605', subj: 'LMAX', crse: 'ADS13', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 7
      { periodo: '202520', crn: '10701', subj: 'LMAD', crse: 'EES02', modalidad: 'RW', calificacion: '10' },

      // Cuatrimestre 8
      { periodo: '202530', crn: '10801', subj: 'LMAJ', crse: 'HUS06', modalidad: 'RW', calificacion: '9' },
      { periodo: '202530', crn: '10802', subj: 'LMAX', crse: 'CFS05', modalidad: 'RW', calificacion: '9' },
      { periodo: '202530', crn: '10803', subj: 'LMKA', crse: 'FIS08', modalidad: 'RW', calificacion: '9' },
      { periodo: '202530', crn: '10804', subj: 'LMAX', crse: 'FIT04', modalidad: 'RW', calificacion: '9' },
      { periodo: '202530', crn: '10805', subj: 'LMHA', crse: 'ADS02', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 9
      { periodo: '202610', crn: '10901', subj: 'LMHV', crse: 'EES03', modalidad: 'RW', calificacion: '10' },

      // Requisitos Co-Curriculares / Egreso aprobados
      { periodo: '202410', crn: '99001', subj: 'MPD', crse: 'CMS02', modalidad: 'RW', calificacion: '10' },
      { periodo: '202420', crn: '99002', subj: 'MPD', crse: 'CMS03', modalidad: 'RW', calificacion: '8' },
      { periodo: '202610', crn: '99003', subj: 'CUPR', crse: 'EGCF1', modalidad: 'RW', calificacion: '9' },
      { periodo: '202620', crn: '99004', subj: 'TPEG', crse: '0001', modalidad: 'RW', calificacion: 'AC' }
    ]
  },
  {
    id: 'demo-1',
    label: 'Expediente C (00778899) - Elegible para Estadía (Sin Adeudos en 1.º-6.º)',
    matricula: '00778899',
    nombre: 'MARTÍNEZ TORRES, EMILIANO',
    programa: 'LIC-COFI-18',
    sede: 'CAM',
    estatus: 'AC',
    ultimoPeriodo: '202520',
    registros: [
      // Cuatrimestre 1 (Periodo 202320)
      { periodo: '202320', crn: '10101', subj: 'LMFM', crse: 'HUS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202320', crn: '10102', subj: 'LMAX', crse: 'FIS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202320', crn: '10103', subj: 'LMIX', crse: 'HTS01', modalidad: 'RW', calificacion: '10' },
      { periodo: '202320', crn: '10104', subj: 'LMAX', crse: 'CFS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202320', crn: '10105', subj: 'LMDX', crse: 'EDS01', modalidad: 'RW', calificacion: '8' },
      // Exento de inglés
      { periodo: '202320', crn: '10106', subj: 'LENG', crse: '0008', modalidad: 'RW', calificacion: 'AC' },
      
      // Cuatrimestre 2 (Periodo 202330)
      { periodo: '202330', crn: '10201', subj: 'LMFM', crse: 'HUS02', modalidad: 'RW', calificacion: '9' },
      { periodo: '202330', crn: '10202', subj: 'LMPX', crse: 'CMS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202330', crn: '10203', subj: 'LMAN', crse: 'MTS06', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '10204', subj: 'LMAX', crse: 'ADS07', modalidad: 'RW', calificacion: '7' },
      { periodo: '202330', crn: '10205', subj: 'LMAX', crse: 'FIS02', modalidad: 'RW', calificacion: '8' },

      // Cuatrimestre 3 (Periodo 202410)
      { periodo: '202410', crn: '10301', subj: 'LMFM', crse: 'HUS03', modalidad: 'RW', calificacion: '9' },
      { periodo: '202410', crn: '10302', subj: 'LMAX', crse: 'CFS02', modalidad: 'RW', calificacion: '8' },
      { periodo: '202410', crn: '10303', subj: 'LMAX', crse: 'FIS03', modalidad: 'RW', calificacion: '9' },
      { periodo: '202410', crn: '10304', subj: 'LMJA', crse: 'DES08', modalidad: 'RE', calificacion: '8' }, // Modo RE
      { periodo: '202410', crn: '10305', subj: 'LMEI', crse: 'MTS02', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 4 (Periodo 202420)
      { periodo: '202420', crn: '10401', subj: 'LMFM', crse: 'HUS05', modalidad: 'RW', calificacion: '10' },
      { periodo: '202420', crn: '10402', subj: 'LMAX', crse: 'FIS04', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '10403', subj: 'LMBX', crse: 'IVS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202420', crn: '10404', subj: 'LMAX', crse: 'CFT01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '10405', subj: 'LMJX', crse: 'DES12', modalidad: 'RW', calificacion: '7' },

      // Cuatrimestre 5 (Periodo 202430)
      { periodo: '202430', crn: '10501', subj: 'LMFX', crse: 'HUS04', modalidad: 'RW', calificacion: '9' },
      { periodo: '202430', crn: '10502', subj: 'LMAX', crse: 'CFS03', modalidad: 'RW', calificacion: '8' },
      { periodo: '202430', crn: '10503', subj: 'LMAX', crse: 'FIS05', modalidad: 'RW', calificacion: '9' },
      { periodo: '202430', crn: '10504', subj: 'LMAX', crse: 'CFT05', modalidad: 'RW', calificacion: '8' },
      { periodo: '202430', crn: '10505', subj: 'LMAJ', crse: 'CFS04', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 6 (Periodo 202510 y 202520)
      { periodo: '202510', crn: '10601', subj: 'LMAX', crse: 'FIS06', modalidad: 'RW', calificacion: '9' },
      { periodo: '202510', crn: '10602', subj: 'LMAD', crse: 'EES01', modalidad: 'RW', calificacion: '10' },
      { periodo: '202510', crn: '10603', subj: 'LMAX', crse: 'FIS07', modalidad: 'RW', calificacion: '8' },
      // CFT08 reprobada primero en 202510 con 5 y acreditada en recursamiento en 202520 con 8
      { periodo: '202510', crn: '10604', subj: 'LMAX', crse: 'CFTD8', modalidad: 'RW', calificacion: '5' },
      { periodo: '202520', crn: '10605', subj: 'LMAX', crse: 'CFT08', modalidad: 'RW', calificacion: '8' },
      { periodo: '202510', crn: '10606', subj: 'LMAX', crse: 'ADS13', modalidad: 'RW', calificacion: '9' },
      
      // Co-curriculares ignoradas
      { periodo: '202320', crn: '99001', subj: 'COCU', crse: 'CMS02', modalidad: 'RW', calificacion: 'AC' },
      { periodo: '202410', crn: '99002', subj: 'COCU', crse: 'CMS03', modalidad: 'RW', calificacion: 'AC' },
    ]
  },
  {
    id: 'demo-2',
    label: 'Expediente D (00223344) - Retenido para Estadía (Adeudo en CFT08 y Conecta Omitida)',
    matricula: '00223344',
    nombre: 'SÁNCHEZ LÓPEZ, MARIANA',
    programa: 'LIC-COFI-18',
    sede: 'CAM',
    estatus: 'AC',
    ultimoPeriodo: '202520',
    registros: [
      // Cuatrimestre 1
      { periodo: '202320', crn: '20101', subj: 'LMFM', crse: 'HUS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202320', crn: '20102', subj: 'LMAX', crse: 'FIS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202320', crn: '20103', subj: 'LMIX', crse: 'HTS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202320', crn: '20104', subj: 'LMAX', crse: 'CFS01', modalidad: 'RW', calificacion: '7' },
      { periodo: '202320', crn: '20105', subj: 'LMDX', crse: 'EDS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202320', crn: '20106', subj: 'LENG', crse: 'F001', modalidad: 'RW', calificacion: '8' },

      // Cuatrimestre 2
      { periodo: '202330', crn: '20201', subj: 'LMFM', crse: 'HUS02', modalidad: 'RW', calificacion: '9' },
      { periodo: '202330', crn: '20202', subj: 'LMPX', crse: 'CMS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '20203', subj: 'LMAN', crse: 'MTS06', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '20204', subj: 'LMAX', crse: 'ADS07', modalidad: 'RW', calificacion: '9' },
      { periodo: '202330', crn: '20205', subj: 'LMAX', crse: 'FIS02', modalidad: 'RW', calificacion: '7' },
      { periodo: '202330', crn: '20206', subj: 'LENG', crse: 'F002', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 3: Omitió LMFM-HUS03 (Seminario de Valores en lo Común - Conecta CC)
      { periodo: '202410', crn: '20302', subj: 'LMAX', crse: 'CFS02', modalidad: 'RW', calificacion: '8' },
      { periodo: '202410', crn: '20303', subj: 'LMAX', crse: 'FIS03', modalidad: 'RW', calificacion: '8' },
      { periodo: '202410', crn: '20304', subj: 'LMJA', crse: 'DES08', modalidad: 'RW', calificacion: '7' },
      { periodo: '202410', crn: '20305', subj: 'LMEI', crse: 'MTS02', modalidad: 'RW', calificacion: '8' },
      { periodo: '202410', crn: '20306', subj: 'LENG', crse: 'F003', modalidad: 'RW', calificacion: '5' }, // Reprobó inglés 3

      // Cuatrimestre 4
      { periodo: '202420', crn: '20401', subj: 'LMFM', crse: 'HUS05', modalidad: 'RW', calificacion: '9' },
      { periodo: '202420', crn: '20402', subj: 'LMAX', crse: 'FIS04', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '20403', subj: 'LMBX', crse: 'IVS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '20404', subj: 'LMAX', crse: 'CFT01', modalidad: 'RW', calificacion: '7' },
      { periodo: '202420', crn: '20405', subj: 'LMJX', crse: 'DES12', modalidad: 'RW', calificacion: '8' },

      // Cuatrimestre 5
      { periodo: '202430', crn: '20501', subj: 'LMFX', crse: 'HUS04', modalidad: 'RW', calificacion: '9' },
      { periodo: '202430', crn: '20502', subj: 'LMAX', crse: 'CFS03', modalidad: 'RW', calificacion: '8' },
      { periodo: '202430', crn: '20503', subj: 'LMAX', crse: 'FIS05', modalidad: 'RW', calificacion: '7' },
      { periodo: '202430', crn: '20504', subj: 'LMAX', crse: 'CFT05', modalidad: 'RW', calificacion: '8' },
      { periodo: '202430', crn: '20505', subj: 'LMAJ', crse: 'CFS04', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 6: Adeudo en CFT08 (reprobada con 5 en último intento)
      { periodo: '202510', crn: '20601', subj: 'LMAX', crse: 'FIS06', modalidad: 'RW', calificacion: '8' },
      { periodo: '202510', crn: '20602', subj: 'LMAD', crse: 'EES01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202510', crn: '20603', subj: 'LMAX', crse: 'FIS07', modalidad: 'RW', calificacion: '8' },
      { periodo: '202510', crn: '20604', subj: 'LMAX', crse: 'CFT08', modalidad: 'RW', calificacion: '5' }, // Adeudo activo
      { periodo: '202510', crn: '20605', subj: 'LMAX', crse: 'ADS13', modalidad: 'RW', calificacion: '7' },
    ]
  },
  {
    id: 'demo-3',
    label: 'Expediente E (00556677) - Estudiante en 5.º Cuatrimestre (Con Materias Cursando)',
    matricula: '00556677',
    nombre: 'RAMÍREZ CASTILLO, MATEO',
    programa: 'LIC-COFI-18',
    sede: 'CAM',
    estatus: 'AC',
    ultimoPeriodo: '202510',
    registros: [
      // Cuatrimestre 1: LMAX-CFS01 en recursamiento (5 -> 8)
      { periodo: '202320', crn: '30101', subj: 'LMFM', crse: 'HUS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202320', crn: '30102', subj: 'LMAX', crse: 'FIS01', modalidad: 'RW', calificacion: '7' },
      { periodo: '202320', crn: '30103', subj: 'LMIX', crse: 'HTS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202320', crn: '30104', subj: 'LMAX', crse: 'CFS01', modalidad: 'RW', calificacion: '5' },
      { periodo: '202330', crn: '30105', subj: 'LMAX', crse: 'CFS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202320', crn: '30106', subj: 'LMDX', crse: 'EDS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202320', crn: '30107', subj: 'LENG', crse: 'F001', modalidad: 'RW', calificacion: '8' },

      // Cuatrimestre 2
      { periodo: '202330', crn: '30201', subj: 'LMFM', crse: 'HUS02', modalidad: 'RW', calificacion: '9' },
      { periodo: '202330', crn: '30202', subj: 'LMPX', crse: 'CMS01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '30203', subj: 'LMAN', crse: 'MTS06', modalidad: 'RW', calificacion: '7' },
      { periodo: '202330', crn: '30204', subj: 'LMAX', crse: 'ADS07', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '30205', subj: 'LMAX', crse: 'FIS02', modalidad: 'RW', calificacion: '8' },
      { periodo: '202330', crn: '30206', subj: 'LENG', crse: 'F002', modalidad: 'RW', calificacion: '8' },

      // Cuatrimestre 3: LMJA-DES08 en modo RE
      { periodo: '202410', crn: '30301', subj: 'LMFM', crse: 'HUS03', modalidad: 'RW', calificacion: '9' },
      { periodo: '202410', crn: '30302', subj: 'LMAX', crse: 'CFS02', modalidad: 'RW', calificacion: '8' },
      { periodo: '202410', crn: '30303', subj: 'LMAX', crse: 'FIS03', modalidad: 'RW', calificacion: '8' },
      { periodo: '202410', crn: '30304', subj: 'LMJA', crse: 'DES08', modalidad: 'RE', calificacion: '7' },
      { periodo: '202410', crn: '30305', subj: 'LMEI', crse: 'MTS02', modalidad: 'RW', calificacion: '9' },
      { periodo: '202410', crn: '30306', subj: 'LENG', crse: 'F003', modalidad: 'RW', calificacion: '8' },

      // Cuatrimestre 4
      { periodo: '202420', crn: '30401', subj: 'LMFM', crse: 'HUS05', modalidad: 'RW', calificacion: '9' },
      { periodo: '202420', crn: '30402', subj: 'LMAX', crse: 'FIS04', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '30403', subj: 'LMBX', crse: 'IVS01', modalidad: 'RW', calificacion: '9' },
      { periodo: '202420', crn: '30404', subj: 'LMAX', crse: 'CFT01', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '30405', subj: 'LMJX', crse: 'DES12', modalidad: 'RW', calificacion: '8' },
      { periodo: '202420', crn: '30406', subj: 'LENG', crse: 'F004', modalidad: 'RW', calificacion: '9' },

      // Cuatrimestre 5 (Periodo activo 202510 - Cursando actualmente sin calificación)
      { periodo: '202510', crn: '30501', subj: 'LMFX', crse: 'HUS04', modalidad: 'RW', calificacion: '' },
      { periodo: '202510', crn: '30502', subj: 'LMAX', crse: 'CFS03', modalidad: 'RW', calificacion: '' },
      { periodo: '202510', crn: '30503', subj: 'LMAX', crse: 'FIS05', modalidad: 'RW', calificacion: '' },
      { periodo: '202510', crn: '30504', subj: 'LMAX', crse: 'CFT05', modalidad: 'RW', calificacion: '' },
      { periodo: '202510', crn: '30505', subj: 'LMAJ', crse: 'CFS04', modalidad: 'RW', calificacion: '' },
      { periodo: '202510', crn: '30506', subj: 'LENG', crse: 'P001', modalidad: 'RW', calificacion: '' },
    ]
  }
];
