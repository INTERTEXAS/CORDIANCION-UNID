const getEnvVar = (key, fallback) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

// Configuración de autenticación con Microsoft Entra ID (Azure AD) para UNID
// Soporta dinámicamente tanto el entorno local (localhost) como producción desplegada mediante window.location.origin
export const msalConfig = {
  auth: {
    clientId: getEnvVar('VITE_AZURE_CLIENT_ID', '3e9aa3e7-af76-4177-9ff5-c6150a6e7eb4'),
    authority: `https://login.microsoftonline.com/${getEnvVar('VITE_AZURE_TENANT_ID', '1eac60bd-d90a-4a9e-a286-54e8fd9cdcb7')}`,
    // Valores dinámicos nativos del navegador para redirigir automáticamente a la URL correcta en localhost o en la nube
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true
  }
};

/**
 * Permisos (Scopes) solicitados durante la autenticación de Microsoft 365
 */
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email']
};

/**
 * Extrae y normaliza el correo de la cuenta de Microsoft
 */
export function getAccountEmail(account) {
  if (!account) return '';
  return (
    account.idTokenClaims?.preferred_username ||
    account.username ||
    account.idTokenClaims?.email ||
    account.idTokenClaims?.upn ||
    ''
  ).toLowerCase().trim();
}

/**
 * Valida si la cuenta pertenece de forma estricta al dominio institucional @unid.mx
 * Restricción obligatoria de Coordinación Académica: Solo personal con correo @unid.mx
 */
export function isValidUnidEmail(account) {
  if (!account) return false;
  const email = getAccountEmail(account);
  if (!email) return false;

  return email.endsWith('@unid.mx');
}
