import React from 'react';
import { 
  CheckCircle2, 
  RotateCw, 
  FileCheck, 
  XCircle, 
  AlertTriangle, 
  Layers
} from 'lucide-react';

export default function FilterPills({ 
  activeFilter, 
  onFilterChange, 
  counts = {
    todas: 37,
    ord: 0,
    rec: 0,
    re: 0,
    adeudo: 0,
    omitida: 0
  } 
}) {
  const filters = [
    {
      id: 'TODAS',
      label: 'Todas',
      count: counts.todas,
      icon: Layers,
      activeClass: 'bg-slate-900 text-white shadow-sm border-slate-900',
      inactiveClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
    },
    {
      id: 'ORD',
      label: '1.ª Oportunidad',
      count: counts.ord,
      icon: CheckCircle2,
      activeClass: 'bg-[#059669] text-white shadow-sm border-[#059669]',
      inactiveClass: 'bg-[#ECFDF5] text-[#065F46] hover:bg-[#D1FAE5] border-[#A7F3D0]'
    },
    {
      id: 'REC',
      label: 'Recursadas',
      count: counts.rec,
      icon: RotateCw,
      activeClass: 'bg-[#D97706] text-white shadow-sm border-[#D97706]',
      inactiveClass: 'bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF3C7] border-[#FDE68A]'
    },
    {
      id: 'RE',
      label: 'Modo RE',
      count: counts.re,
      icon: FileCheck,
      activeClass: 'bg-[#0284C7] text-white shadow-sm border-[#0284C7]',
      inactiveClass: 'bg-[#F0F9FF] text-[#075985] hover:bg-[#E0F2FE] border-[#BAE6FD]'
    },
    {
      id: 'ADEUDO',
      label: 'Adeudos',
      count: counts.adeudo,
      icon: XCircle,
      activeClass: 'bg-[#DC2626] text-white shadow-sm border-[#DC2626]',
      inactiveClass: 'bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2] border-[#FECACA]'
    },
    {
      id: 'OMITIDA',
      label: 'Omitidas',
      count: counts.omitida,
      icon: AlertTriangle,
      activeClass: 'bg-[#EA580C] text-white shadow-sm border-[#EA580C]',
      inactiveClass: 'bg-[#FFF7ED] text-[#9A3412] hover:bg-[#FFEDD5] border-[#FED7AA]'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center select-none w-full">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 whitespace-nowrap">
        FILTROS DE AUDITORÍA:
      </span>
      {filters.map((f) => {
        const Icon = f.icon;
        const isActive = activeFilter === f.id;
        const isZero = f.count === 0 && f.id !== 'TODAS';

        // Estilo atenuado cuando el contador es 0 para no saturar visualmente
        let buttonStyle = f.inactiveClass;
        if (isActive) {
          buttonStyle = f.activeClass;
        } else if (isZero) {
          buttonStyle = 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600 opacity-60 hover:opacity-100';
        }

        return (
          <button
            key={f.id}
            onClick={() => onFilterChange(isActive ? 'TODAS' : f.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full inline-flex items-center gap-2 transition-all whitespace-nowrap border cursor-pointer ${buttonStyle}`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
            <span>{f.label}</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold leading-none inline-block ${
              isActive 
                ? 'bg-white/25 text-white' 
                : isZero
                ? 'bg-slate-200/70 text-slate-400'
                : 'bg-black/10 text-current'
            }`}>
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
