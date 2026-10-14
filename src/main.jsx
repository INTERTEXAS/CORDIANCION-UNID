import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Detectar de forma inequívoca si la ventana actual es el retorno de autenticación de Microsoft (Popup o Callback)
const isAuthCallback = typeof window !== 'undefined' && Boolean(
  window.location.hash.includes('code=') ||
  window.location.hash.includes('error=') ||
  window.location.hash.includes('state=') ||
  window.location.search.includes('code=') ||
  window.location.search.includes('error=') ||
  (window.opener && window.opener !== window) ||
  (window.name && window.name.includes('msal'))
);

if (isAuthCallback) {
  // CASO POPUP / RETORNO DE MICROSOFT:
  // Esta ventana es exclusivamente un puente de autenticación.
  // Su ÚNICA función es procesar el token, comunicarlo a la ventana principal vía BroadcastChannel y cerrarse de inmediato.
  // NUNCA debe renderizar la aplicación de React dentro de la ventana emergente.
  broadcastResponseToMainFrame()
    .catch((err) => {
      console.warn('[MSAL Bridge] Aviso en broadcast:', err);
    })
    .finally(() => {
      // Forzar el cierre de la ventana emergente de forma inmediata e incondicional
      try { window.close(); } catch (_) {}
      setTimeout(() => { try { window.close(); } catch (_) {} }, 50);
      setTimeout(() => { try { window.close(); } catch (_) {} }, 150);
      setTimeout(() => { try { window.close(); } catch (_) {} }, 400);
    });

  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0B0F17;color:#94a3b8;font-family:system-ui,-apple-system,sans-serif;font-size:13px;gap:12px;text-align:center;padding:24px;">
        <div style="width:32px;height:32px;border:3px solid #f59e0b;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        <div style="font-weight:600;color:#f8fafc;">Autenticación procesada</div>
        <div style="color:#64748b;font-size:12px;">Cerrando esta ventana automáticamente...</div>
        <button onclick="window.close()" style="margin-top:8px;padding:6px 16px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:8px;font-size:12px;cursor:pointer;">
          Cerrar ventana
        </button>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
      </div>
    `;
  }
} else {
  // CASO VENTANA PRINCIPAL: Inicializar cliente y montar la aplicación completa de React
  const msalInstance = new PublicClientApplication(msalConfig);
  msalInstance.initialize().then(async () => {
    try {
      const redirectResponse = await msalInstance.handleRedirectPromise();
      if (redirectResponse?.account) {
        msalInstance.setActiveAccount(redirectResponse.account);
      }
    } catch (err) {
      console.warn('[MSAL] Aviso al procesar respuesta de autenticación:', err);
    }

    // Configurar cuenta activa preexistente si la sesión está en caché
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
      msalInstance.setActiveAccount(accounts[0]);
    }

    // Registrar callback para actualizar cuenta activa al iniciar sesión
    msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
        msalInstance.setActiveAccount(event.payload.account);
      }
    });

    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </AuthProvider>
        </MsalProvider>
      </StrictMode>,
    );
  }).catch((error) => {
    console.error('[MSAL] Error crítico al inicializar cliente de autenticación:', error);
  });
}

