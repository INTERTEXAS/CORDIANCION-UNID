import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { getAccountEmail, isValidUnidEmail } from '../authConfig';
import { obtenerPerfilUsuarioPorEmail } from '../services/neonService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { instance, accounts } = useMsal();
  
  // Estado para el usuario autenticado por Acceso Desarrollador / Super Admin
  const [devUser, setDevUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('unid_dev_user');
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });
  const [devAssistantToken, setDevAssistantToken] = useState(() => {
    try {
      return sessionStorage.getItem('unid_dev_assistant_token') || null;
    } catch (_) {
      return null;
    }
  });

  const [msalProfile, setMsalProfile] = useState(null);

  const activeMsalAccount = instance.getActiveAccount() || accounts[0] || null;

  // Consultar perfil institucional en Neon para cuentas Microsoft
  useEffect(() => {
    let isMounted = true;
    if (activeMsalAccount && isValidUnidEmail(activeMsalAccount)) {
      const email = getAccountEmail(activeMsalAccount);
      obtenerPerfilUsuarioPorEmail(email).then(profile => {
        if (isMounted && profile) {
          setMsalProfile(profile);
        }
      }).catch(err => {
        console.warn('[AuthContext] No se pudo recuperar perfil de usuario:', err);
      });
    } else {
      setMsalProfile(null);
    }
    return () => { isMounted = false; };
  }, [activeMsalAccount]);

  // Si existe devUser, tiene rol prioritario ADMIN_SISTEMA o super_admin
  const roleNorm = String(devUser?.rol || devUser?.role || '').toLowerCase().trim();
  const isSuperAdmin = Boolean(
    devUser && (
      roleNorm === 'super_admin' || 
      roleNorm === 'admin_sistema' || 
      roleNorm === 'superadmin' || 
      devUser.rol === 'ADMIN_SISTEMA'
    )
  );

  // Usuario consolidado (DevUser o cuenta institucional Msal)
  const user = devUser ? {
    ...devUser,
    rol: devUser.rol || 'super_admin',
    role: devUser.role || devUser.rol || 'super_admin'
  } : (activeMsalAccount && isValidUnidEmail(activeMsalAccount) ? {
    id: activeMsalAccount.homeAccountId,
    nombre: msalProfile?.nombre || activeMsalAccount.name || getAccountEmail(activeMsalAccount).split('@')[0],
    email: getAccountEmail(activeMsalAccount),
    rol: msalProfile?.rol || 'DOCENTE',
    role: msalProfile?.rol || 'DOCENTE',
    coordinacion: msalProfile?.coordinacion || 'INSTITUCIONAL',
    activo: msalProfile ? msalProfile.activo : true,
    isMsal: true
  } : null);

  const loginDevUser = (usuario, assistantToken) => {
    sessionStorage.setItem('unid_dev_user', JSON.stringify(usuario));
    setDevUser(usuario);
    if (assistantToken) {
      sessionStorage.setItem('unid_dev_assistant_token', assistantToken);
      setDevAssistantToken(assistantToken);
    } else {
      sessionStorage.removeItem('unid_dev_assistant_token');
      setDevAssistantToken(null);
    }
  };

  const logout = async () => {
    sessionStorage.removeItem('unid_dev_user');
    sessionStorage.removeItem('unid_dev_assistant_token');
    setDevUser(null);
    setDevAssistantToken(null);
    if (activeMsalAccount) {
      try {
        await instance.logoutPopup({
          mainWindowRedirectUri: window.location.origin
        });
      } catch (_) {
        instance.setActiveAccount(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isSuperAdmin,
      devAssistantToken,
      userRole: isSuperAdmin ? 'super_admin' : (user ? (user.rol || 'DOCENTE') : null),
      loginDevUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return ctx;
}
