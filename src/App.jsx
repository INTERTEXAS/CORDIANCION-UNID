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

import { getCarreras } from './services/neonService';
import { parsePdfKardex } from './services/pdfParser';
import { runAcademicAudit } from './services/auditEngine';
import { exportarDictamenPdf } from './services/pdfExportService';
import { CARRERAS_LOCAL } from './data/carrerasData';

import { 
  FileText, 
  Layers, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [carreras, setCarreras] = useState(CARRERAS_LOCAL);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(CARRERAS_LOCAL[0]);
  const [dbStatus, setDbStatus] = useState({ fuente: 'local', mensaje: 'Iniciando conexión...' });

  const [activeTab, setActiveTab] = useState('mapa'); // 'mapa' (Hoja 1) | 'cedula' (Hoja 2)
  const [activeFilter, setActiveFilter] = useState('TODAS');

  const [auditData, setAuditData] = useState(null);
  const [historialReciente, setHistorialReciente] = useState([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mismatchModal, setMismatchModal] = useState(null);
  const [notification, setNotification] = useState(null);

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
        const res = await getCarreras();
        setCarreras(res.carreras || CARRERAS_LOCAL);
        setDbStatus({ fuente: res.fuente, mensaje: res.mensaje });
        
        // Seleccionar por defecto la carrera activa LIC-COFI-18
        const activa = (res.carreras || CARRERAS_LOCAL).find(c => c.activa) || CARRERAS_LOCAL[0];
        setCarreraSeleccionada(activa);

        // ESTADO INICIAL VACÍO (SIN ALUMNO PRECARGADO)
        setAuditData(null);
        setHistorialReciente([]);
      } catch (err) {
        console.error('Error inicializando carreras:', err);
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

  // Manejador para subir PDF del estudiante
  const handleUploadPdf = async (file) => {
    setIsProcessing(true);
    setNotification(null);

    try {
      const parsed = await parsePdfKardex(file);

      // Comprobar coincidencia del programa del PDF contra la carrera seleccionada
      if (parsed.estudiante.programa && parsed.estudiante.programa !== carreraSeleccionada.codigo) {
        setMismatchModal({
          detectedProgram: parsed.estudiante.programa,
          currentProgram: carreraSeleccionada.codigo,
          parsedData: parsed
        });
        setIsProcessing(false);
        return;
      }

      // Ejecutar motor de auditoría
      const auditResult = runAcademicAudit(parsed.estudiante, parsed.registros, carreraSeleccionada);
      setAuditData(auditResult);
      addToHistorial(auditResult);
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

  // Confirmar cambio automático de carrera si el PDF pertenece a otra
  const handleConfirmMismatch = () => {
    if (!mismatchModal) return;
    const { parsedData, detectedProgram } = mismatchModal;
    
    // Buscar la carrera en el catálogo
    const targetCarrera = carreras.find(c => c.codigo === detectedProgram) || {
      ...carreraSeleccionada,
      codigo: detectedProgram
    };
    
    setCarreraSeleccionada(targetCarrera);
    const auditResult = runAcademicAudit(parsedData.estudiante, parsedData.registros, targetCarrera);
    setAuditData(auditResult);
    addToHistorial(auditResult);
    setMismatchModal(null);
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
    setNotification({
      tipo: 'exito',
      texto: `Cargado: ${demo.label}`
    });
  };

  // Limpiar / Nueva consulta
  const handleReset = () => {
    setAuditData(null);
    setActiveFilter('TODAS');
    setNotification({
      tipo: 'info',
      texto: 'Consulta reiniciada. Cargue un nuevo kárdex para auditar.'
    });
  };

  // Exportar Dictamen Oficial de 2 Hojas en PDF (Horizontal)
  const handleExportPdf = async () => {
    if (!auditData) return;
    setIsExporting(true);

    try {
      // Obtenemos los elementos directamente por ID para garantizar captura íntegra
      const elHoja1 = document.getElementById('export-hoja1-container');
      const elHoja2 = document.getElementById('export-hoja2-container');

      await exportarDictamenPdf(elHoja1, elHoja2, auditData.estudiante.matricula);

      setNotification({
        tipo: 'exito',
        texto: 'Dictamen oficial de 2 hojas exportado exitosamente.'
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
  const filterCounts = auditData?.resumen ? {
    todas: auditData.resumen.totalMateriasMapa,
    ord: auditData.resumen.aprobadasOrd,
    rec: auditData.resumen.aprobadasRec,
    re: auditData.resumen.aprobadasRe,
    adeudo: auditData.resumen.adeudos,
    omitida: auditData.resumen.omitidas
  } : undefined;

  return (
    <div className="flex min-h-screen bg-[#F4F6F9] text-[#1E293B]">
      {/* Menú Lateral Desplegable Oficial UNID */}
      <Sidebar 
        dbStatus={dbStatus} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Barra Superior con Selector de Carrera y Botones de Acción */}
        <HeaderBar
          carreras={carreras}
          carreraSeleccionada={carreraSeleccionada}
          onSelectCarrera={(carrera) => {
            setCarreraSeleccionada(carrera);
            if (auditData) {
              const updated = runAcademicAudit(auditData.estudiante, [], carrera);
              setAuditData(updated);
            }
          }}
          onUploadPdf={handleUploadPdf}
          onReset={handleReset}
          onExportPdf={handleExportPdf}
          onLoadDemo={handleLoadDemo}
          isProcessing={isProcessing}
          isExporting={isExporting}
          hasAuditData={Boolean(auditData)}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          isWidgetsOpen={isWidgetsOpen}
          onToggleWidgets={() => setIsWidgetsOpen(prev => !prev)}
        />

        {/* Notificaciones y Avisos del Sistema */}
        {notification && (
          <div className={`mx-6 mt-3 px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-between border ${
            notification.tipo === 'exito'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : notification.tipo === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            <span className="flex items-center space-x-2">
              {notification.tipo === 'exito' && <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />}
              {notification.tipo === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" strokeWidth={1.5} />}
              <span>{notification.texto}</span>
            </span>
            <button 
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 ml-4 font-bold"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Zona Central de Trabajo: Todo el ancho disponible para el Mapa Curricular */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {/* Contenedor Central de Contenido y Vistas */}
          <div className="w-full space-y-4">
            {/* Si la carrera no está activa, mostrar aviso de integración */}
            {!carreraSeleccionada?.activa ? (
              <CareerInactiveModal 
                carrera={carreraSeleccionada}
                onSelectActive={() => {
                  const activa = carreras.find(c => c.activa) || CARRERAS_LOCAL[0];
                  setCarreraSeleccionada(activa);
                }}
              />
            ) : !auditData ? (
              /* Tarjeta inicial centrada cuando no hay alumno cargado */
              <UploadStudentCard 
                carrera={carreraSeleccionada}
                onUploadPdf={handleUploadPdf}
              />
            ) : (
              <>
                {/* Selector de Pestañas y Barra Completa de Filtros en Dos Filas */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  {/* Fila superior: Selector de vista a la izquierda */}
                  <div className="flex items-center justify-between">
                    <div className="bg-[#181C24] p-1 rounded-lg inline-flex items-center space-x-1 select-none">
                      <button
                        onClick={() => setActiveTab('mapa')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          activeTab === 'mapa'
                            ? 'bg-white text-[#181C24] shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Hoja 1: Mapa de Ejecución Oficial</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('cedula')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          activeTab === 'cedula'
                            ? 'bg-white text-[#181C24] shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Hoja 2: Cédula de Auditoría y Trazabilidad</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">
                      {activeTab === 'mapa' ? 'Validación de Asignaturas' : 'Cédula Oficial y Trazabilidad'}
                    </div>
                  </div>

                  {/* Fila inferior: Barra completa de Filtros ocupando todo el ancho sin scroll */}
                  {activeTab === 'mapa' && (
                    <div className="border-t border-slate-100 pt-2.5">
                      <FilterPills
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        counts={filterCounts}
                      />
                    </div>
                  )}
                </div>

                {/* Vistas Principales en Pantalla */}
                {activeTab === 'mapa' && (
                  <CurriculumMap 
                    auditData={auditData}
                    activeFilter={activeFilter}
                    forwardedRef={hoja1Ref}
                  />
                )}

                {activeTab === 'cedula' && (
                  <AuditCedula 
                    auditData={auditData}
                    forwardedRef={hoja2Ref}
                  />
                )}
              </>
            )}
          </div>

          {/* Panel Deslizable (Drawer) con los 4 Widgets Oficiales del Portal UNID */}
          <WidgetsColumn
            auditData={auditData}
            historialReciente={historialReciente}
            onSelectHistorial={(item) => setAuditData(item)}
            isOpen={isWidgetsOpen}
            onClose={() => setIsWidgetsOpen(false)}
          />
        </main>
      </div>

      {/* CONTENEDOR OCULTO PARA EXPORTACIÓN EN PDF DE ALTA RESOLUCIÓN */}
      {/* Contiene ambas hojas con ancho landscape fijo (1160px) para html2canvas */}
      {auditData && (
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '1200px' }}>
          <div id="export-hoja1-container" className="p-6 bg-white">
            <CurriculumMap auditData={auditData} activeFilter="TODAS" />
          </div>
          <div id="export-hoja2-container" className="p-6 bg-white">
            <AuditCedula auditData={auditData} />
          </div>
        </div>
      )}

      {/* Modal de Discrepancia de Programa Académico */}
      {mismatchModal && (
        <ProgramMismatchModal
          detectedProgram={mismatchModal.detectedProgram}
          currentProgram={mismatchModal.currentProgram}
          onConfirmSwitch={handleConfirmMismatch}
          onDismiss={() => {
            const { parsedData } = mismatchModal;
            const auditResult = runAcademicAudit(parsedData.estudiante, parsedData.registros, carreraSeleccionada);
            setAuditData(auditResult);
            addToHistorial(auditResult);
            setMismatchModal(null);
          }}
        />
      )}
    </div>
  );
}
