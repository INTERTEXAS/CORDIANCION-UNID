import React, { useState, useEffect, useRef } from 'react';
import { 
  validarCredencialesDev, 
  esIpAutorizada, 
  registrarEventoAuditoriaDev,
  verificarDispositivoAutorizado
} from '../services/neonService';
import { 
  generateDeviceId, 
  fetchClientTelemetry, 
  fetchExactGeolocation,
  getClientSystemInfo 
} from '../services/deviceFingerprint';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle,
  Copy, 
  Check, 
  Lock,
  MapPin,
  ExternalLink
} from 'lucide-react';

export default function DevLoginPage({ onDevLoginSuccess, onBackToMain }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Spinner de acceso exitoso (3 segundos)
  const [showAccessSpinner, setShowAccessSpinner] = useState(false);
  const pendingUserRef = useRef(null);
  const pendingAssistantTokenRef = useRef(null);

  // Estados de telemetría y auditoría de hardware y geolocalización
  const [deviceId, setDeviceId] = useState('');
  const [clientIp, setClientIp] = useState('...');
  const [ispName, setIspName] = useState('');
  const [ubicacionStr, setUbicacionStr] = useState('Detectando...');
  const [exactAddress, setExactAddress] = useState(null);
  const [mapaUrl, setMapaUrl] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [isGpsDenied, setIsGpsDenied] = useState(false);
  const [sistemaNavegador, setSistemaNavegador] = useState('');
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(true);

  // Estado de autorización del hardware
  const [isDeviceAuthorized, setIsDeviceAuthorized] = useState(null);
  const [propietarioDispositivo, setPropietarioDispositivo] = useState(null);
  const [isIpBlocked, setIsIpBlocked] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Prevenir duplicación del registro de visita (Evento 1) en React StrictMode
  const hasLoggedVisitRef = useRef(false);

  // 1. Detección de huella digital del hardware, telemetría GPS y Evento 1 ('VISITA_LINK')
  useEffect(() => {
    let isMounted = true;

    async function auditarVisitaCliente() {
      setIsLoadingTelemetry(true);
      const sysInfo = getClientSystemInfo();
      if (isMounted) setSistemaNavegador(sysInfo);

      try {
        const idGenerado = await generateDeviceId();
        if (!isMounted) return;
        setDeviceId(idGenerado);

        console.log('%c[AUDITORÍA DEV] Device ID del hardware:', 'color: #f59e0b; font-weight: bold;', idGenerado);

        const [telemetry, geoResult] = await Promise.all([
          fetchClientTelemetry(),
          fetchExactGeolocation()
        ]);

        if (!isMounted) return;
        setClientIp(telemetry.ip);
        setIspName(telemetry.isp || '');
        setUbicacionStr(telemetry.ubicacion);
        setGeoData(geoResult);

        let finalAddress = telemetry.ubicacion;
        let finalMapaUrl = null;
        let motivoVisita = '';

        if (geoResult.gpsObtenido && geoResult.latitud && geoResult.longitud) {
          setExactAddress(geoResult.direccionExacta);
          setMapaUrl(geoResult.mapaUrl);
          setIsGpsDenied(false);
          finalAddress = geoResult.direccionExacta;
          finalMapaUrl = geoResult.mapaUrl;
        } else {
          setIsGpsDenied(true);
        }

        console.log('%c[AUDITORÍA DEV] Telemetría y Geolocalización:', 'color: #38bdf8; font-weight: bold;', {
          ip: telemetry.ip,
          isp: telemetry.isp,
          nodoIp: telemetry.ubicacion,
          gpsExacto: geoResult.gpsObtenido ? geoResult.direccionExacta : 'DENEGADO / NO_DISPONIBLE',
          coordenadas: geoResult.gpsObtenido ? `${geoResult.latitud}, ${geoResult.longitud}` : null,
          sistema: sysInfo
        });

        const authCheck = esIpAutorizada(telemetry.ip);
        if (authCheck.whitelistConfigurada && !authCheck.permitida) {
          setIsIpBlocked(true);
        }

        const devCheck = await verificarDispositivoAutorizado(idGenerado);
        if (isMounted) {
          setIsDeviceAuthorized(devCheck.autorizado);
          if (devCheck.autorizado && devCheck.dispositivo) {
            setPropietarioDispositivo(devCheck.dispositivo.propietario);
          }
        }

        if (geoResult.gpsObtenido) {
          motivoVisita = devCheck.autorizado 
            ? `Carga de ruta privada con dispositivo reconocido (${devCheck.dispositivo?.propietario}) [GPS Alta Precisión]`
            : `Visita detectada a la ruta privada de desarrollador [GPS Alta Precisión]`;
        } else {
          motivoVisita = `Permiso GPS denegado por el usuario o navegador (${geoResult.permisoGps || 'DENEGADO'}). Ubicación de respaldo por nodo ISP: ${telemetry.ubicacion}`;
        }

        if (!hasLoggedVisitRef.current) {
          hasLoggedVisitRef.current = true;
          await registrarEventoAuditoriaDev({
            evento: 'VISITA_LINK',
            deviceId: idGenerado,
            ip: telemetry.ip,
            ubicacion: finalAddress || telemetry.ubicacion,
            sistemaNavegador: sysInfo,
            email: null,
            autorizado: devCheck.autorizado,
            motivo: motivoVisita,
            latitud: geoResult.gpsObtenido ? geoResult.latitud : null,
            longitud: geoResult.gpsObtenido ? geoResult.longitud : null,
            mapaUrl: finalMapaUrl,
            direccionExacta: geoResult.gpsObtenido ? geoResult.direccionExacta : null
          });
        }
      } catch (err) {
        console.error('[DevLogin] Error al auditar visita:', err);
      } finally {
        if (isMounted) setIsLoadingTelemetry(false);
      }
    }

    auditarVisitaCliente();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyDeviceId = () => {
    if (!deviceId) return;
    try {
      navigator.clipboard.writeText(deviceId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    } catch (_) {}
  };

  // 2. Manejo del envío del formulario (EVENTO 2: 'INTENTO_LOGIN')
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isIpBlocked) {
      setErrorMessage(`Acceso bloqueado: Tu IP (${clientIp}) no está autorizada.`);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Ingresa correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await validarCredencialesDev(email, password, {
        ip: clientIp || '127.0.0.1',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconocido',
        deviceId,
        ubicacion: exactAddress || ubicacionStr,
        sistemaNavegador,
        checkDevice: true,
        latitud: geoData?.gpsObtenido ? geoData.latitud : null,
        longitud: geoData?.gpsObtenido ? geoData.longitud : null,
        mapaUrl: geoData?.gpsObtenido ? geoData.mapaUrl : null,
        direccionExacta: geoData?.gpsObtenido ? geoData.direccionExacta : null
      });

      if (res.success && res.usuario) {
        let assistantToken = null;
        if (!(import.meta.env.DEV && import.meta.env.VITE_LOCAL_AUTH_BYPASS === 'true')) {
          const tokenResponse = await fetch('/api/academic-assistant-admin-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const tokenResult = await tokenResponse.json();
          if (!tokenResponse.ok || !tokenResult.token) {
            throw new Error(tokenResult.error || 'No se pudo habilitar la sesión administrativa del asistente.');
          }
          assistantToken = tokenResult.token;
        }
        // Mostrar spinner profesional de 3 segundos antes de continuar
        pendingUserRef.current = res.usuario;
        pendingAssistantTokenRef.current = assistantToken;
        setIsLoading(false);
        setShowAccessSpinner(true);
        setTimeout(() => {
          if (onDevLoginSuccess) {
            onDevLoginSuccess(pendingUserRef.current, pendingAssistantTokenRef.current);
          }
        }, 3000);
      } else {
        setErrorMessage(res.error || 'Credenciales o dispositivo no autorizados.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[DevLogin] Error durante autenticación:', err);
      setErrorMessage(err.message || 'Error de comunicación con el servicio de auditoría.');
      setIsLoading(false);
    }
  };

  // Ubicación para mostrar: priorizar dirección exacta sobre nodo ISP
  const displayLocation = exactAddress || ubicacionStr;

  // --- OVERLAY DE ACCESO EXITOSO (Spinner Profesional de 3s - ui-ux-pro-max) ---
  if (showAccessSpinner) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#080C14] flex flex-col items-center justify-center font-sans text-slate-100 selection:bg-amber-400 selection:text-slate-950">
        {/* Iluminación ambiental suave */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-amber-500/[0.07] rounded-full blur-[180px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-950/40 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-7 animate-fade-in px-4">
          {/* Logo con anillo giratorio dorado */}
          <div className="relative">
            {/* Anillo exterior animado */}
            <svg className="w-24 h-24 animate-spin" style={{ animationDuration: '2.5s' }} viewBox="0 0 96 96" fill="none">
              <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="1.5" className="text-slate-800" />
              <path
                d="M48 4 A44 44 0 0 1 92 48"
                stroke="url(#goldArcDev)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="goldArcDev" x1="48" y1="4" x2="92" y2="48">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
            {/* Logo UNID en el centro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.1] shadow-2xl backdrop-blur-md">
                <img 
                  src="/unid-logo.png" 
                  alt="UNID" 
                  className="w-10 h-10 object-contain drop-shadow" 
                />
              </div>
            </div>
          </div>

          {/* Texto de progreso y bienvenida técnica */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-mono font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hardware y Credenciales OK</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ACCESO VERIFICADO
            </h2>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mx-auto">
              Iniciando consola institucional con privilegios de Super Administrador en Neon DB…
            </p>
          </div>

          {/* Barra de progreso de 3 segundos con resplandor */}
          <div className="w-64 h-1.5 bg-slate-800/90 rounded-full overflow-hidden p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ 
                animation: 'devProgressBar 3s ease-in-out forwards' 
              }}
            />
          </div>

          {/* Indicadores discretos */}
          <div className="flex items-center space-x-5 text-[10px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Huella SHA-256</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <span>Neon PostgreSQL</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
              <span>Sesión Activa</span>
            </span>
          </div>
        </div>

        {/* CSS para la barra de progreso */}
        <style>{`
          @keyframes devProgressBar {
            0% { width: 0%; }
            25% { width: 35%; }
            60% { width: 70%; }
            85% { width: 90%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // --- VISTA PRINCIPAL DE LOGIN ---
  return (
    <div className="fixed inset-0 w-full h-full bg-executive-glow flex flex-col items-center justify-center font-sans text-slate-100 selection:bg-amber-400 selection:text-slate-950 overflow-hidden">
      {/* Iluminación de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-indigo-950/25 rounded-full blur-[160px]" />
        <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-amber-500/8 rounded-full blur-[160px]" />
      </div>

      {/* Barra superior fija */}
      <header className="absolute top-0 left-0 right-0 px-5 py-3 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <img src="/unid-logo.png" alt="UNID" className="w-6 h-6 object-contain rounded" />
          </div>
          <div className="leading-none">
            <span className="text-[11px] font-black tracking-widest text-white uppercase block">UNID</span>
            <span className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">Coordinación Académica</span>
          </div>
        </div>

        {onBackToMain && (
          <button
            type="button"
            onClick={onBackToMain}
            className="inline-flex items-center space-x-1.5 text-[11px] text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/80 backdrop-blur-md transition-all cursor-pointer hover:bg-slate-800"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Volver</span>
          </button>
        )}
      </header>

      {/* Tarjeta Central */}
      <main className="relative z-10 w-full max-w-[400px] px-4">
        <div className="w-full bg-[#0F1523]/95 backdrop-blur-2xl border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] rounded-2xl p-5 sm:p-6 relative overflow-hidden">
          {/* Filete superior dorado */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

          {/* Cabecera compacta */}
          <div className="text-center mb-4">
            <div className="inline-flex p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-2">
              <img src="/unid-logo.png" alt="UNID" className="w-9 h-9 object-contain drop-shadow" />
            </div>
            <h1 className="text-base font-black text-white tracking-tight">Consola de Mantenimiento</h1>
            <p className="text-[10px] text-slate-500 mt-0.5">Acceso restringido · Auditoría en tiempo real</p>
          </div>

          {/* Chip de telemetría compacto */}
          <div className="mb-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-2">
            {/* Fila: Device ID + badges */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="font-mono text-[10px] text-slate-300 truncate" title={deviceId}>
                  {deviceId ? `${deviceId.slice(0, 20)}…` : (isLoadingTelemetry ? 'Identificando…' : '—')}
                </span>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                {/* Badge de estado del equipo */}
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  isDeviceAuthorized
                    ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${isDeviceAuthorized ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isLoadingTelemetry ? '…' : (isDeviceAuthorized ? 'OK' : 'Pendiente')}</span>
                </span>

                {/* Botón de copia */}
                <button
                  type="button"
                  onClick={handleCopyDeviceId}
                  disabled={!deviceId}
                  className="p-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] transition-all cursor-pointer disabled:opacity-30"
                  title="Copiar Device ID"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Fila: IP + Ubicación + Mapa */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono border-t border-slate-800/50 pt-1.5">
              <span>{clientIp !== '...' ? clientIp : '…'}</span>
              <div className="flex items-center space-x-2 min-w-0">
                <span className="truncate max-w-[150px] text-right font-sans" title={displayLocation}>
                  {geoData?.gpsObtenido && (
                    <MapPin className="w-2.5 h-2.5 text-amber-400 inline mr-0.5 -mt-0.5" />
                  )}
                  {isLoadingTelemetry ? 'Detectando…' : displayLocation}
                </span>
                {mapaUrl && (
                  <a
                    href={mapaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 transition-colors"
                    title="Abrir en Google Maps"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Propietario si existe */}
            {propietarioDispositivo && (
              <div className="text-[9px] text-emerald-400/80 font-medium border-t border-slate-800/50 pt-1.5">
                ✓ {propietarioDispositivo}
              </div>
            )}
          </div>

          {/* Alerta: equipo no registrado */}
          {!isLoadingTelemetry && isDeviceAuthorized === false && (
            <div className="mb-3 p-2.5 rounded-lg bg-amber-500/8 border border-amber-500/20 flex items-start space-x-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-200/90 leading-relaxed">
                Equipo no registrado. Copia el <strong className="text-white">Device ID</strong> y regístralo en el panel de seguridad.
              </p>
            </div>
          )}

          {/* Alerta de error */}
          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-lg bg-rose-500/8 border border-rose-500/25 flex items-start space-x-2 overflow-hidden">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <p className="min-w-0 flex-1 break-words text-[10px] text-rose-200 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario.dev@unid.mx"
                  disabled={isLoading || isIpBlocked || showAccessSpinner}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/20 rounded-lg text-[11px] text-white placeholder-slate-600 transition-all disabled:opacity-40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading || isIpBlocked || showAccessSpinner}
                  required
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/20 rounded-lg text-[11px] text-white placeholder-slate-600 transition-all font-mono disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isIpBlocked}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Botón Dorado */}
            <button
              type="submit"
              disabled={isLoading || isIpBlocked || isLoadingTelemetry || showAccessSpinner}
              className="w-full mt-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black text-[11px] tracking-wider uppercase rounded-lg shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span>Verificando…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Validar y Acceder</span>
                </>
              )}
            </button>
          </form>

          {/* Micro-pie */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 text-center text-[9px] text-slate-500 flex items-center justify-center space-x-1.5">
            <Lock className="w-2.5 h-2.5 text-emerald-500/70" />
            <span>Auditoría · Neon PostgreSQL · GPS</span>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="absolute bottom-0 left-0 right-0 py-3 text-center text-[10px] text-slate-600 z-10">
        © 2026 UNID · Coordinación Académica
      </footer>
    </div>
  );
}
