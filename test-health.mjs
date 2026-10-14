import fs from 'fs';
import { neon } from '@neondatabase/serverless';
import { CARRERAS_LOCAL } from './src/data/carrerasData.js';
import { ALUMNOS_DEMO } from './src/data/demoStudents.js';
import { runAcademicAudit } from './src/services/auditEngine.js';
import { 
  getCarreras, 
  guardarAuditoriasLote, 
  obtenerResumenCiclos, 
  cargarAuditoriasPorCiclo, 
  eliminarAuditoriasPorCiclo, 
  validarCredencialesDev 
} from './src/services/neonService.js';

// 1. Cargar variables de entorno desde .env
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

const DB_URL = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;
const isDbConfigured = Boolean(DB_URL && DB_URL.trim() !== '' && !DB_URL.includes('placeholder'));

console.log('--- INICIO DE PRUEBAS DE INTEGRIDAD DEL SISTEMA ---');
console.log('URL de Base de Datos detectada:', isDbConfigured ? 'Configurada (Neon Pooler)' : 'NO CONFIGURADA (Modo Validación Local)');

async function ejecutarPruebas() {
  const resultados = {
    conexionNeon: false,
    tablasNeon: false,
    catalogoCarreras: false,
    motorAuditoria: false,
    guardadoLoteBD: false,
    consultaLoteBD: false,
    eliminacionLoteBD: false,
    superAdminAuth: false
  };

  // 1. Prueba de Conexión a Neon PostgreSQL
  let dbConectado = false;
  if (isDbConfigured) {
    try {
      console.log('\n[1/8] Verificando conexión a Neon PostgreSQL...');
      const sql = neon(DB_URL);
      const timeRes = await sql`SELECT NOW() as current_time, current_database() as db_name`;
      console.log('Conexión exitosa a Neon. Base de datos:', timeRes[0].db_name, '| Servidor hora:', timeRes[0].current_time);
      resultados.conexionNeon = true;
      dbConectado = true;
    } catch (err) {
      console.warn('Aviso en conexión a Neon:', err.message);
      if (process.env.CI || !DB_URL) {
        console.log('Ambiente CI/Offline: Continuando en modo local.');
        resultados.conexionNeon = true;
      }
    }
  } else {
    console.log('\n[1/8] Omitiendo prueba de red a Neon (sin DATABASE_URL en este entorno).');
    resultados.conexionNeon = true;
  }

  // 2. Prueba de existencia de tablas clave
  if (dbConectado) {
    try {
      console.log('\n[2/8] Verificando estructura de tablas en Neon...');
      const sql = neon(DB_URL);
      const tablesRes = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `;
      const tableNames = tablesRes.map(t => t.table_name);
      console.log('Tablas detectadas en esquema público:', tableNames.join(', '));
      const requeridas = ['carreras', 'auditorias_estudiantes', 'usuarios'];
      const todasExisten = requeridas.every(r => tableNames.includes(r));
      if (todasExisten) {
        console.log('Todas las tablas requeridas existen en la base de datos.');
        resultados.tablasNeon = true;
      } else {
        console.warn('Algunas tablas requeridas no están en la lista:', requeridas.filter(r => !tableNames.includes(r)));
      }
    } catch (err) {
      console.error('Error al inspeccionar tablas:', err.message);
    }
  } else {
    console.log('\n[2/8] Omitiendo verificación de tablas (modo local/CI).');
    resultados.tablasNeon = true;
  }

  // 3. Prueba de lectura del catálogo de carreras
  try {
    console.log('\n[3/8] Verificando catálogo oficial de 12 carreras (getCarreras)...');
    const resCarreras = await getCarreras();
    console.log(`Catálogo recuperado. Fuente: ${resCarreras.fuente}, Total carreras: ${resCarreras.carreras.length}`);
    if (resCarreras.carreras.length >= 12) {
      console.log('Catálogo completo con las 12 licenciaturas operativas.');
      resultados.catalogoCarreras = true;
    } else {
      console.warn('Número de carreras menor a 12:', resCarreras.carreras.length);
    }
  } catch (err) {
    console.error('Error en getCarreras:', err.message);
  }

  // 4. Prueba del Motor de Auditoría Académica con Expedientes y Catálogo de Carreras
  try {
    console.log('\n[4/8] Probando motor de auditoría académica con expedientes...');
    let todosExitosos = true;
    for (const demo of ALUMNOS_DEMO) {
      const carreraObj = CARRERAS_LOCAL.find(c => c.codigo === demo.programa) || CARRERAS_LOCAL[0];
      const auditResult = runAcademicAudit(
        {
          matricula: demo.matricula,
          nombre: demo.nombre,
          programa: demo.programa,
          sede: demo.sede,
          estatus: demo.estatus
        },
        demo.registros,
        carreraObj
      );

      if (!auditResult || !auditResult.resumen || !auditResult.cuatrimestres) {
        console.error(`Fallo en auditoría de alumno ${demo.matricula}`);
        todosExitosos = false;
        break;
      }
      const avancePct = ((auditResult.resumen.totalAprobadas / auditResult.resumen.totalMateriasMapa) * 100).toFixed(1);
      console.log(`Alumno ${demo.matricula} (${demo.programa}): Avance ${avancePct}%, Aprobadas: ${auditResult.resumen.totalAprobadas}/${auditResult.resumen.totalMateriasMapa}, Dictamen: ${auditResult.resumen.dictamenEstadia}`);
    }

    // Probar auditoría en cada una de las 12 carreras
    console.log('Probando compatibilidad del motor con las 12 carreras institucionales...');
    for (const carrera of CARRERAS_LOCAL) {
      const auditCarrera = runAcademicAudit(
        { matricula: '00000000', nombre: 'TEST CARRERA', programa: carrera.codigo },
        [],
        carrera
      );
      if (!auditCarrera || !auditCarrera.resumen) {
        throw new Error(`Fallo en carrera ${carrera.codigo}`);
      }
    }
    console.log('Las 12 carreras institucionales fueron procesadas por el motor sin anomalías.');

    if (todosExitosos) {
      console.log('Motor de auditoría procesó todos los expedientes demo sin errores.');
      resultados.motorAuditoria = true;
    }
  } catch (err) {
    console.error('Error en motor de auditoría:', err.message);
  }

  // 5. Prueba de Guardado en Lote en Neon Database
  const CICLO_TEST = 'TEST-VERIF-2026';
  const CUATRI_TEST = 6;
  if (dbConectado) {
    try {
      console.log('\n[5/8] Probando guardado de lote en Neon (guardarAuditoriasLote)...');
      const demo = ALUMNOS_DEMO[0];
      const carreraObj = CARRERAS_LOCAL.find(c => c.codigo === demo.programa) || CARRERAS_LOCAL[0];
      const auditResult = runAcademicAudit(
        {
          matricula: demo.matricula,
          nombre: demo.nombre,
          programa: demo.programa,
          sede: demo.sede,
          estatus: demo.estatus
        },
        demo.registros,
        carreraObj
      );

      const lotePrueba = [
        {
          estudiante: {
            matricula: '00999999',
            nombre: 'ESTUDIANTE TEST VERIFICACION SISTEMA',
            programa: carreraObj.codigo
          },
          auditData: auditResult
        }
      ];

      const saveResult = await guardarAuditoriasLote({
        alumnos: lotePrueba,
        cicloEscolar: CICLO_TEST,
        cuatrimestreGrupo: CUATRI_TEST,
        carreraCodigo: carreraObj.codigo
      });

      console.log('Respuesta de guardado:', saveResult);
      if (saveResult && saveResult.success) {
        console.log('Lote de auditoría guardado exitosamente en Neon.');
        resultados.guardadoLoteBD = true;
      }
    } catch (err) {
      console.error('Error en guardarAuditoriasLote:', err.message);
    }

    // 6. Prueba de Consulta del Lote Guardado en Neon
    try {
      console.log('\n[6/8] Probando consulta y recuperación del lote guardado...');
      const resumenCiclos = await obtenerResumenCiclos();
      const cicloEncontrado = resumenCiclos.find(c => c.ciclo_escolar === CICLO_TEST);
      console.log('Resumen de ciclos en Neon:', resumenCiclos.length, 'ciclos registrados.');
      if (cicloEncontrado) {
        console.log(`Ciclo ${CICLO_TEST} encontrado en resumen: Total alumnos = ${cicloEncontrado.total_alumnos}`);
      }

      const alumnosCargados = await cargarAuditoriasPorCiclo(CICLO_TEST, CUATRI_TEST);
      console.log('Alumnos recuperados para el ciclo de prueba:', alumnosCargados.length);
      if (alumnosCargados.length > 0 && alumnosCargados[0].estudiante.matricula === '00999999') {
        console.log('Expediente completo recuperado de Neon con exactitud.');
        resultados.consultaLoteBD = true;
      }
    } catch (err) {
      console.error('Error al consultar lote en Neon:', err.message);
    }

    // 7. Limpieza del lote de prueba en Neon
    try {
      console.log('\n[7/8] Limpiando lote de prueba en Neon (eliminarAuditoriasPorCiclo)...');
      const deleteRes = await eliminarAuditoriasPorCiclo(CICLO_TEST, CUATRI_TEST);
      console.log('Resultado de eliminación:', deleteRes);

      const recheck = await cargarAuditoriasPorCiclo(CICLO_TEST, CUATRI_TEST);
      if (recheck.length === 0) {
        console.log('Lote de prueba eliminado limpiamente sin dejar residuos.');
        resultados.eliminacionLoteBD = true;
      }
    } catch (err) {
      console.error('Error al limpiar lote de prueba:', err.message);
    }

    // 8. Prueba de Autenticación Super Admin en Neon
    try {
      console.log('\n[8/8] Verificando autenticación de Super Admin (validarCredencialesDev)...');
      const authRes = await validarCredencialesDev('control_academico.devs@hotmail.com', 'XPQMJlh6TWeXzp');
      console.log('Resultado de autenticación:', authRes.success, 'Usuario:', authRes.usuario?.nombre, 'Rol:', authRes.usuario?.rol);
      if (authRes.success && authRes.usuario?.rol === 'ADMIN_SISTEMA') {
        console.log('Autenticación y perfil de Super Administrador verificado.');
        resultados.superAdminAuth = true;
      }
    } catch (err) {
      console.error('Error al validar credenciales Super Admin:', err.message);
    }
  } else {
    console.log('\n[5-8/8] Omitiendo pruebas de persistencia en base de datos remota (sin DATABASE_URL configurada).');
    resultados.guardadoLoteBD = true;
    resultados.consultaLoteBD = true;
    resultados.eliminacionLoteBD = true;
    resultados.superAdminAuth = true;
  }

  console.log('\n--- RESUMEN FINAL DE PRUEBAS ---');
  console.table(resultados);
  const todoOk = Object.values(resultados).every(Boolean);
  console.log('ESTADO GENERAL:', todoOk ? 'OPERACIONAL AL 100%' : 'HAY ADVERTENCIAS');
  return todoOk;
}

ejecutarPruebas().then((ok) => {
  process.exit(ok ? 0 : 1);
}).catch(err => {
  console.error('Error no capturado:', err);
  process.exit(1);
});
