import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  ShieldCheck, 
  History, 
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { getEstatusInfo } from '../data/estatusAlumnosData';

export default function WidgetsColumn({ 
  auditData, 
  historialReciente = [], 
  onSelectHistorial,
  isOpen = false,
  onClose
}) {
  const estudiante = auditData?.estudiante;
  const resumen = auditData?.resumen;
  const materiasPrioritarias = auditData?.materiasPrioritarias || [];

  const esElegible = resumen?.esElegibleEstadia;

  // Render dynamically based on catalog
  const estatusInfo = estudiante ? getEstatusInfo(estudiante.estatus) : null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside 
        className={`fixed top-0 right-0 bottom-0 w-88 max-w-[90vw] bg-surface-0 border-l border-border shadow-glass-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="h-14 px-4 bg-surface-1 border-b border-border flex items-center justify-between shrink-0 transition-theme">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-accent/10 text-accent rounded-xl">
              <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-text-primary leading-tight">
                Panel de Widgets
              </h2>
              <p className="text-[10px] text-text-muted">
                Dictamen, Expediente e Historial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
            title="Cerrar panel"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 1. Sede y Coordinación */}
          <div className="bg-surface-1 rounded-2xl border border-border p-4 shadow-card transition-theme">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-border-subtle">
              <div className="p-1.5 bg-surface-2 rounded-xl text-text-secondary">
                <Building2 className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-text-primary leading-tight">
                  Sede CAM · Coordinación
                </h3>
                <p className="text-[11px] text-text-muted">Licenciaturas Mixtas</p>
              </div>
            </div>

            <div className="pt-3 space-y-2 text-[12px]">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Campus:</span>
                <span className="font-semibold text-text-primary">Sede CAM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">RVOE / Plan:</span>
                <span className="font-mono text-[11px] font-semibold text-text-secondary">Federal 2018</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Auditoría CPA:</span>
                <span className="font-medium text-text-secondary">31-julio-2026</span>
              </div>
            </div>
          </div>

          {/* 2. Expediente del Alumno */}
          <div className="bg-surface-1 rounded-2xl border border-border p-4 shadow-card transition-theme">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-surface-2 rounded-xl text-text-secondary">
                  <UserCheck className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-text-primary">Expediente del Alumno</h3>
                  <p className="text-[11px] text-text-muted">Datos del Kárdex</p>
                </div>
              </div>
              {estatusInfo && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${estatusInfo.color.split(' ')[0]} ${estatusInfo.color.split(' ')[1]}`}>
                  {estatusInfo.codigo} - {estatusInfo.descripcion}
                </span>
              )}
            </div>

            {estudiante ? (
              <div className="pt-3 space-y-2.5 text-[12px]">
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                    Nombre Completo
                  </span>
                  <span className="font-bold text-text-primary leading-snug block mt-0.5">
                    {estudiante.nombre}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                      Matrícula
                    </span>
                    <span className="font-mono font-bold text-text-primary text-[14px] mt-0.5 block">
                      {estudiante.matricula}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                      Programa
                    </span>
                    <span className="font-mono text-[12px] font-semibold text-text-secondary mt-0.5 block">
                      {estudiante.programa}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-text-muted text-[12px]">
                Sin estudiante activo en sesión
              </div>
            )}
          </div>

          {/* 3. Dictamen de Estadía */}
          <div className="bg-surface-1 rounded-2xl border border-border p-4 shadow-card transition-theme">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-border-subtle">
              <div className={`p-1.5 rounded-xl ${esElegible ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                {esElegible ? (
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <ShieldAlert className="w-4 h-4" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-text-primary">Dictamen de Estadía</h3>
                <p className="text-[11px] text-text-muted">Criterio normativo UNID</p>
              </div>
            </div>

            <div className="pt-3">
              {resumen ? (
                <div>
                  <div className={`p-3.5 rounded-xl text-center ${
                    esElegible 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' 
                      : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300'
                  }`}>
                    <div className="text-[11px] font-extrabold uppercase tracking-tight">
                      {resumen.dictamenEstadia}
                    </div>
                    <p className="text-[11px] mt-1.5 opacity-80 leading-relaxed">
                      {esElegible 
                        ? 'Cumple con el 100% de asignaturas aprobadas sin adeudos ni omisiones del 1.º al 6.º cuatrimestre.' 
                        : `Presenta ${resumen.adeudosQ1toQ6} adeudo(s) activo(s) y/o ${resumen.omitidasQ1toQ6} materia(s) omitida(s).`
                      }
                    </p>
                  </div>

                  {/* Materias Prioritarias */}
                  {!esElegible && materiasPrioritarias.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Materias Prioritarias</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{materiasPrioritarias.length}</span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {materiasPrioritarias.map((mat, i) => (
                          <div 
                            key={i}
                            className="p-2.5 rounded-xl bg-surface-2 text-[11px] space-y-1 transition-theme"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-text-primary">
                                {mat.clave}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${
                                mat.tipo === 'Adeudo Activo' 
                                  ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300' 
                                  : 'bg-orange-100 dark:bg-orange-500/15 text-orange-800 dark:text-orange-300'
                              }`}>
                                {mat.tipo}
                              </span>
                            </div>
                            <div className="text-text-secondary font-medium truncate">
                              {mat.nombre}
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-text-muted">
                              <span>Cuatrimestre {mat.cuatrimestre}.º</span>
                              {mat.conecta && (
                                <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-1.5 rounded-lg">
                                  Clase Conecta
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-text-muted text-[12px]">
                  Sin estudiante activo en sesión
                </div>
              )}
            </div>
          </div>

          {/* 4. Historial Reciente */}
          <div className="bg-surface-1 rounded-2xl border border-border p-4 shadow-card transition-theme">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-border-subtle">
              <div className="p-1.5 bg-surface-2 rounded-xl text-text-secondary">
                <History className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-text-primary">Historial Reciente</h3>
                <p className="text-[11px] text-text-muted">Últimos expedientes consultados</p>
              </div>
            </div>

            <div className="pt-2">
              {historialReciente.length > 0 ? (
                <div className="space-y-1">
                  {historialReciente.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectHistorial(item)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-surface-2 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="truncate mr-2">
                        <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent truncate">
                          {item.estudiante.nombre}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono">
                          {item.estudiante.matricula} · {item.estudiante.programa}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent flex-shrink-0 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-text-muted text-[12px]">
                  No hay consultas previas
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
