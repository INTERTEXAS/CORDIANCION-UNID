import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  FileSpreadsheet
} from 'lucide-react';

export default function AuditCedula({ auditData, forwardedRef }) {
  if (!auditData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
        <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-bold text-slate-700">Sin cédula de auditoría</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
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
      className="bg-white rounded-md border border-slate-300 p-6 space-y-5 w-full max-w-[1380px] mx-auto box-border print:p-2 print:shadow-none print:border-none"
      id="hoja2-cedula-auditoria"
    >
      {/* 1. ENCABEZADO INSTITUCIONAL OFICIAL UNID */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 select-none">
        <div className="space-y-0.5">
          <div className="text-[10px] font-black tracking-widest text-[#111622] uppercase">
            UNIVERSIDAD INTERAMERICANA PARA EL DESARROLLO
          </div>
          <div className="text-xs font-black text-slate-800 uppercase tracking-tight">
            CÉDULA OFICIAL DE AUDITORÍA ACADÉMICA Y TRAZABILIDAD DE CRÉDITOS
          </div>
          <div className="text-sm font-black text-[#111622] uppercase tracking-normal">
            {carrera?.nombre || 'LICENCIATURA EN CONTABILIDAD Y FINANZAS (MIXTO) - FEDERAL'}
          </div>
          <div className="flex items-center space-x-4 pt-1 text-[10px] text-slate-500 font-medium">
            <span>RVOE Federal 2018 · Sede CAM</span>
            <span>·</span>
            <span>Fecha de dictamen: <strong className="text-slate-800">{fechaConsulta}</strong></span>
          </div>
        </div>

        {/* Emblema UNID */}
        <div className="flex items-center space-x-3 text-right">
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-[#111622] tracking-wider">UNID</span>
            <span className="text-[9px] font-extrabold text-slate-500 tracking-widest uppercase">
              FORMANDO CON VALORES
            </span>
          </div>
          <img 
            src="/unid-logo.png" 
            alt="UNID" 
            className="w-10 h-10 rounded-xl object-contain shadow-xs border border-slate-200/80 flex-shrink-0" 
          />
        </div>
      </div>

      {/* 2. CINTILLA FORMAL DEL ESTUDIANTE */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-8">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Matrícula:</span>
            <span className="font-mono font-bold text-slate-900 text-xs">{estudiante.matricula}</span>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estudiante:</span>
            <span className="font-bold text-slate-900 text-xs">{estudiante.nombre}</span>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sede y Plan:</span>
            <span className="font-semibold text-slate-800 text-xs">{estudiante.sede} · {carrera?.codigo || 'LIC-COFI-18'}</span>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estatus Actual:</span>
            <span className="font-bold text-slate-800 text-xs">{estudiante.estatus || 'AC'}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Documento:</span>
          <span className="text-xs font-bold text-slate-800 font-mono">HOJA 2 DE 2</span>
        </div>
      </div>

      {/* 3. DICTAMEN EJECUTIVO Y RESUMEN CUANTITATIVO */}
      <div className="grid grid-cols-12 gap-4 select-none">
        {/* Recuadro de Dictamen Normativo */}
        <div className={`col-span-5 rounded-xl border p-4 flex flex-col justify-between ${
          esElegible 
            ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]' 
            : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
        }`}>
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider pb-1">
              {esElegible ? (
                <ShieldCheck className="w-4 h-4 text-emerald-700" strokeWidth={1.5} />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-700" strokeWidth={1.5} />
              )}
              <span>Dictamen Normativo Institucional</span>
            </div>

            <div className="text-[13px] font-black uppercase tracking-tight mt-1 leading-snug break-words">
              {resumen.dictamenEstadia}
            </div>

            <p className="text-xs mt-2 leading-relaxed opacity-95">
              {esElegible 
                ? 'El expediente del estudiante valida el 100% de los requisitos curriculares, idioma inglés y requisitos co-curriculares / egreso sin registrar materias en adeudo activo ni materias omitidas. Se autoriza la asignación e inscripción de la Estadía Empresarial y proceso de titulación.'
                : (resumen.adeudosReqEgreso > 0 || resumen.omitidasReqEgreso > 0)
                ? `El expediente presenta restricciones de titulación: ${resumen.adeudosReqEgreso || 0} adeudo(s) activo(s) y/o ${resumen.omitidasReqEgreso || 0} materia(s) omitida(s) en Requisitos Co-Curriculares y de Egreso (EGEL / Ortografía / Comprensión / TPEG). Requiere solventar los adeudos para acreditar el dictamen.`
                : `El expediente presenta restricciones académicas: ${resumen.adeudosQ1toQ6} asignatura(s) en adeudo activo y/o ${resumen.omitidasQ1toQ6} asignatura(s) omitida(s) dentro del bloque 1.º a 6.º cuatrimestre. Conforme al reglamento escolar UNID, no es posible inscribir Estadía Empresarial hasta solventar dichos adeudos.`
              }
            </p>
          </div>

          <div className="pt-3 border-t border-current/20 text-[10px] flex items-center justify-between font-bold">
            <span>Validación: Coordinación de Licenciaturas</span>
            <span>Estatus: {esElegible ? 'AUTORIZADO' : 'NO ACREDITADO / BLOQUEO'}</span>
          </div>
        </div>

        {/* Resumen Cuantitativo de Avance Curricular */}
        <div className="col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="text-[10px] font-black uppercase text-slate-700 tracking-wider mb-2 flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span>Resumen Cuantitativo de Créditos y Materias</span>
            <span className="text-[10px] font-bold text-slate-500">Plan 37 Asignaturas + 5 Inglés + 4 Egreso</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Mapa Oficial</span>
              <span className="text-base font-extrabold text-slate-900">{resumen.totalMateriasMapa} Asignaturas</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Niveles Inglés</span>
              <span className="text-base font-extrabold text-slate-900">{resumen.inglesAcreditados} / 5</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-purple-700 block uppercase">Req. Egreso</span>
              <span className="text-base font-extrabold text-purple-900">{resumen.coCurricularesAcreditados || 0} / 4</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-emerald-700 block uppercase">1.ª Oportunidad</span>
              <span className="text-base font-extrabold text-[#059669]">{resumen.aprobadasOrd}</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-amber-700 block uppercase">Recursamientos</span>
              <span className="text-base font-extrabold text-[#D97706]">{resumen.aprobadasRec}</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-sky-700 block uppercase">Modalidad RE</span>
              <span className="text-base font-extrabold text-[#0284C7]">{resumen.aprobadasRe}</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-rose-700 block uppercase">Adeudos Activos</span>
              <span className="text-base font-extrabold text-[#DC2626]">{resumen.adeudos}</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-orange-700 block uppercase">Omitidas</span>
              <span className="text-base font-extrabold text-[#EA580C]">{resumen.omitidas}</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-indigo-700 block uppercase">En Curso Activo</span>
              <span className="text-base font-extrabold text-[#4F46E5]">{resumen.cursando}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BITÁCORA DE INCIDENCIAS Y TRAZABILIDAD DE INTENTOS */}
      <div className="space-y-2 select-none">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Bitácora de Incidencias y Trazabilidad de Intentos
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">
            {incidencias.length > 0 
              ? `Registra ${incidencias.length} asignatura(s) con eventos académicos relevantes` 
              : 'Sin incidencias curriculares detectadas'}
          </span>
        </div>

        {incidencias.length > 0 ? (
          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
                  <th className="py-2 px-3 text-center w-14">Cuat.</th>
                  <th className="py-2 px-3 w-28">Clave</th>
                  <th className="py-2 px-3">Asignatura</th>
                  <th className="py-2 px-3 text-center w-28">Clasificación</th>
                  <th className="py-2 px-3 text-center w-20">Intentos</th>
                  <th className="py-2 px-3">Trazabilidad por Periodo, CRN y Calificación</th>
                  <th className="py-2 px-3 w-64">Motivo / Dictamen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidencias.map((inc, index) => {
                  let badgeClass = 'bg-slate-100 text-slate-700';
                  if (inc.estado === 'REC') badgeClass = 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold';
                  if (inc.estado === 'RE') badgeClass = 'bg-sky-100 text-sky-900 border border-sky-300 font-extrabold';
                  if (inc.estado === 'ADEUDO') badgeClass = 'bg-red-100 text-red-900 border border-red-300 font-extrabold';
                  if (inc.estado === 'OMITIDA') badgeClass = 'bg-orange-100 text-orange-900 border border-orange-300 font-extrabold';
                  if (inc.estado === 'RECURSANDO') badgeClass = 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-extrabold';

                  return (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center font-bold text-slate-700">
                        {inc.cuatrimestre}.º
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800 text-[11px]">
                        {inc.clave}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        <span>{inc.nombre}</span>
                        {inc.conecta && (
                          <span className="ml-1.5 text-[9px] font-black text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                            CC Conecta
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span 
                          data-badge="true"
                          className={`badge-pill inline-flex items-center justify-center px-3 h-[22px] rounded-full text-[10px] font-black tracking-wide leading-none whitespace-nowrap shadow-2xs ${badgeClass}`}
                        >
                          <span className="inline-block transform -translate-y-[1px] leading-none">
                            {inc.etiquetaCorta}
                          </span>
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                        {inc.intentosTotal}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                        {inc.historialTexto}
                      </td>
                      <td className="py-2 px-3 text-[10px] text-slate-600 italic">
                        {inc.motivoIncidencia || 'Registro académico validado'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-lg text-center text-xs text-emerald-900">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" strokeWidth={1.5} />
            <span className="font-bold">Trayectoria Regular Limpia:</span> No se registran recursamientos, exámenes extraordinarios ni adeudos activos en el expediente.
          </div>
        )}
      </div>

      {/* 5. PIE DE PÁGINA FORMAL Y LÍNEAS DE VALIDACIÓN */}
      <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-6 items-end select-none text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Coordinación Emisora:
          </span>
          <span className="font-bold text-slate-800 block">
            Coordinación de Licenciaturas Mixtas
          </span>
          <span className="text-[10px] text-slate-500">
            Sede CAM · Universidad Interamericana para el Desarrollo
          </span>
        </div>

        {/* Línea de Firma y Validación */}
        <div className="text-center">
          <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
            Firma y Sello de Validación Académica
          </span>
          <span className="text-[9px] text-slate-400">
            Control Escolar y Coordinación de Sede
          </span>
        </div>

        {/* Numeración y Cadena */}
        <div className="text-right space-y-0.5">
          <div className="text-[10px] text-slate-500">
            Cadena de Certificación: <span className="font-mono text-slate-700 font-semibold">{estudiante.matricula}-CAM-2026</span>
          </div>
          <div className="text-xs font-black text-slate-900 font-mono">
            HOJA 2 DE 2
          </div>
        </div>
      </div>
    </div>
  );
}
