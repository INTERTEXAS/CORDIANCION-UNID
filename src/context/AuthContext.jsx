import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { getAccountEmail, isValidUnidEmail } from '../authConfig';

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

  const activeMsalAccount = instance.getActiveAccount() || accounts[0] || null;

  // Si existe devUser, tiene rol prioritario ADMIN_SISTEMA
  const isSuperAdmin = Boolean(devUser && devUser.rol === 'ADMIN_SISTEMA');

  // Usuario consolidado (DevUser o cuenta institucional Msal)
  const user = devUser || (activeMsalAccount && isValidUnidEmail(activeMsalAccount) ? {
    id: activeMsalAccount.homeAccountId,
    nombre: activeMsalAccount.name || getAccountEmail(activeMsalAccount).split('@')[0],
    email: getAccountEmail(activeMsalAccount),
    rol: 'DOCENTE',
    coordinacion: 'INSTITUCIONAL',
    isMsal: true
  } : null);

  const loginDevUser = (usuario) => {
    sessionStorage.setItem('unid_dev_user', JSON.stringify(usuario));
    setDevUser(usuario);
  };

  const logout = async () => {
    sessionStorage.removeItem('unid_dev_user');
    setDevUser(null);
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
      userRole: isSuperAdmin ? 'ADMIN_SISTEMA' : (user ? 'DOCENTE' : null),
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
