// Servicio de consulta de Carreras en Neon Database con Respaldo Local Oficial
import { neon } from '@neondatabase/serverless';
import { CARRERAS_LOCAL, resolverNombreOficialCarrera, normalizarMapaCurricular } from '../data/carrerasData.js';

function getDatabaseUrl() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_NEON_DATABASE_URL) {
      return import.meta.env.VITE_NEON_DATABASE_URL;
    }
  } catch (_) {}
  try {
    if (typeof process !== 'undefined') {
      if (process?.env?.VITE_NEON_DATABASE_URL) return process.env.VITE_NEON_DATABASE_URL;
      if (process?.env?.DATABASE_URL) return process.env.DATABASE_URL;
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
    const rows = await sql`SELECT codigo, nombre, encabezado_plan, activa, coordinadora, mapa_json FROM carreras ORDER BY codigo ASC`;

    if (rows && rows.length > 0) {
      // Mapear los datos provenientes de Neon por código
      const dbCarrerasMap = new Map();
      rows.forEach(carrera => {
        let mapa = carrera.mapa_json;
        if (typeof mapa === 'string') {
          try {
            mapa = JSON.parse(mapa);
          } catch (e) {
            console.warn('[NeonService] Error al parsear mapa_json de carrera:', carrera.codigo, e);
          }
        }
        mapa = normalizarMapaCurricular(mapa);
        dbCarrerasMap.set(carrera.codigo, {
          ...carrera,
          mapa_json: mapa
        });
      });

      // El catálogo maestro institucional garantizado incluye las carreras oficiales de CARRERAS_LOCAL y Neon DB.
      // Sincronizamos las propiedades desde Neon para las carreras oficiales.
      const carrerasConsolidadas = CARRERAS_LOCAL.map(local => {
        const fromDb = dbCarrerasMap.get(local.codigo);
        if (!fromDb) return local;

        const nombreOficial = resolverNombreOficialCarrera(fromDb) || local.nombre;
        const mapaDb = normalizarMapaCurricular(fromDb.mapa_json);
        const mapaValido = (Array.isArray(mapaDb?.cuatrimestres) && mapaDb.cuatrimestres.length > 0)
          ? mapaDb
          : local.mapa_json;

        return {
          ...local,
          ...fromDb,
          nombre: nombreOficial,
          activa: fromDb.activa !== undefined ? Boolean(fromDb.activa) : local.activa,
          coordinadora: fromDb.coordinadora || local.coordinadora,
          mapa_json: mapaValido
        };
      });

      // Añadir de forma dinámica cualquier carrera registrada en BD que no esté en local
      dbCarrerasMap.forEach((fromDb, codigo) => {
        if (!carrerasConsolidadas.some(c => c.codigo === codigo)) {
          carrerasConsolidadas.push({
            ...fromDb,
            mapa_json: normalizarMapaCurricular(fromDb.mapa_json)
          });
        }
      });

      return {
        carreras: carrerasConsolidadas,
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
    // 1. Eliminar auditorías previas de la misma carrera y ciclo escolar para evitar duplicidad
    const cicloLimpio = String(cicloEscolar || '').trim().substring(0, 50);
    const carreraCodigoSegura = String(carreraCodigo || 'LIC-COFI-18').trim().substring(0, 255);
    const cuatriLimpio = Number.isFinite(Number(cuatrimestreGrupo)) ? Math.trunc(Number(cuatrimestreGrupo)) : 0;

    await sql`
      DELETE FROM auditorias_estudiantes 
      WHERE ciclo_escolar = ${cicloLimpio} 
        AND carrera_codigo = ${carreraCodigoSegura}
    `;

    // 2. Insertar cada expediente del lote con truncamiento defensivo
    for (const item of alumnos) {
      const estudiante = item.estudiante || {};
      const audit = item.auditData || {};
      const rawEstatus = audit.resumen?.dictamenEstadia || 'AUDITADO';

      // Truncamiento preventivo para garantizar que anomalías de lectura OCR/PDF no tiren el guardado
      const matriculaSegura = String(estudiante.matricula || 'SIN_MATRICULA').trim().substring(0, 50);
      const nombreSeguro = String(estudiante.nombre || 'SIN_NOMBRE').trim().substring(0, 255);
      const estatusSeguro = String(rawEstatus).trim().substring(0, 255);

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
          ${matriculaSegura},
          ${nombreSeguro},
          ${carreraCodigoSegura},
          ${cicloLimpio},
          ${cuatriLimpio},
          ${estatusSeguro},
          ${item}
        )
      `;
    }

    return {
      success: true,
      totalGuardados: alumnos.length,
      cicloEscolar: cicloLimpio,
      carreraCodigo: carreraCodigoSegura
    };
  } catch (error) {
    console.error('[NeonService] Error al guardar lote de auditorías:', error);
    throw error;
  }
}

/**
 * Obtiene el resumen consolidado de todos los ciclos escolares y programas guardados en Neon.
 */
export async function obtenerResumenCiclos() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];

  const sql = neon(databaseUrl);

  try {
    const rows = await sql`
      SELECT 
        ciclo_escolar,
        carrera_codigo,
        COALESCE(MAX(cuatrimestre_grupo), 0) as cuatrimestre_grupo,
        COUNT(*)::int as total_alumnos,
        COUNT(*) FILTER (WHERE estatus_estadia ILIKE '%APROBADO%' OR estatus_estadia ILIKE '%ELEGIBLE%')::int as aptos,
        COUNT(*) FILTER (WHERE NOT (estatus_estadia ILIKE '%APROBADO%' OR estatus_estadia ILIKE '%ELEGIBLE%'))::int as con_adeudos,
        MIN(creado_en) as fecha_registro,
        MAX(creado_en) as ultima_actualizacion
      FROM auditorias_estudiantes
      GROUP BY ciclo_escolar, carrera_codigo
      ORDER BY MAX(creado_en) DESC
    `;

    return rows || [];
  } catch (error) {
    console.error('[NeonService] Error al obtener resumen de ciclos:', error);
    return [];
  }
}

/**
 * Carga todos los alumnos auditados de un ciclo escolar y programa específico directamente desde Neon.
 */
export async function cargarAuditoriasPorCiclo(cicloEscolar, carreraCodigoOrCuatri, fallbackCuatri) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) throw new Error('No hay URL de conexión a Neon.');

  const sql = neon(databaseUrl);

  try {
    let rows;
    // Si el segundo argumento es una cadena de código de carrera (ej. MAE-MADP-22 o LIC-COFI-18)
    if (typeof carreraCodigoOrCuatri === 'string' && isNaN(Number(carreraCodigoOrCuatri))) {
      rows = await sql`
        SELECT datos_completos 
        FROM auditorias_estudiantes
        WHERE ciclo_escolar = ${cicloEscolar} 
          AND carrera_codigo = ${carreraCodigoOrCuatri}
        ORDER BY nombre ASC
      `;
    } else {
      const cuatri = Number(carreraCodigoOrCuatri || fallbackCuatri || 0);
      rows = await sql`
        SELECT datos_completos 
        FROM auditorias_estudiantes
        WHERE ciclo_escolar = ${cicloEscolar} 
          AND (cuatrimestre_grupo = ${cuatri} OR ${cuatri} = 0)
        ORDER BY nombre ASC
      `;
    }

    return rows.map(r => r.datos_completos);
  } catch (error) {
    console.error('[NeonService] Error al cargar auditorías por ciclo:', error);
    throw error;
  }
}

/**
 * Elimina las auditorías de un ciclo escolar y programa específicos (Borrado selectivo por Coordinación).
 */
export async function eliminarAuditoriasPorCiclo(cicloEscolar, carreraCodigoOrCuatri, fallbackCuatri) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) throw new Error('No hay URL de conexión a Neon.');

  const sql = neon(databaseUrl);

  try {
    if (typeof carreraCodigoOrCuatri === 'string' && isNaN(Number(carreraCodigoOrCuatri))) {
      await sql`
        DELETE FROM auditorias_estudiantes
        WHERE ciclo_escolar = ${cicloEscolar} 
          AND carrera_codigo = ${carreraCodigoOrCuatri}
      `;
    } else {
      const cuatri = Number(carreraCodigoOrCuatri || fallbackCuatri || 0);
      await sql`
        DELETE FROM auditorias_estudiantes
        WHERE ciclo_escolar = ${cicloEscolar} 
          AND (cuatrimestre_grupo = ${cuatri} OR ${cuatri} = 0)
      `;
    }

    return {
      success: true,
      cicloEscolar,
      carreraCodigo: carreraCodigoOrCuatri
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

/**
 * Guarda o actualiza el estatus manual de un alumno en la base de datos Neon.
 */
export async function saveEstatusAlumno(matricula, nombre, estatusCodigo, estatusDescripcion) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.warn('[NeonService] No hay conexión a Neon DB para guardar estatus. Simulación exitosa en modo local.');
    return { success: true, localOnly: true };
  }

  const sql = neon(databaseUrl);
  try {
    // Truncamiento preventivo para estatus
    const matriculaSegura = String(matricula || '').trim().substring(0, 50);
    const nombreSeguro = String(nombre || 'Desconocido').trim().substring(0, 255);
    const estatusCodigoSeguro = String(estatusCodigo || '').trim().substring(0, 20);
    const estatusDescSegura = String(estatusDescripcion || '').trim().substring(0, 255);

    await sql`
      INSERT INTO estatus_alumnos (matricula, nombre, nombre_alumno, estatus_codigo, estatus_descripcion, actualizado_en, fecha_actualizacion)
      VALUES (${matriculaSegura}, ${nombreSeguro}, ${nombreSeguro}, ${estatusCodigoSeguro}, ${estatusDescSegura}, NOW(), NOW())
      ON CONFLICT (matricula) 
      DO UPDATE SET 
        nombre = EXCLUDED.nombre,
        nombre_alumno = EXCLUDED.nombre_alumno,
        estatus_codigo = EXCLUDED.estatus_codigo,
        estatus_descripcion = EXCLUDED.estatus_descripcion,
        actualizado_en = NOW(),
        fecha_actualizacion = NOW()
    `;
    return { success: true };
  } catch (error) {
    console.error('[NeonService] Error al guardar estatus del alumno:', error);
    throw error;
  }
}

/**
 * Consulta todos los estatus manuales guardados.
 * Devuelve un diccionario { [matricula]: { codigo, descripcion } }
 */
export async function fetchEstatusManuales() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return {};

  const sql = neon(databaseUrl);
  try {
    const rows = await sql`SELECT matricula, estatus_codigo, estatus_descripcion FROM estatus_alumnos`;
    const result = {};
    for (const r of rows) {
      result[r.matricula] = {
        codigo: r.estatus_codigo,
        descripcion: r.estatus_descripcion
      };
    }
    return result;
  } catch (error) {
    // Si la tabla no existe o hay error, fallar en silencio y retornar {}
    console.warn('[NeonService] Error o tabla estatus_alumnos inexistente:', error.message);
    return {};
  }
}

/**
 * Obtiene la configuración de lista blanca de IPs desde variables de entorno.
 * Permite VITE_ALLOWED_DEV_IPS o ALLOWED_DEV_IPS.
 */
export function obtenerListaBlancaIps() {
  let raw = '';
  try {
    if (typeof import.meta !== 'undefined' && import.meta?.env) {
      raw = import.meta.env.VITE_ALLOWED_DEV_IPS || import.meta.env.ALLOWED_DEV_IPS || '';
    }
  } catch (_) {}
  if (!raw && typeof process !== 'undefined' && process?.env) {
    raw = process.env.VITE_ALLOWED_DEV_IPS || process.env.ALLOWED_DEV_IPS || '';
  }
  return String(raw || '').trim();
}

/**
 * Valida si una dirección IP está autorizada según la lista blanca (ALLOWED_DEV_IPS).
 * Si la variable no está configurada, está vacía o contiene '*', se permite el acceso general.
 */
export function esIpAutorizada(ip) {
  const whitelist = obtenerListaBlancaIps();
  if (!whitelist || whitelist === '*') {
    return { permitida: true, whitelistConfigurada: false };
  }

  const ipsPermitidas = whitelist
    .split(',')
    .map(i => i.trim().toLowerCase())
    .filter(Boolean);

  if (ipsPermitidas.length === 0 || ipsPermitidas.includes('*')) {
    return { permitida: true, whitelistConfigurada: false };
  }

  const ipCliente = String(ip || '').trim().toLowerCase();
  if (!ipCliente || ipCliente === '0.0.0.0' || ipCliente === 'desconocida') {
    return { permitida: false, whitelistConfigurada: true, motivo: 'Dirección IP no identificada o vacía' };
  }

  const coincide = ipsPermitidas.some(permitida => {
    if (permitida === ipCliente) return true;
    if ((permitida === '127.0.0.1' || permitida === 'localhost') && (ipCliente === '::1' || ipCliente === '127.0.0.1')) {
      return true;
    }
    return false;
  });

  return {
    permitida: coincide,
    whitelistConfigurada: true,
    motivo: coincide ? 'IP autorizada en lista blanca' : `IP ${ipCliente} no autorizada en ALLOWED_DEV_IPS`
  };
}

/**
 * Obtiene la dirección IP del cliente:
 * 1. Consulta el endpoint backend/API /api/client-ip si está disponible.
 * 2. Si no o si es una IP local/loopback, consulta api.ipify.org (https://api.ipify.org?format=json).
 * 3. Fallback a api64.ipify.org o 127.0.0.1.
 */
export async function obtenerIpPublicaCliente() {
  // 1. Intentar endpoint backend si responde
  try {
    const apiRes = await fetch('/api/client-ip', { signal: AbortSignal.timeout(2000) });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data?.ip && data.ip !== '127.0.0.1' && data.ip !== '::1' && !data.ip.startsWith('127.')) {
        return data.ip;
      }
    }
  } catch (_) {}

  // 2. Consultar https://api.ipify.org?format=json (requerimiento explícito)
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) return data.ip;
    }
  } catch (err) {
    console.warn('[NeonService] Aviso al consultar api.ipify.org:', err);
  }

  // 3. Respaldo secundario
  try {
    const res2 = await fetch('https://api64.ipify.org?format=json', { signal: AbortSignal.timeout(3500) });
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2?.ip) return data2.ip;
    }
  } catch (_) {}

  return '127.0.0.1';
}

/**
 * Registra un intento de acceso de desarrollador en la tabla public.accesos_desarrollador_log de Neon.
 */
export async function registrarAccesoDevLog({
  ip,
  email = null,
  permitido = false,
  motivo = '',
  userAgent = null
}) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.warn('[NeonService] No hay databaseUrl para registrar log en accesos_desarrollador_log.');
    return { success: false, error: 'Sin conexión a base de datos' };
  }

  try {
    const sql = neon(databaseUrl);
    const ipSegura = String(ip || '0.0.0.0').trim().substring(0, 100);
    const emailSeguro = email ? String(email).trim().toLowerCase().substring(0, 255) : null;
    const esPermitido = Boolean(permitido);
    const motivoSeguro = motivo ? String(motivo).trim().substring(0, 1000) : null;
    const uaSeguro = userAgent 
      ? String(userAgent).trim().substring(0, 1000) 
      : (typeof navigator !== 'undefined' ? String(navigator.userAgent).substring(0, 1000) : 'Desconocido');

    await sql`
      INSERT INTO accesos_desarrollador_log (
        ip_address,
        email_intento,
        acceso_permitido,
        motivo,
        user_agent
      ) VALUES (
        ${ipSegura},
        ${emailSeguro},
        ${esPermitido},
        ${motivoSeguro},
        ${uaSeguro}
      )
    `;

    return { success: true };
  } catch (err) {
    console.error('[NeonService] Error al registrar intento en accesos_desarrollador_log:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Consulta los registros recientes de auditoría de accesos de desarrollador.
 */
export async function fetchAccesosDevLogs(limit = 20) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT id, ip_address, email_intento, acceso_permitido, motivo, user_agent, fecha_intento
      FROM accesos_desarrollador_log
      ORDER BY fecha_intento DESC
      LIMIT ${limit}
    `;
    return rows || [];
  } catch (err) {
    console.error('[NeonService] Error al consultar accesos_desarrollador_log:', err);
    return [];
  }
}

/**
 * Registra un evento en la tabla public.auditoria_accesos_dev de Neon Database.
 * Eventos típicos: 'VISITA_LINK', 'INTENTO_LOGIN'.
 * Permite registrar coordenadas GPS exactas, link a Google Maps y dirección física de OpenStreetMap.
 */
export async function registrarEventoAuditoriaDev({
  evento = 'VISITA_LINK',
  deviceId,
  ip = '127.0.0.1',
  ubicacion = null,
  sistemaNavegador = null,
  email = null,
  autorizado = false,
  motivo = null,
  latitud = null,
  longitud = null,
  mapaUrl = null,
  direccionExacta = null
}) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.warn('[NeonService] Sin databaseUrl para registrar evento en auditoria_accesos_dev.');
    return { success: false, error: 'Sin conexión a base de datos' };
  }

  try {
    const sql = neon(databaseUrl);
    const evSeguro = String(evento || 'VISITA_LINK').trim().substring(0, 100);
    const devSeguro = String(deviceId || 'desconocido').trim().substring(0, 255);
    const ipSegura = String(ip || '0.0.0.0').trim().substring(0, 100);
    const ubiSegura = ubicacion ? String(ubicacion).trim().substring(0, 255) : null;
    const sysSeguro = sistemaNavegador ? String(sistemaNavegador).trim() : (typeof navigator !== 'undefined' ? `${navigator.userAgent} [${navigator.platform || ''}]` : 'Desconocido');
    const emailSeguro = email ? String(email).trim().toLowerCase().substring(0, 255) : null;
    const esAutorizado = Boolean(autorizado);
    const motivoSeguro = motivo ? String(motivo).trim().substring(0, 1000) : null;
    const latSegura = latitud !== null && latitud !== undefined && !isNaN(Number(latitud)) ? Number(latitud) : null;
    const lonSegura = longitud !== null && longitud !== undefined && !isNaN(Number(longitud)) ? Number(longitud) : null;
    const mapaSeguro = mapaUrl ? String(mapaUrl).trim() : null;
    const dirExactaSegura = direccionExacta ? String(direccionExacta).trim() : null;

    const rows = await sql`
      INSERT INTO auditoria_accesos_dev (
        evento,
        device_id,
        ip_address,
        ubicacion,
        sistema_navegador,
        email_intentado,
        autorizado,
        motivo,
        latitud,
        longitud,
        mapa_url,
        direccion_exacta
      ) VALUES (
        ${evSeguro},
        ${devSeguro},
        ${ipSegura},
        ${ubiSegura},
        ${sysSeguro},
        ${emailSeguro},
        ${esAutorizado},
        ${motivoSeguro},
        ${latSegura},
        ${lonSegura},
        ${mapaSeguro},
        ${dirExactaSegura}
      )
      RETURNING id, evento, device_id, ip_address, ubicacion, autorizado, motivo, fecha, latitud, longitud, mapa_url, direccion_exacta;
    `;

    return { success: true, row: rows[0] };
  } catch (err) {
    console.error('[NeonService] Error al registrar en auditoria_accesos_dev:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Verifica si un device_id existe y se encuentra activo en public.dispositivos_autorizados.
 */
export async function verificarDispositivoAutorizado(deviceId) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl || !deviceId) {
    return { autorizado: false, motivo: 'Sin conexión o device_id no provisto' };
  }

  try {
    const sql = neon(databaseUrl);
    const devSeguro = String(deviceId).trim();

    const rows = await sql`
      SELECT id, device_id, propietario, activo, fecha_registro
      FROM dispositivos_autorizados
      WHERE device_id = ${devSeguro} AND activo = true
      LIMIT 1
    `;

    if (rows && rows.length > 0) {
      return {
        autorizado: true,
        dispositivo: rows[0],
        motivo: `Dispositivo autorizado para: ${rows[0].propietario}`
      };
    }

    return {
      autorizado: false,
      dispositivo: null,
      motivo: `El device_id (${devSeguro}) no se encuentra registrado o activo en la tabla dispositivos_autorizados.`
    };
  } catch (err) {
    console.error('[NeonService] Error al consultar dispositivos_autorizados:', err);
    return {
      autorizado: false,
      dispositivo: null,
      motivo: `Error al validar dispositivo: ${err.message}`
    };
  }
}

/**
 * Consulta los últimos registros de auditoría estricta en auditoria_accesos_dev.
 */
export async function fetchAuditoriaAccesosDev(limit = 30) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT id, evento, device_id, ip_address, ubicacion, sistema_navegador, email_intentado, autorizado, motivo, fecha, latitud, longitud, mapa_url, direccion_exacta
      FROM auditoria_accesos_dev
      ORDER BY fecha DESC
      LIMIT ${limit}
    `;
    return rows || [];
  } catch (err) {
    console.error('[NeonService] Error consultando auditoria_accesos_dev:', err);
    return [];
  }
}

/**
 * Consulta el catálogo de dispositivos registrados en public.dispositivos_autorizados.
 */
export async function fetchDispositivosAutorizados() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT id, device_id, propietario, activo, fecha_registro
      FROM dispositivos_autorizados
      ORDER BY fecha_registro DESC
    `;
    return rows || [];
  } catch (err) {
    console.error('[NeonService] Error consultando dispositivos_autorizados:', err);
    return [];
  }
}

/**
 * Registra o autoriza un dispositivo en public.dispositivos_autorizados.
 * Si el device_id ya existe, actualiza el propietario y su estado activo.
 */
export async function registrarDispositivoAutorizado({ deviceId, propietario = 'Desarrollador Autorizado', activo = true }) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl || !deviceId) {
    throw new Error('Sin conexión o device_id no provisto');
  }

  const sql = neon(databaseUrl);
  const rows = await sql`
    INSERT INTO dispositivos_autorizados (device_id, propietario, activo)
    VALUES (${String(deviceId).trim()}, ${String(propietario).trim()}, ${Boolean(activo)})
    ON CONFLICT (device_id) 
    DO UPDATE SET 
      propietario = EXCLUDED.propietario,
      activo = EXCLUDED.activo
    RETURNING id, device_id, propietario, activo, fecha_registro
  `;
  return rows[0];
}

/**
 * Consulta la bitácora de auditoría haciendo LEFT JOIN con dispositivos_autorizados
 * para vincular cada evento de acceso con el nombre del equipo y propietario.
 */
export async function fetchBitacoraAccesosConDispositivos(limit = 100) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT 
        a.id,
        a.evento,
        a.device_id,
        a.ip_address,
        a.ubicacion,
        a.sistema_navegador,
        a.email_intentado,
        a.autorizado,
        a.motivo,
        a.fecha,
        a.latitud,
        a.longitud,
        a.mapa_url,
        a.direccion_exacta,
        d.id AS dispositivo_id,
        d.propietario AS propietario_equipo,
        d.activo AS dispositivo_activo
      FROM auditoria_accesos_dev a
      LEFT JOIN dispositivos_autorizados d ON a.device_id = d.device_id
      ORDER BY a.fecha DESC
      LIMIT ${limit}
    `;
    return rows || [];
  } catch (err) {
    console.error('[NeonService] Error al consultar bitácora con JOIN de dispositivos:', err);
    return [];
  }
}

/**
 * Cambia el estado activo (true/false) de un dispositivo en tiempo real.
 */
export async function toggleEstadoDispositivo(id, activo) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) throw new Error('Sin conexión a base de datos');

  const sql = neon(databaseUrl);
  const rows = await sql`
    UPDATE dispositivos_autorizados
    SET activo = ${Boolean(activo)}
    WHERE id = ${Number(id)}
    RETURNING id, device_id, propietario, activo, fecha_registro
  `;
  return rows[0];
}

/**
 * Elimina un dispositivo de la lista de equipos autorizados.
 */
export async function eliminarDispositivo(id) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) throw new Error('Sin conexión a base de datos');

  const sql = neon(databaseUrl);
  await sql`
    DELETE FROM dispositivos_autorizados
    WHERE id = ${Number(id)}
  `;
  return { success: true };
}

/**
 * Valida credenciales de Super Administrador (DEV) contra la tabla 'usuarios' de Neon Database.
 * Audita estrictamente en public.auditoria_accesos_dev y public.accesos_desarrollador_log.
 * Verifica previamente la tabla public.dispositivos_autorizados si se requiere control por hardware.
 */
export async function validarCredencialesDev(email, password, options = {}) {
  const databaseUrl = getDatabaseUrl();
  const emailNorm = String(email || '').trim().toLowerCase();
  const passNorm = String(password || '').trim();

  const ip = options.ip || (typeof window !== 'undefined' ? await obtenerIpPublicaCliente() : '127.0.0.1');
  const userAgent = options.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconocido');
  const deviceId = options.deviceId || null;
  const ubicacion = options.ubicacion || null;
  const sistemaNavegador = options.sistemaNavegador || userAgent;
  const latitud = options.latitud ?? null;
  const longitud = options.longitud ?? null;
  const mapaUrl = options.mapaUrl || null;
  const direccionExacta = options.direccionExacta || null;

  // 1. Verificación previa de Hardware / Dispositivo Autorizado (si se especifica control estricto)
  if (options.checkDevice && deviceId) {
    const devCheck = await verificarDispositivoAutorizado(deviceId);
    if (!devCheck.autorizado) {
      await registrarEventoAuditoriaDev({
        evento: 'INTENTO_LOGIN',
        deviceId,
        ip,
        ubicacion,
        sistemaNavegador,
        email: emailNorm || null,
        autorizado: false,
        motivo: devCheck.motivo || 'Dispositivo no autorizado en dispositivos_autorizados',
        latitud,
        longitud,
        mapaUrl,
        direccionExacta
      });

      await registrarAccesoDevLog({
        ip,
        email: emailNorm || null,
        permitido: false,
        motivo: `Dispositivo no autorizado: ${deviceId}`,
        userAgent
      });

      return {
        success: false,
        error: 'Dispositivo no autorizado. Copia tu Device ID arriba y regístralo en el panel de seguridad.'
      };
    }
  }

  // 2. Verificación contra Lista Blanca de IPs (ALLOWED_DEV_IPS)
  const whitelistCheck = esIpAutorizada(ip);
  if (whitelistCheck.whitelistConfigurada && !whitelistCheck.permitida) {
    if (deviceId) {
      await registrarEventoAuditoriaDev({
        evento: 'INTENTO_LOGIN',
        deviceId,
        ip,
        ubicacion,
        sistemaNavegador,
        email: emailNorm || null,
        autorizado: false,
        motivo: `IP bloqueada por lista blanca: ${ip}`,
        latitud,
        longitud,
        mapaUrl,
        direccionExacta
      });
    }

    await registrarAccesoDevLog({
      ip,
      email: emailNorm || null,
      permitido: false,
      motivo: `IP bloqueada por lista blanca: ${ip}`,
      userAgent
    });

    return {
      success: false,
      error: `Acceso bloqueado: Tu dirección IP (${ip}) no está autorizada en la lista blanca de desarrollo.`
    };
  }

  // 3. Verificación si no hay conexión a Neon DB (modo offline/fallback)
  const fallbackEmail = (typeof process !== 'undefined' && process.env?.DEV_FALLBACK_EMAIL)
    || (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_DEV_FALLBACK_EMAIL) || '';
  const fallbackPass = (typeof process !== 'undefined' && process.env?.DEV_FALLBACK_PASSWORD)
    || (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_DEV_FALLBACK_PASSWORD) || '';

  if (!databaseUrl) {
    if (fallbackEmail && fallbackPass && emailNorm === fallbackEmail.toLowerCase() && passNorm === fallbackPass) {
      if (deviceId) {
        await registrarEventoAuditoriaDev({
          evento: 'INTENTO_LOGIN',
          deviceId,
          ip,
          ubicacion,
          sistemaNavegador,
          email: emailNorm,
          autorizado: true,
          motivo: 'Autenticación exitosa (modo offline/fallback)',
          latitud,
          longitud,
          mapaUrl,
          direccionExacta
        });
      }

      await registrarAccesoDevLog({
        ip,
        email: emailNorm,
        permitido: true,
        motivo: 'Autenticación exitosa (modo offline/fallback)',
        userAgent
      });

      return {
        success: true,
        usuario: {
          id: 1,
          nombre: 'SysAdmin Académico',
          email: emailNorm,
          rol: 'ADMIN_SISTEMA',
          coordinacion: 'TODAS'
        }
      };
    }

    if (deviceId) {
      await registrarEventoAuditoriaDev({
        evento: 'INTENTO_LOGIN',
        deviceId,
        ip,
        ubicacion,
        sistemaNavegador,
        email: emailNorm || null,
        autorizado: false,
        motivo: 'Sin conexión a base de datos y credenciales inválidas',
        latitud,
        longitud,
        mapaUrl,
        direccionExacta
      });
    }

    await registrarAccesoDevLog({
      ip,
      email: emailNorm || null,
      permitido: false,
      motivo: 'Sin conexión a base de datos y credenciales inválidas',
      userAgent
    });
    return { success: false, error: 'No hay conexión a la base de datos.' };
  }

  // 4. Verificación contra tabla 'usuarios' en Neon PostgreSQL
  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT id, nombre, email, password_hash, rol, coordinacion 
      FROM usuarios 
      WHERE LOWER(TRIM(email)) = ${emailNorm}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      if (deviceId) {
        await registrarEventoAuditoriaDev({
          evento: 'INTENTO_LOGIN',
          deviceId,
          ip,
          ubicacion,
          sistemaNavegador,
          email: emailNorm || null,
          autorizado: false,
          motivo: 'Correo electrónico no registrado en el sistema.',
          latitud,
          longitud,
          mapaUrl,
          direccionExacta
        });
      }

      await registrarAccesoDevLog({
        ip,
        email: emailNorm || null,
        permitido: false,
        motivo: 'Correo electrónico no registrado en el sistema.',
        userAgent
      });
      return { success: false, error: 'Correo electrónico no registrado en el sistema.' };
    }

    const user = rows[0];
    if (user.password_hash !== passNorm) {
      if (deviceId) {
        await registrarEventoAuditoriaDev({
          evento: 'INTENTO_LOGIN',
          deviceId,
          ip,
          ubicacion,
          sistemaNavegador,
          email: emailNorm,
          autorizado: false,
          motivo: 'Contraseña incorrecta.',
          latitud,
          longitud,
          mapaUrl,
          direccionExacta
        });
      }

      await registrarAccesoDevLog({
        ip,
        email: emailNorm,
        permitido: false,
        motivo: 'Contraseña incorrecta.',
        userAgent
      });
      return { success: false, error: 'Contraseña incorrecta.' };
    }

    // Acceso permitido exitoso
    if (deviceId) {
      await registrarEventoAuditoriaDev({
        evento: 'INTENTO_LOGIN',
        deviceId,
        ip,
        ubicacion,
        sistemaNavegador,
        email: emailNorm,
        autorizado: true,
        motivo: 'Autenticación exitosa como Super Administrador',
        latitud,
        longitud,
        mapaUrl,
        direccionExacta
      });
    }

    await registrarAccesoDevLog({
      ip,
      email: emailNorm,
      permitido: true,
      motivo: 'Autenticación exitosa como Super Administrador.',
      userAgent
    });

    return {
      success: true,
      usuario: {
        id: user.id,
        nombre: user.nombre || 'SysAdmin Académico',
        email: user.email,
        rol: user.rol || 'ADMIN_SISTEMA',
        coordinacion: user.coordinacion || 'TODAS'
      }
    };
  } catch (error) {
    console.error('[NeonService] Error validando credenciales de usuario:', error);
    if (fallbackEmail && fallbackPass && emailNorm === fallbackEmail.toLowerCase() && passNorm === fallbackPass) {
      if (deviceId) {
        await registrarEventoAuditoriaDev({
          evento: 'INTENTO_LOGIN',
          deviceId,
          ip,
          ubicacion,
          sistemaNavegador,
          email: emailNorm,
          autorizado: true,
          motivo: 'Autenticación exitosa (fallback por excepción de BD)',
          latitud,
          longitud,
          mapaUrl,
          direccionExacta
        });
      }

      await registrarAccesoDevLog({
        ip,
        email: emailNorm,
        permitido: true,
        motivo: 'Autenticación exitosa (fallback por excepción de BD)',
        userAgent
      });
      return {
        success: true,
        usuario: {
          id: 1,
          nombre: 'SysAdmin Académico',
          email: emailNorm,
          rol: 'ADMIN_SISTEMA',
          coordinacion: 'TODAS'
        }
      };
    }

    if (deviceId) {
      await registrarEventoAuditoriaDev({
        evento: 'INTENTO_LOGIN',
        deviceId,
        ip,
        ubicacion,
        sistemaNavegador,
        email: emailNorm || null,
        autorizado: false,
        motivo: `Error al consultar base de datos: ${error.message}`,
        latitud,
        longitud,
        mapaUrl,
        direccionExacta
      });
    }

    await registrarAccesoDevLog({
      ip,
      email: emailNorm || null,
      permitido: false,
      motivo: `Error al consultar base de datos: ${error.message}`,
      userAgent
    });
    return { success: false, error: 'Error al consultar la base de datos: ' + error.message };
  }
}

/**
 * Consulta la lista completa de usuarios y colaboradores en Neon Database.
 */
export async function fetchUsuarios() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT id, nombre, email, rol, coordinacion, COALESCE(activo, true) as activo, fecha_creacion
      FROM usuarios
      ORDER BY id ASC
    `;
    return rows || [];
  } catch (err) {
    console.error('[NeonService] Error al consultar usuarios:', err);
    return [];
  }
}

/**
 * Registra o da de alta un nuevo usuario / colaborador en Neon Database.
 */
export async function registrarUsuario({ nombre, email, rol = 'COORDINADOR', coordinacion = 'TODAS', activo = true }) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;

  try {
    const sql = neon(databaseUrl);
    const emailNorm = String(email || '').trim().toLowerCase();
    const nombreNorm = String(nombre || emailNorm.split('@')[0]).trim();
    const rolNorm = String(rol || 'COORDINADOR').trim().toUpperCase();
    const coordNorm = String(coordinacion || 'TODAS').trim();

    const existing = await sql`SELECT id FROM usuarios WHERE LOWER(TRIM(email)) = ${emailNorm} LIMIT 1;`;
    if (existing && existing.length > 0) {
      const updated = await sql`
        UPDATE usuarios 
        SET nombre = ${nombreNorm}, rol = ${rolNorm}, coordinacion = ${coordNorm}, activo = ${Boolean(activo)}
        WHERE id = ${existing[0].id}
        RETURNING id, nombre, email, rol, coordinacion, activo, fecha_creacion;
      `;
      return updated?.[0] || null;
    } else {
      const inserted = await sql`
        INSERT INTO usuarios (nombre, email, rol, coordinacion, activo, fecha_creacion)
        VALUES (${nombreNorm}, ${emailNorm}, ${rolNorm}, ${coordNorm}, ${Boolean(activo)}, NOW())
        RETURNING id, nombre, email, rol, coordinacion, activo, fecha_creacion;
      `;
      return inserted?.[0] || null;
    }
  } catch (err) {
    console.error('[NeonService] Error al registrar usuario:', err);
    return null;
  }
}

/**
 * Actualiza los datos de un usuario existente.
 */
export async function actualizarUsuario(id, { nombre, email, rol, coordinacion, activo }) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;

  try {
    const sql = neon(databaseUrl);
    const emailNorm = String(email || '').trim().toLowerCase();
    const nombreNorm = String(nombre || '').trim();
    const rolNorm = String(rol || 'COORDINADOR').trim().toUpperCase();
    const coordNorm = String(coordinacion || 'TODAS').trim();

    const rows = await sql`
      UPDATE usuarios
      SET 
        nombre = ${nombreNorm},
        email = ${emailNorm},
        rol = ${rolNorm},
        coordinacion = ${coordNorm},
        activo = ${Boolean(activo)}
      WHERE id = ${id}
      RETURNING id, nombre, email, rol, coordinacion, activo, fecha_creacion;
    `;
    return rows?.[0] || null;
  } catch (err) {
    console.error('[NeonService] Error al actualizar usuario:', err);
    return null;
  }
}

/**
 * Activa o desactiva a un usuario con switch en tiempo real.
 */
export async function toggleEstadoUsuario(id, nuevoEstado) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      UPDATE usuarios
      SET activo = ${Boolean(nuevoEstado)}
      WHERE id = ${id}
      RETURNING id, nombre, email, rol, coordinacion, activo;
    `;
    return rows?.[0] || null;
  } catch (err) {
    console.error('[NeonService] Error en toggleEstadoUsuario:', err);
    return null;
  }
}

/**
 * Elimina un usuario de Neon Database (protegiendo al admin id=1).
 */
export async function eliminarUsuario(id) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return { success: false, error: 'Sin conexión a base de datos' };

  if (Number(id) === 1) {
    return { success: false, error: 'No se puede eliminar el usuario administrador principal del sistema.' };
  }

  try {
    const sql = neon(databaseUrl);
    await sql`DELETE FROM usuarios WHERE id = ${id}`;
    return { success: true };
  } catch (err) {
    console.error('[NeonService] Error al eliminar usuario:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Consulta el perfil, rol y coordinación de un usuario por su correo institucional.
 */
export async function obtenerPerfilUsuarioPorEmail(email) {
  const databaseUrl = getDatabaseUrl();
  const emailNorm = String(email || '').trim().toLowerCase();
  if (!emailNorm) return null;

  const fallbackEmail = (typeof process !== 'undefined' && process.env?.DEV_FALLBACK_EMAIL)
    || (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_DEV_FALLBACK_EMAIL) || '';

  if (!databaseUrl) {
    if (fallbackEmail && emailNorm === fallbackEmail.toLowerCase()) {
      return {
        id: 1,
        nombre: 'SysAdmin Académico',
        email: emailNorm,
        rol: 'ADMIN_SISTEMA',
        coordinacion: 'TODAS',
        activo: true
      };
    }
    return null;
  }

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT id, nombre, email, rol, coordinacion, COALESCE(activo, true) as activo
      FROM usuarios
      WHERE LOWER(TRIM(email)) = ${emailNorm}
      LIMIT 1
    `;
    return rows?.[0] || null;
  } catch (err) {
    console.warn('[NeonService] Error al consultar perfil de usuario por email:', err);
    return null;
  }
}


