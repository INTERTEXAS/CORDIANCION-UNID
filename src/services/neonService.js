// Servicio de consulta de Carreras en Neon Database con Respaldo Local Oficial
import { neon } from '@neondatabase/serverless';
import { CARRERAS_LOCAL } from '../data/carrerasData.js';

function getDatabaseUrl() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_NEON_DATABASE_URL) {
      return import.meta.env.VITE_NEON_DATABASE_URL;
    }
  } catch (_) {}
  try {
    if (typeof process !== 'undefined' && process?.env?.VITE_NEON_DATABASE_URL) {
      return process.env.VITE_NEON_DATABASE_URL;
    }
  } catch (_) {}
  return null;
}

/**
 * Consulta la tabla 'carreras' en la base de datos Neon.
 * Si VITE_NEON_DATABASE_URL no está configurada o la conexión falla,
 * retorna de manera transparente el respaldo local (CARRERAS_LOCAL).
 */
export async function getCarreras() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl || databaseUrl.trim() === '' || databaseUrl.includes('placeholder')) {
    console.info('[NeonService] Variable VITE_NEON_DATABASE_URL no configurada. Utilizando catálogo institucional local.');
    return {
      carreras: CARRERAS_LOCAL,
      fuente: 'local',
      mensaje: 'Catálogo institucional local (modo seguro y sin latencia)'
    };
  }

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT * FROM carreras ORDER BY id ASC`;
    
    if (rows && rows.length > 0) {
      // Validamos que el mapa_json venga deserializado si venía como string
      const parsedRows = rows.map(carrera => {
        let mapa = carrera.mapa_json;
        if (typeof mapa === 'string') {
          try {
            mapa = JSON.parse(mapa);
          } catch (e) {
            console.warn('[NeonService] Error al parsear mapa_json de carrera:', carrera.codigo, e);
          }
        }
        return {
          ...carrera,
          activa: Boolean(carrera.activa),
          mapa_json: mapa || (carrera.codigo === 'LIC-COFI-18' ? CARRERAS_LOCAL[0].mapa_json : null)
        };
      });

      return {
        carreras: parsedRows,
        fuente: 'neon',
        mensaje: 'Conectado a Neon PostgreSQL Serverless'
      };
    } else {
      console.warn('[NeonService] Tabla carreras vacía en Neon. Usando respaldo local.');
      return {
        carreras: CARRERAS_LOCAL,
        fuente: 'local',
        mensaje: 'Respaldo institucional (tabla vacía en BD)'
      };
    }
  } catch (error) {
    console.error('[NeonService] Error al consultar Neon PostgreSQL:', error);
    return {
      carreras: CARRERAS_LOCAL,
      fuente: 'local',
      error: error.message,
      mensaje: `Respaldo local activado (${error.message || 'error de conexión'})`
    };
  }
}

/**
 * Guarda un lote de alumnos auditados en Neon Database bajo un ciclo escolar y cuatrimestre.
 * Si ya existen registros previos para ese mismo ciclo y cuatrimestre, los reemplaza para evitar duplicados.
 */
export async function guardarAuditoriasLote({
  alumnos,
  cicloEscolar,
  cuatrimestreGrupo = 6,
  carreraCodigo = 'LIC-COFI-18'
}) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl || !alumnos || alumnos.length === 0) {
    throw new Error('No hay conexión a la base de datos o no hay alumnos para guardar.');
  }

  const sql = neon(databaseUrl);

  try {
    // 1. Eliminar auditorías previas del mismo ciclo y cuatrimestre para evitar duplicidad
    await sql`
      DELETE FROM auditorias_estudiantes 
      WHERE ciclo_escolar = ${cicloEscolar} 
        AND cuatrimestre_grupo = ${Number(cuatrimestreGrupo)}
    `;

    // 2. Insertar cada expediente del lote
    for (const item of alumnos) {
      const estudiante = item.estudiante || {};
      const audit = item.auditData || {};
      const estatus = audit.resumen?.dictamenEstadia || 'AUDITADO';

      await sql`
        INSERT INTO auditorias_estudiantes (
          matricula, 
          nombre, 
          carrera_codigo, 
          ciclo_escolar, 
          cuatrimestre_grupo, 
          estatus_estadia, 
          datos_completos
        )
        VALUES (
          ${estudiante.matricula || 'SIN_MATRICULA'},
          ${estudiante.nombre || 'SIN_NOMBRE'},
          ${carreraCodigo},
          ${cicloEscolar},
          ${Number(cuatrimestreGrupo)},
          ${estatus},
          ${item}
        )
      `;
    }

    return {
      success: true,
      totalGuardados: alumnos.length,
      cicloEscolar,
      cuatrimestreGrupo
    };
  } catch (error) {
    console.error('[NeonService] Error al guardar lote de auditorías:', error);
    throw error;
  }
}

/**
 * Obtiene el resumen consolidado de todos los ciclos escolares y cuatrimestres guardados en Neon.
 */
export async function obtenerResumenCiclos() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];

  const sql = neon(databaseUrl);

  try {
    const rows = await sql`
      SELECT 
        ciclo_escolar,
        cuatrimestre_grupo,
        carrera_codigo,
        COUNT(*)::int as total_alumnos,
        COUNT(*) FILTER (WHERE estatus_estadia ILIKE '%APROBADO%' OR estatus_estadia ILIKE '%ELEGIBLE%')::int as aptos,
        COUNT(*) FILTER (WHERE NOT (estatus_estadia ILIKE '%APROBADO%' OR estatus_estadia ILIKE '%ELEGIBLE%'))::int as con_adeudos,
        MIN(creado_en) as fecha_registro,
        MAX(creado_en) as ultima_actualizacion
      FROM auditorias_estudiantes
      GROUP BY ciclo_escolar, cuatrimestre_grupo, carrera_codigo
      ORDER BY MAX(creado_en) DESC
    `;

    return rows || [];
  } catch (error) {
    console.error('[NeonService] Error al obtener resumen de ciclos:', error);
    return [];
  }
}

/**
 * Carga todos los alumnos auditados de un ciclo escolar y cuatrimestre específico directamente desde Neon.
 */
export async function cargarAuditoriasPorCiclo(cicloEscolar, cuatrimestreGrupo) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) throw new Error('No hay URL de conexión a Neon.');

  const sql = neon(databaseUrl);

  try {
    const rows = await sql`
      SELECT datos_completos 
      FROM auditorias_estudiantes
      WHERE ciclo_escolar = ${cicloEscolar} 
        AND cuatrimestre_grupo = ${Number(cuatrimestreGrupo)}
      ORDER BY nombre ASC
    `;

    return rows.map(r => r.datos_completos);
  } catch (error) {
    console.error('[NeonService] Error al cargar auditorías por ciclo:', error);
    throw error;
  }
}

/**
 * Elimina las auditorías de un ciclo escolar y cuatrimestre específicos (Borrado selectivo por Coordinación).
 */
export async function eliminarAuditoriasPorCiclo(cicloEscolar, cuatrimestreGrupo) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) throw new Error('No hay URL de conexión a Neon.');

  const sql = neon(databaseUrl);

  try {
    const res = await sql`
      DELETE FROM auditorias_estudiantes
      WHERE ciclo_escolar = ${cicloEscolar} 
        AND cuatrimestre_grupo = ${Number(cuatrimestreGrupo)}
    `;

    return {
      success: true,
      cicloEscolar,
      cuatrimestreGrupo
    };
  } catch (error) {
    console.error('[NeonService] Error al eliminar auditorías por ciclo:', error);
    throw error;
  }
}

/**
 * Purga expedientes antiguos (por defecto con más de 5 meses de antigüedad conforme al ciclo escolar).
 */
export async function eliminarAuditoriasAntiguas(meses = 5) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) throw new Error('No hay URL de conexión a Neon.');

  const sql = neon(databaseUrl);

  try {
    await sql`
      DELETE FROM auditorias_estudiantes
      WHERE creado_en < NOW() - (${Number(meses)} || ' months')::interval
    `;

    return {
      success: true,
      meses
    };
  } catch (error) {
    console.error('[NeonService] Error al purgar auditorías antiguas:', error);
    throw error;
  }
}

