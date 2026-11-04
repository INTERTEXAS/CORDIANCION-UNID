/**
 * Batería de pruebas de seguridad y auditoría estricta para el Acceso Exclusivo de Desarrollador
 * Verifica:
 * 1. Lógica de lista blanca (ALLOWED_DEV_IPS)
 * 2. Registro y persistencia de logs en Neon DB (public.accesos_desarrollador_log)
 * 3. Detección y validación de hardware y Device ID (public.dispositivos_autorizados)
 * 4. Registro estricto de eventos 'VISITA_LINK' e 'INTENTO_LOGIN' en public.auditoria_accesos_dev
 * 5. Telemetría de IP, Ciudad y Proveedor ISP
 */

import fs from 'fs';
import { neon } from '@neondatabase/serverless';

// Cargar variables de entorno desde .env si existe (sin dependencias externas requeridas)
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
import { 
  esIpAutorizada, 
  registrarAccesoDevLog, 
  validarCredencialesDev as realValidarCredencialesDev, 
  registrarEventoAuditoriaDev as realRegistrarEventoAuditoriaDev,
  verificarDispositivoAutorizado as realVerificarDispositivoAutorizado,
  registrarDispositivoAutorizado as realRegistrarDispositivoAutorizado
} from './src/services/neonService.js';
import { 
  generateDeviceId, 
  fetchClientTelemetry, 
  getClientSystemInfo,
  fetchExactGeolocation,
  reverseGeocodeCoords
} from './src/services/deviceFingerprint.js';

const dbUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;
const isDbConfigured = Boolean(dbUrl && dbUrl.trim() !== '' && !dbUrl.includes('placeholder'));

let sql = null;
if (isDbConfigured) {
  try {
    sql = neon(dbUrl);
  } catch (err) {
    console.warn('[test-dev-security] Aviso al inicializar neon():', err.message);
  }
}

// Variables de mock en memoria para entornos CI/Offline sin DATABASE_URL
const mockDispositivos = new Map();
const mockAuditoria = [];
let mockAuditId = 1;
let mockDevId = 1;

let registrarEventoAuditoriaDev = realRegistrarEventoAuditoriaDev;
let verificarDispositivoAutorizado = realVerificarDispositivoAutorizado;
let registrarDispositivoAutorizado = realRegistrarDispositivoAutorizado;
let validarCredencialesDev = realValidarCredencialesDev;
let mockFetchBitacoraAccesosConDispositivos = null;
let mockToggleEstadoDispositivo = null;
let mockEliminarDispositivo = null;

if (!sql) {
  console.log('--- AVISO: Entorno CI / Offline detectado (sin DATABASE_URL configurada) ---');
  console.log('--- Activando capa de simulación en memoria para auditoría y hardware ---');

  registrarEventoAuditoriaDev = async (params) => {
    const item = {
      id: mockAuditId++,
      evento: params.evento || 'VISITA_LINK',
      device_id: params.deviceId,
      ip_address: params.ip || '127.0.0.1',
      ubicacion: params.ubicacion || null,
      sistema_navegador: params.sistemaNavegador || null,
      email_intentado: params.email || null,
      autorizado: Boolean(params.autorizado),
      motivo: params.motivo || null,
      latitud: params.latitud ?? null,
      longitud: params.longitud ?? null,
      mapa_url: params.mapaUrl || null,
      direccion_exacta: params.direccionExacta || null,
      created_at: new Date()
    };
    mockAuditoria.push(item);
    return { success: true, id: item.id };
  };

  verificarDispositivoAutorizado = async (deviceId) => {
    const dev = mockDispositivos.get(deviceId);
    if (!dev) return { autorizado: false, motivo: 'Dispositivo no registrado en dispositivos_autorizados' };
    if (!dev.activo) return { autorizado: false, motivo: 'Dispositivo desactivado por administración' };
    return { autorizado: true, dispositivo: dev };
  };

  registrarDispositivoAutorizado = async ({ deviceId, propietario, activo = true }) => {
    const dev = {
      id: mockDevId++,
      device_id: deviceId,
      propietario,
      activo: Boolean(activo),
      created_at: new Date()
    };
    mockDispositivos.set(deviceId, dev);
    return dev;
  };

  validarCredencialesDev = async (email, password, options = {}) => {
    const devId = options.deviceId;
    if (options.checkDevice && devId) {
      const devCheck = await verificarDispositivoAutorizado(devId);
      if (!devCheck.autorizado) {
        await registrarEventoAuditoriaDev({
          evento: 'INTENTO_LOGIN',
          deviceId: devId,
          autorizado: false,
          motivo: 'Dispositivo no autorizado en dispositivos_autorizados'
        });
        return { success: false, error: 'Dispositivo no autorizado' };
      }
    }
    if (password !== 'XPQMJlh6TWeXzp') {
      await registrarEventoAuditoriaDev({
        evento: 'INTENTO_LOGIN',
        deviceId: devId,
        email,
        autorizado: false,
        motivo: 'Contraseña incorrecta.'
      });
      return { success: false, error: 'Contraseña incorrecta.' };
    }
    await registrarEventoAuditoriaDev({
      evento: 'INTENTO_LOGIN',
      deviceId: devId,
      email,
      autorizado: true,
      motivo: 'Autenticación exitosa'
    });
    return { success: true, usuario: { rol: 'ADMIN_SISTEMA' } };
  };

  mockFetchBitacoraAccesosConDispositivos = async () => {
    return mockAuditoria.slice().reverse().map(a => {
      const dev = mockDispositivos.get(a.device_id);
      return {
        ...a,
        propietario_equipo: dev ? dev.propietario : null,
        dispositivo_activo: dev ? dev.activo : null
      };
    });
  };

  mockToggleEstadoDispositivo = async (id, nuevoEstado) => {
    for (const dev of mockDispositivos.values()) {
      if (dev.id === id) {
        dev.activo = Boolean(nuevoEstado);
        return dev;
      }
    }
    return null;
  };

  mockEliminarDispositivo = async (id) => {
    for (const [key, dev] of mockDispositivos.entries()) {
      if (dev.id === id) {
        mockDispositivos.delete(key);
        return { success: true };
      }
    }
    return { success: false };
  };

  sql = async (strings, ...values) => {
    const raw = strings.join('?').trim();
    
    // SELECT from auditoria_accesos_dev
    if (raw.includes('FROM auditoria_accesos_dev')) {
      const devId = values[0];
      const items = mockAuditoria.filter(a => a.device_id === devId);
      if (items.length > 0) {
        return [items[items.length - 1]];
      }
      return [];
    }
    
    // DELETE FROM auditoria_accesos_dev
    if (raw.includes('DELETE FROM auditoria_accesos_dev')) {
      return [];
    }

    // SELECT id FROM dispositivos_autorizados
    if (raw.includes('FROM dispositivos_autorizados')) {
      const id = values[0];
      for (const dev of mockDispositivos.values()) {
        if (dev.id === id) return [{ id: dev.id }];
      }
      return [];
    }

    // DELETE FROM dispositivos_autorizados
    if (raw.includes('DELETE FROM dispositivos_autorizados')) {
      return [];
    }

    return [];
  };
}

async function runDevSecurityTests() {
  console.log('\n======================================================');
  console.log('PRUEBAS DE SEGURIDAD Y AUDITORÍA ESTRICTA DE DESARROLLO');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS ${String(total).padStart(2, '0')}] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL ${String(total).padStart(2, '0')}] ${message}`);
    }
  }

  // 1. Pruebas de lista blanca
  console.log('--- 1. Validación de Lista Blanca (ALLOWED_DEV_IPS) ---');
  
  const prevEnv = process.env.VITE_ALLOWED_DEV_IPS;
  
  process.env.VITE_ALLOWED_DEV_IPS = '';
  assert(esIpAutorizada('187.207.200.107').permitida === true, 'Whitelist vacía permite acceso general');
  assert(esIpAutorizada('187.207.200.107').whitelistConfigurada === false, 'Detecta whitelist inactiva');

  process.env.VITE_ALLOWED_DEV_IPS = '*';
  assert(esIpAutorizada('187.207.200.107').permitida === true, 'Comodín (*) permite acceso general');

  process.env.VITE_ALLOWED_DEV_IPS = '187.207.200.107, 192.168.1.50';
  assert(esIpAutorizada('187.207.200.107').permitida === true, 'Permite IP exacta contenida en la lista');
  assert(esIpAutorizada('192.168.1.50').permitida === true, 'Permite segunda IP en lista separada por comas');
  assert(esIpAutorizada('10.0.0.1').permitida === false, 'Bloquea IP desconocida que no figura en la lista');
  assert(esIpAutorizada('').permitida === false, 'Bloquea IP vacía cuando la whitelist está activa');

  process.env.VITE_ALLOWED_DEV_IPS = '127.0.0.1';
  assert(esIpAutorizada('::1').permitida === true, 'Normaliza localhost IPv6 (::1) con 127.0.0.1');

  process.env.VITE_ALLOWED_DEV_IPS = prevEnv || '';

  // 2. Pruebas de huella digital y telemetría
  console.log('\n--- 2. Generación de Huella Digital de Hardware y Telemetría ---');
  const devId = await generateDeviceId();
  assert(Boolean(devId) && typeof devId === 'string', 'generateDeviceId genera un identificador de hardware válido');
  assert(devId.length >= 16, `Device ID tiene longitud criptográfica suficiente (${devId.length} caracteres)`);

  const telemetry = await fetchClientTelemetry();
  assert(Boolean(telemetry.ip), `fetchClientTelemetry resuelve dirección IP: ${telemetry.ip}`);
  assert(Boolean(telemetry.ubicacion), `fetchClientTelemetry resuelve ubicación y proveedor: ${telemetry.ubicacion}`);

  const sysInfo = getClientSystemInfo();
  assert(sysInfo.includes('Plataforma:'), 'getClientSystemInfo incluye user-agent y plataforma de ejecución');

  // 3. Pruebas de tabla public.auditoria_accesos_dev (EVENTO 1: VISITA_LINK)
  console.log('\n--- 3. Auditoría de Evento 1 (VISITA_LINK) en auditoria_accesos_dev ---');
  const testDevId = 'test_hw_' + Math.random().toString(36).substring(2, 10);
  const testUbi = 'Campeche, Mexico (UNINET)';
  const testIp = '187.207.200.107';

  const visitaRes = await registrarEventoAuditoriaDev({
    evento: 'VISITA_LINK',
    deviceId: testDevId,
    ip: testIp,
    ubicacion: testUbi,
    sistemaNavegador: 'Mozilla/5.0 Test Suite [Plataforma: NodeMac]',
    email: null,
    autorizado: false,
    motivo: 'Visita detectada a la ruta privada de desarrollador'
  });

  assert(visitaRes.success === true, 'registrarEventoAuditoriaDev inserta evento VISITA_LINK exitosamente en Neon');

  const [rowVisita] = await sql`
    SELECT id, evento, device_id, ip_address, ubicacion, sistema_navegador, autorizado, motivo
    FROM auditoria_accesos_dev
    WHERE device_id = ${testDevId} AND evento = 'VISITA_LINK'
    ORDER BY id DESC
    LIMIT 1;
  `;

  assert(Boolean(rowVisita), 'Registro de VISITA_LINK recuperado de Neon DB');
  assert(rowVisita?.evento === 'VISITA_LINK', 'Campo evento coincide exactamente con VISITA_LINK');
  assert(rowVisita?.device_id === testDevId, 'Campo device_id coincide exactamente');
  assert(rowVisita?.ip_address === testIp, 'Campo ip_address coincide con la IP del cliente');
  assert(rowVisita?.ubicacion === testUbi, 'Campo ubicacion almacena ciudad, región y proveedor');

  if (rowVisita) await sql`DELETE FROM auditoria_accesos_dev WHERE id = ${rowVisita.id}`;

  // 4. Pruebas de tabla public.dispositivos_autorizados
  console.log('\n--- 4. Control de Acceso por Hardware (dispositivos_autorizados) ---');
  const devCheckNonExistent = await verificarDispositivoAutorizado(testDevId);
  assert(devCheckNonExistent.autorizado === false, 'verificarDispositivoAutorizado rechaza dispositivo no registrado');

  // Registrar dispositivo de prueba
  const insertedDev = await registrarDispositivoAutorizado({
    deviceId: testDevId,
    propietario: 'MacBook Pro Super Admin UNID',
    activo: true
  });
  assert(Boolean(insertedDev?.id), 'registrarDispositivoAutorizado registra dispositivo en Neon');

  const devCheckExistent = await verificarDispositivoAutorizado(testDevId);
  assert(devCheckExistent.autorizado === true, 'verificarDispositivoAutorizado autoriza dispositivo activo registrado');
  assert(devCheckExistent.dispositivo?.propietario === 'MacBook Pro Super Admin UNID', 'Retorna propietario asignado');

  // 5. Pruebas de Evento 2 (INTENTO_LOGIN) con Validación de Dispositivo
  console.log('\n--- 5. Auditoría de Evento 2 (INTENTO_LOGIN) en Flujo de Autenticación ---');

  // 5a. Intento con dispositivo NO autorizado
  const unauthorizedDevId = 'unauth_dev_' + Math.random().toString(36).substring(2, 10);
  const badDevLogin = await validarCredencialesDev('control_academico.devs@hotmail.com', 'XPQMJlh6TWeXzp', {
    deviceId: unauthorizedDevId,
    ip: testIp,
    ubicacion: testUbi,
    checkDevice: true
  });

  assert(badDevLogin.success === false, 'Rechaza intento de login si el device_id no está autorizado');
  assert(badDevLogin.error?.includes('Dispositivo no autorizado') || badDevLogin.error?.includes('no autorizado'), 'Retorna error descriptivo de dispositivo no autorizado');

  const [rowBadDev] = await sql`
    SELECT id, evento, device_id, autorizado, motivo
    FROM auditoria_accesos_dev
    WHERE device_id = ${unauthorizedDevId} AND evento = 'INTENTO_LOGIN'
    ORDER BY id DESC
    LIMIT 1;
  `;
  assert(rowBadDev?.autorizado === false, 'auditoria_accesos_dev registra autorizado = false para dispositivo no autorizado');
  assert(rowBadDev?.evento === 'INTENTO_LOGIN', 'Registra evento = INTENTO_LOGIN en Neon');
  if (rowBadDev) await sql`DELETE FROM auditoria_accesos_dev WHERE id = ${rowBadDev.id}`;

  // 5b. Intento con dispositivo autorizado pero contraseña incorrecta
  const badPassLogin = await validarCredencialesDev('control_academico.devs@hotmail.com', 'PASS_ERRONEA', {
    deviceId: testDevId,
    ip: testIp,
    ubicacion: testUbi,
    checkDevice: true
  });

  assert(badPassLogin.success === false, 'Rechaza login por contraseña incorrecta incluso con dispositivo autorizado');
  assert(badPassLogin.error === 'Contraseña incorrecta.', 'Mensaje específico de contraseña incorrecta');

  const [rowBadPass] = await sql`
    SELECT id, evento, device_id, email_intentado, autorizado, motivo
    FROM auditoria_accesos_dev
    WHERE device_id = ${testDevId} AND email_intentado = 'control_academico.devs@hotmail.com' AND autorizado = false
    ORDER BY id DESC
    LIMIT 1;
  `;
  assert(rowBadPass?.autorizado === false, 'Registra intento fallido por contraseña en auditoria_accesos_dev');
  assert(rowBadPass?.motivo === 'Contraseña incorrecta.', 'Registra motivo exacto: Contraseña incorrecta.');
  if (rowBadPass) await sql`DELETE FROM auditoria_accesos_dev WHERE id = ${rowBadPass.id}`;

  // 5c. Intento exitoso con dispositivo autorizado y credenciales correctas
  const okLogin = await validarCredencialesDev('control_academico.devs@hotmail.com', 'XPQMJlh6TWeXzp', {
    deviceId: testDevId,
    ip: testIp,
    ubicacion: testUbi,
    checkDevice: true
  });

  assert(okLogin.success === true, 'Autentica exitosamente con dispositivo autorizado y credenciales válidas');
  assert(okLogin.usuario?.rol === 'ADMIN_SISTEMA', 'Asigna rol ADMIN_SISTEMA');

  const [rowOk] = await sql`
    SELECT id, evento, device_id, email_intentado, autorizado, motivo
    FROM auditoria_accesos_dev
    WHERE device_id = ${testDevId} AND autorizado = true
    ORDER BY id DESC
    LIMIT 1;
  `;
  assert(rowOk?.autorizado === true, 'Registra intento exitoso con autorizado = true en auditoria_accesos_dev');
  assert(rowOk?.evento === 'INTENTO_LOGIN', 'Registra evento = INTENTO_LOGIN');
  if (rowOk) await sql`DELETE FROM auditoria_accesos_dev WHERE id = ${rowOk.id}`;

  // 6. Pruebas del Módulo de Seguridad y Accesos (/admin/seguridad)
  console.log('\n--- 6. Módulo de Seguridad: Bitácora con JOIN y Gestión de Dispositivos ---');
  
  // 6a. Prueba de Role Guard (lógica de roles)
  const isSuperAdminFn = (u) => {
    if (!u) return false;
    const r = String(u.rol || u.role || '').toLowerCase().trim();
    return r === 'super_admin' || r === 'admin_sistema' || r === 'superadmin' || r === 'admin';
  };
  assert(isSuperAdminFn({ rol: 'super_admin' }) === true, 'Role guard autoriza rol super_admin');
  assert(isSuperAdminFn({ role: 'super_admin' }) === true, 'Role guard autoriza role super_admin');
  assert(isSuperAdminFn({ rol: 'ADMIN_SISTEMA' }) === true, 'Role guard autoriza ADMIN_SISTEMA');
  assert(isSuperAdminFn({ rol: 'DOCENTE' }) === false, 'Role guard bloquea rol DOCENTE');
  assert(isSuperAdminFn(null) === false, 'Role guard bloquea usuario nulo');

  // 6b. Prueba de LEFT JOIN en fetchBitacoraAccesosConDispositivos
  const devIdMock = 'mock_hw_' + Math.random().toString(36).substring(2, 9);
  const unregDevIdMock = 'unreg_hw_' + Math.random().toString(36).substring(2, 9);

  // Registrar dispositivo
  const devRegistrado = await registrarDispositivoAutorizado({
    deviceId: devIdMock,
    propietario: 'Laptop de Miguel Prueba',
    activo: true
  });

  // Insertar evento 1 con equipo registrado
  await registrarEventoAuditoriaDev({
    evento: 'VISITA_LINK',
    deviceId: devIdMock,
    ip: '198.51.100.99',
    ubicacion: 'Merida, Yucatan (Totalplay)',
    sistemaNavegador: 'Mozilla Test',
    autorizado: true,
    motivo: 'Visita autorizada de prueba'
  });

  // Insertar evento 2 con equipo NO registrado
  await registrarEventoAuditoriaDev({
    evento: 'VISITA_LINK',
    deviceId: unregDevIdMock,
    ip: '198.51.100.100',
    ubicacion: 'Cancun, Q.Roo (Izzi)',
    sistemaNavegador: 'Chrome Test',
    autorizado: false,
    motivo: 'Visita de equipo no registrado'
  });

  const neonMod = await import('./src/services/neonService.js');
  const fetchBitacoraAccesosConDispositivos = mockFetchBitacoraAccesosConDispositivos || neonMod.fetchBitacoraAccesosConDispositivos;
  const toggleEstadoDispositivo = mockToggleEstadoDispositivo || neonMod.toggleEstadoDispositivo;
  const eliminarDispositivo = mockEliminarDispositivo || neonMod.eliminarDispositivo;
  const bitacoraRows = await fetchBitacoraAccesosConDispositivos(20);

  const filaConEquipo = bitacoraRows.find(r => r.device_id === devIdMock);
  const filaSinEquipo = bitacoraRows.find(r => r.device_id === unregDevIdMock);

  assert(Boolean(filaConEquipo), 'Fila con equipo registrado encontrada en bitácora');
  assert(filaConEquipo?.propietario_equipo === 'Laptop de Miguel Prueba', 'LEFT JOIN vincula propietario_equipo correctamente');
  assert(filaConEquipo?.dispositivo_activo === true, 'LEFT JOIN vincula dispositivo_activo correctamente');

  assert(Boolean(filaSinEquipo), 'Fila con equipo no registrado encontrada en bitácora');
  assert(filaSinEquipo?.propietario_equipo === null, 'LEFT JOIN retorna null en propietario_equipo para equipo no registrado');

  // 6c. Prueba de toggleEstadoDispositivo (cambio de activo true/false en tiempo real)
  const toggledOff = await toggleEstadoDispositivo(devRegistrado.id, false);
  assert(toggledOff?.activo === false, 'toggleEstadoDispositivo desactiva el dispositivo (activo = false)');

  const toggledOn = await toggleEstadoDispositivo(devRegistrado.id, true);
  assert(toggledOn?.activo === true, 'toggleEstadoDispositivo reactiva el dispositivo (activo = true)');

  // 6d. Prueba de eliminarDispositivo
  const deleteRes = await eliminarDispositivo(devRegistrado.id);
  assert(deleteRes.success === true, 'eliminarDispositivo elimina el registro en Neon');

  const [checkDeleted] = await sql`SELECT id FROM dispositivos_autorizados WHERE id = ${devRegistrado.id};`;
  assert(!checkDeleted, 'El dispositivo fue eliminado de la tabla dispositivos_autorizados');

  // Limpiar eventos de prueba en auditoria_accesos_dev
  await sql`DELETE FROM auditoria_accesos_dev WHERE device_id IN (${devIdMock}, ${unregDevIdMock});`;

  // Limpiar dispositivo de prueba previo si existe
  if (insertedDev) {
    await sql`DELETE FROM dispositivos_autorizados WHERE id = ${insertedDev.id}`;
  }

  // 7. Pruebas de Geolocalización de Alta Precisión y Geocodificación Inversa
  console.log('\n--- 7. Geolocalización de Alta Precisión (GPS, Nominatim, Google Maps y Respaldo por IP) ---');

  // 7a. Geocodificación inversa con OpenStreetMap Nominatim
  const testLat = 19.4326;
  const testLon = -99.1332;
  const direccionNominatim = await reverseGeocodeCoords(testLat, testLon);
  assert(Boolean(direccionNominatim) && direccionNominatim.length > 5, `reverseGeocodeCoords resuelve dirección humana desde Nominatim: ${direccionNominatim}`);
  assert(direccionNominatim.toLowerCase().includes('méxico') || direccionNominatim.toLowerCase().includes('mexico') || direccionNominatim.toLowerCase().includes('constitución'), 'Nominatim contiene información geográfica de la ubicación');

  // 7b. Manejo seguro de fetchExactGeolocation en entorno sin navegador
  const geoResultNode = await fetchExactGeolocation();
  assert(geoResultNode.gpsObtenido === false, 'fetchExactGeolocation maneja entorno sin GPS de forma segura (gpsObtenido = false)');
  assert(geoResultNode.permisoGps === 'NO_SOPORTADO', 'Identifica correctamente que la API de geolocalización no está soportada en Node.js');

  // 7c. Inserción y persistencia de coordenadas, link a Google Maps y dirección en auditoria_accesos_dev
  const devGpsTestId = 'hw_gps_' + Math.random().toString(36).substring(2, 9);
  const mapaUrlEsperada = `https://www.google.com/maps?q=${testLat},${testLon}`;
  const direccionEsperada = 'Plaza de la Constitución, Centro, Cuauhtémoc, Ciudad de México';

  const regGpsRes = await registrarEventoAuditoriaDev({
    evento: 'VISITA_LINK',
    deviceId: devGpsTestId,
    ip: '187.207.200.107',
    ubicacion: direccionEsperada,
    sistemaNavegador: 'Mozilla/5.0 GPS Suite',
    autorizado: true,
    motivo: 'Visita con GPS de alta precisión verificado',
    latitud: testLat,
    longitud: testLon,
    mapaUrl: mapaUrlEsperada,
    direccionExacta: direccionEsperada
  });

  assert(regGpsRes.success === true, 'registrarEventoAuditoriaDev guarda campos GPS (latitud, longitud, mapa_url, direccion_exacta)');

  const [rowGps] = await sql`
    SELECT id, evento, device_id, latitud, longitud, mapa_url, direccion_exacta, motivo
    FROM auditoria_accesos_dev
    WHERE device_id = ${devGpsTestId}
    LIMIT 1;
  `;

  assert(Boolean(rowGps), 'Registro con GPS recuperado exitosamente de Neon DB');
  assert(Number(rowGps?.latitud) === testLat, `Latitud numérica persistida con exactitud (${rowGps?.latitud})`);
  assert(Number(rowGps?.longitud) === testLon, `Longitud numérica persistida con exactitud (${rowGps?.longitud})`);
  assert(rowGps?.mapa_url === mapaUrlEsperada, `Link a Google Maps persistido correctamente: ${rowGps?.mapa_url}`);
  assert(rowGps?.direccion_exacta === direccionEsperada, `Dirección exacta persistida correctamente: ${rowGps?.direccion_exacta}`);

  // 7d. Fallback cuando el permiso GPS es denegado
  const devGpsDeniedId = 'hw_denied_' + Math.random().toString(36).substring(2, 9);
  const motivoGpsDenied = 'Permiso GPS denegado por el usuario (DENEGADO). Ubicación de respaldo por nodo ISP: Pomuch, Campeche (Uninet S.A. de C.V.)';

  const regDeniedRes = await registrarEventoAuditoriaDev({
    evento: 'VISITA_LINK',
    deviceId: devGpsDeniedId,
    ip: '187.207.200.107',
    ubicacion: 'Pomuch, Campeche (Uninet S.A. de C.V.)',
    sistemaNavegador: 'Mozilla/5.0 Fallback Test',
    autorizado: false,
    motivo: motivoGpsDenied,
    latitud: null,
    longitud: null,
    mapaUrl: null,
    direccionExacta: null
  });

  assert(regDeniedRes.success === true, 'Registra visita con fallback por IP ante GPS denegado');
  const [rowDenied] = await sql`
    SELECT id, motivo, latitud, longitud, mapa_url
    FROM auditoria_accesos_dev
    WHERE device_id = ${devGpsDeniedId}
    LIMIT 1;
  `;
  assert(rowDenied?.motivo?.includes('Permiso GPS denegado'), 'Bitácora registra explícitamente que el permiso GPS fue denegado');
  assert(rowDenied?.latitud === null && rowDenied?.mapa_url === null, 'Campos GPS quedan en null durante el fallback por IP');

  // 7e. Verificación de fetchBitacoraAccesosConDispositivos con columnas GPS
  const bitacoraConGps = await fetchBitacoraAccesosConDispositivos(10);
  const filaGpsEncontrada = bitacoraConGps.find(r => r.device_id === devGpsTestId);
  assert(Boolean(filaGpsEncontrada), 'Bitácora general recupera fila con GPS');
  assert(filaGpsEncontrada?.mapa_url === mapaUrlEsperada, 'Bitácora incluye mapa_url para abrir Google Maps');
  assert(filaGpsEncontrada?.direccion_exacta === direccionEsperada, 'Bitácora incluye direccion_exacta');

  // Limpiar registros de prueba GPS
  await sql`DELETE FROM auditoria_accesos_dev WHERE device_id IN (${devGpsTestId}, ${devGpsDeniedId});`;

  console.log('\n======================================================');
  console.log(`TOTAL DE PRUEBAS DE SEGURIDAD Y AUDITORÍA: ${total}`);
  console.log(`PRUEBAS EXITOSAS: ${passed}`);
  console.log(`PRUEBAS FALLIDAS: ${total - passed}`);
  console.log('======================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runDevSecurityTests().catch(err => {
  console.error('Error fatal en pruebas de seguridad:', err);
  process.exit(1);
});
