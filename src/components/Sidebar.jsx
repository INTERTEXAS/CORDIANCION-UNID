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
  return (
    <aside 
      className={`bg-[#111622] text-slate-300 flex flex-col flex-shrink-0 h-screen sticky top-0 shadow-xl select-none z-20 transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'w-72 border-r border-slate-800' : 'w-0 border-r-0'
      }`}
    >
      {/* Contenedor interno con ancho fijo para evitar saltos durante la transición */}
      <div className="w-72 flex flex-col h-full flex-shrink-0">
        {/* Isotipo, Logotipo UNID y Botón de Colapso */}
        <div className="px-3.5 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <img 
              src="/unid-logo.png" 
              alt="UNID" 
              className="w-10 h-10 rounded-xl object-contain flex-shrink-0 shadow-sm" 
            />
            <div className="flex flex-col justify-center">
              <div className="text-[10px] font-bold text-[#E5A823] tracking-widest uppercase leading-tight whitespace-nowrap">
                PORTAL INSTITUCIONAL
              </div>
              <div className="text-[13px] font-bold text-white tracking-tight leading-snug whitespace-nowrap">
                UNID · Control Académico
              </div>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer ml-1"
            title="Ocultar menú lateral"
          >
            <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Menú de Navegación */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Módulos Principales
          </div>

          {/* Botón Activo: Validador Académico */}
          <button
            onClick={() => setActiveTab('mapa')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'mapa' || activeTab === 'cedula'
                ? 'bg-white text-[#111622] shadow-none font-bold'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#111622]" strokeWidth={1.5} />
            <span>Validador Académico</span>
          </button>

          <button
            onClick={() => setActiveTab('mapa')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'mapa' ? 'text-[#F2B705] font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 flex-shrink-0 ml-2" strokeWidth={1.5} />
            <span>Hoja 1: Mapa Curricular</span>
          </button>

          <button
            onClick={() => setActiveTab('cedula')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'cedula' ? 'text-[#F2B705] font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0 ml-2" strokeWidth={1.5} />
            <span>Hoja 2: Cédula de Auditoría</span>
          </button>

          <button
            onClick={() => setActiveTab('grupo')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'grupo'
                ? 'bg-white text-[#111622] shadow-none font-bold'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 flex-shrink-0 text-[#F2B705]" strokeWidth={1.5} />
              <span>Auditoría de Grupo</span>
            </div>
            {batchCount > 0 && (
              <span className="bg-[#F2B705] text-slate-950 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                {batchCount}
              </span>
            )}
          </button>

          <div className="pt-5 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Auditoría de Egreso
          </div>

          <div className="flex items-center space-x-3 px-3.5 py-2.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 cursor-default">
            <Award className="w-4 h-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
            <span>Validación de Estadía</span>
          </div>

          <div className="flex items-center space-x-3 px-3.5 py-2.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 cursor-default">
            <GraduationCap className="w-4 h-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
            <span>Revisión de Kárdex</span>
          </div>
        </div>

        {/* Estado del Sistema y Base de Datos Neon */}
        <div className="p-4 border-t border-slate-800 bg-[#0c1018]/80 text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
              <span>Servidor Neon DB:</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              dbStatus?.fuente === 'neon'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {dbStatus?.fuente === 'neon' ? 'Neon Serverless' : 'Respaldo Local'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
              <span>Campus Activo:</span>
            </span>
            <span className="font-semibold text-white">Sede CAM</span>
          </div>

          <div className="pt-1 text-[10px] text-slate-400 text-center border-t border-slate-800/80">
            Versión 2026.1 · Licenciatura Mixta
          </div>
        </div>
      </div>
    </aside>
  );
}
