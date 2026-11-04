import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest, isValidUnidEmail, getAccountEmail } from '../authConfig';
import { ShieldAlert, ShieldCheck, Loader2, ArrowRight, X } from 'lucide-react';

export default function LoginPage({ initialError = null, onAuthSuccess = null, onClearError = null }) {
  const { instance } = useMsal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showWelcomeSpinner, setShowWelcomeSpinner] = useState(false);
  const [errorMessage, setErrorMessage] = useState(initialError);
  const timerRef = useRef(null);

  // Borra de inmediato el mensaje de error y cancela temporizadores activos
  const dismissError = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setErrorMessage(null);
    if (onClearError) {
      onClearError();
    }
  }, [onClearError]);

  // Asigna un mensaje de error con duración programada de 20 segundos
  const setTimedErrorMessage = useCallback((msg) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setErrorMessage(msg);
    if (msg) {
      // Temporizador de 20 segundos (20,000 ms)
      timerRef.current = setTimeout(() => {
        dismissError();
      }, 20000);
    }
  }, [dismissError]);

  useEffect(() => {
    if (initialError) {
      setTimedErrorMessage(initialError);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setErrorMessage(null);
    }
  }, [initialError, setTimedErrorMessage]);

  // Limpieza defensiva del temporizador al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleLogin = async () => {
    // EN CADA INTENTO: Borrar inmediatamente el mensaje anterior
    dismissError();
    setIsLoggingIn(true);

    try {
      // Ejecutar inicio de sesión con ventana emergente de Microsoft
      const response = await instance.loginPopup({
        ...loginRequest,
        prompt: 'select_account'
      });

      const account = response?.account || instance.getActiveAccount() || instance.getAllAccounts()[0];
      const email = getAccountEmail(account);

      // Comprobar pertenencia al dominio oficial @unid.mx de forma estricta
      if (!account || !isValidUnidEmail(account)) {
        console.warn(`[Auth] Intento de acceso no autorizado con correo: ${email}`);
        instance.setActiveAccount(null);
        try {
          if (typeof instance.clearCache === 'function') {
            await instance.clearCache();
          }
        } catch (_) {}

        setTimedErrorMessage(`Acceso denegado: El correo (${email || 'desconocido'}) no pertenece al dominio oficial @unid.mx. Solo personal con cuenta @unid.mx tiene acceso permitido.`);
        return;
      }

      // Cuenta válida autorizada: asignar como activa
      instance.setActiveAccount(account);

      // Activar pantalla de bienvenida con spinner institucional de al menos 3 segundos
      setIsLoggingIn(false);
      setShowWelcomeSpinner(true);

      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess(account, 'DOCENTE');
        }
        // Recargar la página para abrir por completo el sistema con la sesión activa
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('[Auth] Error durante loginPopup:', error);
      const isCancelled = 
        error.errorCode === 'user_cancelled' || 
        error.errorCode === 'popup_window_error' ||
        error.message?.toLowerCase().includes('cancelled') ||
        error.message?.toLowerCase().includes('closed') ||
        error.message?.toLowerCase().includes('popup');

      if (isCancelled) {
        setTimedErrorMessage('Inicio de sesión cancelado o ventana cerrada.');
      } else {
        setTimedErrorMessage(error.message || 'Error al conectar con los servicios de Microsoft Entra ID.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- OVERLAY INSTITUCIONAL DE BIENVENIDA (3 Segundos) ---
  if (showWelcomeSpinner) {
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
            <svg className="w-24 h-24 animate-spin" style={{ animationDuration: '2.5s' }} viewBox="0 0 96 96" fill="none">
              <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="1.5" className="text-slate-800" />
              <path
                d="M48 4 A44 44 0 0 1 92 48"
                stroke="url(#goldArcWelcome)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="goldArcWelcome" x1="48" y1="4" x2="92" y2="48">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
            {/* Logo UNID en el centro con relieve */}
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

          {/* Saludo y Texto de Progreso */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-mono font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Autenticación Exitosa</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              HOLA, BIENVENIDO
            </h2>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mx-auto">
              Iniciando tu sesión en la plataforma de Coordinación Académica con Microsoft 365…
            </p>
          </div>

          {/* Barra de progreso de 3 segundos */}
          <div className="w-64 h-1.5 bg-slate-800/90 rounded-full overflow-hidden p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ 
                animation: 'welcomeProgressBar 3s ease-in-out forwards' 
              }}
            />
          </div>

          {/* Indicadores institucionales discretos */}
          <div className="flex items-center space-x-5 text-[10px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cuenta @unid.mx</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <span>Microsoft Entra ID</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
              <span>Planes de Estudio</span>
            </span>
          </div>
        </div>

        {/* Keyframes CSS para la animación de 3 segundos */}
        <style>{`
          @keyframes welcomeProgressBar {
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

  return (
    <div className="min-h-screen w-full bg-executive-glow flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-y-auto overflow-x-hidden font-sans text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Iluminación arquitectónica de fondo suave y sobria (Sin mallas ni elementos artificiales) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-indigo-950/25 rounded-full blur-[160px]" />
        <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-amber-500/8 rounded-full blur-[160px]" />
      </div>

      {/* Barra superior institucional discreta */}
      <header className="w-full max-w-4xl py-3 shrink-0 z-10 flex items-center justify-between animate-fade-in">
        <div className="flex items-center space-x-3 group cursor-default">
          <div className="p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400/40">
            <img 
              src="/unid-logo.png" 
              alt="UNID Logo" 
              className="w-7 h-7 object-contain rounded-lg drop-shadow-sm" 
            />
          </div>
          <div className="leading-tight">
            <span className="text-xs font-black tracking-widest text-white uppercase block">UNID</span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Coordinación Académica</span>
          </div>
        </div>

        {/* Badge de seguridad con pulso institucional */}
        <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-300 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full shadow-sm backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm" />
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={1.8} />
          <span className="hidden sm:inline">Acceso Seguro Microsoft Entra ID</span>
          <span className="sm:hidden">Entra ID</span>
        </div>
      </header>

      {/* Contenedor central - Tarjeta ejecutiva sobria y elegante */}
      <main className="w-full max-w-md my-auto py-5 shrink-0 z-10 flex flex-col items-center justify-center min-h-0 animate-scale-in">
        <div className="w-full bg-[#0F1523]/95 backdrop-blur-2xl border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] hover:border-slate-700/80 transition-all duration-300 rounded-3xl p-7 sm:p-9 relative overflow-hidden group">
          {/* Fino filete superior dorado institucional */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

          {/* Logotipo e Identidad Institucional */}
          <div className="text-center space-y-3 mb-7">
            <div className="inline-flex p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-sm mb-1 transition-all duration-300 hover:border-amber-400/40 cursor-default">
              <img 
                src="/unid-logo.png" 
                alt="UNID" 
                className="w-12 h-12 object-contain drop-shadow" 
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Sistema de Auditoría Curricular
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Plataforma institucional de validación de kárdex, trayectorias y dictamen de estadía.
            </p>
          </div>

          {/* Mensaje de Alerta / Timeout / Error (se borra en cada intento y dura 20s) */}
          {errorMessage && (
            <div 
              key={errorMessage}
              className={`mb-5 p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 animate-shake relative overflow-hidden transition-all duration-300 ${
                errorMessage.includes('inactividad') || errorMessage.includes('expirado')
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${
                errorMessage.includes('inactividad') || errorMessage.includes('expirado')
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`} strokeWidth={1.8} />

              <div className="space-y-1 flex-1 pr-4 min-w-0">
                <span className={`font-bold block ${
                  errorMessage.includes('inactividad') || errorMessage.includes('expirado')
                    ? 'text-amber-100'
                    : 'text-rose-200'
                }`}>
                  {errorMessage.includes('inactividad') || errorMessage.includes('expirado')
                    ? 'Sesión finalizada por inactividad'
                    : 'Acceso no autorizado'}
                </span>
                <p className="leading-relaxed opacity-90">{errorMessage}</p>
                <div className="pt-0.5 flex items-center justify-between text-[10px] opacity-75">
                  <span>Cierre automático en 20s</span>
                  <span className="font-mono">o al reintentar</span>
                </div>
              </div>

              {/* Botón manual para descartar el mensaje */}
              <button
                type="button"
                onClick={dismissError}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Descartar aviso"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>

              {/* Barra de progreso de cuenta regresiva de 20s */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden">
                <div 
                  className={`h-full ${
                    errorMessage.includes('inactividad') || errorMessage.includes('expirado')
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  } animate-countdown-20s`} 
                />
              </div>
            </div>
          )}

          {/* Botón Principal de Microsoft 365 Oficial */}
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-bold text-[13px] rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group border border-slate-200"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-800" strokeWidth={2} />
                  <span>Conectando con Microsoft...</span>
                </>
              ) : (
                <>
                  {/* Icono de Microsoft Oficial (4 cuadros institucionales) */}
                  <svg className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                  </svg>
                  <span>Iniciar sesión con Microsoft 365</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={2} />
                </>
              )}
            </button>
          </div>

          {/* Requisitos y directrices */}
          <div className="mt-7 pt-5 border-t border-slate-800/80 text-center space-y-1.5">
            <div className="text-[11px] text-slate-400 font-medium">
              Universidad Interamericana para el Desarrollo
            </div>
            <div className="text-[10px] text-slate-400">
              Usa tu cuenta institucional de Office 365 / Microsoft Entra.
            </div>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="w-full max-w-4xl py-3 shrink-0 text-center text-[11px] text-slate-400 z-10">
        <p>© {new Date().getFullYear()} UNID · Coordinación Académica · Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
