import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
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
  Clock,
  RefreshCw
} from 'lucide-react';
import CurriculumMap from './CurriculumMap';
import AuditCedula from './AuditCedula';
import FilterPills from './FilterPills';
import NeonAuditManagerModal from './NeonAuditManagerModal';

export default function BatchAuditView({
  batchData, // { totalAlumnos, alumnos: [ { estudiante, auditData, carrera } ], carrera }
  onClearBatch,
  onUploadNewBatch,
  onActiveStudentAuditChange,
  onExportPdf,
  isExporting,
  onLoadBatchData
}) {
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
      onActiveStudentAuditChange?.(alumnos[selectedStudentIndex].auditData);
    } else {
      onActiveStudentAuditChange?.(null);
    }
  }, [selectedStudentIndex, alumnos, onActiveStudentAuditChange]);

  // Métricas globales de la generación
  const stats = useMemo(() => {
    let elegibles = 0;
    let conAdeudos = 0;
    let conOmitidas = 0;
    let promedioAvanceTotal = 0;

    for (const item of alumnos) {
      const res = item.auditData?.resumen;
      if (!res) continue;
      if (res.dictamenEstadia?.includes('APROBADO') || res.dictamenEstadia?.includes('ELEGIBLE')) {
        elegibles++;
      }
      if (res.adeudos > 0) conAdeudos++;
      if (res.omitidas > 0) conOmitidas++;
      const totalAprobadas = res.totalAprobadas ?? ((res.aprobadasOrd || 0) + (res.aprobadasRec || 0) + (res.aprobadasRe || 0));
      promedioAvanceTotal += Math.round((totalAprobadas / (res.totalMateriasMapa || 37)) * 100);
    }

    return {
      total: alumnos.length,
      elegibles,
      conAdeudos,
      conOmitidas,
      promedioAvance: alumnos.length > 0 ? Math.round(promedioAvanceTotal / alumnos.length) : 0
    };
  }, [alumnos]);

  // Filtrado y ordenamiento de alumnos
  const filteredAlumnos = useMemo(() => {
    return alumnos
      .map((item, originalIndex) => ({ ...item, originalIndex }))
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
  }, [alumnos, searchQuery, filterStatus, sortBy]);

  // Si hay un alumno seleccionado, mostrar el visor detallado de sus dos hojas
  if (selectedStudentIndex !== null && alumnos[selectedStudentIndex]) {
    const selectedItem = alumnos[selectedStudentIndex];
    const currentAudit = selectedItem.auditData;
    const filterCounts = currentAudit?.resumen ? {
      todas: currentAudit.resumen.totalMateriasMapa,
      ord: currentAudit.resumen.aprobadasOrd,
      rec: currentAudit.resumen.aprobadasRec,
      re: currentAudit.resumen.aprobadasRe,
      adeudo: currentAudit.resumen.adeudos,
      omitida: currentAudit.resumen.omitidas
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
                <Layers className="w-4 h-4" strokeWidth={1.5} />
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
                <FileText className="w-4 h-4" strokeWidth={1.5} />
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
    <div className="space-y-4 animate-fade-in transition-theme">
      {/* 1. Tarjeta Cabecera de la Generación */}
      <div className="bg-surface-1 rounded-2xl border border-border p-6 shadow-card print:hidden transition-theme">
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center space-x-2 text-[12px] font-bold text-accent">
              <Users className="w-4 h-4 text-text-primary" strokeWidth={2} />
              <span className="uppercase tracking-widest text-text-secondary font-black">
                Auditoría Consolidada de Generación / Grupo
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-text-primary mt-1.5 tracking-tight">
              {batchData.carrera?.nombre || 'Licenciatura en Contabilidad y Finanzas'}
            </h2>
            <p className="text-[13px] text-text-muted mt-1">
              Programa: <span className="font-mono font-bold text-text-secondary">{batchData.carrera?.clave || 'LIC-COFI-18'}</span> · 
              Reporte oficial de materias acreditadas (Banner UNID).
            </p>
          </div>

          {/* Grupo de Acciones Estructurado con Jerarquía */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Base de Datos Neon */}
            <div className="inline-flex items-center rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10 p-1">
              <button
                onClick={() => {
                  setNeonModalMode('guardar');
                  setIsNeonModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center space-x-2"
                title="Guardar este grupo en Neon Database clasificándolo por ciclo escolar y cuatrimestre"
              >
                <Database className="w-4 h-4 text-indigo-200" strokeWidth={2} />
                <span>Guardar en BD (Neon)</span>
              </button>
              <button
                onClick={() => {
                  setNeonModalMode('gestionar');
                  setIsNeonModalOpen(true);
                }}
                className="px-4 py-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-2 ml-1"
                title="Ver grupos guardados en Neon, cargar otro cuatrimestre o depurar a 5 meses"
              >
                <Calendar className="w-4 h-4" strokeWidth={2} />
                <span>Gestionar Ciclos</span>
              </button>
            </div>

            {/* Acción Primaria: Imprimir Sábana */}
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-slate-950 text-[13px] font-bold rounded-xl shadow-sm hover:shadow-glow-gold transition-all cursor-pointer flex items-center space-x-2"
              title="Imprimir o guardar como PDF la sábana ejecutiva de toda la generación"
            >
              <Printer className="w-4 h-4 text-slate-950" strokeWidth={2} />
              <span>Imprimir Sábana</span>
            </button>

            {/* Divisor Visual */}
            <div className="hidden sm:block w-px h-8 bg-border-subtle mx-2"></div>

            {/* Acciones Secundarias */}
            <button
              onClick={onUploadNewBatch}
              className="px-4 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border text-text-primary text-[13px] font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-2"
              title="Cargar un nuevo archivo PDF de grupo"
            >
              <SlidersHorizontal className="w-4 h-4 text-accent" strokeWidth={2} />
              <span>Subir otro Reporte</span>
            </button>
            
            <button
              onClick={onClearBatch}
              className="px-4 py-2.5 bg-surface-1 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-border hover:border-rose-200 dark:hover:border-rose-500/30 text-text-secondary hover:text-rose-600 dark:hover:text-rose-400 text-[13px] font-bold rounded-xl transition-colors cursor-pointer"
              title="Cerrar la vista del grupo actual"
            >
              Cerrar Grupo
            </button>
          </div>
        </div>

        {/* Métricas Resumen de la Generación - Ribbon Estilo ERP */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 bg-surface-2 border border-border rounded-xl overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Card 1: Total Alumnos */}
          <div className="p-5 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
              Total Alumnos
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-text-primary font-mono tracking-tight">{stats.total}</span>
              <span className="text-[11px] font-semibold text-text-muted">expedientes</span>
            </div>
          </div>

          {/* Card 2: Aptos para Estadía */}
          <div className="p-5 flex flex-col justify-center">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)] dark:shadow-[0_0_0_2px_rgba(16,185,129,0.4)]"></div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Aptos para Estadía
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-text-primary font-mono tracking-tight">{stats.elegibles}</span>
              <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">{Math.round((stats.elegibles / Math.max(1, stats.total)) * 100)}%</span>
            </div>
          </div>

          {/* Card 3: Adeudos Previos */}
          <div className="p-5 flex flex-col justify-center">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.2)] dark:shadow-[0_0_0_2px_rgba(244,63,94,0.4)]"></div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Adeudos (1.º - 6.º)
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-text-primary font-mono tracking-tight">{stats.conAdeudos}</span>
              <span className="text-[12px] font-bold text-rose-600 dark:text-rose-400">en riesgo</span>
            </div>
          </div>

          {/* Card 4: Omitidas / En Curso */}
          <div className="p-5 flex flex-col justify-center">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.2)] dark:shadow-[0_0_0_2px_rgba(251,191,36,0.4)]"></div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Omitidas / Curso
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-text-primary font-mono tracking-tight">{stats.conOmitidas}</span>
              <span className="text-[12px] font-bold text-amber-600 dark:text-amber-400">seguimiento</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Búsqueda, Filtros y Ordenamiento */}
      <div className="bg-surface-1 p-4 rounded-2xl border border-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 print:hidden transition-theme shadow-sm">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
          <input
            type="text"
            placeholder="Buscar por nombre de alumno o matrícula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-text-primary placeholder-text-muted focus:bg-surface-0 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Filtros Rápidos */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 select-none w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('TODOS')}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === 'TODOS'
                  ? 'bg-text-primary text-surface-1 shadow-sm'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
              }`}
            >
              Todos ({alumnos.length})
            </button>
            <button
              onClick={() => setFilterStatus('ELEGIBLE')}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === 'ELEGIBLE'
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
              }`}
            >
              Aptos ({stats.elegibles})
            </button>
            <button
              onClick={() => setFilterStatus('ADEUDOS')}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === 'ADEUDOS'
                  ? 'bg-rose-600 dark:bg-rose-500 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20'
              }`}
            >
              Con Adeudos ({stats.conAdeudos})
            </button>
            <button
              onClick={() => setFilterStatus('OMITIDAS')}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === 'OMITIDAS'
                  ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20'
              }`}
            >
              Omitidas ({stats.conOmitidas})
            </button>
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center space-x-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-text-muted" strokeWidth={2} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-2 border border-border text-text-primary text-[12px] font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="nombre">Orden: Alfabético (A-Z)</option>
              <option value="matricula">Orden: Matrícula</option>
              <option value="avance-desc">Mayor Avance %</option>
              <option value="avance-asc">Menor Avance %</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Directorio de Expedientes de la Generación (Tabla Formal) */}
      <div className="print:hidden">
        {filteredAlumnos.length === 0 ? (
          <div className="bg-surface-1 rounded-3xl border border-border p-16 text-center shadow-card">
            <Search className="w-10 h-10 text-text-muted/50 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[15px] font-bold text-text-primary">No se encontraron alumnos con ese criterio</p>
            <p className="text-[13px] text-text-muted mt-1.5">Prueba cambiando el término de búsqueda o el filtro seleccionado.</p>
          </div>
        ) : (
          <div className="bg-surface-1 rounded-2xl border border-border overflow-hidden shadow-card transition-theme">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-surface-2 text-text-secondary text-[11px] uppercase tracking-wider font-bold border-b border-border">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4 w-32">Matrícula</th>
                    <th className="py-3.5 px-4">Alumno</th>
                    <th className="py-3.5 px-4 w-36 text-center">Dictamen</th>
                    <th className="py-3.5 px-4 w-32 text-center">Avance</th>
                    <th className="py-3.5 px-4 text-center">Desempeño (Intentos)</th>
                    <th className="py-3.5 px-3 w-20 text-center">Inglés</th>
                    <th className="py-3.5 px-4 w-32 text-center">Expediente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-surface-1">
                  {filteredAlumnos.map(({ estudiante, auditData, originalIndex }, idx) => {
                    const res = auditData?.resumen;
                    const esElegible = res?.dictamenEstadia?.includes('APROBADO') || res?.dictamenEstadia?.includes('ELEGIBLE');
                    const tieneAdeudos = (res?.adeudos || 0) > 0;
                    const totalAprobadas = res?.totalAprobadas ?? ((res?.aprobadasOrd || 0) + (res?.aprobadasRec || 0) + (res?.aprobadasRe || 0));
                    const porcentaje = Math.round((totalAprobadas / (res?.totalMateriasMapa || 37)) * 100);

                    return (
                      <tr 
                        key={estudiante.matricula} 
                        className="hover:bg-surface-2/50 transition-colors group"
                      >
                        {/* # */}
                        <td className="py-3 px-4 text-center text-[11px] font-mono font-bold text-text-muted">
                          {idx + 1}
                        </td>

                        {/* Matrícula */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-[12px] font-black text-text-primary">{estudiante.matricula}</span>
                        </td>

                        {/* Nombre */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-text-primary text-[13px] block">{estudiante.nombre}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {estudiante.modalidadDetectada && (
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                estudiante.modalidadDetectada === 'EJECUTIVO' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                                estudiante.modalidadDetectada === 'ESCOLARIZADO DUAL' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' :
                                'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                              }`}>
                                {estudiante.modalidadDetectada === 'ESCOLARIZADO DUAL' ? 'DUAL' : (estudiante.modalidadDetectada === 'EJECUTIVO' ? (
                                  <span className="flex items-center space-x-1">
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Plan Ejecutivo (LIC-EJCO-17)</span>
                                  </span>
                                ) : estudiante.modalidadDetectada)}
                              </span>
                            )}
                            {auditData?.coherencia?.alertaCarreraAjena && (
                              <span className="inline-flex items-center space-x-1 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase">
                                <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
                                <span>Materias de otra Lic. ({auditData.coherencia.alertaCarreraAjena})</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Dictamen Badge */}
                        <td className="py-3 px-4 text-center">
                          {esElegible ? (
                            <div className="flex items-center justify-center space-x-2" title="Apto para Estadía">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)] dark:shadow-[0_0_0_2px_rgba(16,185,129,0.4)]"></div>
                              <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">Apto</span>
                            </div>
                          ) : tieneAdeudos ? (
                            <div className="flex items-center justify-center space-x-2" title={`${res.adeudos} materia(s) en adeudo`}>
                              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.2)] dark:shadow-[0_0_0_2px_rgba(244,63,94,0.4)]"></div>
                              <span className="text-[12px] font-bold text-rose-700 dark:text-rose-400">{res.adeudos} Adeudo{res.adeudos !== 1 ? 's' : ''}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2" title="En seguimiento o con materias en curso">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.2)] dark:shadow-[0_0_0_2px_rgba(251,191,36,0.4)]"></div>
                              <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400">Seguimiento</span>
                            </div>
                          )}
                        </td>

                        {/* Avance Curricular Circular */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            {/* Circular Progress */}
                            <div className="relative w-10 h-10 flex items-center justify-center">
                              <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-surface-3" strokeWidth="3" />
                                <circle 
                                  cx="18" cy="18" r="16" fill="none" 
                                  className={`transition-all duration-500 ease-out ${esElegible ? 'stroke-emerald-500' : tieneAdeudos ? 'stroke-rose-500' : 'stroke-accent'}`}
                                  strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - porcentaje} strokeLinecap="round" 
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-black text-text-primary">{porcentaje}%</span>
                              </div>
                            </div>
                            <div className="text-left">
                              <span className="text-[11px] font-bold text-text-secondary block leading-none">
                                {totalAprobadas}/{res?.totalMateriasMapa || 37}
                              </span>
                              <span className="text-[9px] text-text-muted">Aprobadas</span>
                            </div>
                          </div>
                        </td>

                        {/* Desempeño Combinado (ORD / REC) */}
                        <td className="py-3 px-4">
                          <div className="flex justify-center space-x-3">
                            <div className="flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20" title="Materias aprobadas en 1er intento (Ordinario)">
                              <span className="text-[12px] font-black text-emerald-700 dark:text-emerald-400 leading-none">{res?.aprobadasOrd || 0}</span>
                              <span className="text-[8px] font-bold text-emerald-600/70 dark:text-emerald-500 uppercase mt-0.5">1er Intento</span>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-500/20" title="Materias aprobadas en Recuperación">
                              <span className="text-[12px] font-black text-blue-700 dark:text-blue-400 leading-none">{(res?.aprobadasRec || 0) + (res?.aprobadasRe || 0)}</span>
                              <span className="text-[8px] font-bold text-blue-600/70 dark:text-blue-500 uppercase mt-0.5">Recup.</span>
                            </div>
                          </div>
                        </td>

                        {/* Inglés */}
                        <td className="py-3 px-3 text-center font-mono font-black text-text-primary text-[13px]">
                          {res?.inglesAcreditados || 0}/5
                        </td>

                        {/* Acción */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedStudentIndex(originalIndex);
                              setActiveSheetTab('mapa');
                            }}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-surface-2 group-hover:bg-accent text-text-primary group-hover:text-slate-950 text-[11px] font-bold rounded-lg transition-all cursor-pointer border border-border group-hover:border-accent"
                          >
                            <Layers className="w-3.5 h-3.5 group-hover:text-slate-950 text-accent transition-colors" strokeWidth={2} />
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
            <div className="px-5 py-3 bg-surface-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted font-medium">
              <span>Mostrando {filteredAlumnos.length} de {alumnos.length} expedientes</span>
              <span className="font-mono">{batchData.carrera?.clave || 'LIC-COFI-18'}</span>
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
              Programa: <strong>{batchData.carrera?.nombre || 'Licenciatura en Contabilidad y Finanzas'}</strong> ({batchData.carrera?.clave || 'LIC-COFI-18'}) · 
              Total de Alumnos: <strong>{alumnos.length}</strong> · Fecha: {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <img src="/unid-logo.png" alt="UNID" className="w-10 h-10 object-contain" />
        </div>

        {/* Resumen Métricas */}
        <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
          <div className="border border-gray-400 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-gray-600 block">Total Evaluados</span>
            <span className="text-base font-black text-black">{stats.total} alumnos</span>
          </div>
          <div className="border border-emerald-500 bg-emerald-50 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-emerald-800 block">Aptos a Estadía</span>
            <span className="text-base font-black text-emerald-900">{stats.elegibles} ({Math.round((stats.elegibles / Math.max(1, stats.total)) * 100)}%)</span>
          </div>
          <div className="border border-rose-500 bg-rose-50 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-rose-800 block">Adeudos Previos a Estadía (1.º - 6.º)</span>
            <span className="text-base font-black text-rose-900">{stats.conAdeudos} alumnos</span>
          </div>
          <div className="border border-amber-500 bg-amber-50 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-amber-800 block">En Seguimiento</span>
            <span className="text-base font-black text-amber-900">{stats.conOmitidas} alumnos</span>
          </div>
        </div>

        {/* Tabla Oficial de la Generación */}
        <table className="w-full text-left border-collapse text-[9.5px]">
          <thead>
            <tr className="bg-black text-white font-bold uppercase text-[8.5px]">
              <th className="p-1 border border-black text-center w-7">#</th>
              <th className="p-1 border border-black w-16">Matrícula</th>
              <th className="p-1 border border-black">Nombre del Estudiante</th>
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
              const pct = Math.round((totalAprob / 37) * 100);
              const esApto = res?.dictamenEstadia?.includes('APROBADO') || res?.dictamenEstadia?.includes('ELEGIBLE');
              const tieneAd = (res?.adeudos || 0) > 0;

              return (
                <tr key={item.estudiante.matricula} className={idx % 2 === 0 ? 'bg-white text-black' : 'bg-gray-100 text-black'}>
                  <td className="p-1 border border-gray-400 text-center font-bold">{idx + 1}</td>
                  <td className="p-1 border border-gray-400 font-mono font-bold">{item.estudiante.matricula}</td>
                  <td className="p-1 border border-gray-400 font-bold">{item.estudiante.nombre}</td>
                  <td className="p-1 border border-gray-400 text-center">{res?.aprobadasOrd || 0}</td>
                  <td className="p-1 border border-gray-400 text-center">{(res?.aprobadasRec || 0) + (res?.aprobadasRe || 0)}</td>
                  <td className="p-1 border border-gray-400 text-center">{res?.inglesAcreditados || 0}/5</td>
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
