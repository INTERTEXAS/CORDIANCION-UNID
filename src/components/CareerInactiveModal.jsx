import React from 'react';
import { Layers, ArrowLeft } from 'lucide-react';

export default function CareerInactiveModal({ carrera, onSelectActive }) {
  if (!carrera || carrera.activa) return null;

  return (
    <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
      <div className="bg-surface-1 rounded-3xl border border-border p-10 max-w-xl mx-auto shadow-card text-center space-y-4 transition-theme">
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
          <Layers className="w-7 h-7" strokeWidth={1.5} />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Plan en Proceso de Integración
          </span>
          <h3 className="text-[16px] font-extrabold text-text-primary pt-3">
            {carrera.nombre}
          </h3>
          <p className="font-mono text-[12px] text-text-muted font-semibold">
            {carrera.codigo} · {carrera.encabezado_plan || 'Plan Mixto Federal'}
          </p>
        </div>

        <p className="text-[13px] text-text-secondary leading-relaxed max-w-md mx-auto">
          El mapa curricular digital y las reglas de seriación para esta licenciatura se encuentran en fase de homologación ante la Dirección de Servicios Escolares UNID.
        </p>

        <div className="pt-3">
          <button
            onClick={onSelectActive}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-slate-950 text-[13px] font-bold rounded-xl shadow-sm hover:shadow-glow-gold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Volver a Contabilidad y Finanzas (LIC-COFI-18)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
