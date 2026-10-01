import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export default function UploadStudentCard({ carrera, onUploadPdf }) {
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
      className={`bg-white rounded-2xl border transition-all duration-200 p-10 max-w-xl mx-auto my-8 shadow-sm text-center space-y-4 ${
        isDragOver ? 'border-[#F2B705] ring-4 ring-[#F2B705]/20 bg-amber-50/20' : 'border-slate-200'
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

      {/* Recuadro suave crema/dorado con bordes redondeados e icono vectorial en tono ámbar */}
      <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
        <Upload className="w-7 h-7 text-amber-600" strokeWidth={1.5} />
      </div>

      {/* Etiqueta tipo cápsula en tono ámbar suave y títulos */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
          AUDITORÍA CURRICULAR UNID
        </span>

        <h3 className="text-base font-extrabold text-[#111622] pt-2 uppercase">
          VALIDADOR DE KÁRDEX Y DICTAMEN DE ESTADÍA
        </h3>

        <p className="font-mono text-xs text-slate-500 font-semibold">
          Clave Oficial: {carrera?.codigo || 'LIC-COFI-18'} · {carrera?.encabezado_plan || 'MAPA DE EJECUCIÓN PARA EL PLAN 2018'}
        </p>
      </div>

      {/* Párrafo descriptivo institucional */}
      <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
        Seleccione o arrastre el archivo PDF del kárdex del estudiante (Detalle de selección de cursos y estado de cuenta) para analizar automáticamente su trayectoria académica, historial de intentos y elegibilidad para Estadía Empresarial.
      </p>

      {/* Botón principal centrado abajo estilo cápsula oscura */}
      <div className="pt-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#111622] hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4 text-white" strokeWidth={1.5} />
          <span>Cargar Kárdex de Alumno (PDF)</span>
        </button>
      </div>
    </div>
  );
}
