import React, { useRef, useState } from 'react';
import { Upload, Database, FileUp, Users, ArrowRight } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="w-full max-w-xl">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />

        {/* Card */}
        <div className={`bg-surface-1 rounded-3xl border overflow-hidden transition-all duration-300 shadow-card hover:shadow-card-hover ${
          isDragOver ? 'border-accent ring-4 ring-accent/15 scale-[1.01]' : 'border-border'
        }`}>
          {/* Header strip */}
          <div className="bg-gradient-to-r from-[#0F1319] to-[#1a2030] px-6 py-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                Universidad Interamericana para el Desarrollo
              </div>
              <div className="text-[15px] font-bold text-white tracking-tight mt-1">
                Sistema de Auditoría Académica
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
              <img 
                src="/unid-logo.png" 
                alt="UNID" 
                className="w-8 h-8 rounded-lg object-contain" 
              />
            </div>
          </div>

          {/* Body */}
          <div className={`px-6 py-6 space-y-5 transition-colors ${isDragOver ? 'bg-accent-soft' : ''}`}>
            {/* Context */}
            <div className="space-y-1">
              <h3 className="text-[15px] font-bold text-text-primary">
                Validador de Kárdex y Auditoría de Generación
              </h3>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                {carrera?.codigo || 'LIC-COFI-18'} · {carrera?.encabezado_plan || 'Plan 2018'}
              </p>
            </div>

            {/* Drop zone */}
            <div 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
                isDragOver 
                  ? 'border-accent bg-accent-soft scale-[1.01]' 
                  : 'border-border hover:border-accent/40 bg-surface-2/50 hover:bg-accent-soft/30'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-colors ${
                isDragOver ? 'bg-accent/20 text-accent' : 'bg-surface-3/60 text-text-muted group-hover:bg-accent/10 group-hover:text-accent'
              }`}>
                <FileUp className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-semibold text-text-primary mb-1">
                Arrastre su archivo PDF aquí
              </p>
              <p className="text-[12px] text-text-muted leading-relaxed max-w-sm mx-auto">
                Admite kárdex individual y reporte consolidado de grupo con cualquier cantidad de alumnos.
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-accent hover:bg-accent-hover text-slate-950 text-[13px] font-bold rounded-xl shadow-sm hover:shadow-glow-gold transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" strokeWidth={2} />
                <span>Subir PDF</span>
              </button>

              {onOpenNeonManager && (
                <button
                  type="button"
                  onClick={onOpenNeonManager}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-surface-2 hover:bg-surface-3 text-text-primary border border-border text-[13px] font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <Database className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span>Base de datos</span>
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
