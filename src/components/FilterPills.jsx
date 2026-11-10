import React from 'react';
import { 
  CheckCircle2, 
  RotateCw, 
  FileCheck, 
  XCircle, 
  AlertTriangle, 
  Layers,
  Info
} from 'lucide-react';

export default function FilterPills({ 
  activeFilter = 'TODAS', 
  onFilterChange, 
  counts = {
    todas: 37,
    ord: 0,
    rec: 0,
    re: 0,
    adeudo: 0,
    omitida: 0,
    ou: 0
  } 
}) {
  const filters = [
    {
      id: 'TODAS',
      label: 'Todas',
      count: counts.todas,
      icon: Layers,
      activeClass: 'bg-slate-900 dark:bg-surface-3 text-white dark:text-text-primary shadow-2xs font-semibold border border-transparent dark:border-border',
      inactiveClass: 'bg-white dark:bg-surface-1 text-slate-700 dark:text-text-secondary border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-surface-2 hover:border-slate-300 dark:hover:border-slate-600'
    },
    {
      id: 'ORD',
      label: '1.ª Oportunidad',
      count: counts.ord,
      icon: CheckCircle2,
      dotColor: 'bg-emerald-500',
      activeClass: 'bg-emerald-700 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-emerald-50/60 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-500/20'
    },
    {
      id: 'REC',
      label: 'Recursadas',
      count: counts.rec,
      icon: RotateCw,
      dotColor: 'bg-amber-500',
      activeClass: 'bg-amber-600 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-amber-50/70 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20'
    },
    {
      id: 'RE',
      label: 'Modo RE',
      count: counts.re,
      icon: FileCheck,
      dotColor: 'bg-sky-500',
      activeClass: 'bg-sky-700 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-sky-50/70 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-500/30 hover:bg-sky-100 dark:hover:bg-sky-500/20'
    },
    {
      id: 'ADEUDO',
      label: 'Adeudos',
      count: counts.adeudo,
      icon: XCircle,
      dotColor: 'bg-rose-500',
      activeClass: 'bg-rose-700 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-rose-50/80 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/20'
    },
    {
      id: 'OMITIDA',
      label: 'Omitidas',
      count: counts.omitida,
      icon: AlertTriangle,
      dotColor: 'bg-orange-500',
      activeClass: 'bg-orange-600 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-orange-50/80 dark:bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-500/30 hover:bg-orange-100 dark:hover:bg-orange-500/20'
    },
    {
      id: 'OU',
      label: 'Oportunidad Utilizada',
      count: counts.ou,
      icon: Info,
      dotColor: 'bg-purple-500',
      activeClass: 'bg-purple-700 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-purple-50/80 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 hover:bg-purple-100 dark:hover:bg-purple-500/20'
    }
  ];

  // Separar filtros activos (con asignaturas registradas) de los filtros en cero
  const activeFilters = filters.filter(f => f.id === 'TODAS' || f.count > 0);
  const zeroFilters = filters.filter(f => f.id !== 'TODAS' && f.count === 0);

  return (
    <div className="flex flex-wrap items-center gap-2 select-none w-full text-xs">
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-text-muted font-semibold mr-1">
        Filtros:
      </span>

      {/* Filtros Principales (Con Datos Reales) */}
      <div className="inline-flex flex-wrap items-center gap-1.5">
        {activeFilters.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(isActive ? 'TODAS' : f.id)}
              className={`px-2.5 py-1 rounded-md text-xs border transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                isActive ? f.activeClass : f.inactiveClass
              }`}
            >
              {f.dotColor && !isActive && (
                <span className={`w-1.5 h-1.5 rounded-full ${f.dotColor}`} />
              )}
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono font-bold leading-tight ${
                isActive ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-text-primary'
              }`}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtros Secundarios sin incidencias (Cero registros) en estilo discreto sin contaminar la vista */}
      {zeroFilters.length > 0 && (
        <div className="inline-flex flex-wrap items-center gap-1 border-l border-slate-200 dark:border-border pl-2 ml-1">
          {zeroFilters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onFilterChange(isActive ? 'TODAS' : f.id)}
                className={`px-2 py-0.5 rounded text-[11px] border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                  isActive 
                    ? 'bg-slate-800 dark:bg-surface-3 text-white dark:text-text-primary border-slate-800 dark:border-border font-semibold' 
                    : 'bg-transparent text-slate-400 dark:text-text-muted border-slate-200/70 dark:border-border hover:text-slate-600 dark:hover:text-text-secondary hover:border-slate-300 dark:hover:border-slate-500'
                }`}
                title={`${f.label}: 0 asignaturas registradas`}
              >
                <span>{f.label}</span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-text-muted">0</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
