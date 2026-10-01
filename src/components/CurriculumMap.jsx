import React, { useState } from 'react';
import { 
  ShieldCheck,
  ShieldAlert,
  Award,
  BookOpen
} from 'lucide-react';

export default function CurriculumMap({ 
  auditData, 
  activeFilter = 'TODAS',
  forwardedRef
}) {
  const [selectedMateriaModal, setSelectedMateriaModal] = useState(null);

  if (!auditData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
        <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-bold text-slate-700">Sin datos de auditoría cargados</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Seleccione una licenciatura y cargue el kárdex del alumno en PDF o elija uno de los casos de prueba institucionales para visualizar el mapa curricular oficial.
        </p>
      </div>
    );
  }

  const { estudiante, carrera, cuatrimestres, ingles, coCurriculares = [], electivas, resumen, fechaConsulta } = auditData;
  const esElegible = resumen?.esElegibleEstadia;

  // Función para determinar si una materia debe atenuarse con base en el filtro
  const isMateriaDimmed = (estado) => {
    if (activeFilter === 'TODAS') return false;
    if (activeFilter === 'ORD' && estado === 'ORD') return false;
    if (activeFilter === 'REC' && estado === 'REC') return false;
    if (activeFilter === 'RE' && estado === 'RE') return false;
    if (activeFilter === 'ADEUDO' && estado === 'ADEUDO') return false;
    if (activeFilter === 'OMITIDA' && estado === 'OMITIDA') return false;
    return true;
  };

  return (
    <div 
      ref={forwardedRef} 
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-[1360px] mx-auto print:p-2 print:shadow-none print:border-none"
      id="hoja1-mapa-ejecucion"
    >
      {/* 1. ENCABEZADO INSTITUCIONAL OFICIAL UNID */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
        {/* Izquierda: Textos Institucionales */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-black tracking-widest text-[#111622] uppercase">
            UNIVERSIDAD INTERAMERICANA PARA EL DESARROLLO
          </div>
          <div className="text-xs font-black text-slate-800 uppercase tracking-tight">
            {carrera?.encabezado_plan || 'MAPA DE EJECUCIÓN PARA EL PLAN 2018'}
          </div>
          <div className="text-sm font-black text-[#111622] uppercase tracking-normal">
            {carrera?.nombre || 'LICENCIATURA EN CONTABILIDAD Y FINANZAS (MIXTO) - FEDERAL'}
          </div>
          <div className="flex items-center space-x-4 pt-1 text-[10px] text-slate-500 font-medium">
            <span>Última actualización CPA: <strong className="text-slate-800">{carrera?.ultima_actualizacion_cpa || '31-julio-2026'}</strong></span>
            <span>·</span>
            <span>Fecha de consulta: <strong className="text-slate-800">{fechaConsulta}</strong></span>
          </div>
        </div>

        {/* Derecha: Emblema Oficial UNID */}
        <div className="flex items-center space-x-3 text-right">
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-[#111622] tracking-wider">UNID</span>
            <span className="text-[9px] font-extrabold text-slate-500 tracking-widest uppercase">
              FORMANDO CON VALORES
            </span>
          </div>
          <div className="w-10 h-10 bg-[#F2B705] rounded-lg flex items-center justify-center shadow-sm">
            <span className="font-black text-black text-2xl tracking-tighter">U</span>
          </div>
        </div>
      </div>

      {/* 2. CINTILLA FORMAL DEL ESTUDIANTE */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Matrícula:</span>
            <span className="font-mono font-bold text-slate-900 text-xs">{estudiante.matricula}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alumno:</span>
            <span className="font-bold text-slate-900 text-xs">{estudiante.nombre}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sede:</span>
            <span className="font-semibold text-slate-800 text-xs">{estudiante.sede || 'CAM'}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estatus:</span>
            <span className="font-bold text-slate-800 text-xs">{estudiante.estatus || 'AC'}</span>
          </div>
        </div>

        {/* Dictamen Compacto de Estadía */}
        <div className="flex items-center space-x-2 pl-4 border-l border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dictamen de Estadía:</span>
          <span className={`px-2.5 py-1 rounded text-[11px] font-extrabold tracking-tight border flex items-center space-x-1.5 ${
            esElegible 
              ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' 
              : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
          }`}>
            {esElegible ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" strokeWidth={1.5} />
            )}
            <span>{resumen.dictamenEstadia}</span>
          </span>
        </div>
      </div>

      {/* 3. CUADRÍCULA DE LOS 9 CUATRIMESTRES */}
      <div className="grid grid-cols-9 gap-1.5 select-none">
        {cuatrimestres.map((cuat) => (
          <div key={cuat.numero} className="flex flex-col space-y-1.5">
            {/* Cabecera del Cuatrimestre */}
            <div className="bg-[#181C24] text-white text-center py-1.5 px-1 rounded-t shadow-sm">
              <span className="block text-[11px] font-bold tracking-tight whitespace-nowrap">
                {cuat.numero}.º Cuat.
              </span>
              <span className="text-[8.5px] font-medium text-slate-300 block whitespace-nowrap">
                {cuat.con_ingles ? 'Con Inglés' : 'Sin Inglés'}
              </span>
            </div>

            {/* Materias del Cuatrimestre */}
            <div className="flex flex-col space-y-1.5 flex-1">
              {cuat.materias.map((materia) => {
                const audit = materia.audit;
                const dimmed = isMateriaDimmed(audit.estado);

                return (
                  <div
                    key={materia.clave}
                    onClick={() => setSelectedMateriaModal({ materia, audit })}
                    style={{
                      borderLeftColor: audit.color,
                      backgroundColor: audit.bgColor
                    }}
                    className={`p-1.5 rounded border border-slate-200 border-l-4 text-left transition-all duration-150 cursor-pointer hover:shadow-md hover:scale-[1.01] flex flex-col justify-between min-h-[88px] overflow-hidden box-border ${
                      dimmed ? 'opacity-25 grayscale' : 'opacity-100'
                    }`}
                    title="Haga clic para ver el historial detallado de intentos"
                  >
                    <div>
                      {/* Clave y Conecta */}
                      <div className="flex items-center justify-between text-[8.5px] font-mono leading-none mb-1 gap-1">
                        <span className="font-mono font-bold tracking-tight text-slate-700 whitespace-nowrap">
                          {materia.subj}-{materia.crse}
                        </span>
                        {materia.conecta && (
                          <span className="px-1 py-0 text-[7px] font-black text-rose-600 bg-rose-100 rounded shrink-0">
                            CC
                          </span>
                        )}
                      </div>

                      {/* Nombre oficial */}
                      <div className="text-[8.5px] leading-[1.18] font-bold tracking-tighter text-slate-800 whitespace-normal break-normal">
                        {materia.nombre}
                      </div>
                    </div>

                    {/* Calificación y Etiqueta corta de estado */}
                    <div className="flex items-center justify-between gap-1 pt-1 mt-auto border-t border-slate-200/60 text-[8px] font-bold">
                      <span className="font-mono font-bold text-slate-700 whitespace-nowrap">
                        {audit.calificacion && audit.calificacion !== '--' && audit.calificacion !== 'NO CURSÓ' ? (
                          <>Cal: <strong className="text-slate-950 font-black">{audit.calificacion}</strong></>
                        ) : (
                          <span className="text-slate-400 font-normal">--</span>
                        )}
                      </span>

                      <span 
                        style={{ color: audit.color }}
                        className="text-[7.5px] px-1 py-0.5 rounded font-extrabold whitespace-nowrap shrink-0 bg-white/90 shadow-2xs text-center border border-slate-200/50"
                      >
                        {audit.etiquetaCorta}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Relleno de altura para cuatrimestres con menos de 5 materias (ej. Estadías 7 y 9) */}
              {cuat.materias.length < 5 && (
                <div key={`filler-${cuat.numero}`} className="flex-1 bg-slate-50/70 border border-dashed border-slate-200 rounded p-2 flex flex-col items-center justify-center text-center text-slate-400 text-[10px]">
                  <Award className="w-5 h-5 text-slate-300 mb-1" strokeWidth={1.5} />
                  <span className="font-bold text-slate-500">Bloque Completo</span>
                  <span className="text-[9px] text-slate-400">5 Créditos BH</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. FILA DE NIVELES DE INGLÉS (COLS 1-5) Y REQUISITOS CO-CURRICULARES / EGRESO (COLS 6-9) */}
      <div className="pt-1 select-none">
        <div className="grid grid-cols-9 gap-1.5 mb-1.5 text-[11px] font-black uppercase text-slate-700 tracking-wider">
          <div className="col-span-5 flex items-center space-x-2">
            <span>Requisito Curricular de Inglés (1.º al 5.º Cuatrimestre):</span>
            {auditData.exentoIngles && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Exento (LENG-0008 AC)
              </span>
            )}
          </div>
          <div className="col-span-4 flex items-center space-x-2">
            <span>Requisitos Co-Curriculares y de Titulación / Egreso:</span>
          </div>
        </div>

        <div className="grid grid-cols-9 gap-1.5">
          {/* Niveles de Inglés (1.º al 5.º Cuatrimestre) */}
          {ingles.map((ing) => {
            const dimmed = isMateriaDimmed(ing.estado);
            return (
              <div
                key={`ing-${ing.nivel || ing.clave}`}
                onClick={() => setSelectedMateriaModal({ materia: { clave: `LENG-${ing.clave}`, nombre: ing.nombre }, audit: ing })}
                style={{
                  borderLeftColor: ing.color || '#059669',
                  backgroundColor: ing.bgColor || '#ECFDF5'
                }}
                className={`p-1.5 rounded border border-slate-200 border-l-4 text-left min-h-[64px] overflow-hidden box-border flex flex-col justify-between cursor-pointer hover:shadow-xs transition-shadow ${
                  dimmed ? 'opacity-25 grayscale' : 'opacity-100'
                }`}
                title="Haga clic para ver el detalle de intentos de inglés"
              >
                <div>
                  <div className="text-[8.5px] font-mono text-slate-500 leading-none">
                    LENG-{ing.clave}
                  </div>
                  <div className="text-[9.5px] font-bold text-slate-800 leading-tight mt-0.5 whitespace-normal break-normal">
                    {ing.nombre}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 mt-auto border-t border-slate-200/60 text-[8px] font-bold">
                  <span className="font-mono font-bold text-slate-700 whitespace-nowrap">
                    {ing.calificacion && ing.calificacion !== '--' ? `Cal: ${ing.calificacion}` : '--'}
                  </span>
                  <span 
                    style={{ color: ing.color || '#059669' }} 
                    className="text-[7.5px] px-1 py-0.5 rounded font-extrabold whitespace-nowrap shrink-0 bg-white/90 shadow-2xs border border-slate-200/50 text-center"
                  >
                    {ing.etiquetaCorta}
                  </span>
                </div>
              </div>
            );
          })}

          {/* 4 Requisitos Co-Curriculares y de Titulación / Egreso (Cols 6 a 9) */}
          {coCurriculares.map((cocu, index) => {
            const dimmed = isMateriaDimmed(cocu.estado);
            return (
              <div
                key={`cocu-${cocu.clave || index}`}
                onClick={() => setSelectedMateriaModal({ materia: { clave: cocu.clave, nombre: cocu.nombre }, audit: cocu })}
                style={{
                  borderLeftColor: cocu.color || '#059669',
                  backgroundColor: cocu.bgColor || '#ECFDF5'
                }}
                className={`p-1.5 rounded border border-slate-200 border-l-4 text-left min-h-[64px] overflow-hidden box-border flex flex-col justify-between cursor-pointer hover:shadow-xs transition-shadow ${
                  dimmed ? 'opacity-25 grayscale' : 'opacity-100'
                }`}
                title="Haga clic para ver el detalle de este requisito"
              >
                <div>
                  <div className="text-[8.5px] font-mono text-slate-500 leading-none">
                    {cocu.clave}
                  </div>
                  <div className="text-[9.5px] font-bold text-slate-800 leading-tight mt-0.5 whitespace-normal break-normal">
                    {cocu.nombre}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 mt-auto border-t border-slate-200/60 text-[8px] font-bold">
                  <span className="font-mono font-bold text-slate-700 whitespace-nowrap">
                    {cocu.calificacion && cocu.calificacion !== '--' && cocu.calificacion !== 'NO CURSÓ' 
                      ? `Cal: ${cocu.calificacion}` 
                      : cocu.calificacion === 'NO CURSÓ' 
                      ? 'No cursó' 
                      : '--'}
                  </span>
                  <span 
                    style={{ color: cocu.color || '#059669' }} 
                    className="text-[7.5px] px-1 py-0.5 rounded font-extrabold whitespace-nowrap shrink-0 bg-white/90 shadow-2xs border border-slate-200/50 text-center"
                  >
                    {cocu.etiquetaCorta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. PARTE INFERIOR: NOMENCLATURA (IZQ) Y ELECTIVAS MULTIDISCIPLINARES (DER) */}
      <div className="grid grid-cols-12 gap-3 pt-2 border-t border-slate-200 select-none text-[10px]">
        {/* Bloque Izquierdo: Descripción y Nomenclatura de Estados */}
        <div className="col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
          <div className="text-[10px] font-black uppercase text-slate-800 tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>Nomenclatura y Estados de Asignatura</span>
            <span className="text-[9px] font-normal text-slate-500">Criterio Institucional UNID</span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-0.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669] flex-shrink-0" />
              <span className="font-bold text-slate-800">ORD:</span>
              <span className="text-slate-600 truncate">1.ª Oportunidad (RW)</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] flex-shrink-0" />
              <span className="font-bold text-slate-800">REC:</span>
              <span className="text-slate-600 truncate">Recursamiento (≥2 Int)</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] flex-shrink-0" />
              <span className="font-bold text-slate-800">RE:</span>
              <span className="text-slate-600 truncate">Regularización (Modo RE)</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] flex-shrink-0" />
              <span className="font-bold text-slate-800">CURS:</span>
              <span className="text-slate-600 truncate">En Curso Activo</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] flex-shrink-0" />
              <span className="font-bold text-slate-800">ADEUDO:</span>
              <span className="text-slate-600 truncate">Reprobada Activa (5/NP)</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] flex-shrink-0" />
              <span className="font-bold text-slate-800">OMITIDA:</span>
              <span className="text-slate-600 truncate">No cargada en su ciclo</span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-200/80 text-[9px] text-slate-500 leading-tight">
            * <strong className="text-rose-600">CC</strong>: Clase Conecta obligatoria. Las materias en <strong className="text-red-700">ADEUDO</strong> u <strong className="text-orange-700">OMITIDAS</strong> entre el 1.º y 6.º cuatrimestre retienen automáticamente la inscripción a Estadía Empresarial.
          </div>
        </div>

        {/* Bloque Derecho: Asignaturas Electivas Multidisciplinares (10) */}
        <div className="col-span-7 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
          <div className="text-[10px] font-black uppercase text-slate-800 tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>Asignaturas Electivas Multidisciplinares (Catálogo Institucional)</span>
            <span className="text-[9px] font-semibold text-slate-500">10 Opciones Oficiales</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
            {electivas.map((elec) => (
              <div 
                key={elec.clave} 
                className={`flex items-center justify-between p-1 rounded border text-[9px] ${
                  elec.cursada 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' 
                    : elec.cursando
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="truncate mr-1">
                  <span className="font-mono font-bold mr-1">{elec.subj}-{elec.crse}:</span>
                  <span className="truncate">{elec.nombre}</span>
                </div>
                <span className="flex-shrink-0 text-[8px] font-extrabold uppercase">
                  {elec.cursada ? `Aprobada (${elec.calificacion})` : elec.cursando ? 'En Curso' : 'Disponible'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL / DETALLE DE INTENTOS DE MATERIA */}
      {selectedMateriaModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMateriaModal(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  {selectedMateriaModal.materia.clave}
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {selectedMateriaModal.materia.nombre}
                </h3>
              </div>
              <span 
                style={{ color: selectedMateriaModal.audit.color, backgroundColor: selectedMateriaModal.audit.bgColor }}
                className="text-[10px] font-extrabold px-2.5 py-1 rounded border border-current/20"
              >
                {selectedMateriaModal.audit.etiquetaCorta}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-700">Trazabilidad de Intentos:</div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 leading-relaxed">
                {selectedMateriaModal.audit.historialTexto || 'Sin intentos registrados en el kárdex.'}
              </div>

              {selectedMateriaModal.audit.motivoIncidencia && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                  <strong>Observación de auditoría:</strong> {selectedMateriaModal.audit.motivoIncidencia}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedMateriaModal(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-all"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
