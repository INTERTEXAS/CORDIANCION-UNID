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
      activeClass: 'bg-text-primary text-surface-1 shadow-sm',
      inactiveClass: 'bg-surface-2 text-text-secondary hover:bg-surface-3'
    },
    {
      id: 'ORD',
      label: '1.ª Oportunidad',
      count: counts.ord,
      icon: CheckCircle2,
      color: 'emerald',
      activeClass: 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm',
      inactiveClass: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
    },
    {
      id: 'REC',
      label: 'Recursadas',
      count: counts.rec,
      icon: RotateCw,
      color: 'amber',
      activeClass: 'bg-amber-600 dark:bg-amber-500 text-white shadow-sm',
      inactiveClass: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20'
    },
    {
      id: 'RE',
      label: 'Modo RE',
      count: counts.re,
      icon: FileCheck,
      color: 'sky',
      activeClass: 'bg-sky-600 dark:bg-sky-500 text-white shadow-sm',
      inactiveClass: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20'
    },
    {
      id: 'ADEUDO',
      label: 'Adeudos',
      count: counts.adeudo,
      icon: XCircle,
      color: 'rose',
      activeClass: 'bg-rose-600 dark:bg-rose-500 text-white shadow-sm',
      inactiveClass: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20'
    },
    {
      id: 'OMITIDA',
      label: 'Omitidas',
      count: counts.omitida,
      icon: AlertTriangle,
      color: 'orange',
      activeClass: 'bg-orange-600 dark:bg-orange-500 text-white shadow-sm',
      inactiveClass: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center select-none w-full">
      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mr-1 whitespace-nowrap">
        Filtros:
      </span>
      {filters.map((f) => {
        const Icon = f.icon;
        const isActive = activeFilter === f.id;
        const isZero = f.count === 0 && f.id !== 'TODAS';

        let buttonStyle = f.inactiveClass;
        if (isActive) {
          buttonStyle = f.activeClass;
        } else if (isZero) {
          buttonStyle = 'bg-surface-2 text-text-muted opacity-50 hover:opacity-80';
        }

        return (
          <button
            key={f.id}
            onClick={() => onFilterChange(isActive ? 'TODAS' : f.id)}
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-xl inline-flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${buttonStyle}`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
            <span>{f.label}</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-lg font-bold leading-none inline-block ${
              isActive 
                ? 'bg-white/25 text-white' 
                : 'bg-black/5 dark:bg-white/10 text-current'
            }`}>
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
