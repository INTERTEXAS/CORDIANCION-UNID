import React, { useRef } from 'react';
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
  Users
} from 'lucide-react';
import { ALUMNOS_DEMO } from '../data/demoStudents';

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPdf(file);
      e.target.value = '';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-300 px-5 flex items-center justify-between sticky top-0 z-10 select-none">
      {/* Selector de Licenciatura y Toggle de Menú Lateral */}
      <div className="flex items-center space-x-2">
        {/* Botón de alternancia de menú lateral izquierdo */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors mr-1 cursor-pointer flex-shrink-0"
          title={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
          )}
        </button>

        <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-500">
          <GraduationCap className="w-4 h-4 text-[#F2B705]" strokeWidth={1.5} />
          <span className="font-semibold text-slate-700 hidden sm:inline">Licenciatura:</span>
        </div>

        <div className="relative">
          <select
            value={carreraSeleccionada?.codigo || 'LIC-COFI-18'}
            onChange={(e) => {
              const selected = carreras.find(c => c.codigo === e.target.value);
              if (selected) onSelectCarrera(selected);
            }}
            className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg pl-3 pr-8 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent transition-all max-w-sm sm:max-w-md shadow-sm"
          >
            {carreras.map((carrera) => (
              <option key={carrera.codigo} value={carrera.codigo}>
                {carrera.codigo} - {carrera.nombre} {!carrera.activa ? '[En integración / Próximamente]' : '[Plan Vigente]'}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
        </div>

        {!carreraSeleccionada?.activa && (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full hidden md:inline">
            Próximamente
          </span>
        )}
      </div>

      {/* Acciones Principales y Toggle de Panel Derecho */}
      <div className="flex items-center space-x-2">
        {/* Input de archivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />

        {/* Cargar Casos Demo para Verificación Inmediata */}
        <div className="relative group">
          <button
            type="button"
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all cursor-pointer"
            title="Cargar ejemplos institucionales preconfigurados"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.5} />
            <span className="hidden md:inline">Casos Demo</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
          </button>

          <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 hidden group-hover:block z-30">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              Expedientes de Prueba
            </div>
            {onLoadBatchDemo && (
              <div className="p-1 border-b border-slate-100 bg-amber-50/60">
                <button
                  type="button"
                  onClick={onLoadBatchDemo}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-amber-950 hover:bg-amber-100/80 rounded flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <span className="font-bold block text-slate-900">Generación Completa (36 Alumnos)</span>
                    <span className="text-[10px] text-amber-800">Reporte oficial catalogo.pdf (LIC-COFI-18)</span>
                  </div>
                </button>
              </div>
            )}
            {ALUMNOS_DEMO.map((demo) => (
              <button
                key={demo.id}
                onClick={() => onLoadDemo(demo)}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex flex-col transition-colors border-b border-slate-50 last:border-0 cursor-pointer"
              >
                <span className="font-semibold text-slate-900">{demo.label}</span>
                <span className="text-[11px] text-slate-500">{demo.matricula} · {demo.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Botón: Subir PDF Kárdex */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#F2B705] hover:bg-[#dfa500] text-slate-950 text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" strokeWidth={1.5} />
              <span className="hidden sm:inline">Procesando...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-slate-950" strokeWidth={1.5} />
              <span className="hidden sm:inline">Subir Kárdex</span>
            </>
          )}
        </button>

        {/* Botón: Limpiar / Nueva Consulta */}
        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer"
          title="Restablecer vista a consulta en blanco"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="hidden lg:inline">Limpiar</span>
        </button>

        {/* Botón: Exportar Dictamen Oficial (PDF 2 Hojas) */}
        <button
          onClick={onExportPdf}
          disabled={!hasAuditData || isExporting}
          className="flex items-center space-x-2 px-3.5 py-2 bg-[#181C24] hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Descarga el dictamen oficial de 2 hojas en formato horizontal"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" strokeWidth={1.5} />
              <span className="hidden sm:inline">Generando...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-white" strokeWidth={1.5} />
              <span className="hidden sm:inline">Exportar Dictamen (PDF)</span>
            </>
          )}
        </button>

        {/* Botón para abrir el panel deslizable de widgets */}
        <button
          onClick={onToggleWidgets}
          className={`px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-semibold ${
            isWidgetsOpen 
              ? 'bg-[#181C24] text-white border-[#181C24] shadow-xs' 
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
          title={isWidgetsOpen ? "Cerrar panel de widgets" : "Abrir panel deslizable de widgets (Dictamen e Historial)"}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-current" strokeWidth={1.5} />
          <span className="hidden xl:inline">Panel Widgets</span>
          {hasAuditData && (
            <span className="w-2 h-2 rounded-full bg-[#F2B705]" />
          )}
        </button>
      </div>
    </header>
  );
}
