import React, { useState, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { isValidUnidEmail, getAccountEmail } from '../authConfig';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';

export default function AuthBarrier({ children }) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { isSuperAdmin, loginDevUser } = useAuth();
  const [authError, setAuthError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const currentAccount = instance.getActiveAccount() || accounts[0] || null;

  useEffect(() => {
    // Si ya está autenticado como Super Admin (DEV), omitir MSAL
    if (isSuperAdmin) {
      setIsVerifying(false);
      return;
    }

    // Si hay una cuenta activa en sesión de Microsoft
    if (currentAccount) {
      const email = getAccountEmail(currentAccount);
      if (isValidUnidEmail(currentAccount)) {
        if (!instance.getActiveAccount()) {
          instance.setActiveAccount(currentAccount);
        }
        setAuthError(null);
      } else {
        console.warn('[AuthBarrier] Cuenta en sesión no autorizada:', email);
        setAuthError(`Acceso denegado: El correo (${email || 'desconocido'}) no pertenece al dominio oficial @unid.mx. Solo personal con cuenta @unid.mx tiene acceso permitido.`);
        instance.setActiveAccount(null);
        try {
          if (typeof instance.clearCache === 'function') {
            instance.clearCache();
          }
        } catch (_) {}
      }
    }
    setIsVerifying(false);
  }, [currentAccount, instance, isSuperAdmin]);

  // Tiempo de inactividad de 5 minutos (300,000 ms)
  const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

  // Temporizador de inactividad: expulsa automáticamente a cualquier usuario excepto Super Admin
  useEffect(() => {
    // EXCEPCIÓN ESTRICTA: El Super Admin no tiene límite de inactividad
    if (isSuperAdmin || !currentAccount || authError) {
      return;
    }

    let lastActivity = Date.now();

    const handleUserActivity = () => {
      lastActivity = Date.now();
    };

    // Escuchar eventos de interacción del usuario
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    const verifyInactivity = () => {
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        console.warn('[Seguridad] Sesión institucional cerrada automáticamente tras 5 minutos de inactividad.');
        try {
          instance.setActiveAccount(null);
        } catch (err) {
          console.warn('[Seguridad] Error al desasignar cuenta activa en timeout:', err);
        }
        setAuthError('Tu sesión ha expirado por inactividad (5 minutos). Por seguridad institucional, inicia sesión nuevamente.');
      }
    };

    // Revisar inactividad periódicamente cada 4 segundos
    const intervalId = setInterval(verifyInactivity, 4000);

    // Revisar de inmediato al volver a enfocar la pestaña del navegador
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verifyInactivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [isSuperAdmin, currentAccount, authError, instance, INACTIVITY_TIMEOUT_MS]);

  // Si está verificando la sesión inicial
  if (isVerifying) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F17] text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Verificando credenciales institucionales...
          </p>
        </div>
      </div>
    );
  }

  // Autorizado si es Super Admin O si está autenticado en Microsoft con correo @unid.mx
  const isAuthorized = Boolean(
    isSuperAdmin || 
    (isAuthenticated && currentAccount && isValidUnidEmail(currentAccount) && !authError)
  );

  // Si NO está autorizado, muestra EXCLUSIVAMENTE la pantalla de Login
  if (!isAuthorized) {
    return (
      <LoginPage 
        initialError={authError} 
        onClearError={() => setAuthError(null)}
        onAuthSuccess={(authResult, role) => {
          setAuthError(null);
          if (role === 'ADMIN_SISTEMA') {
            loginDevUser(authResult);
          } else {
            instance.setActiveAccount(authResult);
          }
        }}
      />
    );
  }

  // Acceso concedido: renderiza el sistema principal
  return <>{children}</>;
}
