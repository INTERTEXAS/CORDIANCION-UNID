import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck,
  ShieldAlert,
  Award,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import StudentStatusSelector from './StudentStatusSelector';

export default function CurriculumMap({ 
  auditData, 
  activeFilter = 'TODAS',
  forwardedRef,
  onStatusChange
}) {
  const [selectedMateriaModal, setSelectedMateriaModal] = useState(null);
  
  // Local state for immediate UI reaction when status changes
  const [localEstatus, setLocalEstatus] = useState('AC');

  useEffect(() => {
    if (auditData?.estudiante?.estatus) {
      setLocalEstatus(auditData.estudiante.estatus);
    }
  }, [auditData]);

  const handleStatusUpdate = (newStatus) => {
    setLocalEstatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  if (!auditData) {
    return (
      <div className="bg-surface-1 rounded-3xl border border-border p-12 text-center text-text-muted shadow-card transition-theme">
        <BookOpen className="w-12 h-12 mx-auto text-text-muted/50 mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-bold text-text-primary">Sin datos de auditoría cargados</h3>
        <p className="text-[13px] text-text-secondary mt-1 max-w-md mx-auto">
          Seleccione una licenciatura y cargue el kárdex del alumno en PDF o elija uno de los casos de prueba institucionales para visualizar el mapa curricular oficial.
        </p>
      </div>
    );
  }

  const { estudiante, carrera, cuatrimestres, ingles, coCurriculares = [], electivas, resumen, coherencia, fechaConsulta } = auditData;
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
      className="bg-surface-1 rounded-2xl border border-border p-6 space-y-5 w-full max-w-[1380px] mx-auto box-border transition-theme print:p-2 print:shadow-none print:border-none print:bg-white print:text-black"
      id="hoja1-mapa-ejecucion"
    >
      {/* 1. ENCABEZADO INSTITUCIONAL OFICIAL UNID */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-500 pb-3">
        {/* Izquierda: Textos Institucionales */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-black tracking-widest text-text-primary uppercase">
            UNIVERSIDAD INTERAMERICANA PARA EL DESARROLLO
          </div>
          <div className="text-xs font-black text-text-secondary uppercase tracking-tight">
            {carrera?.encabezado_plan || 'MAPA DE EJECUCIÓN PARA EL PLAN 2018'}
          </div>
          <div className="text-sm font-black text-text-primary uppercase tracking-normal">
            {carrera?.nombre || 'LICENCIATURA EN CONTABILIDAD Y FINANZAS (MIXTO) - FEDERAL'}
          </div>
          <div className="flex items-center space-x-4 pt-1 text-[10px] text-text-muted font-medium">
            <span>Última actualización CPA: <strong className="text-text-primary">{carrera?.ultima_actualizacion_cpa || '31-julio-2026'}</strong></span>
            <span>·</span>
            <span>Fecha de consulta: <strong className="text-text-primary">{fechaConsulta}</strong></span>
          </div>
        </div>

        {/* Derecha: Emblema Oficial UNID */}
        <div className="flex items-center space-x-3 text-right">
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-text-primary tracking-wider">UNID</span>
            <span className="text-[9px] font-extrabold text-text-muted tracking-widest uppercase">
              FORMANDO CON VALORES
            </span>
          </div>
          <img 
            src="/unid-logo.png" 
            alt="UNID" 
            className="w-10 h-10 rounded-xl object-contain shadow-sm border border-border flex-shrink-0" 
          />
        </div>
      </div>

      {/* BANNER DE INCONSISTENCIA DE KÁRDEX */}
      {coherencia?.materiasHuerfanas?.length > 4 && coherencia?.alertaCarreraAjena && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 text-rose-800 dark:text-rose-300 text-[13px]">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wide text-rose-900 dark:text-rose-200">⚠️ Inconsistencia de Kárdex Detectada</p>
              <p className="mt-1 leading-relaxed text-rose-800 dark:text-rose-300">
                Aunque el expediente indica {estudiante.programa}, el alumno registra <strong className="font-bold">{coherencia.materiasHuerfanas.length}</strong> asignaturas pertenecientes a <strong className="font-bold">Licenciatura en {coherencia.alertaCarreraAjena}</strong> que no corresponden a este mapa curricular.
              </p>
              <details className="mt-2 cursor-pointer group">
                <summary className="font-semibold underline decoration-rose-300 dark:decoration-rose-500/50 group-hover:decoration-rose-500 dark:group-hover:decoration-rose-400">Ver asignaturas ajenas detectadas</summary>
                <div className="mt-2 text-[11px] bg-white dark:bg-surface-2 p-3 rounded-lg border border-rose-100 dark:border-rose-500/10 max-h-32 overflow-y-auto">
                  {coherencia.materiasHuerfanas.map(m => (
                    <div key={m.claveCompleta} className="font-mono text-text-secondary border-b border-border-subtle py-1.5 last:border-0">
                      {m.claveCompleta} - {m.calificacion || 'SC'}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* 2. CINTILLA FORMAL DEL ESTUDIANTE */}
      <div className="bg-surface-2 border border-border rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs select-none transition-theme">
        <div className="flex flex-wrap items-center space-x-6 gap-y-2">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">Matrícula:</span>
            <span className="font-mono font-bold text-text-primary text-[13px] block mt-1">{estudiante.matricula}</span>
          </div>
          <div className="border-l border-border-subtle pl-5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">Alumno:</span>
            <span className="font-bold text-text-primary text-[13px] block mt-1">{estudiante.nombre}</span>
          </div>
          <div className="border-l border-border-subtle pl-5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">Sede:</span>
            <span className="font-semibold text-text-secondary text-[13px] block mt-1">{estudiante.sede || 'CAM'}</span>
          </div>
          <div className="border-l border-border-subtle pl-5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">Estatus Actual:</span>
            <StudentStatusSelector 
              estudiante={{ ...estudiante, estatus: localEstatus }} 
              onStatusChange={handleStatusUpdate} 
            />
          </div>
          {estudiante.modalidadDetectada && (
            <div className="border-l border-border-subtle pl-5">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Modalidad:</span>
              <span className={`font-extrabold px-2 py-0.5 mt-0.5 inline-block rounded text-[10px] uppercase border ${
                estudiante.modalidadDetectada === 'EJECUTIVO' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                estudiante.modalidadDetectada === 'ESCOLARIZADO DUAL' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' :
                'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
              }`}>
                {estudiante.modalidadDetectada === 'ESCOLARIZADO DUAL' ? 'DUAL' : estudiante.modalidadDetectada}
              </span>
            </div>
          )}
        </div>

        {/* Dictamen Compacto de Estadía */}
        <div className="flex items-center space-x-3 pl-5 border-l border-border-subtle shrink-0">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">DICTAMEN DE ESTADÍA:</span>
          <span className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold tracking-tight border flex items-center space-x-1.5 whitespace-nowrap ${
            esElegible 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20' 
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/20'
          }`}>
            {esElegible ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" strokeWidth={1.5} />
            )}
            <span>{resumen.dictamenEstadia}</span>
          </span>
        </div>
      </div>

      {/* 3. CUADRÍCULA DE LOS CUATRIMESTRES */}
      <div className={`grid gap-2 select-none ${cuatrimestres.length === 10 ? 'grid-cols-10' : 'grid-cols-9'}`}>
        {cuatrimestres.map((cuat) => (
          <div key={cuat.numero} className="flex flex-col space-y-2">
            {/* Cabecera del Cuatrimestre */}
            <div className="bg-[#181C24] dark:bg-surface-2 text-white dark:text-text-primary text-center py-2 px-1 rounded-lg shadow-sm border dark:border-border transition-theme">
              <span className="block text-[12px] font-bold tracking-tight whitespace-nowrap">
                {cuat.numero}.º Cuat.
              </span>
              <span className="text-[9px] font-medium text-slate-300 dark:text-text-muted block whitespace-nowrap mt-0.5">
                {cuat.con_ingles ? 'Con Inglés' : 'Sin Inglés'}
              </span>
            </div>

            {/* Materias del Cuatrimestre */}
            <div className="flex flex-col space-y-2 flex-1">
              {cuat.materias.map((materia) => {
                const audit = materia.audit;
                const dimmed = isMateriaDimmed(audit.estado);

                return (
                  <div
                    key={materia.clave}
                    onClick={() => setSelectedMateriaModal({ materia, audit })}
                    style={{
                      borderLeftColor: audit.color,
                      backgroundColor: 'var(--surface-1)' // Se manejaba por audit.bgColor, ahora preferimos surface para dark mode y un ligero border
                    }}
                    className={`p-2 rounded-lg border border-border border-l-4 text-left transition-all duration-150 cursor-pointer hover:shadow-card hover:scale-[1.02] flex flex-col justify-between min-h-[96px] overflow-hidden box-border bg-surface-1 ${
                      dimmed ? 'opacity-30 grayscale' : 'opacity-100'
                    }`}
                    title="Haga clic para ver el historial detallado de intentos"
                  >
                    <div>
                      {/* Clave y Conecta */}
                      <div className="flex items-center justify-between text-[9px] font-mono leading-none mb-1.5 gap-1">
                        <span className="font-mono font-bold tracking-tight text-text-secondary whitespace-nowrap">
                          {materia.subj}-{materia.crse}
                        </span>
                        {materia.conecta && (
                          <span className="px-1.5 py-0.5 text-[8px] font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 rounded shrink-0">
                            CC
                          </span>
                        )}
                      </div>

                      {/* Nombre oficial */}
                      <div className="text-[10px] leading-[1.25] font-bold tracking-tighter text-text-primary whitespace-normal break-normal">
                        {materia.nombre}
                      </div>
                    </div>

                    {/* Calificación y Etiqueta corta de estado */}
                    <div className="flex items-center justify-between gap-1 pt-1.5 mt-auto border-t border-border-subtle text-[9px] font-bold">
                      <span className="font-mono font-bold text-text-secondary whitespace-nowrap">
                        {audit.calificacion && audit.calificacion !== '--' && audit.calificacion !== 'NO CURSÓ' ? (
                          <>Cal: <strong className="text-text-primary font-black">{audit.calificacion}</strong></>
                        ) : (
                          <span className="text-text-muted font-normal">--</span>
                        )}
                      </span>

                      <span 
                        style={{ color: audit.color, borderColor: audit.color }}
                        className="text-[8px] px-1.5 py-0.5 rounded font-extrabold whitespace-nowrap shrink-0 bg-surface-1 shadow-sm text-center border opacity-90"
                      >
                        {audit.etiquetaCorta}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Relleno de altura para cuatrimestres con estadía de bloque completo */}
              {cuat.materias.length === 1 && cuat.materias[0].es_estadia && (
                <div key={`filler-${cuat.numero}`} className="flex-1 bg-surface-2 border border-dashed border-border rounded-lg p-2 flex flex-col items-center justify-center text-center text-text-muted text-[11px]">
                  <Award className="w-6 h-6 text-text-muted/50 mb-1" strokeWidth={1.5} />
                  <span className="font-bold text-text-secondary">Bloque Completo</span>
                  <span className="text-[10px] text-text-muted">Estadía</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. FILA DE NIVELES DE INGLÉS (COLS 1-5) Y REQUISITOS CO-CURRICULARES / EGRESO (COLS 6-9) */}
      <div className="pt-2 select-none">
        <div className="grid grid-cols-9 gap-2 mb-2 text-[11px] font-black uppercase text-text-secondary tracking-wider">
          <div className="col-span-5 flex items-center space-x-2">
            <span>Requisito Curricular de Inglés (1.º al 5.º Cuatrimestre):</span>
            {auditData.exentoIngles && (
              <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                Exento (LENG-0008 AC)
              </span>
            )}
          </div>
          <div className="col-span-4 flex items-center space-x-2">
            <span>Requisitos Co-Curriculares y de Egreso:</span>
          </div>
        </div>

        <div className="grid grid-cols-9 gap-2">
          {/* Niveles de Inglés (1.º al 5.º Cuatrimestre) */}
          {ingles.length > 0 ? ingles.map((ing) => {
            const dimmed = isMateriaDimmed(ing.estado);
            return (
              <div
                key={`ing-${ing.nivel || ing.clave}`}
                onClick={() => setSelectedMateriaModal({ materia: { clave: `LENG-${ing.clave}`, nombre: ing.nombre }, audit: ing })}
                style={{
                  borderLeftColor: ing.color || '#059669',
                }}
                className={`p-2 rounded-lg border border-border border-l-4 text-left min-h-[72px] overflow-hidden box-border flex flex-col justify-between cursor-pointer hover:shadow-card transition-shadow bg-surface-1 ${
                  dimmed ? 'opacity-30 grayscale' : 'opacity-100'
                }`}
                title="Haga clic para ver el detalle de intentos de inglés"
              >
                <div>
                  <div className="text-[9px] font-mono text-text-muted leading-none">
                    LENG-{ing.clave}
                  </div>
                  <div className="text-[10px] font-bold text-text-primary leading-tight mt-1 whitespace-normal break-normal">
                    {ing.nombre}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 mt-auto border-t border-border-subtle text-[9px] font-bold">
                  <span className="font-mono font-bold text-text-secondary whitespace-nowrap">
                    {ing.calificacion && ing.calificacion !== '--' ? `Cal: ${ing.calificacion}` : '--'}
                  </span>
                  <span 
                    style={{ color: ing.color || '#059669', borderColor: ing.color || '#059669' }} 
                    className="text-[8px] px-1.5 py-0.5 rounded font-extrabold whitespace-nowrap shrink-0 bg-surface-1 shadow-sm border text-center opacity-90"
                  >
                    {ing.etiquetaCorta}
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-5 flex items-center justify-center p-3 bg-surface-2 border border-border border-dashed rounded-lg text-text-muted text-[12px] font-semibold">
              No aplica en Plan Ejecutivo
            </div>
          )}

          {/* 4 Requisitos Co-Curriculares y de Titulación / Egreso (Cols 6 a 9) */}
          {coCurriculares.map((cocu, index) => {
            const dimmed = isMateriaDimmed(cocu.estado);
            return (
              <div
                key={`cocu-${cocu.clave || index}`}
                onClick={() => setSelectedMateriaModal({ materia: { clave: cocu.clave, nombre: cocu.nombre }, audit: cocu })}
                style={{
                  borderLeftColor: cocu.color || '#059669',
                }}
                className={`p-2 rounded-lg border border-border border-l-4 text-left min-h-[72px] overflow-hidden box-border flex flex-col justify-between cursor-pointer hover:shadow-card transition-shadow bg-surface-1 ${
                  dimmed ? 'opacity-30 grayscale' : 'opacity-100'
                }`}
                title="Haga clic para ver el detalle de este requisito"
              >
                <div>
                  <div className="text-[9px] font-mono text-text-muted leading-none">
                    {cocu.clave}
                  </div>
                  <div className="text-[10px] font-bold text-text-primary leading-tight mt-1 whitespace-normal break-normal">
                    {cocu.nombre}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 mt-auto border-t border-border-subtle text-[9px] font-bold">
                  <span className="font-mono font-bold text-text-secondary whitespace-nowrap">
                    {cocu.calificacion && cocu.calificacion !== '--' && cocu.calificacion !== 'NO CURSÓ' 
                      ? `Cal: ${cocu.calificacion}` 
                      : cocu.calificacion === 'NO CURSÓ' 
                      ? 'No cursó' 
                      : '--'}
                  </span>
                  <span 
                    style={{ color: cocu.color || '#059669', borderColor: cocu.color || '#059669' }} 
                    className="text-[8px] px-1.5 py-0.5 rounded font-extrabold whitespace-nowrap shrink-0 bg-surface-1 shadow-sm border text-center opacity-90"
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
      <div className="grid grid-cols-12 gap-4 pt-4 border-t border-border select-none text-[13px]" style={{ overflow: 'visible' }}>
        {/* Bloque Izquierdo: Descripción y Nomenclatura de Estados */}
        <div className="col-span-5 bg-surface-2 border border-border rounded-xl p-4 space-y-3">
          <div className="text-[12px] font-bold uppercase text-text-primary tracking-wide border-b border-border-subtle pb-1.5 flex items-center justify-between">
            <span>Nomenclatura y Estados</span>
            <span className="text-[11px] font-medium text-text-muted normal-case">Criterio UNID</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] leading-normal">
            <div className="flex items-center space-x-2 py-1">
              <span className="w-3 h-3 rounded-full bg-[#059669] shrink-0" />
              <span className="font-bold text-text-primary">ORD:</span>
              <span className="text-text-secondary">1.ª Oportunidad</span>
            </div>

            <div className="flex items-center space-x-2 py-1">
              <span className="w-3 h-3 rounded-full bg-[#D97706] shrink-0" />
              <span className="font-bold text-text-primary">REC:</span>
              <span className="text-text-secondary">Recursamiento</span>
            </div>

            <div className="flex items-center space-x-2 py-1">
              <span className="w-3 h-3 rounded-full bg-[#0284C7] shrink-0" />
              <span className="font-bold text-text-primary">RE:</span>
              <span className="text-text-secondary">Regularización</span>
            </div>

            <div className="flex items-center space-x-2 py-1">
              <span className="w-3 h-3 rounded-full bg-[#4F46E5] shrink-0" />
              <span className="font-bold text-text-primary">CURS:</span>
              <span className="text-text-secondary">En Curso</span>
            </div>

            <div className="flex items-center space-x-2 py-1">
              <span className="w-3 h-3 rounded-full bg-[#DC2626] shrink-0" />
              <span className="font-bold text-text-primary">ADEUDO:</span>
              <span className="text-text-secondary">Reprobada</span>
            </div>

            <div className="flex items-center space-x-2 py-1">
              <span className="w-3 h-3 rounded-full bg-[#EA580C] shrink-0" />
              <span className="font-bold text-text-primary">OMITIDA:</span>
              <span className="text-text-secondary">No cargada</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border-subtle text-[11px] text-text-muted leading-snug">
            * <strong className="text-rose-600 dark:text-rose-400 font-bold">CC</strong>: Clase Conecta. Materias en <strong className="text-red-700 dark:text-red-400 font-bold">ADEUDO</strong> u <strong className="text-orange-700 dark:text-orange-400 font-bold">OMITIDAS</strong> (1.º-6.º) bloquean Estadía.
          </div>
        </div>

        {/* Bloque Derecho: Asignaturas Electivas Multidisciplinares (10) */}
        <div className="col-span-7 bg-surface-2 border border-border rounded-xl p-4 space-y-3">
          <div className="text-[12px] font-bold uppercase text-text-primary tracking-wide border-b border-border-subtle pb-1.5 flex items-center justify-between">
            <span>Electivas Multidisciplinares</span>
            <span className="text-[11px] font-semibold text-text-muted normal-case">10 Opciones del Catálogo</span>
          </div>

          {electivas.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {electivas.map((elec) => (
                <div 
                  key={elec.clave} 
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] leading-normal ${
                    elec.cursada 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-300 font-bold' 
                      : elec.cursando
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-950 dark:text-indigo-300 font-bold'
                      : 'bg-surface-1 border-border text-text-secondary font-medium'
                  }`}
                  style={{ overflow: 'visible' }}
                >
                  <div className="flex items-center space-x-1.5 min-w-0 pr-1 leading-normal" style={{ overflow: 'visible' }}>
                    <span className="font-mono font-bold text-text-muted text-[10px] shrink-0 leading-normal">{elec.subj}-{elec.crse}:</span>
                    <span className="leading-normal truncate">{elec.nombre}</span>
                  </div>
                  <span className={`shrink-0 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ml-1 leading-normal ${
                    elec.cursada
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                      : elec.cursando
                      ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-400'
                      : 'bg-surface-3 text-text-muted'
                  }`}>
                    {elec.cursada ? `AC (${elec.calificacion})` : elec.cursando ? 'En Curso' : 'Disp.'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full pb-4">
              <span className="text-text-muted text-[13px] font-semibold">Plan curricular cerrado (Sin asignaturas electivas)</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL / DETALLE DE INTENTOS DE MATERIA */}
      {selectedMateriaModal && (
        <div 
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in print:hidden"
          onClick={() => setSelectedMateriaModal(null)}
        >
          <div 
            className="bg-surface-1 rounded-2xl shadow-glass-lg border border-border max-w-lg w-full p-6 space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
                  {selectedMateriaModal.materia.clave}
                </span>
                <h3 className="text-[16px] font-bold text-text-primary leading-snug mt-1">
                  {selectedMateriaModal.materia.nombre}
                </h3>
              </div>
              <span 
                style={{ color: selectedMateriaModal.audit.color, borderColor: selectedMateriaModal.audit.color }}
                className="text-[11px] font-extrabold px-3 py-1 rounded-lg border bg-surface-1 shadow-sm mt-1"
              >
                {selectedMateriaModal.audit.etiquetaCorta}
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-[12px] font-bold text-text-primary">Trazabilidad de Intentos:</div>
              <div className="p-4 bg-surface-2 rounded-xl border border-border font-mono text-[12px] text-text-secondary leading-relaxed">
                {selectedMateriaModal.audit.historialTexto || 'Sin intentos registrados en el kárdex.'}
              </div>

              {selectedMateriaModal.audit.motivoIncidencia && (
                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-900 dark:text-amber-200 text-[12px]">
                  <strong className="text-amber-700 dark:text-amber-400">Observación de auditoría:</strong> {selectedMateriaModal.audit.motivoIncidencia}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border-subtle">
              <button
                onClick={() => setSelectedMateriaModal(null)}
                className="px-5 py-2.5 bg-surface-3 hover:bg-border text-text-primary rounded-xl text-[13px] font-bold transition-all cursor-pointer shadow-sm"
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
