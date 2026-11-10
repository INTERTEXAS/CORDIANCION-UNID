import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  ShieldAlert,
  Layers, 
  FileText, 
  Award,
  Building2,
  Server,
  PanelLeftClose,
  Users,
  Database,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DemoStudentsModal from './DemoStudentsModal';

export default function Sidebar({ 
  dbStatus, 
  activeTab, 
  setActiveTab, 
  isOpen = true, 
  onToggle,
  batchCount = 0,
  onOpenNeonManager,
  onLoadDemo
}) {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const { user, isSuperAdmin } = useAuth();
  const esSuperAdmin = Boolean(
    isSuperAdmin || 
    user?.rol === 'super_admin' || 
    user?.role === 'super_admin' || 
    user?.rol === 'ADMIN_SISTEMA'
  );

  const navItems = [
    {
      id: 'validador',
      label: 'Validador Académico',
      icon: ShieldCheck,
      isActive: activeTab === 'mapa' || activeTab === 'cedula',
      onClick: () => {
        if (window.location.pathname === '/admin/seguridad') {
          window.history.pushState({}, '', '/');
        }
        setActiveTab('mapa');
      },
      children: [
        { 
          id: 'mapa', 
          label: 'Mapa Curricular', 
          icon: Layers, 
          onClick: () => {
            if (window.location.pathname === '/admin/seguridad') {
              window.history.pushState({}, '', '/');
            }
            setActiveTab('mapa');
          }
        },
        { 
          id: 'cedula', 
          label: 'Cédula de Auditoría', 
          icon: FileText, 
          onClick: () => {
            if (window.location.pathname === '/admin/seguridad') {
              window.history.pushState({}, '', '/');
            }
            setActiveTab('cedula');
          }
        },
      ]
    },
    {
      id: 'grupo',
      label: 'Auditoría de Grupo',
      icon: Users,
      isActive: activeTab === 'grupo',
      onClick: () => {
        if (window.location.pathname === '/admin/seguridad') {
          window.history.pushState({}, '', '/');
        }
        setActiveTab('grupo');
      },
      badge: batchCount > 0 ? batchCount : null
    }
  ];

  // REQUERIMIENTO 1: Ocultar enlace si el usuario NO es super_admin
  if (esSuperAdmin) {
    navItems.push({
      id: 'seguridad',
      label: 'Seguridad y Accesos',
      icon: ShieldAlert,
      isActive: activeTab === 'seguridad',
      onClick: () => {
        window.history.pushState({}, '', '/admin/seguridad');
        setActiveTab('seguridad');
      },
      badge: 'DEV'
    });
  }

  const futureItems = [
    { label: 'Validación de Estadía', icon: Award },
    { label: 'Revisión de Kárdex', icon: GraduationCap },
  ];

  return (
    <aside 
      className={`flex flex-col flex-shrink-0 h-screen sticky top-0 select-none z-20 overflow-hidden transition-all duration-300 ease-in-out
        bg-[var(--sidebar-bg)] text-slate-400 ${isOpen ? 'w-[264px] border-r border-[var(--sidebar-border)]' : 'w-0 border-r-0'}`}
    >
      <div className="w-[264px] flex flex-col h-full flex-shrink-0">
        {/* Brand Header */}
        <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F2B705] to-[#E89B00] flex items-center justify-center shadow-glow-gold flex-shrink-0">
              <img 
                src="/unid-logo.png" 
                alt="UNID" 
                className="w-7 h-7 rounded-lg object-contain" 
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[10px] font-bold text-[#F2B705]/80 tracking-[0.15em] uppercase leading-tight">
                Control Académico
              </div>
              <div className="text-[13px] font-bold text-white tracking-tight leading-snug">
                UNID · Sede CAM
              </div>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all flex-shrink-0 cursor-pointer hover:scale-105"
            title="Ocultar menú lateral"
          >
            <PanelLeftClose className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
            Módulos
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                <button
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer group ${
                    item.isActive
                      ? 'bg-white/[0.08] text-white shadow-xs border border-white/10'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                      item.isActive 
                        ? 'bg-[#F2B705]/15 text-[#F2B705] border border-[#F2B705]/30 shadow-xs' 
                        : 'bg-white/[0.03] text-slate-400 border border-transparent group-hover:text-slate-200 group-hover:bg-white/[0.08] group-hover:scale-105'
                    }`}>
                      <Icon className="w-4 h-4" strokeWidth={1.8} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#F2B705] text-slate-950 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full min-w-[24px] text-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Sub-items */}
                {item.children && item.isActive && (
                  <div className="mt-1 ml-5 pl-4 border-l border-white/[0.08] space-y-0.5">
                    {item.children.map(child => {
                      const ChildIcon = child.icon;
                      const isChildActive = activeTab === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={child.onClick}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer group ${
                            isChildActive 
                              ? 'text-[#F2B705] font-semibold bg-[#F2B705]/10' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className={`p-1 rounded-md transition-colors ${
                            isChildActive ? 'text-[#F2B705]' : 'text-slate-500 group-hover:text-slate-300'
                          }`}>
                            <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.8} />
                          </div>
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Botón Profesional de Expedientes Demo */}
          {onLoadDemo && (
            <div className="pt-3 mt-1 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:from-amber-500/20 hover:to-amber-500/10 border border-amber-500/25 hover:border-amber-500/40 text-amber-300 hover:text-amber-200 transition-all text-xs font-semibold cursor-pointer group shadow-2xs"
                title="Cargar expediente institucional de prueba (5 casos disponibles)"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="truncate">Expedientes Demo</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30 shrink-0">
                  5 casos
                </span>
              </button>

              <DemoStudentsModal
                isOpen={isDemoModalOpen}
                onClose={() => setIsDemoModalOpen(false)}
                onSelectStudent={onLoadDemo}
              />
            </div>
          )}

          {/* Future modules (disabled) */}
          <div className="pt-5 px-3 pb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-[0.12em]">
            Próximamente
          </div>
          {futureItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center space-x-3 px-3 py-2 rounded-xl text-[12.5px] font-medium text-slate-600 cursor-default opacity-50">
                <div className="p-1.5 rounded-lg bg-white/[0.02]">
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Footer: Micro-Cockpit de Telemetría Escolar */}
        <div className="p-3 border-t border-white/[0.06] bg-black/25 space-y-2">
          {/* Micro-tarjeta de Servidor & Base de Datos */}
          <div
            onClick={onOpenNeonManager}
            role={onOpenNeonManager ? 'button' : undefined}
            tabIndex={onOpenNeonManager ? 0 : undefined}
            onKeyDown={(e) => {
              if (onOpenNeonManager && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onOpenNeonManager();
              }
            }}
            title={onOpenNeonManager ? "Clic para abrir el Gestor de Ciclos y Auditorías en Neon DB" : undefined}
            className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 select-none ${
              onOpenNeonManager 
                ? 'cursor-pointer hover:border-emerald-500/40 hover:bg-white/[0.04] group' 
                : ''
            } ${
              dbStatus?.fuente === 'neon'
                ? 'bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.06)]'
                : 'bg-slate-900/60 border-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  {dbStatus?.fuente === 'neon' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    dbStatus?.fuente === 'neon' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                </span>
                <span className="text-[11px] font-semibold text-slate-200 tracking-tight truncate">
                  {dbStatus?.fuente === 'neon' ? 'Neon PostgreSQL' : 'Almacenamiento Local'}
                </span>
              </div>
              <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wide ${
                dbStatus?.fuente === 'neon'
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
              }`}>
                {dbStatus?.fuente === 'neon' ? 'ONLINE' : 'LOCAL'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center space-x-1.5 truncate text-slate-400">
                <Database className="w-3 h-3 text-slate-500 flex-shrink-0" strokeWidth={1.8} />
                <span className="truncate">
                  {dbStatus?.fuente === 'neon' ? 'Serverless Pooler' : 'Caché navegador'}
                </span>
              </span>
              {onOpenNeonManager && (
                <span className="text-[9.5px] font-medium text-emerald-400/80 group-hover:text-emerald-300 flex items-center transition-colors">
                  <span>Gestionar</span>
                  <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </div>
          </div>

          {/* Contexto de Sede y Build */}
          <div className="pt-1 px-1 flex items-center justify-between text-[10.5px]">
            <span className="flex items-center space-x-1.5 text-slate-400 font-medium">
              <Building2 className="w-3 h-3 text-slate-500 flex-shrink-0" strokeWidth={1.8} />
              <span>Sede CAM</span>
            </span>
            <span className="font-mono text-[9.5px] text-slate-500 tracking-wider">
              v2026.1 · MIXTO
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
