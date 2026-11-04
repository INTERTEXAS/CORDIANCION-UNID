import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  AlertTriangle, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Layers, 
  SlidersHorizontal,
  Printer,
  Database,
  Calendar,
  ArrowUpDown,
  Download,
  RefreshCw
} from 'lucide-react';
import CurriculumMap from './CurriculumMap';
import AuditCedula from './AuditCedula';
import FilterPills from './FilterPills';
import NeonAuditManagerModal from './NeonAuditManagerModal';
import { runAcademicAudit } from '../services/auditEngine';
import { CARRERAS_LOCAL } from '../data/carrerasData';

function getResolvedAudit(item, batchCarrera) {
  if (!item) return null;
  if (
    item.auditData?.resumen?.promedioFormatted !== undefined &&
    item.auditData?.estudiante?.modalidadDetectada &&
    item.auditData.estudiante.modalidadDetectada !== 'ESCOLARIZADO' ||
    (item.auditData?.resumen?.promedioFormatted !== undefined && !item.carrera?.codigo?.startsWith('MAE-') && !batchCarrera?.codigo?.startsWith('MAE-'))
  ) {
    return item.auditData;
  }
  const est = item.estudiante || {};
  const registros = est.registros || item.auditData?.estudiante?.registros || [];
  const studentCarrera = item.carrera || batchCarrera || CARRERAS_LOCAL[0];
  const estToAudit = { ...est };
  delete estToAudit.modalidadDetectada;
  if (!estToAudit.programa && studentCarrera?.codigo) {
    estToAudit.programa = studentCarrera.codigo;
  }
  const fresh = runAcademicAudit(estToAudit, registros, studentCarrera);
  item.auditData = fresh;
  item.estudiante = fresh.estudiante;
  return fresh;
}

export default function BatchAuditView({
  batchData, // { totalAlumnos, alumnos: [ { estudiante, auditData, carrera } ], carrera }
  onClearBatch,
  onUploadNewBatch,
  onUploadPdf,
  onActiveStudentAuditChange,
  onExportPdf,
  isExporting,
  onLoadBatchData
}) {
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS'); // 'TODOS' | 'ELEGIBLE' | 'ADEUDOS' | 'OMITIDAS'
  const [sortBy, setSortBy] = useState('nombre'); // 'nombre' | 'matricula' | 'avance-desc' | 'avance-asc'
  const [isNeonModalOpen, setIsNeonModalOpen] = useState(false);
  const [neonModalMode, setNeonModalMode] = useState('gestionar'); // 'guardar' | 'gestionar'
  
  // Alumno seleccionado para ver su mapa individual en detalle (índice dentro de batchData.alumnos)
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
  const [activeSheetTab, setActiveSheetTab] = useState('mapa'); // 'mapa' | 'cedula'
  const [activeMapFilter, setActiveMapFilter] = useState('TODAS');

  const alumnos = batchData?.alumnos || [];

  // Sincronizar el alumno actualmente auditado con el componente padre (para habilitar exportación de PDF)
  useEffect(() => {
    if (selectedStudentIndex !== null && alumnos[selectedStudentIndex]) {
      const resolved = getResolvedAudit(alumnos[selectedStudentIndex], batchData?.carrera);
      onActiveStudentAuditChange?.(resolved);
    } else {
      onActiveStudentAuditChange?.(null);
    }
  }, [selectedStudentIndex, alumnos, batchData?.carrera, onActiveStudentAuditChange]);

  // Métricas globales de la generación
  const stats = useMemo(() => {
    let elegibles = 0;
    let conAdeudos = 0;
    let conOmitidas = 0;
    let promedioAvanceTotal = 0;
    let sumaPromedios = 0;
    let alumnosConPromedio = 0;

    for (const item of alumnos) {
      const audit = getResolvedAudit(item, batchData?.carrera);
      const res = audit?.resumen;
      if (!res) continue;
      if (res.dictamenEstadia?.includes('APROBADO') || res.dictamenEstadia?.includes('ELEGIBLE')) {
        elegibles++;
      }
      if (res.adeudos > 0) conAdeudos++;
      if (res.omitidas > 0) conOmitidas++;
      const totalAprobadas = res.totalAprobadas ?? ((res.aprobadasOrd || 0) + (res.aprobadasRec || 0) + (res.aprobadasRe || 0));
      promedioAvanceTotal += Math.round((totalAprobadas / (res.totalMateriasMapa || 37)) * 100);

      if (typeof res.promedio === 'number' && !isNaN(res.promedio)) {
        sumaPromedios += res.promedio;
        alumnosConPromedio++;
      }
    }

    const promedioGeneracion = alumnosConPromedio > 0
      ? (Math.round((sumaPromedios / alumnosConPromedio) * 100) / 100).toFixed(2)
      : 'S/C';

    return {
      total: alumnos.length,
      elegibles,
      conAdeudos,
      conOmitidas,
      promedioAvance: alumnos.length > 0 ? Math.round(promedioAvanceTotal / alumnos.length) : 0,
      promedioGeneracion,
      alumnosConPromedio
    };
  }, [alumnos, batchData?.carrera]);

  // Filtrado y ordenamiento de alumnos
  const filteredAlumnos = useMemo(() => {
    return alumnos
      .map((item, originalIndex) => {
        getResolvedAudit(item, batchData?.carrera);
        return { ...item, originalIndex };
      })
      .filter(({ estudiante, auditData }) => {
        // Búsqueda por texto (nombre o matrícula)
        const q = searchQuery.toLowerCase().trim();
        const matchSearch = !q || 
          estudiante.nombre.toLowerCase().includes(q) || 
          estudiante.matricula.includes(q);

        if (!matchSearch) return false;

        const res = auditData?.resumen;
        if (!res) return true;

        if (filterStatus === 'ELEGIBLE') {
          return res.dictamenEstadia?.includes('APROBADO') || res.dictamenEstadia?.includes('ELEGIBLE');
        }
        if (filterStatus === 'ADEUDOS') {
          return res.adeudos > 0;
        }
        if (filterStatus === 'OMITIDAS') {
          return res.omitidas > 0;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nombre') {
          return a.estudiante.nombre.localeCompare(b.estudiante.nombre);
        }
        if (sortBy === 'matricula') {
          return a.estudiante.matricula.localeCompare(b.estudiante.matricula);
        }
        if (sortBy === 'avance-desc') {
          const aAprob = a.auditData?.resumen?.totalAprobadas ?? ((a.auditData?.resumen?.aprobadasOrd || 0) + (a.auditData?.resumen?.aprobadasRec || 0));
          const bAprob = b.auditData?.resumen?.totalAprobadas ?? ((b.auditData?.resumen?.aprobadasOrd || 0) + (b.auditData?.resumen?.aprobadasRec || 0));
          return bAprob - aAprob;
        }
        if (sortBy === 'avance-asc') {
          const aAprob = a.auditData?.resumen?.totalAprobadas ?? ((a.auditData?.resumen?.aprobadasOrd || 0) + (a.auditData?.resumen?.aprobadasRec || 0));
          const bAprob = b.auditData?.resumen?.totalAprobadas ?? ((b.auditData?.resumen?.aprobadasOrd || 0) + (b.auditData?.resumen?.aprobadasRec || 0));
          return aAprob - bAprob;
        }
        return 0;
      });
  }, [alumnos, searchQuery, filterStatus, sortBy, batchData?.carrera]);

  // Si hay un alumno seleccionado, mostrar el visor detallado de sus dos hojas
  if (selectedStudentIndex !== null && alumnos[selectedStudentIndex]) {
    const selectedItem = alumnos[selectedStudentIndex];
    const currentAudit = getResolvedAudit(selectedItem, batchData?.carrera);
    const filterCounts = currentAudit?.resumen ? {
      todas: currentAudit.resumen.totalMateriasMapa,
      ord: currentAudit.resumen.aprobadasOrd,
      rec: currentAudit.resumen.aprobadasRec,
      re: currentAudit.resumen.aprobadasRe,
      adeudo: currentAudit.resumen.adeudos,
      omitida: currentAudit.resumen.omitidas,
      ou: currentAudit.incidencias.filter(incidencia => incidencia.estado === 'OU').length
        + currentAudit.electivas.filter(electiva => electiva.calificacion === 'OU').length
    } : undefined;

    return (
      <div className="space-y-4 animate-fade-in transition-theme">
        {/* Barra de Navegación de Alumno del Grupo */}
        <div className="no-print print:hidden bg-surface-1 p-4 rounded-2xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-4 select-none">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedStudentIndex(null)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-surface-2 hover:bg-surface-3 text-text-primary text-[13px] font-bold rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              <span>Volver al Grupo ({alumnos.length})</span>
            </button>

            <span className="text-border-subtle hidden sm:inline">|</span>

            {/* Selector desplegable de alumnos del lote */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider hidden sm:inline">
                Expediente:
              </span>
              <select
                value={selectedStudentIndex}
                onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
                className="bg-surface-2 border border-border hover:border-accent/50 text-text-primary text-[13px] font-bold rounded-xl px-3 py-2 cursor-pointer focus:ring-2 focus:ring-accent/50 focus:outline-none transition-all"
              >
                {alumnos.map((item, idx) => (
                  <option key={item.estudiante.matricula} value={idx}>
                    {idx + 1}. [{item.estudiante.matricula}] {item.estudiante.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Flechas Anterior / Siguiente */}
          <div className="flex items-center space-x-2.5">
            <button
              disabled={selectedStudentIndex <= 0}
              onClick={() => setSelectedStudentIndex(prev => Math.max(0, prev - 1))}
              className="flex items-center justify-center p-2.5 bg-surface-2 hover:bg-surface-3 border border-border text-text-primary rounded-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>

            <span className="text-[13px] font-mono font-bold text-text-secondary px-1">
              {selectedStudentIndex + 1} / {alumnos.length}
            </span>

            <button
              disabled={selectedStudentIndex >= alumnos.length - 1}
              onClick={() => setSelectedStudentIndex(prev => Math.min(alumnos.length - 1, prev + 1))}
              className="flex items-center justify-center p-2.5 bg-surface-2 hover:bg-surface-3 border border-border text-text-primary rounded-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>

            {onExportPdf && (
              <button
                onClick={onExportPdf}
                disabled={isExporting}
                className="flex items-center space-x-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-slate-950 text-[13px] font-bold rounded-xl shadow-sm hover:shadow-glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ml-2"
                title="Exportar dictamen oficial de 2 hojas para este alumno"
              >
                <Download className="w-4 h-4" strokeWidth={2} />
                <span className="hidden md:inline">Exportar Dictamen (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Selector de Pestañas (Hoja 1 y Hoja 2) y Filtros */}
        <div className="no-print print:hidden bg-surface-1 p-4 rounded-2xl border border-border shadow-sm space-y-3 transition-theme">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="bg-surface-2 p-1 rounded-xl inline-flex items-center space-x-1 select-none border border-border-subtle w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveSheetTab('mapa')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSheetTab === 'mapa'
                    ? 'bg-surface-0 border border-border shadow-sm text-text-primary'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-3'
                }`}
              >
                <Layers className="w-4 h-4" strokeWidth={1.8} />
                <span>Hoja 1: Mapa de Ejecución</span>
              </button>

              <button
                onClick={() => setActiveSheetTab('cedula')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSheetTab === 'cedula'
                    ? 'bg-surface-0 border border-border shadow-sm text-text-primary'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-3'
                }`}
              >
                <FileText className="w-4 h-4" strokeWidth={1.8} />
                <span>Hoja 2: Cédula y Trazabilidad</span>
              </button>
            </div>

            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider hidden md:block">
              {activeSheetTab === 'mapa' ? 'Validación Cuatrimestral' : 'Cédula Oficial y Trazabilidad'}
            </div>
          </div>

          {activeSheetTab === 'mapa' && (
            <div className="border-t border-border-subtle pt-3">
              <FilterPills
                activeFilter={activeMapFilter}
                onFilterChange={setActiveMapFilter}
                counts={filterCounts}
              />
            </div>
          )}
        </div>

        {/* Vista del Mapa o Cédula */}
        <div className="transition-all duration-300">
          {activeSheetTab === 'mapa' ? (
            <CurriculumMap 
              auditData={currentAudit} 
              activeFilter={activeMapFilter} 
            />
          ) : (
            <AuditCedula 
              auditData={currentAudit} 
            />
          )}
        </div>
      </div>
    );
  }

  // Vista de Directorio de la Generación Completa
  return (
    <div className="space-y-4 animate-fade-in text-slate-800 font-sans">
      {/* 1. Cabecera Institucional Consolidada de la Generación */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print:hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Coordinación Académica UNID</span>
              <span className="text-slate-300">/</span>
              <span className="text-amber-700">Auditoría de Grupo</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {batchData.carrera?.nombre || 'Licenciatura en Contabilidad y Finanzas'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Programa: <span className="font-mono font-semibold text-slate-700">{batchData.carrera?.codigo || 'LIC-COFI-18'}</span> ·
              Reporte oficial de materias acreditadas (Banner UNID) · <span className="font-medium text-slate-700">{alumnos.length} expedientes procesados</span>
            </p>
          </div>

          {/* Grupo de Acciones Unificado */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Base de Datos Neon (Segmentado) */}
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setNeonModalMode('guardar');
                  setIsNeonModalOpen(true);
                }}
                className="px-3 py-1.5 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center space-x-1.5"
                title="Guardar lote en Neon Database"
              >
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Guardar en BD</span>
              </button>
              <div className="w-px h-4 bg-slate-200 my-auto" />
              <button
                type="button"
                onClick={() => {
                  setNeonModalMode('gestionar');
                  setIsNeonModalOpen(true);
                }}
                className="px-3 py-1.5 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center space-x-1.5"
                title="Historial de auditorías en Neon"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Ciclos</span>
              </button>
            </div>

            {/* Imprimir Sábana */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5"
              title="Imprimir sábana ejecutiva"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Imprimir Sábana</span>
            </button>

            {/* Input oculto para subir PDF */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (onUploadPdf) onUploadPdf(file);
                  else if (onUploadNewBatch) onUploadNewBatch(file);
                  e.target.value = '';
                }
              }}
              accept="application/pdf"
              className="hidden"
            />

            {/* Subir otro Reporte */}
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
                else if (onUploadNewBatch) onUploadNewBatch();
              }}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5"
              title="Cargar nuevo PDF"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Nuevo Reporte</span>
            </button>
            
            {/* Cerrar Grupo */}
            <button
              type="button"
              onClick={onClearBatch}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              title="Cerrar vista actual"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Métricas de la Generación: KPI Ribbon Continuo */}
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/50">
          {/* Card 1: Total Alumnos */}
          <div className="px-5 py-3.5">
            <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Expedientes Totales</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900">{stats.total}</span>
              <span className="text-xs text-slate-500 font-mono">alumnos</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">100% procesados</span>
          </div>

          {/* Card 2: Aptos para Estadía */}
          <div className="px-5 py-3.5">
            <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Aptos para Estadía</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900">{stats.elegibles}</span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">
                {Math.round((stats.elegibles / Math.max(1, stats.total)) * 100)}%
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium flex items-center space-x-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Elegibles para titulación</span>
            </span>
          </div>

          {/* Card 3: Adeudos Previos */}
          <div className="px-5 py-3.5">
            <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Adeudos (1.º - 6.º)</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-rose-600">{stats.conAdeudos}</span>
              <span className="text-xs text-slate-400">alumnos</span>
            </div>
            <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
              {stats.conAdeudos > 0 ? 'En riesgo académico' : 'Sin adeudos'}
            </span>
          </div>

          {/* Card 4: Omitidas / En Curso */}
          <div className="px-5 py-3.5">
            <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Omitidas / En Curso</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900">{stats.conOmitidas}</span>
              <span className="text-xs text-slate-400">alumnos</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Avance curricular regular</span>
          </div>

          {/* Card 5: Promedio Generacional */}
          <div className="px-5 py-3.5">
            <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Promedio Generacional</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900">{stats.promedioGeneracion}</span>
              <span className="text-xs text-slate-400 font-mono">/ 10.0</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {stats.alumnosConPromedio > 0 ? `${stats.alumnosConPromedio} evaluados` : 'Sin calificaciones'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Barra de Búsqueda, Filtros Segmentados y Orden */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs print:hidden">
        {/* Buscador */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o matrícula…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros Segmentados Técnicos */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setFilterStatus('TODOS')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'TODOS'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({alumnos.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ELEGIBLE')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'ELEGIBLE'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Aptos ({stats.elegibles})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ADEUDOS')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'ADEUDOS'
                  ? 'bg-white text-rose-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Con Adeudos ({stats.conAdeudos})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('OMITIDAS')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'OMITIDAS'
                  ? 'bg-white text-amber-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              Omitidas ({stats.conOmitidas})
            </button>
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-md px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-slate-400"
            >
              <option value="nombre">Alfabético (A-Z)</option>
              <option value="matricula">Por Matrícula</option>
              <option value="avance-desc">Mayor Avance %</option>
              <option value="avance-asc">Menor Avance %</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Directorio de Expedientes de la Generación (Tabla Formal) */}
      <div className="print:hidden">
        {filteredAlumnos.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-2xs">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2.5" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-slate-900">No se encontraron expedientes con ese criterio</p>
            <p className="text-xs text-slate-500 mt-1">Prueba cambiando el término de búsqueda o el filtro seleccionado.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-10 text-center font-mono">#</th>
                    <th className="py-2.5 px-3.5 w-28">Matrícula</th>
                    <th className="py-2.5 px-3.5">Alumno</th>
                    <th className="py-2.5 px-3 w-36 text-center">Dictamen</th>
                    <th className="py-2.5 px-3.5 w-36 text-center">Avance</th>
                    <th className="py-2.5 px-3 w-24 text-center">Promedio</th>
                    <th className="py-2.5 px-3 text-center">Desempeño</th>
                    <th className="py-2.5 px-3 w-20 text-center">Inglés</th>
                    <th className="py-2.5 px-3.5 w-24 text-center">Expediente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAlumnos.map(({ estudiante, auditData, originalIndex }, idx) => {
                    const res = auditData?.resumen;
                    const esElegible = res?.dictamenEstadia?.includes('APROBADO') || res?.dictamenEstadia?.includes('ELEGIBLE');
                    const tieneAdeudos = (res?.adeudos || 0) > 0;
                    const totalAprobadas = res?.totalAprobadas ?? ((res?.aprobadasOrd || 0) + (res?.aprobadasRec || 0) + (res?.aprobadasRe || 0));
                    const totalNivelesIngles = res?.nivelesIngles ?? 5;
                    const porcentaje = Math.round((totalAprobadas / (res?.totalMateriasMapa || 37)) * 100);

                    return (
                      <tr 
                        key={estudiante.matricula} 
                        className="hover:bg-slate-50/75 transition-colors group"
                      >
                        {/* # */}
                        <td className="py-2.5 px-3 text-center text-[11px] font-mono text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Matrícula */}
                        <td className="py-2.5 px-3.5">
                          <span className="font-mono text-xs font-semibold text-slate-900">{estudiante.matricula}</span>
                        </td>

                        {/* Nombre */}
                        <td className="py-2.5 px-3.5">
                          <span className="font-medium text-slate-900 text-xs block leading-tight">{estudiante.nombre}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {estudiante.modalidadDetectada && (
                              <span className="text-[10px] font-mono text-slate-500 uppercase">
                                {estudiante.modalidadDetectada === 'ESCOLARIZADO DUAL' ? 'Modalidad Dual' : estudiante.modalidadDetectada === 'EJECUTIVO' ? 'Plan Ejecutivo' : estudiante.modalidadDetectada}
                              </span>
                            )}
                            {auditData?.coherencia?.alertaCarreraAjena && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Materias de otra Lic. ({auditData.coherencia.alertaCarreraAjena})</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Dictamen */}
                        <td className="py-2.5 px-3 text-center">
                          {esElegible ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700" title="Apto para Estadía">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Apto Estadía
                            </span>
                          ) : tieneAdeudos ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700" title={`${res.adeudos} materia(s) en adeudo`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              {res.adeudos} Adeudo{res.adeudos !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700" title="En seguimiento o con materias en curso">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Seguimiento
                            </span>
                          )}
                        </td>

                        {/* Avance Curricular (Barra horizontal limpia + ratio numérico) */}
                        <td className="py-2.5 px-3.5">
                          <div className="w-28 mx-auto">
                            <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                              <span className="font-semibold text-slate-800">{porcentaje}%</span>
                              <span className="text-slate-400 text-[10px]">{totalAprobadas}/{res?.totalMateriasMapa || 37}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  esElegible ? 'bg-emerald-500' : tieneAdeudos ? 'bg-rose-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Promedio */}
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {res?.promedioFormatted || '—'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.2">
                            {res?.materiasConNota > 0 ? `${res.materiasConNota} asig.` : 'Sin calif.'}
                          </span>
                        </td>

                        {/* Desempeño (Intentos Ordinario / Recuperación) */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5 text-xs font-mono">
                            <span className="text-slate-800 font-semibold" title="1er Intento (Ordinario)">
                              {res?.aprobadasOrd || 0} <span className="text-[10px] text-slate-400 font-sans font-normal">ord</span>
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-800 font-semibold" title="Recuperación">
                              {(res?.aprobadasRec || 0) + (res?.aprobadasRe || 0)} <span className="text-[10px] text-slate-400 font-sans font-normal">rec</span>
                            </span>
                          </div>
                        </td>

                        {/* Inglés */}
                        <td className="py-2.5 px-3 text-center font-mono text-xs text-slate-700">
                          {res?.inglesAcreditados ?? 0}/{totalNivelesIngles}
                        </td>

                        {/* Acción / Expediente */}
                        <td className="py-2.5 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentIndex(originalIndex);
                              setActiveSheetTab('mapa');
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>Auditar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pie de tabla con conteo */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Mostrando {filteredAlumnos.length} de {alumnos.length} expedientes</span>
              <span className="font-mono text-[11px] text-slate-400">{batchData.carrera?.codigo || 'LIC-COFI-18'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. SÁBANA EJECUTIVA INSTITUCIONAL (FORMATO FORMAL PARA IMPRESIÓN Y GUARDAR EN PDF) */}
      <div className="hidden print:block print:w-full bg-white text-black font-sans p-2">
        <div className="border-b-2 border-black pb-3 mb-3 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
              UNIVERSIDAD INTERAMERICANA PARA EL DESARROLLO · SISTEMA DE AUDITORÍA ACADÉMICA
            </div>
            <h1 className="text-lg font-black text-black uppercase tracking-tight mt-0.5">
              Sábana Ejecutiva de Auditoría y Dictamen de Generación
            </h1>
            <p className="text-[11px] text-gray-700 mt-0.5">
              Programa: <strong>{batchData.carrera?.nombre || 'Licenciatura en Contabilidad y Finanzas'}</strong> ({batchData.carrera?.codigo || 'LIC-COFI-18'}) ·
              Total de Alumnos: <strong>{alumnos.length}</strong> · Fecha: {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <img src="/unid-logo.png" alt="UNID" className="w-10 h-10 object-contain" />
        </div>

        {/* Resumen Métricas */}
        <div className="grid grid-cols-5 gap-2 mb-3 text-xs">
          <div className="border border-gray-400 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-gray-600 block">Total Evaluados</span>
            <span className="text-base font-black text-black">{stats.total} alumnos</span>
          </div>
          <div className="border border-emerald-500 bg-emerald-50 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-emerald-800 block">Aptos a Estadía</span>
            <span className="text-base font-black text-emerald-900">{stats.elegibles} ({Math.round((stats.elegibles / Math.max(1, stats.total)) * 100)}%)</span>
          </div>
          <div className="border border-rose-500 bg-rose-50 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-rose-800 block">Adeudos Previos (1.º - 6.º)</span>
            <span className="text-base font-black text-rose-900">{stats.conAdeudos} alumnos</span>
          </div>
          <div className="border border-amber-500 bg-amber-50 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-amber-800 block">En Seguimiento</span>
            <span className="text-base font-black text-amber-900">{stats.conOmitidas} alumnos</span>
          </div>
          <div className="border border-amber-500 bg-amber-50 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-amber-800 block">Promedio Grupo</span>
            <span className="text-base font-black text-amber-900">{stats.promedioGeneracion}</span>
          </div>
        </div>

        {/* Tabla Oficial de la Generación */}
        <table className="w-full text-left border-collapse text-[9.5px]">
          <thead>
            <tr className="bg-black text-white font-bold uppercase text-[8.5px]">
              <th className="p-1 border border-black text-center w-7">#</th>
              <th className="p-1 border border-black w-16">Matrícula</th>
              <th className="p-1 border border-black">Nombre del Estudiante</th>
              <th className="p-1 border border-black text-center w-12">Prom.</th>
              <th className="p-1 border border-black text-center w-10">ORD</th>
              <th className="p-1 border border-black text-center w-12">REC/RE</th>
              <th className="p-1 border border-black text-center w-12">Inglés</th>
              <th className="p-1 border border-black text-center w-12">Adeudos</th>
              <th className="p-1 border border-black text-center w-14">Avance %</th>
              <th className="p-1 border border-black text-center w-36">Dictamen Oficial</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((item, idx) => {
              const res = item.auditData?.resumen;
              const totalAprob = res?.totalAprobadas ?? ((res?.aprobadasOrd || 0) + (res?.aprobadasRec || 0));
              const totalMaterias = res?.totalMateriasMapa || 37;
              const pct = Math.round((totalAprob / totalMaterias) * 100);
              const esApto = res?.dictamenEstadia?.includes('APROBADO') || res?.dictamenEstadia?.includes('ELEGIBLE');
              const tieneAd = (res?.adeudos || 0) > 0;

              return (
                <tr key={item.estudiante.matricula} className={idx % 2 === 0 ? 'bg-white text-black' : 'bg-gray-100 text-black'}>
                  <td className="p-1 border border-gray-400 text-center font-bold">{idx + 1}</td>
                  <td className="p-1 border border-gray-400 font-mono font-bold">{item.estudiante.matricula}</td>
                  <td className="p-1 border border-gray-400 font-bold">{item.estudiante.nombre}</td>
                  <td className="p-1 border border-gray-400 text-center font-mono font-bold">{res?.promedioFormatted || 'S/C'}</td>
                  <td className="p-1 border border-gray-400 text-center">{res?.aprobadasOrd || 0}</td>
                  <td className="p-1 border border-gray-400 text-center">{(res?.aprobadasRec || 0) + (res?.aprobadasRe || 0)}</td>
                  <td className="p-1 border border-gray-400 text-center">{res?.inglesAcreditados ?? 0}/{res?.nivelesIngles ?? 5}</td>
                  <td className="p-1 border border-gray-400 text-center font-bold text-rose-700">{res?.adeudos || 0}</td>
                  <td className="p-1 border border-gray-400 text-center font-bold">{pct}%</td>
                  <td className="p-1 border border-gray-400 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      esApto ? 'bg-emerald-100 text-emerald-800' : tieneAd ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {esApto ? 'APTO / ELEGIBLE' : tieneAd ? `${res?.adeudos} ADEUDO(S)` : 'EN SEGUIMIENTO'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Firmas Institucionales */}
        <div className="mt-6 pt-4 border-t border-gray-400 grid grid-cols-2 text-center text-[10px]">
          <div>
            <div className="w-48 border-b border-gray-600 mx-auto mb-1"></div>
            <span className="font-bold text-black block">Coordinación de Licenciatura</span>
            <span className="text-[9px] text-gray-600">Dictamen Académico</span>
          </div>
          <div>
            <div className="w-48 border-b border-gray-600 mx-auto mb-1"></div>
            <span className="font-bold text-black block">Dirección de Campus</span>
            <span className="text-[9px] text-gray-600">Validación Institucional</span>
          </div>
        </div>
      </div>

      {/* Modal de Control Escolar en Neon Database */}
      <NeonAuditManagerModal
        isOpen={isNeonModalOpen}
        onClose={() => setIsNeonModalOpen(false)}
        initialMode={neonModalMode}
        batchData={batchData}
        onLoadBatchData={onLoadBatchData}
      />
    </div>
  );
}
