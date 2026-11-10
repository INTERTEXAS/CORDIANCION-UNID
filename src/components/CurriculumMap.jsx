import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Award, 
  BookOpen, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2
} from 'lucide-react';

// Formateador inteligente a Title Case institucional
function formatTitle(str) {
  if (!str) return '';
  const lowerWords = new Set(['de', 'en', 'y', 'el', 'la', 'los', 'las', 'del', 'para', 'lo', 'al', 'con', 'e', 'a']);
  const romanNumerals = new Set(['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']);
  return str.toLowerCase().split(' ').map((word, i) => {
    if (romanNumerals.has(word)) return word.toUpperCase();
    if (i > 0 && lowerWords.has(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

export default function CurriculumMap({ 
  auditData, 
  activeFilter = 'TODAS',
  forwardedRef,
  onStatusChange: _onStatusChange
}) {
  const [selectedMateriaModal, setSelectedMateriaModal] = useState(null);
  const [isAuxiliaryExpanded, setIsAuxiliaryExpanded] = useState(false);

  if (!auditData) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-2xs">
        <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2.5" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-slate-900">Sin datos de auditoría cargados</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Seleccione una licenciatura y cargue el kárdex del alumno en PDF o elija uno de los casos de prueba institucionales para visualizar el mapa curricular oficial.
        </p>
      </div>
    );
  }

  const { estudiante, carrera, cuatrimestres, ingles, coCurriculares = [], electivas, resumen, coherencia, fechaConsulta } = auditData;
  const esElegible = resumen?.esElegibleEstadia;
  const esEjad = carrera?.codigo === 'LIC-EJAD-17' || estudiante?.programa === 'LIC-EJAD-17';
  const clavesOcultasEjad = new Set([
    'ECAM-ADR18',
    'ECIA-INR02',
    'ECIK-SIR01',
    'ECFM-HUR01'
  ]);
  const debeOcultarseDelMapa = (materia) => esEjad && clavesOcultasEjad.has(materia.clave);

  // Función para determinar si una materia debe atenuarse con base en el filtro
  const isMateriaDimmed = (estado) => {
    if (activeFilter === 'TODAS') return false;
    if (activeFilter === 'ORD' && estado === 'ORD') return false;
    if (activeFilter === 'REC' && estado === 'REC') return false;
    if (activeFilter === 'RE' && estado === 'RE') return false;
    if (activeFilter === 'ADEUDO' && estado === 'ADEUDO') return false;
    if (activeFilter === 'OMITIDA' && estado === 'OMITIDA') return false;
    if (activeFilter === 'OU' && estado === 'OU') return false;
    if (activeFilter === 'CURS' && (estado === 'CURS' || estado === 'CURSANDO' || estado === 'RECURSANDO')) return false;
    return true;
  };

  // Principio de Diseño por Excepción:
  // Lo ordinario (ORD) es transparente y limpio. Solo la anomalía levanta la mano.
  const getMateriaVisuals = (estado) => {
    switch (estado) {
      case 'ORD':
        return { 
          isRegular: true,
          cardStyle: 'bg-white border-slate-200 border-l-[3px] border-l-emerald-500 hover:border-slate-300 hover:shadow-2xs', 
          dotColor: 'bg-emerald-500', 
          gradeColor: 'text-slate-800 font-bold',
          badgeClass: 'text-emerald-700 font-semibold bg-emerald-50/70 border border-emerald-200/60',
          label: 'Acreditada' 
        };
      case 'REC':
        return { 
          isRegular: false,
          cardStyle: 'bg-amber-50/40 border-amber-300 border-l-[3px] border-l-amber-500 hover:border-amber-400', 
          dotColor: 'bg-amber-500', 
          gradeColor: 'text-amber-950 font-bold',
          badgeClass: 'bg-amber-100/80 text-amber-900 border border-amber-200',
          label: 'Recursamiento' 
        };
      case 'RE':
        return { 
          isRegular: false,
          cardStyle: 'bg-sky-50/40 border-sky-300 border-l-[3px] border-l-sky-500 hover:border-sky-400', 
          dotColor: 'bg-sky-500', 
          gradeColor: 'text-sky-950 font-bold',
          badgeClass: 'bg-sky-100/80 text-sky-900 border border-sky-200',
          label: 'Regularización' 
        };
      case 'ADEUDO':
        return { 
          isRegular: false,
          cardStyle: 'bg-rose-50/60 border-rose-300 border-l-[3px] border-l-rose-600 hover:border-rose-400', 
          dotColor: 'bg-rose-600', 
          gradeColor: 'text-rose-700 font-bold',
          badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200',
          label: 'Adeudo' 
        };
      case 'OMITIDA':
        return { 
          isRegular: false,
          cardStyle: 'bg-orange-50/60 border-orange-300 border-l-[3px] border-l-orange-500 hover:border-orange-400', 
          dotColor: 'bg-orange-500', 
          gradeColor: 'text-orange-700 font-bold',
          badgeClass: 'bg-orange-100 text-orange-800 border border-orange-200',
          label: 'Omitida' 
        };
      case 'PENDIENTE':
        return { 
          isRegular: false,
          cardStyle: 'bg-slate-50/40 border-slate-200 border-dashed hover:bg-white', 
          dotColor: 'bg-slate-400', 
          gradeColor: 'text-slate-400 font-normal',
          badgeClass: 'bg-slate-100 text-slate-500',
          label: 'Por cursar' 
        };
      case 'OU':
        return {
          isRegular: false,
          cardStyle: 'bg-purple-50/40 border-purple-300 border-l-[3px] border-l-purple-600 hover:border-purple-400',
          dotColor: 'bg-purple-500',
          gradeColor: 'text-purple-900 font-bold',
          badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200',
          label: 'Oport. Utilizada'
        };
      case 'CURS':
      case 'CURSANDO':
      case 'RECURSANDO':
        return { 
          isRegular: false,
          cardStyle: 'bg-pink-50/30 border-pink-300 border-l-[3px] border-l-pink-500 hover:border-pink-400', 
          dotColor: 'bg-pink-500', 
          gradeColor: 'text-pink-900 font-bold',
          badgeClass: 'bg-pink-100 text-pink-800 border border-pink-200',
          label: estado === 'RECURSANDO' ? 'Recursando' : 'En Curso' 
        };
      default:
        return { 
          isRegular: true,
          cardStyle: 'bg-white border-slate-200 hover:border-slate-300', 
          dotColor: 'bg-slate-400', 
          gradeColor: 'text-slate-800 font-bold',
          badgeClass: 'bg-slate-100 text-slate-700',
          label: estado 
        };
    }
  };

  return (
    <div 
      ref={forwardedRef} 
      className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 w-full max-w-[1400px] mx-auto box-border shadow-2xs print:p-2 print:shadow-none print:border-none print:bg-white print:text-black"
      id="hoja1-mapa-ejecucion"
    >
      {/* 1. ENCABEZADO INSTITUCIONAL OFICIAL UNID */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-2.5">
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            UNIVERSIDAD INTERAMERICANA PARA EL DESARROLLO
          </div>
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-tight">
            {carrera?.encabezado_plan || 'MAPA DE EJECUCIÓN PARA EL PLAN 2018'}
          </div>
          <div className="text-sm font-bold text-slate-900 uppercase tracking-normal">
            {carrera?.nombre || 'LICENCIATURA EN CONTABILIDAD Y FINANZAS (MIXTO) - FEDERAL'}
          </div>
          <div className="flex items-center space-x-3 pt-0.5 text-[10px] text-slate-400 font-mono">
            <span>Última actualización CPA: <strong className="text-slate-700">{carrera?.ultima_actualizacion_cpa || '31-julio-2026'}</strong></span>
            <span>·</span>
            <span>Fecha de consulta: <strong className="text-slate-700">{fechaConsulta}</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-right">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900 tracking-wider">UNID</span>
            <span className="text-[8px] font-semibold text-slate-400 tracking-widest uppercase">
              FORMANDO CON VALORES
            </span>
          </div>
          <img 
            src="/unid-logo.png" 
            alt="UNID" 
            className="w-9 h-9 rounded-lg object-contain border border-slate-200 flex-shrink-0" 
          />
        </div>
      </div>

      {/* BANNER DE INCONSISTENCIA DE KÁRDEX */}
      {coherencia?.materiasHuerfanas?.length > 4 && coherencia?.alertaCarreraAjena && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-rose-800 text-xs">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wide text-rose-900">Inconsistencia de Kárdex Detectada</p>
              <p className="mt-0.5 leading-relaxed text-rose-800">
                El alumno registra <strong className="font-bold">{coherencia.materiasHuerfanas.length}</strong> asignaturas pertenecientes a <strong className="font-bold">Licenciatura en {coherencia.alertaCarreraAjena}</strong> que no corresponden a este mapa curricular.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. CINTILLA FORMAL DEL ESTUDIANTE */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="flex flex-wrap items-center space-x-5 gap-y-1">
          <div>
            <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">Matrícula</span>
            <span className="font-mono font-bold text-slate-900 text-xs block">{estudiante.matricula}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">Alumno</span>
            <span className="font-semibold text-slate-900 text-xs block">{estudiante.nombre}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">Sede</span>
            <span className="font-medium text-slate-700 text-xs block">{estudiante.sede || 'CAM'}</span>
          </div>
          {estudiante.modalidadDetectada && (
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">Modalidad</span>
              <span className="text-[11px] font-semibold text-slate-700 uppercase">
                {estudiante.modalidadDetectada === 'ESCOLARIZADO DUAL' ? 'Modalidad Dual' : estudiante.modalidadDetectada === 'EJECUTIVO' ? 'Plan Ejecutivo' : estudiante.modalidadDetectada}
              </span>
            </div>
          )}
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">Promedio</span>
            <div className="flex items-baseline space-x-1">
              <span className="font-mono font-bold text-xs text-slate-900">
                {resumen?.promedioFormatted || 'S/C'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {resumen?.materiasConNota > 0 ? `(${resumen.materiasConNota} asig.)` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Dictamen Compacto de Estadía / Posgrado */}
        <div className="flex items-center space-x-2 pl-4 border-l border-slate-200 shrink-0">
          <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Dictamen:</span>
          <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border flex items-center space-x-1.5 whitespace-nowrap ${
            resumen?.esRegularEnCurso
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : esElegible 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {resumen?.esRegularEnCurso ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            ) : esElegible ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span>{resumen?.dictamenEstadia}</span>
          </span>
        </div>
      </div>

      {/* CONTENEDOR RESPONSIVO PARA CUADRÍCULA DE CUATRIMESTRES */}
      <div className="overflow-x-auto pb-1 -mx-0.5 px-0.5">
        <div className={`${cuatrimestres.length === 5 ? 'min-w-[650px] max-w-4xl' : 'min-w-[880px]'} space-y-2.5`}>
          {/* 3. CUADRÍCULA DE LOS CUATRIMESTRES */}
          <div className={`grid gap-1.5 select-none ${cuatrimestres.length === 10 ? 'grid-cols-10' : cuatrimestres.length === 5 ? 'grid-cols-5' : 'grid-cols-9'}`}>
            {cuatrimestres.map((cuat) => (
              <div key={cuat.numero} className="flex flex-col space-y-1.5">
                {/* Cabecera del Cuatrimestre */}
                <div className="bg-slate-900 text-white text-center py-1 px-1 rounded-md shadow-2xs">
                  <span className="block text-[11px] font-bold tracking-tight whitespace-nowrap">
                    {cuat.numero}.º Cuat.
                  </span>
                  <span className="text-[8px] font-mono text-slate-300 block whitespace-nowrap">
                    {cuat.con_ingles ? 'Con Inglés' : (cuatrimestres.length === 5 ? 'Posgrado' : 'Sin Inglés')}
                  </span>
                </div>

                {/* Materias del Cuatrimestre */}
                <div className="flex flex-col space-y-1.5 flex-1">
                  {cuat.materias.filter((materia) => !debeOcultarseDelMapa(materia)).map((materia) => {
                    const audit = materia.audit;
                    const dimmed = isMateriaDimmed(audit.estado);
                    const visual = getMateriaVisuals(audit.estado);

                    return (
                      <div
                        key={materia.clave}
                        onClick={() => setSelectedMateriaModal({ materia, audit })}
                        className={`p-2 rounded-md border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[86px] box-border ${visual.cardStyle} ${
                          dimmed ? 'opacity-20 grayscale' : 'opacity-100'
                        }`}
                        title="Haga clic para ver el historial detallado de intentos"
                      >
                        <div>
                          {/* Clave y Conecta */}
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-mono text-[8.5px] text-slate-400 tracking-wider">
                              {materia.subj}-{materia.crse}
                            </span>
                            {materia.conecta && (
                              <span className="px-1 py-0.2 text-[7.5px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 rounded" title="Asignatura Institucional Virtual (Clase Conecta)">
                                CONECTA
                              </span>
                            )}
                          </div>

                          {/* Nombre de la Asignatura en Title Case para descansar la vista */}
                          <div className="text-[11px] font-semibold text-slate-800 leading-tight">
                            {formatTitle(materia.nombre)}
                          </div>
                        </div>

                        {/* Calificación y Estado con indicador de color correspondiente */}
                        <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100">
                          <span className={`font-mono text-xs ${visual.gradeColor}`}>
                            {audit.calificacion && audit.calificacion !== '--' && audit.calificacion !== 'NO CURSÓ' ? (
                              audit.calificacion
                            ) : (
                              <span className="text-slate-300 font-normal">--</span>
                            )}
                          </span>

                          <span className={`inline-flex items-center gap-1 text-[8.5px] font-semibold px-1.5 py-0.2 rounded leading-none ${visual.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${visual.dotColor}`} />
                            {visual.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Relleno de altura para cuatrimestres con estadía de bloque completo */}
                  {cuat.materias.length === 1 && cuat.materias[0].es_estadia && (
                    <div key={`filler-${cuat.numero}`} className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-md p-2 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                      <Award className="w-5 h-5 text-slate-300 mb-1" strokeWidth={1.5} />
                      <span className="font-semibold text-slate-700 text-[11px]">Bloque Completo</span>
                      <span className="text-[9px] text-slate-400">Estadía Empresarial</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 4. FILA DE NIVELES DE INGLÉS (COLS 1-5) Y REQUISITOS CO-CURRICULARES / EGRESO (COLS 6-9) */}
          <div className="pt-2 select-none border-t border-slate-100">
            <div className="grid grid-cols-9 gap-1.5 mb-1 text-[9.5px] font-bold uppercase text-slate-400 tracking-wider">
              <div className="col-span-5 flex items-center space-x-2">
                <span>Requisito de Inglés (1.º al 5.º)</span>
                {auditData.exentoIngles && (
                  <span className="text-[8.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1 py-0.2 rounded">
                    Exento
                  </span>
                )}
              </div>
              <div className="col-span-4 flex items-center space-x-2">
                <span>Requisitos de Egreso y Titulación</span>
              </div>
            </div>

            <div className="grid grid-cols-9 gap-1.5">
              {/* Niveles de Inglés (1.º al 5.º Cuatrimestre) */}
              {ingles.length > 0 ? ingles.map((ing) => {
                const dimmed = isMateriaDimmed(ing.estado);
                const visual = getMateriaVisuals(ing.estado);
                return (
                  <div
                    key={`ing-${ing.nivel || ing.clave}`}
                    onClick={() => setSelectedMateriaModal({ materia: { clave: `LENG-${ing.clave}`, nombre: ing.nombre }, audit: ing })}
                    className={`p-2 rounded-md border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[76px] box-border ${visual.cardStyle} ${
                      dimmed ? 'opacity-20 grayscale' : 'opacity-100'
                    }`}
                    title="Haga clic para ver el detalle de intentos de inglés"
                  >
                    <div>
                      <div className="font-mono text-[8.5px] text-slate-400 mb-0.5">
                        LENG-{ing.clave}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-800 leading-tight">
                        {formatTitle(ing.nombre)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                      <span className={`font-mono text-xs ${visual.gradeColor}`}>
                        {ing.calificacion && ing.calificacion !== '--' ? ing.calificacion : <span className="text-slate-300 font-normal">--</span>}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[8.5px] font-semibold px-1.5 py-0.2 rounded leading-none ${visual.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${visual.dotColor}`} />
                        {visual.label}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-5 flex items-center justify-center p-2.5 bg-slate-50 border border-slate-200 border-dashed rounded-md text-slate-400 text-xs font-medium">
                  No aplica en Plan Ejecutivo
                </div>
              )}

              {/* 4 Requisitos Co-Curriculares y de Titulación / Egreso (Cols 6 a 9) */}
              {coCurriculares.filter((cocu) => !debeOcultarseDelMapa(cocu)).map((cocu, index) => {
                const dimmed = isMateriaDimmed(cocu.estado);
                const visual = getMateriaVisuals(cocu.estado);
                return (
                  <div
                    key={`cocu-${cocu.clave || index}`}
                    onClick={() => setSelectedMateriaModal({ materia: { clave: cocu.clave, nombre: cocu.nombre }, audit: cocu })}
                    className={`p-2 rounded-md border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[76px] box-border ${visual.cardStyle} ${
                      dimmed ? 'opacity-20 grayscale' : 'opacity-100'
                    }`}
                    title="Haga clic para ver el detalle de este requisito"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono text-[8.5px] text-slate-400">
                          {cocu.clave}
                        </span>
                        <span className="px-1 py-0.2 text-[7.5px] font-bold text-purple-800 bg-purple-50 border border-purple-200 rounded" title="Requisito Co-Curricular / Titulación">
                          CC
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-800 leading-tight">
                        {formatTitle(cocu.nombre)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                      <span className={`font-mono text-xs ${visual.gradeColor}`}>
                        {cocu.calificacion && cocu.calificacion !== '--' && cocu.calificacion !== 'NO CURSÓ' 
                          ? cocu.calificacion 
                          : cocu.calificacion === 'NO CURSÓ' 
                          ? <span className="text-[9px] text-slate-400">NC</span> 
                          : <span className="text-slate-300 font-normal">--</span>}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[8.5px] font-semibold px-1.5 py-0.2 rounded leading-none ${visual.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${visual.dotColor}`} />
                        {visual.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. PARTE INFERIOR: NOMENCLATURA Y ELECTIVAS (COLAPSABLE EN PANTALLA, COMPLETO EN IMPRESIÓN/PDF) */}
      <div className="pt-2 border-t border-slate-200 select-none text-xs">
        {/* Barra compacta de control bajo demanda */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 print:hidden">
          <div className="flex items-center space-x-3 text-slate-600">
            <span className="font-semibold text-xs text-slate-800">Referencias y Catálogo:</span>
            <span className="text-[11px] text-slate-500">8 criterios de estados · 10 electivas del plan · Normativa</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAuxiliaryExpanded(!isAuxiliaryExpanded)}
            className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
          >
            <span>{isAuxiliaryExpanded ? 'Ocultar Referencias' : 'Ver Nomenclatura y Electivas'}</span>
            {isAuxiliaryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Paneles de Referencia (Visibles si isAuxiliaryExpanded = true o en impresión/PDF) */}
        <div className={`${isAuxiliaryExpanded ? 'block' : 'hidden print:block'} mt-2.5`}>
          <div className="grid grid-cols-12 gap-3 text-xs">
            {/* Bloque Izquierdo: Nomenclatura de Estados */}
            <div className="col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="text-[10px] font-bold uppercase text-slate-700 tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Criterios Oficiales de Auditoría</span>
                <span className="text-[9px] font-normal text-slate-400 font-mono">UNID</span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <div className="flex items-center space-x-1.5 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669] shrink-0" />
                  <span className="font-bold text-slate-800 font-mono text-[11px]">ORD:</span>
                  <span className="text-slate-600 text-[11px]">Acreditada 1.er intento</span>
                </div>

                <div className="flex items-center space-x-1.5 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
                  <span className="font-bold text-slate-800 font-mono text-[11px]">REC:</span>
                  <span className="text-slate-600 text-[11px]">Recursamiento</span>
                </div>

                <div className="flex items-center space-x-1.5 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7] shrink-0" />
                  <span className="font-bold text-slate-800 font-mono text-[11px]">RE:</span>
                  <span className="text-slate-600 text-[11px]">Regularización</span>
                </div>

                <div className="flex items-center space-x-1.5 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                  <span className="font-bold text-slate-800 font-mono text-[11px]">CURS:</span>
                  <span className="text-slate-600 text-[11px]">En Curso</span>
                </div>

                <div className="flex items-center space-x-1.5 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
                  <span className="font-bold text-slate-800 font-mono text-[11px]">ADEUDO:</span>
                  <span className="text-slate-600 text-[11px]">Reprobada activa</span>
                </div>

                <div className="flex items-center space-x-1.5 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#EA580C] shrink-0" />
                  <span className="font-bold text-slate-800 font-mono text-[11px]">OMITIDA:</span>
                  <span className="text-slate-600 text-[11px]">No inscrita</span>
                </div>

                <div className="flex items-center space-x-1.5 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#7E22CE] shrink-0" />
                  <span className="font-bold text-slate-800 font-mono text-[11px]">OU:</span>
                  <span className="text-slate-600 text-[11px]">Oportunidad util.</span>
                </div>

                <div className="flex items-center space-x-1.5 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 border border-slate-300 shrink-0" />
                  <span className="font-bold text-slate-800 font-mono text-[11px]">PEND:</span>
                  <span className="text-slate-600 text-[11px]">Por cursar</span>
                </div>
              </div>

              {/* Normativa */}
              <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-500 leading-tight">
                * <strong className="text-slate-800">Normativa:</strong> Asignaturas en <strong className="text-rose-700">ADEUDO</strong> u <strong className="text-orange-700">OMITIDAS</strong> (1.º a 6.º) bloquean la Estadía.
              </div>
            </div>

            {/* Bloque Derecho: Asignaturas Electivas Multidisciplinares (10) */}
            <div className="col-span-7 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="text-[10px] font-bold uppercase text-slate-700 tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Electivas Multidisciplinares</span>
                <span className="text-[9px] font-normal text-slate-400 font-mono">10 Opciones del Catálogo</span>
              </div>

              {electivas.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {electivas.map((elec) => (
                    <div 
                      key={elec.clave} 
                      className={`flex items-center justify-between px-2 py-0.5 rounded border text-[10.5px] ${
                        activeFilter === 'OU' && elec.calificacion !== 'OU' ? 'opacity-20 grayscale' : 'opacity-100'
                      } ${
                        elec.calificacion === 'OU'
                          ? 'bg-purple-50 border-purple-200 text-purple-900 font-bold'
                          : elec.cursada
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' 
                          : elec.cursando
                          ? 'bg-pink-50 border-pink-200 text-pink-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-1 min-w-0 pr-1">
                        <span className="font-mono text-slate-400 text-[9px] shrink-0">{elec.subj}-{elec.crse}:</span>
                        <span className="truncate text-[10px] font-medium">{formatTitle(elec.nombre)}</span>
                      </div>
                      <span className={`shrink-0 text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded ml-1 ${
                        elec.calificacion === 'OU'
                          ? 'bg-purple-100 text-purple-800'
                          : elec.cursada
                          ? 'bg-emerald-100 text-emerald-800'
                          : elec.cursando
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {elec.calificacion === 'OU' ? 'OU' : elec.cursada ? `AC (${elec.calificacion})` : elec.cursando ? 'En Curso' : 'Disp.'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full pb-2">
                  <span className="text-slate-400 text-xs">Plan curricular cerrado (Sin electivas)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL / DETALLE DE INTENTOS DE MATERIA */}
      {selectedMateriaModal && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden"
          onClick={() => setSelectedMateriaModal(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {selectedMateriaModal.materia.clave}
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                  {formatTitle(selectedMateriaModal.materia.nombre)}
                </h3>
              </div>
              <span 
                className="text-xs font-bold px-2 py-0.5 rounded border bg-slate-50 text-slate-700 border-slate-200 shadow-2xs mt-0.5"
              >
                {selectedMateriaModal.audit.etiquetaCorta}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-800">Trazabilidad de Intentos:</div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed">
                {selectedMateriaModal.audit.historialTexto || 'Sin intentos registrados en el kárdex.'}
              </div>

              {selectedMateriaModal.audit.motivoIncidencia && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                  <strong className="text-amber-800">Observación de auditoría:</strong> {selectedMateriaModal.audit.motivoIncidencia}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedMateriaModal(null)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
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
