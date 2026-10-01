import React from 'react';
import { Layers, ArrowLeft } from 'lucide-react';

export default function CareerInactiveModal({ carrera, onSelectActive }) {
  if (!carrera || carrera.activa) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-xl mx-auto my-8 shadow-sm text-center space-y-4">
      <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
        <Layers className="w-7 h-7" strokeWidth={1.5} />
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Plan en Proceso de Integración
        </span>
        <h3 className="text-base font-extrabold text-slate-900 pt-2">
          {carrera.nombre}
        </h3>
        <p className="font-mono text-xs text-slate-500 font-semibold">
          Clave Oficial: {carrera.codigo} · {carrera.encabezado_plan || 'Plan Mixto Federal'}
        </p>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
        El mapa curricular digital y las reglas de seriación para esta licenciatura se encuentran en fase de homologación ante la Dirección de Servicios Escolares UNID.
      </p>

      <div className="pt-3">
        <button
          onClick={onSelectActive}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-white" strokeWidth={1.5} />
          <span>Volver a Contabilidad y Finanzas (LIC-COFI-18)</span>
        </button>
      </div>
    </div>
  );
}
