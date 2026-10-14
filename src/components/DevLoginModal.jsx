import React, { useState } from 'react';
import { validarCredencialesDev } from '../services/neonService';
import { ShieldCheck, X, Loader2, AlertCircle, Terminal, KeyRound, Mail } from 'lucide-react';

export default function DevLoginModal({ isOpen, onClose, onDevLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, ingresa correo y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await validarCredencialesDev(email, password);
      if (res.success && res.usuario) {
        onDevLoginSuccess(res.usuario);
        onClose();
      } else {
        setErrorMsg(res.error || 'Credenciales no autorizadas.');
      }
    } catch (err) {
      console.error('Error durante validación DEV:', err);
      setErrorMsg('Error de conexión al validar con Neon DB.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-md bg-[#111827] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col relative my-auto max-h-[calc(100vh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal con estilo unificado del sistema */}
        <div className="bg-[#0B0F14] px-5 sm:px-6 py-3.5 sm:py-4 shrink-0 flex items-center justify-between border-b border-slate-800 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Terminal className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide flex items-center space-x-2">
                <span>Acceso Desarrollador</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                  SUPER ADMIN
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Autenticación directa de mantenimiento en Neon DB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal y Formulario con scroll vertical seguro */}
        <div className="p-5 sm:p-6 bg-[#111827] space-y-4 overflow-y-auto">
          {/* Alerta de Error */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  disabled={isLoading}
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-amber-400 rounded-xl text-[13px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-amber-400 rounded-xl text-[13px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-accent hover:bg-accent-hover text-slate-950 font-bold text-[13px] rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando en Neon DB...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                  <span>Ingresar</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
