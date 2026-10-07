import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  FileSpreadsheet
} from 'lucide-react';
import StudentStatusSelector from './StudentStatusSelector';

export default function AuditCedula({ auditData, forwardedRef }) {
  const [localEstatus, setLocalEstatus] = useState('AC');

  useEffect(() => {
    if (auditData?.estudiante?.estatus) {
      setLocalEstatus(auditData.estudiante.estatus);
    }
  }, [auditData]);

  const handleStatusUpdate = (newStatus) => {
    if (auditData?.estudiante) {
      auditData.estudiante.estatus = newStatus;
    }
    setLocalEstatus(newStatus);
  };

  if (!auditData) {
    return (
      <div className="bg-surface-1 rounded-3xl border border-border p-12 text-center text-text-muted shadow-card transition-theme">
        <FileSpreadsheet className="w-12 h-12 mx-auto text-text-muted/50 mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-bold text-text-primary">Sin cédula de auditoría</h3>
        <p className="text-[13px] text-text-secondary mt-1 max-w-md mx-auto">
          Cargue el expediente del estudiante para generar la cédula ejecutiva y la bitácora de trazabilidad.
        </p>
      </div>
    );
  }

  const { estudiante, carrera, resumen, incidencias = [], fechaConsulta } = auditData;
  const esElegible = resumen?.esElegibleEstadia;

  return (
    <div 
      ref={forwardedRef} 
      className="bg-surface-1 rounded-2xl border border-border p-6 space-y-6 w-full max-w-[1380px] mx-auto box-border transition-theme print:p-2 print:shadow-none print:border-none print:bg-white print:text-black"
      id="hoja2-cedula-auditoria"
    >
      {/* 1. ENCABEZADO INSTITUCIONAL OFICIAL UNID */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-500 pb-3 select-none">
        <div className="space-y-0.5">
          <div className="text-[10px] font-black tracking-widest text-text-primary uppercase">
            UNIVERSIDAD INTERAMERICANA PARA EL DESARROLLO
          </div>
          <div className="text-xs font-black text-text-secondary uppercase tracking-tight">
            CÉDULA OFICIAL DE AUDITORÍA ACADÉMICA Y TRAZABILIDAD DE CRÉDITOS
          </div>
          <div className="text-sm font-black text-text-primary uppercase tracking-normal">
            {carrera?.nombre || 'LICENCIATURA EN CONTABILIDAD Y FINANZAS (MIXTO) - FEDERAL'}
          </div>
          <div className="flex items-center space-x-4 pt-1 text-[10px] text-text-muted font-medium">
            <span>RVOE Federal 2018 · Sede CAM</span>
            <span>·</span>
            <span>Fecha de dictamen: <strong className="text-text-primary">{fechaConsulta}</strong></span>
          </div>
        </div>

        {/* Emblema UNID */}
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

      {/* 2. CINTILLA FORMAL DEL ESTUDIANTE */}
      <div className="bg-surface-2 border border-border rounded-xl px-5 py-3.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-8">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">Matrícula:</span>
            <span className="font-mono font-bold text-text-primary text-[13px] block mt-1">{estudiante.matricula}</span>
          </div>
          <div className="border-l border-border-subtle pl-6">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">Estudiante:</span>
            <span className="font-bold text-text-primary text-[13px] block mt-1">{estudiante.nombre}</span>
          </div>
          <div className="border-l border-border-subtle pl-6">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">Sede y Plan:</span>
            <span className="font-semibold text-text-secondary text-[13px] block mt-1">{estudiante.sede} · {carrera?.codigo || 'LIC-COFI-18'}</span>
          </div>
          <div className="border-l border-border-subtle pl-6">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Estatus Actual:</span>
            <StudentStatusSelector 
              estudiante={{ ...estudiante, estatus: localEstatus }} 
              onStatusChange={handleStatusUpdate} 
            />
          </div>
          {estudiante.modalidadDetectada && (
            <div className="border-l border-border-subtle pl-6">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Modalidad:</span>
              <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] uppercase border inline-block mt-0.5 ${
                estudiante.modalidadDetectada === 'EJECUTIVO' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                estudiante.modalidadDetectada === 'ESCOLARIZADO DUAL' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' :
                'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
              }`}>
                {estudiante.modalidadDetectada === 'ESCOLARIZADO DUAL' ? 'DUAL' : estudiante.modalidadDetectada}
              </span>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest block">Documento:</span>
          <span className="text-[13px] font-bold text-text-primary font-mono">HOJA 2 DE 2</span>
        </div>
      </div>

      {/* 3. DICTAMEN EJECUTIVO Y RESUMEN CUANTITATIVO */}
      <div className="grid grid-cols-12 gap-5 select-none">
        {/* Recuadro de Dictamen Normativo */}
        <div className={`col-span-5 rounded-2xl border p-5 flex flex-col justify-between ${
          esElegible 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-900 dark:text-rose-300'
        }`}>
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider pb-1.5">
              {esElegible ? (
                <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" strokeWidth={1.5} />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-700 dark:text-rose-400" strokeWidth={1.5} />
              )}
              <span>Dictamen Normativo Institucional</span>
            </div>

            <div className="text-[14px] font-black uppercase tracking-tight mt-1 leading-snug break-words">
              {resumen.dictamenEstadia}
            </div>

            <p className="text-[12.5px] mt-2.5 leading-relaxed opacity-90">
              {esElegible 
                ? 'El expediente del estudiante valida el 100% de los requisitos curriculares, idioma inglés y requisitos co-curriculares / egreso sin registrar materias en adeudo activo ni materias omitidas. Se autoriza la asignación e inscripción de la Estadía Empresarial y proceso de titulación.'
                : (resumen.adeudosReqEgreso > 0 || resumen.omitidasReqEgreso > 0)
                ? `El expediente presenta restricciones de titulación: ${resumen.adeudosReqEgreso || 0} adeudo(s) activo(s) y/o ${resumen.omitidasReqEgreso || 0} materia(s) omitida(s) en Requisitos Co-Curriculares y de Egreso (EGEL / Ortografía / Comprensión / TPEG). Requiere solventar los adeudos para acreditar el dictamen.`
                : `El expediente presenta restricciones académicas: ${resumen.adeudosQ1toQ6} asignatura(s) en adeudo activo y/o ${resumen.omitidasQ1toQ6} asignatura(s) omitida(s) dentro del bloque 1.º a 6.º cuatrimestre. Conforme al reglamento escolar UNID, no es posible inscribir Estadía Empresarial hasta solventar dichos adeudos.`
              }
            </p>
          </div>

          <div className="pt-3.5 mt-2 border-t border-current/20 text-[11px] flex items-center justify-between font-bold">
            <span>Validación: Coordinación de Licenciaturas</span>
            <span>Estatus: {esElegible ? 'AUTORIZADO' : 'NO ACREDITADO / BLOQUEO'}</span>
          </div>
        </div>

        {/* Resumen Cuantitativo de Avance Curricular */}
        <div className="col-span-7 bg-surface-2 border border-border rounded-2xl p-5">
          <div className="text-[11px] font-black uppercase text-text-primary tracking-wider mb-3 flex items-center justify-between border-b border-border-subtle pb-2">
            <span>Resumen Cuantitativo de Créditos y Materias</span>
            <span className="text-[10px] font-bold text-text-muted">Plan 37 Asignaturas + 5 Inglés + 4 Egreso</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
            <div className="bg-surface-1 p-2.5 rounded-xl border border-border shadow-sm">
              <span className="text-[10px] font-semibold text-text-muted block uppercase mb-0.5">Mapa Oficial</span>
              <span className="text-[16px] font-extrabold text-text-primary">{resumen.totalMateriasMapa} Asig.</span>
            </div>

            <div className="bg-surface-1 p-2.5 rounded-xl border border-border shadow-sm">
              <span className="text-[10px] font-semibold text-text-muted block uppercase mb-0.5">Niveles Inglés</span>
              <span className="text-[16px] font-extrabold text-text-primary">{resumen.inglesAcreditados} / 5</span>
            </div>

            <div className="bg-surface-1 p-2.5 rounded-xl border border-border shadow-sm">
              <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 block uppercase mb-0.5">Req. Egreso</span>
              <span className="text-[16px] font-extrabold text-purple-900 dark:text-purple-300">{resumen.coCurricularesAcreditados || 0} / 4</span>
            </div>

            <div className="bg-surface-1 p-2.5 rounded-xl border border-border shadow-sm">
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block uppercase mb-0.5">1.ª Oportunidad</span>
              <span className="text-[16px] font-extrabold text-[#059669]">{resumen.aprobadasOrd}</span>
            </div>

            <div className="bg-surface-1 p-2.5 rounded-xl border border-border shadow-sm">
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 block uppercase mb-0.5">Recursamientos</span>
              <span className="text-[16px] font-extrabold text-[#D97706]">{resumen.aprobadasRec}</span>
            </div>

            <div className="bg-surface-1 p-2.5 rounded-xl border border-border shadow-sm">
              <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-400 block uppercase mb-0.5">Modalidad RE</span>
              <span className="text-[16px] font-extrabold text-[#0284C7]">{resumen.aprobadasRe}</span>
            </div>

            <div className="bg-surface-1 p-2.5 rounded-xl border border-border shadow-sm">
              <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 block uppercase mb-0.5">Adeudos Activos</span>
              <span className="text-[16px] font-extrabold text-[#DC2626]">{resumen.adeudos}</span>
            </div>

            <div className="bg-surface-1 p-2.5 rounded-xl border border-border shadow-sm">
              <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 block uppercase mb-0.5">Omitidas</span>
              <span className="text-[16px] font-extrabold text-[#EA580C]">{resumen.omitidas}</span>
            </div>

            <div className="bg-surface-1 p-2.5 rounded-xl border border-border shadow-sm">
              <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 block uppercase mb-0.5">En Curso Activo</span>
              <span className="text-[16px] font-extrabold text-[#4F46E5]">{resumen.cursando}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BITÁCORA DE INCIDENCIAS Y TRAZABILIDAD DE INTENTOS */}
      <div className="space-y-3 select-none pt-2">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
            <h3 className="text-[13px] font-black uppercase text-text-primary tracking-wider">
              Bitácora de Incidencias y Trazabilidad de Intentos
            </h3>
          </div>
          <span className="text-[11px] text-text-muted">
            {incidencias.length > 0 
              ? `Registra ${incidencias.length} asignatura(s) con eventos académicos relevantes` 
              : 'Sin incidencias curriculares detectadas'}
          </span>
        </div>

        {incidencias.length > 0 ? (
          <div className="border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-surface-2 text-text-secondary text-[11px] uppercase font-bold tracking-wider border-b border-border">
                  <th className="py-2.5 px-3 text-center w-14">Cuat.</th>
                  <th className="py-2.5 px-3 w-28">Clave</th>
                  <th className="py-2.5 px-3">Asignatura</th>
                  <th className="py-2.5 px-3 text-center w-32">Clasificación</th>
                  <th className="py-2.5 px-3 text-center w-20">Intentos</th>
                  <th className="py-2.5 px-3">Trazabilidad por Periodo, CRN y Calificación</th>
                  <th className="py-2.5 px-3 w-64">Motivo / Dictamen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-surface-1">
                {incidencias.map((inc, index) => {
                  let badgeClass = 'bg-surface-2 text-text-secondary border-border';
                  if (inc.estado === 'REC') badgeClass = 'bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/20';
                  if (inc.estado === 'RE') badgeClass = 'bg-sky-100 dark:bg-sky-500/10 text-sky-900 dark:text-sky-300 border-sky-300 dark:border-sky-500/20';
                  if (inc.estado === 'ADEUDO') badgeClass = 'bg-red-100 dark:bg-red-500/10 text-red-900 dark:text-red-300 border-red-300 dark:border-red-500/20';
                  if (inc.estado === 'OMITIDA') badgeClass = 'bg-orange-100 dark:bg-orange-500/10 text-orange-900 dark:text-orange-300 border-orange-300 dark:border-orange-500/20';
                  if (inc.estado === 'RECURSANDO') badgeClass = 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/20';

                  return (
                    <tr key={index} className="hover:bg-surface-2/50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-text-secondary">
                        {inc.cuatrimestre}.º
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-text-primary text-[12px]">
                        {inc.clave}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-text-primary">
                        <span>{inc.nombre}</span>
                        {inc.conecta && (
                          <span className="ml-1.5 text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">
                            CC Conecta
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span 
                          data-badge="true"
                          className={`badge-pill inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black tracking-wide leading-none whitespace-nowrap shadow-sm border ${badgeClass}`}
                        >
                          {inc.etiquetaCorta}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-text-primary">
                        {inc.intentosTotal}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[12px] text-text-secondary">
                        {inc.historialTexto}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-text-muted italic">
                        {inc.motivoIncidencia || 'Registro académico validado'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 rounded-xl text-center text-[13px] text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" strokeWidth={1.5} />
            <span className="font-bold">Trayectoria Regular Limpia:</span> No se registran recursamientos, exámenes extraordinarios ni adeudos activos en el expediente.
          </div>
        )}
      </div>

      {/* 5. PIE DE PÁGINA FORMAL Y LÍNEAS DE VALIDACIÓN */}
      <div className="pt-5 mt-2 border-t-2 border-slate-900 dark:border-slate-500 grid grid-cols-3 gap-6 items-end select-none text-[12px]">
        <div>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
            Coordinación Emisora:
          </span>
          <span className="font-bold text-text-primary block mt-0.5">
            Coordinación de Licenciaturas Mixtas
          </span>
          <span className="text-[11px] text-text-muted mt-0.5 block">
            Sede CAM · Universidad Interamericana para el Desarrollo
          </span>
        </div>

        {/* Línea de Firma y Validación */}
        <div className="text-center">
          <div className="border-b border-text-muted w-48 mx-auto mb-1.5"></div>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
            Firma y Sello de Validación Académica
          </span>
          <span className="text-[10px] text-text-muted">
            Control Escolar y Coordinación de Sede
          </span>
        </div>

        {/* Numeración y Cadena */}
        <div className="text-right space-y-1">
          <div className="text-[11px] text-text-muted">
            Cadena de Certificación: <span className="font-mono text-text-secondary font-semibold">{estudiante.matricula}-CAM-2026</span>
          </div>
          <div className="text-[13px] font-black text-text-primary font-mono">
            HOJA 2 DE 2
          </div>
        </div>
      </div>
    </div>
  );
}
