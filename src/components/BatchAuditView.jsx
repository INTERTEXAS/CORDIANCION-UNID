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
  Clock
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
      <div className="space-y-4">
        {/* Barra de Navegación de Alumno del Grupo */}
        <div className="no-print print:hidden bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedStudentIndex(null)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Generación ({alumnos.length} alumnos)</span>
            </button>

            <span className="text-slate-300">|</span>

            {/* Selector desplegable de alumnos del lote */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Expediente:
              </span>
              <select
                value={selectedStudentIndex}
                onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 cursor-pointer focus:ring-2 focus:ring-[#F2B705] focus:outline-none"
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
          <div className="flex items-center space-x-2">
            <button
              disabled={selectedStudentIndex <= 0}
              onClick={() => setSelectedStudentIndex(prev => Math.max(0, prev - 1))}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-600 px-1">
              {selectedStudentIndex + 1} / {alumnos.length}
            </span>

            <button
              disabled={selectedStudentIndex >= alumnos.length - 1}
              onClick={() => setSelectedStudentIndex(prev => Math.min(alumnos.length - 1, prev + 1))}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {onExportPdf && (
              <button
                onClick={onExportPdf}
                disabled={isExporting}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#181C24] hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer ml-1"
                title="Exportar dictamen oficial de 2 hojas para este alumno"
              >
                <Download className="w-3.5 h-3.5 text-[#F2B705]" />
                <span className="hidden md:inline">Exportar Dictamen (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Selector de Pestañas (Hoja 1 y Hoja 2) y Filtros */}
        <div className="no-print print:hidden bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="bg-[#181C24] p-1 rounded-lg inline-flex items-center space-x-1 select-none">
              <button
                onClick={() => setActiveSheetTab('mapa')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeSheetTab === 'mapa'
                    ? 'bg-white text-[#181C24] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Hoja 1: Mapa de Ejecución Oficial</span>
              </button>

              <button
                onClick={() => setActiveSheetTab('cedula')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeSheetTab === 'cedula'
                    ? 'bg-white text-[#181C24] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Hoja 2: Cédula de Auditoría y Trazabilidad</span>
              </button>
            </div>

            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">
              {activeSheetTab === 'mapa' ? 'Validación Cuatrimestral' : 'Cédula Oficial y Trazabilidad'}
            </div>
          </div>

          {activeSheetTab === 'mapa' && (
            <div className="border-t border-slate-100 pt-2.5">
              <FilterPills
                activeFilter={activeMapFilter}
                onFilterChange={setActiveMapFilter}
                counts={filterCounts}
              />
            </div>
          )}
        </div>

        {/* Vista del Mapa o Cédula */}
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
    );
  }

  // Vista de Directorio de la Generación Completa
  return (
    <div className="space-y-4">
      {/* 1. Tarjeta Cabecera de la Generación */}
      <div className="bg-white rounded-md border border-slate-300 p-5 print:hidden">
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#F2B705]">
              <Users className="w-4 h-4 text-slate-800" />
              <span className="uppercase tracking-widest text-slate-600 font-black">
                Auditoría Consolidada de Generación / Grupo
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {batchData.carrera?.nombre || 'Licenciatura en Contabilidad y Finanzas'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Programa: <span className="font-mono font-bold text-slate-700">{batchData.carrera?.clave || 'LIC-COFI-18'}</span> · 
              Reporte oficial de materias acreditadas (Banner UNID).
            </p>
          </div>

          {/* Grupo de Acciones Estructurado con Jerarquía */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Base de Datos Neon */}
            <div className="inline-flex items-center rounded-md border border-slate-300 bg-slate-50 p-0.5">
              <button
                onClick={() => {
                  setNeonModalMode('guardar');
                  setIsNeonModalOpen(true);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-none transition-all cursor-pointer flex items-center space-x-1.5"
                title="Guardar este grupo en Neon Database clasificándolo por ciclo escolar y cuatrimestre"
              >
                <Database className="w-3.5 h-3.5 text-indigo-200" />
                <span>Guardar en BD (Neon)</span>
              </button>
              <button
                onClick={() => {
                  setNeonModalMode('gestionar');
                  setIsNeonModalOpen(true);
                }}
                className="px-3 py-1.5 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center space-x-1.5"
                title="Ver grupos guardados en Neon, cargar otro cuatrimestre o depurar a 5 meses"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Gestionar Ciclos</span>
              </button>
            </div>

            {/* Acción Primaria: Imprimir Sábana */}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#F2B705] hover:bg-[#dfa500] text-slate-950 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center space-x-1.5"
              title="Imprimir o guardar como PDF la sábana ejecutiva de toda la generación"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Imprimir / Descargar Sábana</span>
            </button>

            {/* Divisor Visual */}
            <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>

            {/* Acciones Secundarias */}
            <button
              onClick={onUploadNewBatch}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition-all cursor-pointer flex items-center space-x-1.5"
              title="Cargar un nuevo archivo PDF de grupo"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#F2B705]" />
              <span>Subir otro Reporte</span>
            </button>
            
            <button
              onClick={onClearBatch}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 text-xs font-bold rounded-md transition-colors cursor-pointer"
              title="Cerrar la vista del grupo actual"
            >
              Cerrar Grupo
            </button>
          </div>
        </div>

        {/* Métricas Resumen de la Generación - Ribbon Estilo ERP */}
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 bg-slate-50/30 border-t border-slate-200 rounded-b-md">
          {/* Card 1: Total Alumnos */}
          <div className="p-4 flex flex-col justify-center border-b lg:border-b-0 border-r border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Total Alumnos
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{stats.total}</span>
              <span className="text-[10px] font-semibold text-slate-400">expedientes</span>
            </div>
          </div>

          {/* Card 2: Aptos para Estadía */}
          <div className="p-4 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"></div>
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Aptos para Estadía
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{stats.elegibles}</span>
              <span className="text-[11px] font-bold text-emerald-600">{Math.round((stats.elegibles / Math.max(1, stats.total)) * 100)}%</span>
            </div>
          </div>

          {/* Card 3: Adeudos Previos */}
          <div className="p-4 flex flex-col justify-center border-r border-slate-200">
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.2)]"></div>
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Adeudos (1.º - 6.º)
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{stats.conAdeudos}</span>
              <span className="text-[11px] font-bold text-rose-600">en riesgo</span>
            </div>
          </div>

          {/* Card 4: Omitidas / En Curso */}
          <div className="p-4 flex flex-col justify-center">
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.2)]"></div>
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Omitidas / Curso
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{stats.conOmitidas}</span>
              <span className="text-[11px] font-bold text-amber-600">seguimiento</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Búsqueda, Filtros y Ordenamiento */}
      <div className="bg-white p-3.5 rounded-md border border-slate-300 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre de alumno o matrícula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F2B705] focus:border-transparent transition-all"
          />
        </div>

        {/* Filtros Rápidos */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 select-none">
          <button
            onClick={() => setFilterStatus('TODOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'TODOS'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({alumnos.length})
          </button>
          <button
            onClick={() => setFilterStatus('ELEGIBLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'ELEGIBLE'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Aptos ({stats.elegibles})
          </button>
          <button
            onClick={() => setFilterStatus('ADEUDOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'ADEUDOS'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Con Adeudos ({stats.conAdeudos})
          </button>
          <button
            onClick={() => setFilterStatus('OMITIDAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'OMITIDAS'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Omitidas ({stats.conOmitidas})
          </button>
        </div>

        {/* Ordenamiento */}
        <div className="flex items-center space-x-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#F2B705]"
          >
            <option value="nombre">Orden: Alfabético (A-Z)</option>
            <option value="matricula">Orden: Matrícula</option>
            <option value="avance-desc">Mayor Avance %</option>
            <option value="avance-asc">Menor Avance %</option>
          </select>
        </div>
      </div>

      {/* 3. Directorio de Expedientes de la Generación (Tabla Formal) */}
      <div className="print:hidden mt-4">
        {filteredAlumnos.length === 0 ? (
          <div className="bg-white rounded-md border border-slate-300 p-12 text-center">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No se encontraron alumnos con ese criterio</p>
            <p className="text-xs text-slate-400 mt-1">Prueba cambiando el término de búsqueda o el filtro seleccionado.</p>
          </div>
        ) : (
          <div className="bg-white rounded-md border border-slate-300 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#181C24] text-slate-300 text-[10px] uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-4 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-28">Matrícula</th>
                  <th className="py-2.5 px-3">Alumno</th>
                  <th className="py-2.5 px-3 w-32 text-center">Dictamen</th>
                  <th className="py-2.5 px-3 w-44">Avance Curricular</th>
                  <th className="py-2.5 px-2 w-14 text-center">ORD</th>
                  <th className="py-2.5 px-2 w-16 text-center">REC/RE</th>
                  <th className="py-2.5 px-2 w-16 text-center">Inglés</th>
                  <th className="py-2.5 px-3 w-28 text-center">Expediente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlumnos.map(({ estudiante, auditData, originalIndex }, idx) => {
                  const res = auditData?.resumen;
                  const esElegible = res?.dictamenEstadia?.includes('APROBADO') || res?.dictamenEstadia?.includes('ELEGIBLE');
                  const tieneAdeudos = (res?.adeudos || 0) > 0;
                  const totalAprobadas = res?.totalAprobadas ?? ((res?.aprobadasOrd || 0) + (res?.aprobadasRec || 0) + (res?.aprobadasRe || 0));
                  const porcentaje = Math.round((totalAprobadas / (res?.totalMateriasMapa || 37)) * 100);

                  return (
                    <tr 
                      key={estudiante.matricula} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* # */}
                      <td className="py-2.5 px-4 text-center text-[10px] font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Matrícula */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px] font-black text-slate-900">{estudiante.matricula}</span>
                      </td>

                      {/* Nombre */}
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 text-xs">{estudiante.nombre}</span>
                      </td>

                      {/* Dictamen Badge */}
                      <td className="py-2.5 px-3 text-center">
                        {esElegible ? (
                          <div className="flex items-center justify-center space-x-1.5" title="Apto para Estadía">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"></div>
                            <span className="text-[11px] font-semibold text-slate-700">Apto</span>
                          </div>
                        ) : tieneAdeudos ? (
                          <div className="flex items-center justify-center space-x-1.5" title={`${res.adeudos} materia(s) en adeudo`}>
                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.2)]"></div>
                            <span className="text-[11px] font-bold text-rose-700">{res.adeudos} Adeudo{res.adeudos !== 1 ? 's' : ''}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-1.5" title="En seguimiento o con materias en curso">
                            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.2)]"></div>
                            <span className="text-[11px] font-semibold text-slate-600">Seguimiento</span>
                          </div>
                        )}
                      </td>

                      {/* Barra de Avance */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded overflow-hidden">
                            <div 
                              className={`h-full rounded transition-all ${
                                esElegible ? 'bg-emerald-500' : tieneAdeudos ? 'bg-rose-500' : 'bg-[#F2B705]'
                              }`}
                              style={{ width: `${Math.min(100, porcentaje)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700 w-12 text-right shrink-0">
                            {porcentaje}%
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {totalAprobadas}/{res?.totalMateriasMapa || 37} materias
                        </span>
                      </td>

                      {/* ORD */}
                      <td className="py-2.5 px-2 text-center font-mono font-black text-slate-800 text-xs">
                        {res?.aprobadasOrd || 0}
                      </td>

                      {/* REC/RE */}
                      <td className="py-2.5 px-2 text-center font-mono font-black text-slate-800 text-xs">
                        {(res?.aprobadasRec || 0) + (res?.aprobadasRe || 0)}
                      </td>

                      {/* Inglés */}
                      <td className="py-2.5 px-2 text-center font-mono font-black text-slate-800 text-xs">
                        {res?.inglesAcreditados || 0}/5
                      </td>

                      {/* Acción */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudentIndex(originalIndex);
                            setActiveSheetTab('mapa');
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold rounded transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                        >
                          <Layers className="w-3 h-3 text-[#F2B705]" />
                          <span>Auditar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pie de tabla con conteo */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Mostrando {filteredAlumnos.length} de {alumnos.length} expedientes</span>
              <span className="font-mono">{batchData.carrera?.clave || 'LIC-COFI-18'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. SÁBANA EJECUTIVA INSTITUCIONAL (FORMATO FORMAL PARA IMPRESIÓN Y GUARDAR EN PDF) */}
      <div className="hidden print:block print:w-full bg-white text-slate-900 font-sans p-2">
        <div className="border-b-2 border-slate-900 pb-3 mb-3 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              UNIVERSIDAD INTERAMERICANA PARA EL DESARROLLO · SISTEMA DE AUDITORÍA ACADÉMICA
            </div>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-0.5">
              Sábana Ejecutiva de Auditoría y Dictamen de Generación
            </h1>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Programa: <strong>{batchData.carrera?.nombre || 'Licenciatura en Contabilidad y Finanzas'}</strong> ({batchData.carrera?.clave || 'LIC-COFI-18'}) · 
              Total de Alumnos: <strong>{alumnos.length}</strong> · Fecha: {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <img src="/unid-logo.png" alt="UNID" className="w-10 h-10 object-contain" />
        </div>

        {/* Resumen Métricas */}
        <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
          <div className="border border-slate-300 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Total Evaluados</span>
            <span className="text-base font-black">{stats.total} alumnos</span>
          </div>
          <div className="border border-emerald-300 bg-emerald-50/50 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-emerald-800 block">Aptos a Estadía</span>
            <span className="text-base font-black text-emerald-900">{stats.elegibles} ({Math.round((stats.elegibles / Math.max(1, stats.total)) * 100)}%)</span>
          </div>
          <div className="border border-rose-300 bg-rose-50/50 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-rose-800 block">Adeudos Previos a Estadía (1.º - 6.º)</span>
            <span className="text-base font-black text-rose-900">{stats.conAdeudos} alumnos</span>
          </div>
          <div className="border border-amber-300 bg-amber-50/50 p-2 rounded">
            <span className="text-[8.5px] uppercase font-bold text-amber-800 block">En Seguimiento</span>
            <span className="text-base font-black text-amber-900">{stats.conOmitidas} alumnos</span>
          </div>
        </div>

        {/* Tabla Oficial de la Generación */}
        <table className="w-full text-left border-collapse text-[9.5px]">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase text-[8.5px]">
              <th className="p-1 border border-slate-900 text-center w-7">#</th>
              <th className="p-1 border border-slate-900 w-16">Matrícula</th>
              <th className="p-1 border border-slate-900">Nombre del Estudiante</th>
              <th className="p-1 border border-slate-900 text-center w-10">ORD</th>
              <th className="p-1 border border-slate-900 text-center w-12">REC/RE</th>
              <th className="p-1 border border-slate-900 text-center w-12">Inglés</th>
              <th className="p-1 border border-slate-900 text-center w-12">Adeudos</th>
              <th className="p-1 border border-slate-900 text-center w-14">Avance %</th>
              <th className="p-1 border border-slate-900 text-center w-36">Dictamen Oficial</th>
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
                <tr key={item.estudiante.matricula} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-1 border border-slate-200 text-center font-bold">{idx + 1}</td>
                  <td className="p-1 border border-slate-200 font-mono font-bold">{item.estudiante.matricula}</td>
                  <td className="p-1 border border-slate-200 font-bold">{item.estudiante.nombre}</td>
                  <td className="p-1 border border-slate-200 text-center">{res?.aprobadasOrd || 0}</td>
                  <td className="p-1 border border-slate-200 text-center">{(res?.aprobadasRec || 0) + (res?.aprobadasRe || 0)}</td>
                  <td className="p-1 border border-slate-200 text-center">{res?.inglesAcreditados || 0}/5</td>
                  <td className="p-1 border border-slate-200 text-center font-bold text-rose-700">{res?.adeudos || 0}</td>
                  <td className="p-1 border border-slate-200 text-center font-bold">{pct}%</td>
                  <td className="p-1 border border-slate-200 text-center">
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
        <div className="mt-6 pt-4 border-t border-slate-300 grid grid-cols-2 text-center text-[10px]">
          <div>
            <div className="w-48 border-b border-slate-500 mx-auto mb-1"></div>
            <span className="font-bold text-slate-800 block">Coordinación de Licenciatura</span>
            <span className="text-[9px] text-slate-500">Dictamen Académico</span>
          </div>
          <div>
            <div className="w-48 border-b border-slate-500 mx-auto mb-1"></div>
            <span className="font-bold text-slate-800 block">Dirección de Campus</span>
            <span className="text-[9px] text-slate-500">Validación Institucional</span>
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
