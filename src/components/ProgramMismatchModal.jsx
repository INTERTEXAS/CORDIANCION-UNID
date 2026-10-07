import React from 'react';
import { AlertTriangle, Check, ArrowRight } from 'lucide-react';

export default function ProgramMismatchModal({ 
  detectedProgram, 
  currentProgram, 
  onConfirmSwitch, 
  onDismiss 
}) {
  if (!detectedProgram) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface-1 rounded-3xl shadow-glass-lg border border-border max-w-md w-full p-6 space-y-4 animate-scale-in transition-theme">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-500/15 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-text-primary leading-tight">
              Kárdex en Apartado Incorrecto
            </h3>
            <span className="text-[11px] text-text-muted">Validación de correspondencia de plan</span>
          </div>
        </div>

        <p className="text-[13px] text-text-secondary leading-relaxed">
          Las materias de este alumno pertenecen a <strong className="text-text-primary font-mono">({detectedProgram})</strong>, pero estás en el apartado de <strong className="text-text-primary font-mono">({currentProgram})</strong>.
        </p>

        <div className="p-3.5 bg-surface-2 rounded-2xl text-[12px] space-y-2 transition-theme">
          <div className="flex justify-between items-center">
            <span className="text-text-muted">Programa Detectado:</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{detectedProgram}</span>
          </div>
          <div className="flex items-center justify-center text-text-muted">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-muted">Programa Actual:</span>
            <span className="font-mono font-bold text-text-primary">{currentProgram}</span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-1">
          <button
            onClick={onDismiss}
            className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer"
          >
            Mantener en este mapa
          </button>
          <button
            onClick={onConfirmSwitch}
            className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-slate-950 bg-accent hover:bg-accent-hover transition-colors flex items-center space-x-1.5 shadow-sm hover:shadow-glow-gold cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Cambiar al mapa correcto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
