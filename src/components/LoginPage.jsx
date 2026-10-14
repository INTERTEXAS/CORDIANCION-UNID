import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest, isValidUnidEmail, getAccountEmail } from '../authConfig';
import { ShieldAlert, ShieldCheck, Loader2, ArrowRight, Terminal, X } from 'lucide-react';
import DevLoginModal from './DevLoginModal';

export default function LoginPage({ initialError = null, onAuthSuccess = null, onClearError = null }) {
  const { instance } = useMsal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState(initialError);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
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
      if (onAuthSuccess) {
        onAuthSuccess(account, 'DOCENTE');
      }

      // Recargar la página para abrir por completo el sistema con la sesión activa
      setTimeout(() => {
        window.location.reload();
      }, 150);
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

          {/* Requisitos y directrices con enlace de desarrollador discreto */}
          <div className="mt-7 pt-5 border-t border-slate-800/80 text-center space-y-1.5">
            <div className="text-[11px] text-slate-400 font-medium">
              Universidad Interamericana para el Desarrollo
            </div>
            <div className="text-[10px] text-slate-400">
              Usa tu cuenta institucional de Office 365 / Microsoft Entra.
            </div>

            {/* Enlace discreto Desarrollador con icono sutil */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsDevModalOpen(true)}
                className="inline-flex items-center space-x-1.5 text-[11px] text-slate-400 hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-0 p-0 tracking-wide font-normal group"
                title="Acceso de mantenimiento y desarrollo"
              >
                <Terminal className="w-3 h-3 text-slate-400 group-hover:text-amber-400 transition-colors" strokeWidth={1.8} />
                <span className="border-b border-transparent group-hover:border-amber-400/50">Desarrollador</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Acceso Oculto Super Usuario */}
        <DevLoginModal
          isOpen={isDevModalOpen}
          onClose={() => setIsDevModalOpen(false)}
          onDevLoginSuccess={(devUser) => {
            if (onAuthSuccess) {
              onAuthSuccess(devUser, 'ADMIN_SISTEMA');
            }
          }}
        />
      </main>

      {/* Pie de página */}
      <footer className="w-full max-w-4xl py-3 shrink-0 text-center text-[11px] text-slate-400 z-10">
        <p>© {new Date().getFullYear()} UNID · Coordinación Académica · Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
