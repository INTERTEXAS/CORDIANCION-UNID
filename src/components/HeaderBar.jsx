import React, { useRef, useState } from 'react';
import { 
  Upload, 
  RotateCcw, 
  Download, 
  GraduationCap, 
  ChevronDown,
  Sparkles,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  Users,
  Sun,
  Moon,
  Check,
  Briefcase,
  Scale,
  Compass,
  Layers,
  FolderTree
} from 'lucide-react';
import { ALUMNOS_DEMO } from '../data/demoStudents';
import { useTheme } from '../context/ThemeContext';
import { resolverNombreOficialCarrera } from '../data/carrerasData';

const COORDINADORAS_CONFIG = [
  {
    id: 'laura',
    nombreDisplay: 'LAURA ANGÉLICA ARA ANGULO',
    icon: Briefcase,
    areaLabel: 'Ciencias Económico-Administrativas',
    matches: (carrera) => {
      const codigo = (carrera?.codigo || '').toUpperCase();
      // Las 3 carreras oficiales de Laura según estructura institucional:
      const lauraKeys = ['COFI', 'DAEM', 'EJCO'];
      return lauraKeys.some(k => codigo.includes(k));
    },
    containerClass: 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/40',
    headerClass: 'text-purple-700 dark:text-purple-300 font-bold bg-purple-100 dark:bg-purple-900/40',
    itemClass: 'hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800/40'
  },
  {
    id: 'avelina',
    nombreDisplay: 'AVELINA GARCÍA ROMEO',
    icon: Compass,
    areaLabel: 'Diseño, Administración, Mercadotecnia e Ingeniería',
    matches: (carrera) => {
      const codigo = (carrera?.codigo || '').toUpperCase();
      // Las 4 carreras oficiales de Ave según sistema institucional:
      // DSGD, EJAD, MEES, SYSC
      const aveKeys = ['DSGD', 'EJAD', 'MEES', 'SYSC'];
      return aveKeys.some(k => codigo.includes(k));
    },
    containerClass: 'bg-pink-50/50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800/40',
    headerClass: 'text-pink-700 dark:text-pink-300 font-bold bg-pink-100 dark:bg-pink-900/40',
    itemClass: 'hover:bg-pink-50 dark:hover:bg-pink-900/20 border-pink-200 dark:border-pink-800/40'
  },
  {
    id: 'yessica',
    nombreDisplay: 'YESSICA INURRETA PAVÓN',
    icon: Scale,
    areaLabel: 'Arquitectura, Derecho y Educación',
    matches: (carrera) => {
      const codigo = (carrera?.codigo || '').toUpperCase();
      // Las 4 carreras oficiales de Yessica según estructura institucional:
      // ARQU, DERE, EJDE, EJED
      const yessKeys = ['ARQU', 'DERE', 'EJDE', 'EJED'];
      return yessKeys.some(k => codigo.includes(k));
    },
    containerClass: 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/40',
    headerClass: 'text-orange-700 dark:text-orange-300 font-bold bg-orange-100 dark:bg-orange-900/40',
    itemClass: 'hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800/40'
  }
];

export default function HeaderBar({ 
  carreras, 
  carreraSeleccionada, 
  onSelectCarrera, 
  onUploadPdf, 
  onReset, 
  onExportPdf,
  onLoadDemo,
  onLoadBatchDemo,
  isProcessing,
  isExporting,
  hasAuditData,
  isSidebarOpen = true,
  onToggleSidebar,
  isWidgetsOpen = true,
  onToggleWidgets
}) {
  const fileInputRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Agrupamiento por coordinadora pasando el objeto carrera completo
  const gruposCoordinadoras = COORDINADORAS_CONFIG.map(config => {
    const items = (carreras || []).filter(c => config.matches(c));
    return {
      ...config,
      carreras: items
    };
  });

  const codigosAgrupados = new Set(gruposCoordinadoras.flatMap(g => g.carreras.map(c => c.codigo)));
  const carrerasSinGrupo = (carreras || []).filter(c => !codigosAgrupados.has(c.codigo));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPdf(file);
      e.target.value = '';
    }
  };

  return (
    <header className="h-14 bg-surface-1 border-b border-border px-4 flex items-center justify-between sticky top-0 z-10 select-none transition-theme">
      {/* Left: Sidebar toggle + Career Selector */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer flex-shrink-0"
          title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} />
          ) : (
            <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />
          )}
        </button>

        <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

        <div className="flex items-center space-x-1.5 text-text-muted">
          <GraduationCap className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <span className="text-[12px] font-semibold text-text-secondary hidden sm:inline">Programa:</span>
        </div>

        {/* Custom Dropdown */}
        <div className="relative">
          {isDropdownOpen && (
            <div 
              className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] z-40 transition-opacity"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

          <div className="relative z-50">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between min-w-[260px] max-w-[440px] bg-surface-2 hover:bg-surface-3 border border-border text-text-primary text-[12px] font-semibold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all shadow-xs"
            >
              <span className="truncate pr-3">
                {carreraSeleccionada 
                  ? `${carreraSeleccionada.codigo} · ${resolverNombreOficialCarrera(carreraSeleccionada)}` 
                  : 'Seleccione programa...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full md:w-[560px] bg-surface-1 rounded-2xl shadow-glass-lg border border-border overflow-hidden animate-scale-in">
                <div className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em] border-b border-border-subtle bg-surface-2/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FolderTree className="w-3.5 h-3.5 text-accent" strokeWidth={1.8} />
                    <span>Programas por Coordinación Académica</span>
                  </div>
                  <span className="font-mono text-[9px] bg-surface-3 px-2 py-0.5 rounded-full text-text-secondary font-semibold">
                    {carreras.length} Licenciaturas
                  </span>
                </div>
                <div className="max-h-[68vh] overflow-y-auto p-3 space-y-3">
                  {gruposCoordinadoras.map((grupo) => {
                    if (grupo.carreras.length === 0) return null;
                    const GrupoIcon = grupo.icon;
                    return (
                      <div 
                        key={grupo.id} 
                        className={`rounded-xl border p-2.5 space-y-1.5 ${grupo.containerClass}`}
                      >
                        {/* Encabezado del Grupo de Coordinadora */}
                        <div className={`px-3 py-2 rounded-lg text-[11px] flex items-center justify-between shadow-xs ${grupo.headerClass}`}>
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="p-1 rounded-md bg-white/70 dark:bg-black/25 shrink-0 shadow-2xs">
                              <GrupoIcon className="w-3.5 h-3.5" strokeWidth={2.2} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="truncate tracking-wide font-extrabold">{grupo.nombreDisplay}</span>
                              <span className="text-[9.5px] font-medium opacity-80 truncate">{grupo.areaLabel}</span>
                            </div>
                          </div>
                          <span className="text-[10px] opacity-90 shrink-0 font-mono font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/25 ml-2 shadow-2xs">
                            {grupo.carreras.length} {grupo.carreras.length === 1 ? 'carrera' : 'carreras'}
                          </span>
                        </div>

                        {/* Lista de carreras del grupo */}
                        <div className="space-y-1">
                          {grupo.carreras.map((carrera) => {
                            const isSelected = carreraSeleccionada?.codigo === carrera.codigo;
                            const nombreCompleto = resolverNombreOficialCarrera(carrera);
                            return (
                              <button
                                key={carrera.codigo}
                                onClick={() => {
                                  onSelectCarrera(carrera);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border ${grupo.itemClass} ${
                                  isSelected 
                                    ? 'bg-surface-1 font-semibold shadow-xs ring-1 ring-current' 
                                    : 'border-transparent bg-surface-1/70'
                                }`}
                              >
                                <div className="flex flex-col min-w-0 pr-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-[11px] font-extrabold text-text-primary tracking-wide">
                                      {carrera.codigo}
                                    </span>
                                    {carrera.activa ? (
                                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                                        Vigente
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-1.5 py-0.2 rounded-full">
                                        Próximamente
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] mt-1 leading-snug text-text-primary/90 font-medium">
                                    {nombreCompleto}
                                  </span>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-accent shrink-0 ml-1" strokeWidth={2.5} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Fallback para carreras sin coordinadora asignada */}
                  {carrerasSinGrupo.length > 0 && (
                    <div className="rounded-xl border border-border p-2.5 bg-surface-2/40 space-y-1.5">
                      <div className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-surface-3 text-text-secondary flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Layers className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>OTRAS LICENCIATURAS</span>
                        </div>
                        <span className="text-[10px] font-mono">{carrerasSinGrupo.length}</span>
                      </div>
                      <div className="space-y-1">
                        {carrerasSinGrupo.map((carrera) => {
                          const isSelected = carreraSeleccionada?.codigo === carrera.codigo;
                          const nombreCompleto = resolverNombreOficialCarrera(carrera);
                          return (
                            <button
                              key={carrera.codigo}
                              onClick={() => {
                                onSelectCarrera(carrera);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border hover:bg-surface-2 ${
                                isSelected ? 'bg-surface-1 font-semibold shadow-xs' : 'border-transparent bg-surface-1/70'
                              }`}
                            >
                              <div className="flex flex-col min-w-0 pr-3">
                                <span className="font-mono text-[11px] font-extrabold text-text-primary">{carrera.codigo}</span>
                                <span className="text-[11px] text-text-primary/90 mt-0.5">{nombreCompleto}</span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-accent shrink-0 ml-1" strokeWidth={2} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-1.5">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />

        {/* Demo dropdown */}
        <div className="relative">
          {isDemoOpen && (
            <div 
              className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] z-40 transition-opacity"
              onClick={() => setIsDemoOpen(false)}
            />
          )}

          <div className="relative z-50">
            <button
              type="button"
              onClick={() => setIsDemoOpen(!isDemoOpen)}
              className="flex items-center space-x-1.5 px-3 py-2 text-[12px] font-medium text-text-secondary bg-surface-2 hover:bg-surface-3 rounded-xl border border-border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
              title="Cargar ejemplos preconfigurados"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
              <span className="hidden md:inline">Demo</span>
              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isDemoOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            </button>

            {isDemoOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-surface-1 rounded-2xl shadow-glass-lg border border-border py-1 animate-scale-in overflow-hidden">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted border-b border-border-subtle bg-surface-2/50">
                  Expedientes de Prueba
                </div>
                {ALUMNOS_DEMO.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => {
                      onLoadDemo(demo);
                      setIsDemoOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-[12px] text-text-secondary hover:bg-surface-2 hover:text-text-primary flex flex-col transition-colors border-b border-border-subtle last:border-0 cursor-pointer"
                  >
                    <span className="font-semibold text-text-primary">{demo.label}</span>
                    <span className="text-[11px] text-text-muted mt-0.5">{demo.matricula} · {demo.nombre}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-slate-950 text-[12px] font-bold rounded-xl shadow-sm hover:shadow-glow-gold transition-all disabled:opacity-60 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              <span className="hidden sm:inline">Procesando…</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Subir Kárdex</span>
            </>
          )}
        </button>

        {/* Reset button */}
        <button
          onClick={onReset}
          className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-xl border border-border transition-all cursor-pointer"
          title="Limpiar consulta"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Export button */}
        <button
          onClick={onExportPdf}
          disabled={!hasAuditData || isExporting}
          className="flex items-center space-x-1.5 px-3 py-2 bg-surface-2 dark:bg-white/[0.06] hover:bg-surface-3 dark:hover:bg-white/[0.1] text-text-primary text-[12px] font-bold rounded-xl border border-border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Exportar dictamen oficial de 2 hojas"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              <span className="hidden sm:inline">Generando…</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </>
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all cursor-pointer"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
          ) : (
            <Moon className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>

        {/* Widgets toggle */}
        <button
          onClick={onToggleWidgets}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isWidgetsOpen 
              ? 'bg-accent/10 text-accent border-accent/20' 
              : 'bg-surface-2 hover:bg-surface-3 text-text-muted border-border'
          }`}
          title="Panel de widgets"
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
