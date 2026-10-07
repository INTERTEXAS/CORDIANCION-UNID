import { 
  GraduationCap, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Award,
  Building2,
  Server,
  PanelLeftClose,
  Users
} from 'lucide-react';

export default function Sidebar({ 
  dbStatus, 
  activeTab, 
  setActiveTab, 
  isOpen = true, 
  onToggle,
  batchCount = 0
}) {
  const navItems = [
    {
      id: 'validador',
      label: 'Validador Académico',
      icon: ShieldCheck,
      isActive: activeTab === 'mapa' || activeTab === 'cedula',
      onClick: () => setActiveTab('mapa'),
      children: [
        { id: 'mapa', label: 'Mapa Curricular', icon: Layers, onClick: () => setActiveTab('mapa') },
        { id: 'cedula', label: 'Cédula de Auditoría', icon: FileText, onClick: () => setActiveTab('cedula') },
      ]
    },
    {
      id: 'grupo',
      label: 'Auditoría de Grupo',
      icon: Users,
      isActive: activeTab === 'grupo',
      onClick: () => setActiveTab('grupo'),
      badge: batchCount > 0 ? batchCount : null
    }
  ];

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
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors flex-shrink-0 cursor-pointer"
            title="Ocultar menú lateral"
          >
            <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
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
                      ? 'bg-white/[0.08] text-white shadow-glass'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      item.isActive ? 'bg-[#F2B705]/15 text-[#F2B705]' : 'text-slate-500 group-hover:text-slate-300'
                    }`}>
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#F2B705] text-slate-950 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full min-w-[24px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Sub-items */}
                {item.children && item.isActive && (
                  <div className="mt-1 ml-5 pl-4 border-l border-white/[0.06] space-y-0.5">
                    {item.children.map(child => {
                      const ChildIcon = child.icon;
                      const isChildActive = activeTab === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={child.onClick}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                            isChildActive 
                              ? 'text-[#F2B705] font-semibold' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Future modules (disabled) */}
          <div className="pt-5 px-3 pb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-[0.12em]">
            Próximamente
          </div>
          {futureItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-600 cursor-default opacity-50">
                <div className="p-1.5 rounded-lg">
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Footer: System Status */}
        <div className="p-4 border-t border-white/[0.06] bg-black/20 text-[11px] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-slate-500">
              <Server className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Base de datos:</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              dbStatus?.fuente === 'neon'
                ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
            }`}>
              {dbStatus?.fuente === 'neon' ? '● Neon' : '● Local'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-slate-500">
              <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Campus:</span>
            </span>
            <span className="font-semibold text-slate-300">Sede CAM</span>
          </div>

          <div className="pt-2 text-[10px] text-slate-600 text-center border-t border-white/[0.04]">
            v2026.1 · Licenciatura Mixta
          </div>
        </div>
      </div>
    </aside>
  );
}
