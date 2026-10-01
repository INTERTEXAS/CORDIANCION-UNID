// Servicio de consulta de Carreras en Neon Database con Respaldo Local Oficial
import { neon } from '@neondatabase/serverless';
import { CARRERAS_LOCAL } from '../data/carrerasData.js';

/**
 * Consulta la tabla 'carreras' en la base de datos Neon.
 * Si VITE_NEON_DATABASE_URL no está configurada o la conexión falla,
 * retorna de manera transparente el respaldo local (CARRERAS_LOCAL).
 */
export async function getCarreras() {
  const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL;

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
