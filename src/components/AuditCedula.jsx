import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  FileSpreadsheet
} from 'lucide-react';

export default function AuditCedula({ auditData, forwardedRef, onStatusChange }) {
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
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-2xs">
        <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2.5" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-slate-900">Sin cédula de auditoría</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Cargue el expediente del estudiante para generar la cédula ejecutiva y la bitácora de trazabilidad.
        </p>
      </div>
    );
  }

  const { estudiante, carrera, resumen, incidencias = [], fechaConsulta } = auditData;
  const esElegible = resumen?.esElegibleEstadia;
  const totalMateriasMapa = resumen?.totalMateriasMapa ?? 37;
  const totalNivelesIngles = resumen?.nivelesIngles ?? 5;
  const totalRequisitosEgreso = resumen?.requisitosEgresoTotal ?? 4;
  const totalAprobadas = resumen?.totalAprobadas ?? ((resumen?.aprobadasOrd || 0) + (resumen?.aprobadasRec || 0) + (resumen?.aprobadasRe || 0));

  return (
    <div 
      ref={forwardedRef} 
      className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 w-full max-w-[1400px] mx-auto box-border shadow-2xs print:p-2 print:shadow-none print:border-none print:bg-white print:text-black"
      id="hoja2-cedula-auditoria"
    >
      {/* 1. ENCABEZADO INSTITUCIONAL OFICIAL UNID */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-3 select-none">
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            UNIVERSIDAD INTERAMERICANA PARA EL DESARROLLO
          </div>
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-tight">
            CÉDULA OFICIAL DE AUDITORÍA ACADÉMICA Y TRAZABILIDAD DE CRÉDITOS
          </div>
          <div className="text-sm font-bold text-slate-900 uppercase tracking-normal">
            {carrera?.nombre || 'LICENCIATURA EN CONTABILIDAD Y FINANZAS (MIXTO) - FEDERAL'}
          </div>
          <div className="flex items-center space-x-3 pt-0.5 text-[10px] text-slate-400 font-mono">
            <span>RVOE Federal 2018 · Sede CAM</span>
            <span>·</span>
            <span>Fecha de dictamen: <strong className="text-slate-700">{fechaConsulta}</strong></span>
          </div>
        </div>

        {/* Emblema UNID */}
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

      {/* 2. CINTILLA FORMAL DEL ESTUDIANTE */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">Matrícula</span>
            <span className="font-mono font-bold text-slate-900 text-xs block">{estudiante.matricula}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">Estudiante</span>
            <span className="font-semibold text-slate-900 text-xs block">{estudiante.nombre}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block">Sede y Plan</span>
            <span className="font-medium text-slate-700 text-xs block">{estudiante.sede} · {carrera?.codigo || 'LIC-COFI-18'}</span>
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

        <div className="text-right">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Documento</span>
          <span className="text-xs font-bold text-slate-800 font-mono">HOJA 2 DE 2</span>
        </div>
      </div>

      {/* 3. DICTAMEN EJECUTIVO Y RESUMEN CUANTITATIVO */}
      <div className="grid grid-cols-12 gap-3.5 select-none">
        {/* Recuadro de Dictamen Normativo (5 cols) */}
        <div className={`col-span-5 rounded-lg border p-4 flex flex-col justify-between ${
          esElegible 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
            : 'bg-rose-50/70 border-rose-200 text-rose-950'
        }`}>
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider pb-1">
              {esElegible ? (
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-700" />
              )}
              <span>Dictamen Normativo Institucional</span>
            </div>

            <div className="text-sm font-bold uppercase tracking-tight mt-1 leading-snug">
              {resumen.dictamenEstadia}
            </div>

            <p className="text-xs mt-2 leading-relaxed opacity-90">
              {esElegible 
                ? 'Expediente académico con 100% de créditos acreditados, idioma inglés y requisitos de egreso completados sin adeudos. Acreditado para inscripción de Estadía Empresarial y Titulación.'
                : (resumen.adeudosReqEgreso > 0 || resumen.omitidasReqEgreso > 0)
                ? `Presenta ${resumen.adeudosReqEgreso || 0} adeudo(s) y/o ${resumen.omitidasReqEgreso || 0} omisión(es) en Requisitos Co-Curriculares/Egreso. Requiere solventar para acreditar dictamen.`
                : `Presenta ${resumen.adeudosQ1toQ6} adeudo(s) y/o ${resumen.omitidasQ1toQ6} asignatura(s) omitida(s) en 1.º a 6.º cuatrimestre. Conforme al reglamento escolar, bloquea Estadía Empresarial.`
              }
            </p>
          </div>

          <div className="pt-2 mt-2 border-t border-current/15 text-[11px] flex items-center justify-between font-semibold">
            <span>Validación: Coordinación de Licenciaturas</span>
            <span>Estatus: {esElegible ? 'AUTORIZADO' : 'BLOQUEADO'}</span>
          </div>
        </div>

        {/* Resumen Cuantitativo de Avance Curricular (7 cols) */}
        <div className="col-span-7 bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase text-slate-700 tracking-wider flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
            <span>Resumen Cuantitativo de Avance</span>
            <span className="text-[9.5px] font-mono text-slate-400">
              Plan {totalMateriasMapa} Asig. + {totalNivelesIngles} Inglés + {totalRequisitosEgreso} Egreso
            </span>
          </div>

          {/* Nivel 1: 4 KPIs Principales Destacados */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {/* 1. Avance Mapa */}
            <div className="bg-white p-2 rounded-md border border-slate-200 shadow-2xs">
              <span className="text-[9px] font-semibold text-slate-400 uppercase block mb-0.5">Avance Plan</span>
              <div className="flex items-baseline space-x-1 font-mono">
                <span className="text-sm font-bold text-slate-900">{totalAprobadas}</span>
                <span className="text-[11px] text-slate-400">/{totalMateriasMapa}</span>
              </div>
              <span className="text-[8.5px] text-slate-400 block mt-0.5">Aprobadas</span>
            </div>

            {/* 2. Inglés */}
            <div className="bg-white p-2 rounded-md border border-slate-200 shadow-2xs">
              <span className="text-[9px] font-semibold text-slate-400 uppercase block mb-0.5">Inglés</span>
              <div className="flex items-baseline space-x-1 font-mono">
                <span className="text-sm font-bold text-slate-900">{resumen.inglesAcreditados}</span>
                <span className="text-[11px] text-slate-400">/{totalNivelesIngles}</span>
              </div>
              <span className="text-[8.5px] text-slate-400 block mt-0.5">Acreditados</span>
            </div>

            {/* 3. Requisitos Egreso */}
            <div className="bg-white p-2 rounded-md border border-slate-200 shadow-2xs">
              <span className="text-[9px] font-semibold text-slate-400 uppercase block mb-0.5">Req. Egreso</span>
              <div className="flex items-baseline space-x-1 font-mono">
                <span className="text-sm font-bold text-slate-900">{resumen.coCurricularesAcreditados || 0}</span>
                <span className="text-[11px] text-slate-400">/{totalRequisitosEgreso}</span>
              </div>
              <span className="text-[8.5px] text-slate-400 block mt-0.5">Co-curriculares</span>
            </div>

            {/* 4. Promedio General */}
            <div className="bg-white p-2 rounded-md border border-slate-200 shadow-2xs">
              <span className="text-[9px] font-semibold text-slate-400 uppercase block mb-0.5">Promedio</span>
              <div className="flex items-baseline space-x-1 font-mono">
                <span className="text-sm font-bold text-slate-900">{resumen?.promedioFormatted || 'S/C'}</span>
                <span className="text-[11px] text-slate-400">/10</span>
              </div>
              <span className="text-[8.5px] text-slate-400 block mt-0.5 font-mono">
                {resumen?.materiasConNota > 0 ? `${resumen.materiasConNota} asig.` : 'En curso'}
              </span>
            </div>
          </div>

          {/* Nivel 2: Trazabilidad Técnica Ejecutiva (Sin cajas vacías en cero) */}
          <div className="bg-white rounded-md border border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center space-x-3 text-slate-700 font-mono">
              <span><strong className="text-slate-900 font-bold">{resumen.aprobadasOrd}</strong> <span className="text-slate-400 font-sans text-[11px]">Ordinarias</span></span>
              <span className="text-slate-200">·</span>
              <span><strong className="text-amber-800 font-bold">{resumen.aprobadasRec}</strong> <span className="text-slate-400 font-sans text-[11px]">Recursadas</span></span>
              {resumen.aprobadasRe > 0 && (
                <>
                  <span className="text-slate-200">·</span>
                  <span><strong className="text-sky-800 font-bold">{resumen.aprobadasRe}</strong> <span className="text-slate-400 font-sans text-[11px]">Modo RE</span></span>
                </>
              )}
            </div>
            <div>
              {resumen.adeudos === 0 && resumen.omitidas === 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Sin Adeudos Activos
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  {resumen.adeudos} Adeudo(s) · {resumen.omitidas} Omitida(s)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BITÁCORA DE INCIDENCIAS Y TRAZABILIDAD DE INTENTOS */}
      <div className="space-y-2 select-none pt-1">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <div className="flex items-center space-x-1.5">
            <FileSpreadsheet className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
            <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
              Bitácora de Incidencias y Trazabilidad de Intentos
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {incidencias.length > 0 
              ? `${incidencias.length} evento(s) académico(s) relevante(s)` 
              : 'Sin incidencias curriculares'}
          </span>
        </div>

        {incidencias.length > 0 ? (
          <div className="border border-slate-200 rounded-md overflow-x-auto shadow-2xs">
            <table className="w-full min-w-[720px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase font-semibold tracking-wider border-b border-slate-200">
                  <th className="py-1.5 px-3 text-center w-12 font-mono">Cuat.</th>
                  <th className="py-1.5 px-3 w-28">Clave</th>
                  <th className="py-1.5 px-3">Asignatura</th>
                  <th className="py-1.5 px-3 text-center w-28">Clasificación</th>
                  <th className="py-1.5 px-3 text-center w-16 font-mono">Intentos</th>
                  <th className="py-1.5 px-3">Trazabilidad por Periodo, CRN y Calificación</th>
                  <th className="py-1.5 px-3 w-60">Motivo / Dictamen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {incidencias.map((inc, index) => {
                  return (
                    <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 text-center font-mono font-semibold text-slate-500">
                        {inc.cuatrimestre}.º
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-900 text-xs">
                        {inc.clave}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        <span>{inc.nombre}</span>
                        {inc.conecta && (
                          <span className="ml-1.5 text-[8px] font-bold text-cyan-800 bg-cyan-50 px-1 py-0.2 rounded border border-cyan-200">
                            CONECTA
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span 
                          data-badge="true"
                          className="badge-pill inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide leading-none whitespace-nowrap border bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
                        >
                          {inc.etiquetaCorta}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                        {inc.intentosTotal}
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-slate-600">
                        {inc.historialTexto}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-500">
                        {inc.motivoIncidencia || 'Registro académico validado'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-md text-center text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-0.5" strokeWidth={1.5} />
            <span className="font-semibold">Trayectoria Regular Limpia:</span> Sin recursamientos ni adeudos activos registrados.
          </div>
        )}
      </div>

      {/* 5. PIE DE PÁGINA FORMAL Y LÍNEAS DE VALIDACIÓN */}
      <div className="pt-2.5 mt-1 border-t border-slate-200 grid grid-cols-3 gap-6 items-end select-none text-xs">
        <div>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
            Coordinación Emisora
          </span>
          <span className="font-semibold text-slate-900 block mt-0.5">
            Coordinación de Licenciaturas Mixtas
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Sede CAM · Universidad Interamericana para el Desarrollo
          </span>
        </div>

        {/* Línea de Firma y Validación */}
        <div className="text-center">
          <div className="border-b border-slate-300 w-44 mx-auto mb-1"></div>
          <span className="text-[9.5px] font-semibold text-slate-600 uppercase tracking-wider block">
            Firma y Sello de Validación Académica
          </span>
          <span className="text-[9px] text-slate-400">
            Control Escolar y Coordinación de Sede
          </span>
        </div>

        {/* Numeración y Cadena */}
        <div className="text-right space-y-0.5">
          <div className="text-[10px] text-slate-400 font-mono">
            Cadena: <span className="text-slate-700 font-semibold">{estudiante.matricula}-CAM-2026</span>
          </div>
          <div className="text-xs font-bold text-slate-900 font-mono">
            HOJA 2 DE 2
          </div>
        </div>
      </div>
    </div>
  );
}
