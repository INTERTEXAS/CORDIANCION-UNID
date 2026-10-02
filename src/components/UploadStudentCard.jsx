import React, { useRef, useState } from 'react';
import { Upload, Database } from 'lucide-react';

export default function UploadStudentCard({ carrera, onUploadPdf, onLoadBatchDemo, onOpenNeonManager }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPdf(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUploadPdf(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`bg-white rounded-lg border overflow-hidden transition-all duration-200 max-w-2xl mx-auto my-8 shadow-sm ${
        isDragOver ? 'border-[#F2B705] ring-4 ring-[#F2B705]/20' : 'border-slate-200'
      }`}
    >
      {/* Input de archivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {/* Cabecera institucional oscura */}
      <div className="bg-[#111622] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            UNIVERSIDAD INTERAMERICANA PARA EL DESARROLLO
          </div>
          <div className="text-sm font-bold text-white tracking-tight mt-0.5">
            Sistema de Auditoría Académica
          </div>
        </div>
        <img 
          src="/unid-logo.png" 
          alt="UNID" 
          className="w-9 h-9 rounded-lg object-contain flex-shrink-0 border border-slate-700" 
        />
      </div>

      {/* Cuerpo del formulario */}
      <div className={`px-6 py-6 space-y-4 ${isDragOver ? 'bg-amber-50/30' : ''}`}>
        {/* Título y contexto */}
        <div className="space-y-1">
          <h3 className="text-sm font-black text-[#111622] uppercase tracking-tight">
            Validador de Kárdex y Auditoría de Generación
          </h3>
          <p className="font-mono text-[10px] text-slate-500 font-semibold tracking-tight">
            {carrera?.codigo || 'LIC-COFI-18'} · {carrera?.encabezado_plan || 'MAPA DE EJECUCIÓN PARA EL PLAN 2018'}
          </p>
        </div>

        {/* Zona de drop */}
        <div className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${
          isDragOver ? 'border-[#F2B705] bg-amber-50/50' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Arrastre o seleccione el archivo PDF oficial: admite tanto el <strong>kárdex individual</strong> como el <strong>reporte consolidado de grupo</strong> (Reporte de materias acreditadas) de cualquier cantidad de alumnos.
          </p>
        </div>

        {/* Botones principales */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#111622] hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#F2B705]" strokeWidth={1.5} />
            <span>Subir Archivo PDF</span>
          </button>

          {onOpenNeonManager && (
            <button
              type="button"
              onClick={onOpenNeonManager}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Consultar BD (Neon)</span>
            </button>
          )}

          {onLoadBatchDemo && (
            <button
              type="button"
              onClick={onLoadBatchDemo}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              <span>Probar con Reporte de Grupo (36 Alumnos)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
