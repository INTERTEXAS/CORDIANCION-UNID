import React from 'react';
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

  return (
    <>
      {/* Backdrop oscuro con transición de opacidad */}
      <div 
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Deslizable desde el borde derecho */}
      <aside 
        className={`fixed top-0 right-0 bottom-0 w-88 max-w-[90vw] bg-slate-50 border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Cabecera del Drawer */}
        <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#181C24] text-white rounded-lg shadow-xs">
              <SlidersHorizontal className="w-4 h-4 text-[#F2B705]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 leading-tight">
                Panel de Widgets & Dictamen
              </h2>
              <p className="text-[10px] text-slate-500">
                Dictamen de Estadía, Expediente e Historial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar panel lateral"
          >
            <X className="w-4 h-4 strokeWidth={1.5}" />
          </button>
        </div>

        {/* Contenido con scroll de los 4 widgets */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* 1. Tarjeta de Sede y Coordinación */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
            <Building2 className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">
              Sede CAM · Coordinación
            </h3>
            <p className="text-[10px] text-slate-500">
              Coordinación de Licenciaturas Mixtas
            </p>
          </div>
        </div>

        <div className="pt-3 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span className="text-[11px] text-slate-400">Campus:</span>
            <span className="font-semibold text-slate-800">Sede CAM</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="text-[11px] text-slate-400">RVOE / Plan:</span>
            <span className="font-mono text-[11px] font-semibold text-slate-700">Federal 2018</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="text-[11px] text-slate-400">Auditoría CPA:</span>
            <span className="text-[11px] font-medium text-slate-700">31-julio-2026</span>
          </div>
        </div>
      </div>

      {/* 2. Tarjeta de Datos del Estudiante */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <UserCheck className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Expediente del Alumno
              </h3>
              <p className="text-[10px] text-slate-500">Datos validados del Kárdex</p>
            </div>
          </div>
          {estudiante?.estatus && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              estudiante.estatus === 'AC' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : estudiante.estatus === 'EG'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              {estudiante.estatus === 'AC' ? 'ACTIVO (AC)' : estudiante.estatus === 'EG' ? 'EGRESADO (EG)' : estudiante.estatus}
            </span>
          )}
        </div>

        {estudiante ? (
          <div className="pt-3 space-y-2.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nombre Completo:
              </span>
              <span className="font-bold text-slate-900 leading-snug block">
                {estudiante.nombre}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Matrícula:
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {estudiante.matricula}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Programa:
                </span>
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {estudiante.programa}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            Sin estudiante activo en sesión
          </div>
        )}
      </div>

      {/* 3. Tarjeta de "Pendientes y Dictamen de Estadía" */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
          <div className={`p-1.5 rounded-lg ${esElegible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {esElegible ? (
              <ShieldCheck className="w-4 h-4 text-emerald-700" strokeWidth={1.5} />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-700" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Dictamen de Estadía Empresarial
            </h3>
            <p className="text-[10px] text-slate-500">Criterio normativo oficial UNID</p>
          </div>
        </div>

        <div className="pt-3">
          {resumen ? (
            <div>
              {/* Badge de Dictamen */}
              <div className={`p-3 rounded-lg border text-center ${
                esElegible 
                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]' 
                  : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
              }`}>
                <div className="text-[11px] font-extrabold uppercase tracking-tight">
                  {resumen.dictamenEstadia}
                </div>
                <p className="text-[10px] mt-1 opacity-90 leading-tight">
                  {esElegible 
                    ? 'Cumple con el 100% de asignaturas aprobadas sin adeudos ni omisiones del 1.º al 6.º cuatrimestre.' 
                    : `Presenta ${resumen.adeudosQ1toQ6} adeudo(s) activo(s) y/o ${resumen.omitidasQ1toQ6} materia(s) omitida(s) en bloques previos.`
                  }
                </p>
              </div>

              {/* Lista de Materias Prioritarias */}
              {!esElegible && materiasPrioritarias.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Materias Prioritarias:</span>
                    <span className="text-rose-600 font-bold">{materiasPrioritarias.length}</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {materiasPrioritarias.map((mat, i) => (
                      <div 
                        key={i}
                        className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-800">
                            {mat.clave}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            mat.tipo === 'Adeudo Activo' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {mat.tipo}
                          </span>
                        </div>
                        <div className="text-slate-600 font-medium truncate">
                          {mat.nombre}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                          <span>Cuatrimestre {mat.cuatrimestre}.º</span>
                          {mat.conecta && (
                            <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">
                              Clase Conecta (CC)
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
            <div className="py-6 text-center text-slate-400 text-xs">
              Sin estudiante activo en sesión
            </div>
          )}
        </div>
      </div>

      {/* 4. Tarjeta de "Historial Reciente en Sesión" */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
            <History className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Historial Reciente en Sesión
            </h3>
            <p className="text-[10px] text-slate-500">Últimos expedientes consultados</p>
          </div>
        </div>

        <div className="pt-2">
          {historialReciente.length > 0 ? (
            <div className="space-y-1.5">
              {historialReciente.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectHistorial(item)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center justify-between group"
                >
                  <div className="truncate mr-2">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900 truncate">
                      {item.estudiante.nombre}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.estudiante.matricula} · {item.estudiante.programa}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 flex-shrink-0" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              No hay consultas previas en esta sesión
            </div>
          )}
        </div>
      </div>
    </div>
  </aside>
</>
);
}
