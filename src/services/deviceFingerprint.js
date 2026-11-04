import FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * Convierte un ArrayBuffer a cadena hexadecimal (SHA-256 hex).
 */
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Genera una huella digital única y persistente del hardware del navegador.
 * Combina @fingerprintjs/fingerprintjs con WebGL renderer, canvas 2D, núcleos de CPU,
 * resolución de pantalla y zona horaria en un hash criptográfico SHA-256.
 */
export async function generateDeviceId() {
  // 1. Si ya se generó y guardó en este navegador, mantener persistencia exacta
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('unid_dev_device_id');
      if (stored && stored.length >= 16) {
        return stored;
      }
    }
  } catch (_) {}

  // 2. Intentar obtener visitorId de FingerprintJS
  let fpVisitorId = '';
  if (typeof window !== 'undefined') {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      if (result && result.visitorId) {
        fpVisitorId = String(result.visitorId);
      }
    } catch (err) {
      console.warn('[DeviceFingerprint] FingerprintJS no disponible o bloqueado, usando hardware fallback:', err);
    }
  }

  // 3. Captura profunda de hardware nativo (Canvas, WebGL, CPU, Pantalla, Zona Horaria)
  let canvasHash = '';
  let webglVendor = '';
  let webglRenderer = '';
  let screenResolution = '1920x1080x24';
  let cpuCores = 4;
  let timezone = 'America/Mexico_City';
  let platform = 'Unknown';

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      // a) Canvas 2D fingerprint
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial', 'Helvetica', sans-serif";
        ctx.fillStyle = '#f2b705';
        ctx.fillRect(10, 10, 80, 40);
        ctx.fillStyle = '#0f172a';
        ctx.fillText('UNID_DEV_AUDIT_VERIFIED_#@123', 15, 20);
        ctx.strokeStyle = 'rgba(242, 80, 34, 0.8)';
        ctx.strokeRect(5, 5, 200, 50);
        canvasHash = canvas.toDataURL().slice(-80);
      }
    } catch (_) {}

    try {
      // b) WebGL vendor & unmasked renderer
      const glCanvas = document.createElement('canvas');
      const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) {
          webglVendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '';
          webglRenderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '';
        }
      }
    } catch (_) {}

    try {
      if (typeof screen !== 'undefined') {
        screenResolution = `${screen.width}x${screen.height}x${screen.colorDepth || 24}`;
      }
      if (typeof navigator !== 'undefined') {
        cpuCores = navigator.hardwareConcurrency || 4;
        platform = navigator.userAgentData?.platform || navigator.platform || 'BrowserPlatform';
      }
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      }
    } catch (_) {}
  }

  // 4. Consolidar payload de hardware
  const hardwarePayload = {
    fpVisitorId,
    canvasHash,
    webglVendor,
    webglRenderer,
    screenResolution,
    cpuCores,
    timezone,
    platform
  };

  const payloadString = JSON.stringify(hardwarePayload);

  // 5. Generar SHA-256 usando crypto.subtle o fallback
  let deviceId = '';
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const encoded = new TextEncoder().encode(payloadString);
      const digestBuffer = await crypto.subtle.digest('SHA-256', encoded);
      deviceId = bufferToHex(digestBuffer);
    }
  } catch (err) {
    console.warn('[DeviceFingerprint] crypto.subtle fallo, usando fallback de hash:', err);
  }

  if (!deviceId) {
    // Fallback de hash rápido determinista
    let hash = 0;
    for (let i = 0; i < payloadString.length; i++) {
      hash = ((hash << 5) - hash) + payloadString.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    deviceId = `dev_${hex}_${(fpVisitorId || 'hw').slice(0, 16)}`;
  }

  // 6. Persistir en localStorage para estabilidad absoluta en la misma máquina
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('unid_dev_device_id', deviceId);
    }
  } catch (_) {}

  return deviceId;
}

/**
 * Consulta la IP pública, ciudad y proveedor ISP del cliente.
 * Prueba primero https://ipapi.co/json/, luego https://ipwho.is/ y https://api.ipify.org?format=json.
 */
export async function fetchClientTelemetry() {
  let ip = '127.0.0.1';
  let ubicacion = 'Ubicación no identificada';
  let isp = 'Desconocido';

  // 1. Probar https://ipapi.co/json/
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data && !data.error && data.ip) {
        ip = data.ip;
        const ciudad = data.city || '';
        const region = data.region || '';
        const pais = data.country_name || '';
        isp = data.org || data.asn || '';
        ubicacion = [ciudad, region, pais].filter(Boolean).join(', ') + (isp ? ` (${isp})` : '');
        return { ip, ubicacion, isp };
      }
    }
  } catch (e) {
    console.warn('[DeviceFingerprint] ipapi.co no disponible o limitado, reintentando con proveedor de respaldo:', e.message);
  }

  // 2. Proveedor de respaldo: https://ipwho.is/ (altamente confiable, sin rate limit agresivo)
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.ip) {
        ip = data.ip;
        const ciudad = data.city || '';
        const region = data.region || '';
        const pais = data.country || '';
        isp = data.connection?.isp || data.connection?.org || '';
        ubicacion = [ciudad, region, pais].filter(Boolean).join(', ') + (isp ? ` (${isp})` : '');
        return { ip, ubicacion, isp };
      }
    }
  } catch (_) {}

  // 3. Proveedor terciario: https://api.ipify.org?format=json
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) {
        ip = data.ip;
        const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
        ubicacion = `Red Externa (${tz})`;
        return { ip, ubicacion, isp: 'ISP Desconocido' };
      }
    }
  } catch (_) {}

  return { ip, ubicacion, isp };
}

/**
 * Obtiene el user-agent y plataforma detallada del navegador.
 */
export function getClientSystemInfo() {
  if (typeof navigator === 'undefined') return 'Desconocido';
  const ua = navigator.userAgent || 'Desconocido';
  const platform = navigator.userAgentData?.platform || navigator.platform || 'Plataforma estándar';
  return `${ua} [Plataforma: ${platform}]`;
}

/**
 * Realiza geocodificación inversa a partir de latitud y longitud
 * consultando la API de OpenStreetMap Nominatim.
 * Retorna una dirección humana limpia: calle, número, colonia, ciudad y estado.
 */
export async function reverseGeocodeCoords(lat, lon) {
  if (lat === null || lat === undefined || lon === null || lon === undefined) {
    return '';
  }

  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'UNID-Coordinacion-Academica/1.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(6000)
      }
    );

    if (nomRes.ok) {
      const data = await nomRes.json();
      if (data && data.address) {
        const addr = data.address;
        const calle = addr.road || addr.pedestrian || addr.street || addr.footway || addr.path || '';
        const numero = addr.house_number ? `#${addr.house_number}` : '';
        const colonia = addr.neighbourhood || addr.suburb || addr.quarter || addr.residential || addr.city_district || '';
        const ciudad = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
        const estado = addr.state || '';

        const partes = [
          [calle, numero].filter(Boolean).join(' '),
          colonia,
          ciudad,
          estado
        ].filter(Boolean);

        return partes.length > 0 ? partes.join(', ') : (data.display_name || '');
      } else if (data?.display_name) {
        return data.display_name;
      }
    }
  } catch (err) {
    console.warn('[DeviceFingerprint] Error en geocodificación inversa con Nominatim:', err.message);
  }

  return `Coordenadas (${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)})`;
}

/**
 * Solicita las coordenadas físicas exactas del dispositivo mediante navigator.geolocation.getCurrentPosition
 * con enableHighAccuracy: true, y realiza geocodificación inversa con OpenStreetMap Nominatim.
 * 
 * Si el usuario bloquea o rechaza el permiso, o si el navegador no lo soporta, retorna
 * gpsObtenido: false con el código y motivo exacto para activar el respaldo (fallback) por IP.
 */
export async function fetchExactGeolocation() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.geolocation) {
    return {
      gpsObtenido: false,
      latitud: null,
      longitud: null,
      mapaUrl: null,
      direccionExacta: null,
      permisoGps: 'NO_SOPORTADO',
      motivoGps: 'API de geolocalización no soportada en este entorno.'
    };
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const mapaUrl = `https://www.google.com/maps?q=${lat},${lon}`;

    const direccionExacta = await reverseGeocodeCoords(lat, lon);

    return {
      gpsObtenido: true,
      latitud: lat,
      longitud: lon,
      mapaUrl,
      direccionExacta: direccionExacta || `Coordenadas (${lat.toFixed(5)}, ${lon.toFixed(5)})`,
      permisoGps: 'CONCEDIDO',
      motivoGps: null
    };
  } catch (geoError) {
    let motivoGps = 'Permiso GPS denegado por el usuario o navegador.';
    let codigo = 'DENEGADO';

    if (geoError.code === 1) {
      motivoGps = 'Permiso GPS denegado por el usuario o navegador.';
      codigo = 'DENEGADO';
    } else if (geoError.code === 2) {
      motivoGps = 'Ubicación GPS no disponible en el dispositivo.';
      codigo = 'NO_DISPONIBLE';
    } else if (geoError.code === 3) {
      motivoGps = 'Tiempo de espera agotado al consultar GPS.';
      codigo = 'TIMEOUT';
    } else {
      motivoGps = geoError.message || 'Error al obtener geolocalización.';
    }

    return {
      gpsObtenido: false,
      latitud: null,
      longitud: null,
      mapaUrl: null,
      direccionExacta: null,
      permisoGps: codigo,
      motivoGps
    };
  }
}
