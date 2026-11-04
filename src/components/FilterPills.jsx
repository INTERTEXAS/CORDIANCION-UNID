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
      activeClass: 'bg-slate-900 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
    },
    {
      id: 'ORD',
      label: '1.ª Oportunidad',
      count: counts.ord,
      icon: CheckCircle2,
      dotColor: 'bg-emerald-500',
      activeClass: 'bg-emerald-700 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-emerald-50/60 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
    },
    {
      id: 'REC',
      label: 'Recursadas',
      count: counts.rec,
      icon: RotateCw,
      dotColor: 'bg-amber-500',
      activeClass: 'bg-amber-600 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100'
    },
    {
      id: 'RE',
      label: 'Modo RE',
      count: counts.re,
      icon: FileCheck,
      dotColor: 'bg-sky-500',
      activeClass: 'bg-sky-700 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-sky-50/70 text-sky-800 border-sky-200 hover:bg-sky-100'
    },
    {
      id: 'ADEUDO',
      label: 'Adeudos',
      count: counts.adeudo,
      icon: XCircle,
      dotColor: 'bg-rose-500',
      activeClass: 'bg-rose-700 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-rose-50/80 text-rose-800 border-rose-200 hover:bg-rose-100'
    },
    {
      id: 'OMITIDA',
      label: 'Omitidas',
      count: counts.omitida,
      icon: AlertTriangle,
      dotColor: 'bg-orange-500',
      activeClass: 'bg-orange-600 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-orange-50/80 text-orange-800 border-orange-200 hover:bg-orange-100'
    },
    {
      id: 'OU',
      label: 'Oportunidad Utilizada',
      count: counts.ou,
      icon: Info,
      dotColor: 'bg-purple-500',
      activeClass: 'bg-purple-700 text-white shadow-2xs font-semibold',
      inactiveClass: 'bg-purple-50/80 text-purple-800 border-purple-200 hover:bg-purple-100'
    }
  ];

  // Separar filtros activos (con asignaturas registradas) de los filtros en cero
  const activeFilters = filters.filter(f => f.id === 'TODAS' || f.count > 0);
  const zeroFilters = filters.filter(f => f.id !== 'TODAS' && f.count === 0);

  return (
    <div className="flex flex-wrap items-center gap-2 select-none w-full text-xs">
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mr-1">
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
                isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-700'
              }`}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtros Secundarios sin incidencias (Cero registros) en estilo discreto sin contaminar la vista */}
      {zeroFilters.length > 0 && (
        <div className="inline-flex flex-wrap items-center gap-1 border-l border-slate-200 pl-2 ml-1">
          {zeroFilters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onFilterChange(isActive ? 'TODAS' : f.id)}
                className={`px-2 py-0.5 rounded text-[11px] border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                  isActive 
                    ? 'bg-slate-800 text-white border-slate-800 font-semibold' 
                    : 'bg-transparent text-slate-400 border-slate-200/70 hover:text-slate-600 hover:border-slate-300'
                }`}
                title={`${f.label}: 0 asignaturas registradas`}
              >
                <span>{f.label}</span>
                <span className="text-[10px] font-mono text-slate-400">0</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
