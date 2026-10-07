import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import HeaderBar from './components/HeaderBar';
import FilterPills from './components/FilterPills';
import WidgetsColumn from './components/WidgetsColumn';
import CurriculumMap from './components/CurriculumMap';
import AuditCedula from './components/AuditCedula';
import CareerInactiveModal from './components/CareerInactiveModal';
import ProgramMismatchModal from './components/ProgramMismatchModal';
import UploadStudentCard from './components/UploadStudentCard';
import BatchAuditView from './components/BatchAuditView';

import { getCarreras } from './services/neonService';
import { parsePdfKardex } from './services/pdfParser';
import { runAcademicAudit } from './services/auditEngine';
import { exportarDictamenPdf } from './services/pdfExportService';
import { CARRERAS_LOCAL } from './data/carrerasData';

import { 
  FileText, 
  Layers, 
  AlertCircle, 
  CheckCircle2,
  Users,
  X
} from 'lucide-react';
import NeonAuditManagerModal from './components/NeonAuditManagerModal';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [carreras, setCarreras] = useState(CARRERAS_LOCAL);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(CARRERAS_LOCAL[0]);
  const [dbStatus, setDbStatus] = useState({ fuente: 'local', mensaje: 'Iniciando conexión...' });

  const [activeTab, setActiveTab] = useState('mapa'); // 'mapa' (Hoja 1) | 'cedula' (Hoja 2) | 'grupo' (Auditoría de Grupo)
  const [activeFilter, setActiveFilter] = useState('TODAS');

  const [auditData, setAuditData] = useState(null);
  const [batchData, setBatchData] = useState(null); // { totalAlumnos, alumnos, carrera }
  const [selectedBatchStudentAudit, setSelectedBatchStudentAudit] = useState(null);
  const [historialReciente, setHistorialReciente] = useState([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mismatchModal, setMismatchModal] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isGlobalNeonManagerOpen, setIsGlobalNeonManagerOpen] = useState(false);
  const [estatusManuales, setEstatusManuales] = useState({});

  // Estados de visibilidad de paneles laterales
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);

  // Referencias para exportación oficial de 2 hojas en PDF
  const hoja1Ref = useRef(null);
  const hoja2Ref = useRef(null);

  // Inicializar consulta a Neon DB y cargar caso demo inicial
  useEffect(() => {
    async function loadData() {
      try {
        const [res, estatusDict] = await Promise.all([
          getCarreras(),
          import('./services/neonService').then(m => m.fetchEstatusManuales())
        ]);
        setCarreras(res.carreras || CARRERAS_LOCAL);
        setDbStatus({ fuente: res.fuente, mensaje: res.mensaje });
        setEstatusManuales(estatusDict || {});
        
        // Seleccionar por defecto la carrera activa LIC-COFI-18
        const activa = (res.carreras || CARRERAS_LOCAL).find(c => c.activa) || CARRERAS_LOCAL[0];
        setCarreraSeleccionada(activa);

        // ESTADO INICIAL VACÍO (SIN ALUMNO PRECARGADO)
        setAuditData(null);
        setHistorialReciente([]);
      } catch (err) {
        console.error('Error inicializando datos:', err);
      }
    }
    loadData();
  }, []);

  // Agregar al historial reciente (máximo 5 alumnos en memoria)
  const addToHistorial = (newAudit) => {
    setHistorialReciente(prev => {
      const filtered = prev.filter(item => item.estudiante.matricula !== newAudit.estudiante.matricula);
      return [newAudit, ...filtered].slice(0, 5);
    });
  };

  // Manejador para subir PDF (kárdex individual o reporte consolidado de grupo)
  const handleUploadPdf = async (file) => {
    setIsProcessing(true);
    setNotification(null);

    try {
      const parsed = await parsePdfKardex(file);

      // CASO A: Reporte consolidado de materias acreditadas (Grupo / Cuatrimestre)
      if (parsed.isBatch) {
        const auditarAlumnos = parsed.students.map(s => {
          if (estatusManuales[s.matricula]) {
            s.estatus = estatusManuales[s.matricula].codigo;
          }
          const matchingCarrera = carreras.find(c => c.codigo === s.programa || c.clave === s.programa) || carreraSeleccionada;
          const audit = runAcademicAudit(s, s.registros, matchingCarrera);
          return {
            estudiante: s,
            auditData: audit,
            carrera: matchingCarrera
          };
        });

        const newBatch = {
          totalAlumnos: parsed.totalAlumnos,
          alumnos: auditarAlumnos,
          carrera: carreraSeleccionada
        };

        setBatchData(newBatch);
        setActiveTab('grupo');
        setNotification({
          tipo: 'exito',
          texto: `Reporte de grupo procesado exitosamente: ${parsed.totalAlumnos} alumnos auditados.`
        });
        setIsProcessing(false);
        return;
      }

      // CASO B: Kárdex individual
      if (estatusManuales[parsed.estudiante?.matricula]) {
        parsed.estudiante.estatus = estatusManuales[parsed.estudiante.matricula].codigo;
      }

      // Comprobar coincidencia del programa del PDF contra la carrera seleccionada
      if (parsed.estudiante?.programa && parsed.estudiante.programa !== carreraSeleccionada.codigo) {
        setMismatchModal({
          detectedProgram: parsed.estudiante.programa,
          currentProgram: carreraSeleccionada.codigo,
          parsedData: parsed
        });
        setIsProcessing(false);
        return;
      }

      // Ejecutar motor de auditoría individual
      const auditResult = runAcademicAudit(parsed.estudiante, parsed.registros, carreraSeleccionada);
      setAuditData(auditResult);
      addToHistorial(auditResult);
      setActiveTab('mapa');
      setNotification({
        tipo: 'exito',
        texto: `Kárdex de ${parsed.estudiante.nombre} (${parsed.estudiante.matricula}) procesado con éxito.`
      });
    } catch (error) {
      console.error('Error al procesar el archivo PDF:', error);
      setNotification({
        tipo: 'error',
        texto: `Error al leer el archivo PDF: ${error.message || 'Formato no reconocido'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Cargar demo de generación consolidada local (catalogo.pdf)
  const handleLoadBatchDemo = async () => {
    setIsProcessing(true);
    setNotification(null);
    try {
      const response = await fetch('/catalogo.pdf');
      if (!response.ok) throw new Error('No se pudo descargar catalogo.pdf');
      const blob = await response.blob();
      const file = new File([blob], 'catalogo.pdf', { type: 'application/pdf' });
      await handleUploadPdf(file);
    } catch (err) {
      console.error('Error cargando demo de lote:', err);
      setNotification({
        tipo: 'error',
        texto: 'No se pudo cargar el archivo catalogo.pdf local.'
      });
      setIsProcessing(false);
    }
  };

  const handleConfirmMismatch = () => {
    try {
      if (!mismatchModal) return;
      const { parsedData, detectedProgram } = mismatchModal;
      
      const normalizedDetected = detectedProgram.trim().replace(/0/g, 'O');
      
      const targetCarrera = carreras.find(c => c.codigo && c.codigo.replace(/0/g, 'O') === normalizedDetected) || {
        ...carreraSeleccionada,
        codigo: detectedProgram
      };
      
      setCarreraSeleccionada(targetCarrera);
      const auditResult = runAcademicAudit(parsedData.estudiante, parsedData.registros, targetCarrera);
      setAuditData(auditResult);
      addToHistorial(auditResult);
      setActiveTab('mapa');
      setMismatchModal(null);
    } catch (error) {
      console.error("Error confirmando mismatch:", error);
      alert("Error interno al cambiar mapa: " + error.message);
    }
  };

  // Cargar caso demo institucional
  const handleLoadDemo = (demo) => {
    const auditResult = runAcademicAudit(
      {
        matricula: demo.matricula,
        nombre: demo.nombre,
        programa: demo.programa,
        sede: demo.sede,
        estatus: demo.estatus
      },
      demo.registros,
      carreraSeleccionada
    );
    setAuditData(auditResult);
    addToHistorial(auditResult);
    setActiveTab('mapa');
    setNotification({
      tipo: 'exito',
      texto: `Cargado: ${demo.label}`
    });
  };

  // Limpiar / Nueva consulta
  const handleReset = () => {
    setAuditData(null);
    setBatchData(null);
    setActiveFilter('TODAS');
    setActiveTab('mapa');
    setNotification({
      tipo: 'info',
      texto: 'Consulta reiniciada. Cargue un nuevo kárdex para auditar.'
    });
  };

  // Auditoría activa efectiva (individual o alumno seleccionado dentro de la generación)
  const effectiveAuditData = activeTab === 'grupo' ? selectedBatchStudentAudit : auditData;

  // Actualización global del estatus
  const handleUpdateStatus = (newStatus, matricula) => {
    // Actualizar historial
    setHistorialReciente(prev => prev.map(item => 
      item.estudiante.matricula === matricula 
        ? { ...item, estudiante: { ...item.estudiante, estatus: newStatus } }
        : item
    ));

    // Actualizar auditData individual si coincide
    if (auditData && auditData.estudiante.matricula === matricula) {
      setAuditData(prev => ({
        ...prev,
        estudiante: { ...prev.estudiante, estatus: newStatus }
      }));
    }

    // Actualizar lote y seleccionado si coincide
    if (batchData) {
      setBatchData(prev => ({
        ...prev,
        alumnos: prev.alumnos.map(item => 
          item.estudiante.matricula === matricula 
            ? { ...item, estudiante: { ...item.estudiante, estatus: newStatus } }
            : item
        )
      }));
      if (selectedBatchStudentAudit && selectedBatchStudentAudit.estudiante.matricula === matricula) {
        setSelectedBatchStudentAudit(prev => ({
          ...prev,
          estudiante: { ...prev.estudiante, estatus: newStatus }
        }));
      }
    }
  };

  // Exportar Dictamen Oficial de 2 Hojas en PDF (Horizontal)
  const handleExportPdf = async () => {
    const currentToExport = activeTab === 'grupo' ? selectedBatchStudentAudit : auditData;
    if (!currentToExport) return;
    setIsExporting(true);

    try {
      // Obtenemos los elementos directamente por ID para garantizar captura íntegra
      const elHoja1 = document.getElementById('export-hoja1-container');
      const elHoja2 = document.getElementById('export-hoja2-container');

      await exportarDictamenPdf(elHoja1, elHoja2, currentToExport.estudiante.matricula);

      setNotification({
        tipo: 'exito',
        texto: `Dictamen oficial de 2 hojas para ${currentToExport.estudiante.nombre} exportado exitosamente.`
      });
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      setNotification({
        tipo: 'error',
        texto: 'Ocurrió un error al generar el PDF del dictamen.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Conteos para los filtros de auditoría
  const filterCounts = effectiveAuditData?.resumen ? {
    todas: effectiveAuditData.resumen.totalMateriasMapa,
    ord: effectiveAuditData.resumen.aprobadasOrd,
    rec: effectiveAuditData.resumen.aprobadasRec,
    re: effectiveAuditData.resumen.aprobadasRe,
    adeudo: effectiveAuditData.resumen.adeudos,
    omitida: effectiveAuditData.resumen.omitidas
  } : undefined;

  // Auto-dismiss notifications after 6 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="flex min-h-screen bg-surface-0 text-text-primary transition-theme">
      {/* Sidebar */}
      <div className="no-print print:hidden">
        <Sidebar 
          dbStatus={dbStatus} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(prev => !prev)}
          batchCount={batchData?.alumnos?.length || 0}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <div className="no-print print:hidden">
          <HeaderBar
            carreras={carreras}
            carreraSeleccionada={carreraSeleccionada}
            onSelectCarrera={(carrera) => {
              setCarreraSeleccionada(carrera);
              if (auditData || batchData) {
                setAuditData(null);
                setBatchData(null);
                setActiveTab('mapa');
                setNotification({
                  tipo: 'info',
                  texto: `Cambiado a ${carrera.codigo}. Listo para auditar.`
                });
              }
            }}
            onUploadPdf={handleUploadPdf}
            onReset={handleReset}
            onExportPdf={handleExportPdf}
            onLoadDemo={handleLoadDemo}
            onLoadBatchDemo={handleLoadBatchDemo}
            isProcessing={isProcessing}
            isExporting={isExporting}
            hasAuditData={Boolean(effectiveAuditData)}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            isWidgetsOpen={isWidgetsOpen}
            onToggleWidgets={() => setIsWidgetsOpen(prev => !prev)}
          />
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`no-print print:hidden mx-4 mt-3 px-4 py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-between border animate-slide-down transition-theme ${
            notification.tipo === 'exito'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20'
              : notification.tipo === 'error'
              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/20'
              : 'bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/20'
          }`}>
            <span className="flex items-center space-x-2">
              {notification.tipo === 'exito' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />}
              {notification.tipo === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" strokeWidth={1.5} />}
              <span>{notification.texto}</span>
            </span>
            <button 
              onClick={() => setNotification(null)}
              className="text-text-muted hover:text-text-primary ml-4 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-x-hidden print:p-0 print:m-0 print:overflow-visible">
          <ErrorBoundary onReset={handleReset}>
          <div className="w-full space-y-4">
            {/* Career inactive */}
            {!carreraSeleccionada?.activa ? (
              <CareerInactiveModal 
                carrera={carreraSeleccionada}
                onSelectActive={() => {
                  const activa = carreras.find(c => c.activa) || CARRERAS_LOCAL[0];
                  setCarreraSeleccionada(activa);
                }}
              />
            ) : activeTab === 'grupo' ? (
              /* Group Audit View */
              batchData ? (
                <BatchAuditView 
                  batchData={batchData}
                  onClearBatch={() => {
                    setBatchData(null);
                    setSelectedBatchStudentAudit(null);
                    setActiveTab('mapa');
                  }}
                  onUploadNewBatch={handleLoadBatchDemo}
                  onActiveStudentAuditChange={setSelectedBatchStudentAudit}
                  onExportPdf={handleExportPdf}
                  isExporting={isExporting}
                  onLoadBatchData={(loadedBatch) => {
                    setBatchData(loadedBatch);
                    setSelectedBatchStudentAudit(null);
                    setActiveTab('grupo');
                  }}
                />
              ) : (
                <UploadStudentCard 
                  carrera={carreraSeleccionada}
                  onUploadPdf={handleUploadPdf}
                  onLoadBatchDemo={handleLoadBatchDemo}
                  onOpenNeonManager={() => setIsGlobalNeonManagerOpen(true)}
                />
              )
            ) : !auditData ? (
              /* Empty state */
              <UploadStudentCard 
                carrera={carreraSeleccionada}
                onUploadPdf={handleUploadPdf}
                onLoadBatchDemo={handleLoadBatchDemo}
                onOpenNeonManager={() => setIsGlobalNeonManagerOpen(true)}
              />
            ) : (
              <>
                {/* Tab Switcher + Filters */}
                <div className="no-print print:hidden bg-surface-1 p-3 rounded-2xl border border-border shadow-card space-y-2.5 transition-theme">
                  <div className="flex items-center justify-between">
                    <div className="bg-surface-2 dark:bg-white/[0.04] p-1 rounded-xl inline-flex items-center space-x-1 select-none">
                      <button
                        onClick={() => setActiveTab('mapa')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                          activeTab === 'mapa'
                            ? 'bg-surface-1 dark:bg-white/[0.08] text-text-primary shadow-card'
                            : 'text-text-muted hover:text-text-secondary'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Mapa de Ejecución</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('cedula')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                          activeTab === 'cedula'
                            ? 'bg-surface-1 dark:bg-white/[0.08] text-text-primary shadow-card'
                            : 'text-text-muted hover:text-text-secondary'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Cédula de Auditoría</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-medium text-text-muted uppercase tracking-wider hidden sm:block">
                      {activeTab === 'mapa' ? 'Validación de Asignaturas' : 'Cédula Oficial'}
                    </div>
                  </div>

                  {/* Filters */}
                  {activeTab === 'mapa' && (
                    <div className="border-t border-border-subtle pt-2.5">
                      <FilterPills
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        counts={filterCounts}
                      />
                    </div>
                  )}
                </div>

                {/* Main Views */}
                {activeTab === 'mapa' && (
                  <CurriculumMap 
                    auditData={auditData}
                    activeFilter={activeFilter}
                    forwardedRef={hoja1Ref}
                    onStatusChange={(status) => handleUpdateStatus(status, auditData.estudiante.matricula)}
                  />
                )}

                {activeTab === 'cedula' && (
                  <AuditCedula 
                    auditData={auditData}
                    forwardedRef={hoja2Ref}
                    onStatusChange={(status) => handleUpdateStatus(status, auditData.estudiante.matricula)}
                  />
                )}
              </>
            )}
          </div>
          </ErrorBoundary>

          {/* Widgets Drawer */}
          <div className="no-print print:hidden">
            <WidgetsColumn
              auditData={auditData}
              historialReciente={historialReciente}
              onSelectHistorial={(item) => setAuditData(item)}
              isOpen={isWidgetsOpen}
              onClose={() => setIsWidgetsOpen(false)}
            />
          </div>
        </main>
      </div>

      {/* EXPORT PDF CONTAINER (hidden) */}
      {effectiveAuditData && (
        <div 
          id="export-pdf-wrapper"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '1440px', 
            maxWidth: '1440px',
            boxSizing: 'border-box',
            zIndex: -9999, 
            opacity: 0, 
            pointerEvents: 'none',
            overflow: 'visible'
          }}
        >
          <div 
            id="export-hoja1-container" 
            className="p-6 bg-white min-h-[960px] w-[1440px] max-w-[1440px] box-border" 
            style={{ width: '1440px', maxWidth: '1440px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <CurriculumMap auditData={effectiveAuditData} activeFilter="TODAS" />
          </div>
          <div 
            id="export-hoja2-container" 
            className="p-6 bg-white min-h-[960px] w-[1440px] max-w-[1440px] box-border" 
            style={{ width: '1440px', maxWidth: '1440px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <AuditCedula auditData={effectiveAuditData} />
          </div>
        </div>
      )}

      {/* Program Mismatch Modal */}
      {mismatchModal && (
        <ProgramMismatchModal
          detectedProgram={mismatchModal.detectedProgram}
          currentProgram={mismatchModal.currentProgram}
          onConfirmSwitch={handleConfirmMismatch}
          onDismiss={() => {
            try {
              const { parsedData } = mismatchModal;
              const auditResult = runAcademicAudit(parsedData.estudiante, parsedData.registros, carreraSeleccionada);
              setAuditData(auditResult);
              addToHistorial(auditResult);
              setActiveTab('mapa');
              setMismatchModal(null);
            } catch (error) {
              console.error(error);
              alert("Error interno en Mantener mapa: " + error.message);
            }
          }}
        />
      )}

      {/* Neon DB Manager Modal */}
      <NeonAuditManagerModal
        isOpen={isGlobalNeonManagerOpen}
        onClose={() => setIsGlobalNeonManagerOpen(false)}
        initialMode="gestionar"
        batchData={batchData}
        onLoadBatchData={(loadedBatch) => {
          setBatchData(loadedBatch);
          setSelectedBatchStudentAudit(null);
          setActiveTab('grupo');
          setIsGlobalNeonManagerOpen(false);
          setNotification({
            tipo: 'exito',
            texto: `Se cargaron ${loadedBatch.totalAlumnos} expedientes desde Neon Database correctamente.`
          });
        }}
      />
    </div>
  );
}
