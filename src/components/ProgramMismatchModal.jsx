import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';

export default function ProgramMismatchModal({ 
  detectedProgram, 
  currentProgram, 
  onConfirmSwitch, 
  onDismiss 
}) {
  if (!detectedProgram) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center space-x-3 text-amber-600">
          <div className="p-2 bg-amber-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-amber-700" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Discrepancia de Programa Académico
            </h3>
            <span className="text-[11px] text-slate-500">Validación de correspondencia de plan</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          El archivo de kárdex cargado corresponde al programa <strong className="text-slate-900 font-mono">({detectedProgram})</strong>, mientras que en el sistema se encuentra seleccionada la carrera <strong className="text-slate-900 font-mono">({currentProgram})</strong>.
        </p>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500 text-[11px]">Programa en PDF:</span>
            <span className="font-mono font-bold text-amber-800">{detectedProgram}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-[11px]">Programa Seleccionado:</span>
            <span className="font-mono font-bold text-slate-800">{currentProgram}</span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Continuar de todos modos
          </button>
          <button
            onClick={onConfirmSwitch}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-black transition-colors flex items-center space-x-1.5"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Aceptar y Procesar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
