import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Save, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FolderOpen, 
  ShieldAlert, 
  X, 
  Archive,
  ChevronDown,
  ChevronUp,
  Server
} from 'lucide-react';
import { 
  guardarAuditoriasLote, 
  obtenerResumenCiclos, 
  cargarAuditoriasPorCiclo, 
  eliminarAuditoriasPorCiclo, 
  eliminarAuditoriasAntiguas 
} from '../services/neonService';
import { runAcademicAudit } from '../services/auditEngine';
import { CARRERAS_LOCAL } from '../data/carrerasData';

// Helper de capitalización para nombres de programa
function formatProgramName(str) {
  if (!str) return '';
  const lowerWords = new Set(['de', 'en', 'y', 'el', 'la', 'los', 'las', 'del', 'para', 'lo', 'al', 'con', 'e']);
  return str.toLowerCase().split(' ').map((word, i) => {
    if (word.startsWith('(') && word.endsWith(')')) return word.toUpperCase();
    if (i > 0 && lowerWords.has(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

export default function NeonAuditManagerModal({
  isOpen,
  onClose,
  initialMode = 'gestionar', // 'guardar' | 'gestionar'
  batchData = null,
  onLoadBatchData = null
}) {
  const [activeTab, setActiveTab] = useState(initialMode);
  const [ciclos, setCiclos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [showPurgeSection, setShowPurgeSection] = useState(false);

  // Formulario para guardar
  const [cicloInput, setCicloInput] = useState('2026-1');

  const fetchCiclos = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerResumenCiclos();
      setCiclos(data);
    } catch (error) {
      console.error('Error al consultar ciclos en Neon:', error);
      setStatusMessage({
        type: 'error',
        text: 'No se pudo conectar con Neon PostgreSQL. Verifique su conexión.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setStatusMessage(null);
      setShowPurgeSection(false);
      fetchCiclos();
    }
  }, [isOpen, initialMode, fetchCiclos]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!batchData || !batchData.alumnos || batchData.alumnos.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'No hay datos de alumnos para guardar.'
      });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const carreraCodigo = batchData.carrera?.codigo || 'LIC-COFI-18';
      await guardarAuditoriasLote({
        alumnos: batchData.alumnos,
        cicloEscolar: cicloInput.trim(),
        carreraCodigo
      });

      setStatusMessage({
        type: 'success',
        text: `Se guardaron correctamente ${batchData.alumnos.length} expedientes en Neon para el Ciclo ${cicloInput.trim()} (${carreraCodigo}).`
      });

      await fetchCiclos();
      setActiveTab('gestionar');
    } catch (error) {
      console.error('Error al guardar lote en Neon:', error);
      setStatusMessage({
        type: 'error',
        text: `Error al guardar en base de datos: ${error.message || 'Fallo de conexión'}`
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCargarCiclo = async (cicloItem) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const loadedAlumnos = await cargarAuditoriasPorCiclo(
        cicloItem.ciclo_escolar,
        cicloItem.carrera_codigo
      );

      if (onLoadBatchData && loadedAlumnos.length > 0) {
        const targetCarrera = CARRERAS_LOCAL.find(c => c.codigo === cicloItem.carrera_codigo || c.clave === cicloItem.carrera_codigo)
          || batchData?.carrera
          || { codigo: cicloItem.carrera_codigo };

        const freshAlumnos = loadedAlumnos.map(item => {
          const est = item.estudiante || {};
          const registros = est.registros || item.auditData?.estudiante?.registros || [];
          const studentCarrera = CARRERAS_LOCAL.find(c => c.codigo === est.programa || c.clave === est.programa)
            || targetCarrera;

          const estToAudit = { ...est };
          delete estToAudit.modalidadDetectada;
          if (!estToAudit.programa && studentCarrera?.codigo) {
            estToAudit.programa = studentCarrera.codigo;
          }

          const freshAudit = runAcademicAudit(estToAudit, registros, studentCarrera);
          return {
            ...item,
            estudiante: freshAudit.estudiante,
            auditData: freshAudit,
            carrera: studentCarrera
          };
        });

        onLoadBatchData({
          totalAlumnos: freshAlumnos.length,
          alumnos: freshAlumnos,
          carrera: targetCarrera
        });
        onClose();
      } else {
        setStatusMessage({
          type: 'error',
          text: 'No se encontraron expedientes en este ciclo.'
        });
      }
    } catch (error) {
      console.error('Error al cargar alumnos del ciclo:', error);
      setStatusMessage({
        type: 'error',
        text: `Error al cargar expedientes: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCiclo = async (cicloItem) => {
    const carreraObj = CARRERAS_LOCAL.find(c => c.codigo === cicloItem.carrera_codigo);
    const carreraNombre = carreraObj?.nombre || cicloItem.carrera_codigo;
    const confirmar = window.confirm(
      `¿Desea eliminar permanentemente las auditorías del Ciclo ${cicloItem.ciclo_escolar} (${carreraNombre}) de Neon Database? Esta acción liberará espacio de forma inmediata.`
    );
    if (!confirmar) return;

    setLoading(true);
    setStatusMessage(null);
    try {
      await eliminarAuditoriasPorCiclo(cicloItem.ciclo_escolar, cicloItem.carrera_codigo);
      setStatusMessage({
        type: 'success',
        text: `Auditorías del Ciclo ${cicloItem.ciclo_escolar} (${cicloItem.carrera_codigo}) eliminadas exitosamente de Neon.`
      });
      await fetchCiclos();
    } catch (error) {
      console.error('Error al eliminar ciclo de Neon:', error);
      setStatusMessage({
        type: 'error',
        text: `Error al eliminar expedientes: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDepurar5Meses = async () => {
    const confirmar = window.confirm(
      '¿Desea depurar todos los expedientes escolares con más de 5 meses de antigüedad registrados en Neon Database? Esta acción no se puede deshacer.'
    );
    if (!confirmar) return;

    setLoading(true);
    setStatusMessage(null);
    try {
      await eliminarAuditoriasAntiguas(5);
      setStatusMessage({
        type: 'success',
        text: 'Depuración completada. Se eliminaron de Neon los expedientes escolares con más de 5 meses de antigüedad.'
      });
      await fetchCiclos();
    } catch (error) {
      console.error('Error al purgar registros de más de 5 meses:', error);
      setStatusMessage({
        type: 'error',
        text: `Error en la depuración: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Cabecera Institucional Unificada */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Database className="w-4 h-4 text-slate-800" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Control Escolar · Neon PostgreSQL
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Conectado
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Gestor de Ciclos y Auditorías de Grupo
              </h2>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Selector Segmentado de Pestañas */}
        <div className="px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="inline-flex items-center bg-slate-200/60 p-0.5 rounded-lg text-xs font-semibold">
            {batchData && (
              <button
                type="button"
                onClick={() => setActiveTab('guardar')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'guardar'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Grupo Actual ({batchData.alumnos?.length || 0})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('gestionar')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'gestionar'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Ciclos Guardados ({ciclos.length})</span>
            </button>
          </div>

          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
            Pooler Serverless
          </span>
        </div>

        {/* Notificaciones de Estado */}
        {statusMessage && (
          <div className={`px-5 py-2 flex items-center space-x-2 text-xs font-medium border-b ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 3. Cuerpo del Modal */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
          {/* TAB 1: Guardar Grupo */}
          {activeTab === 'guardar' && batchData && (
            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-start space-x-3">
                <Database className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900">Almacenamiento Estructurado y Permanente</p>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Se guardará la nómina de <strong>{batchData.alumnos?.length} alumnos</strong> con sus materias acreditadas, promedios y dictámenes oficiales. Peso estimado: <strong>~0.2 MB</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-white border border-slate-200 rounded-lg p-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Ciclo Escolar UNID
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={cicloInput}
                      onChange={(e) => setCicloInput(e.target.value)}
                      placeholder="Ej. 2026-1, 2026-2, 2025-3"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
                      required
                    />
                    <div className="flex items-center space-x-1 shrink-0">
                      {['2026-1', '2026-2', '2026-3'].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setCicloInput(sug)}
                          className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                            cicloInput === sug
                              ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Programa Académico</span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {batchData.carrera?.nombre || 'Licenciatura en Contabilidad y Finanzas'}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px] ml-1.5">
                      ({batchData.carrera?.codigo || 'LIC-COFI-18'})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Total Alumnos</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {batchData.alumnos?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar en Base de Datos</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Gestionar Ciclos Guardados */}
          {activeTab === 'gestionar' && (
            <div className="space-y-4">
              {/* Barra superior de lista */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">
                    Grupos Archivados ({ciclos.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchCiclos}
                  disabled={loading}
                  className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>

              {/* Lista de Registros */}
              {loading && ciclos.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                  <span>Consultando Neon Database...</span>
                </div>
              ) : ciclos.length === 0 ? (
                <div className="py-10 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 p-6 space-y-1.5">
                  <Archive className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1.5} />
                  <p className="text-xs font-semibold text-slate-800">No hay auditorías guardadas aún</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Al cargar un grupo, utiliza la opción <strong>"Guardar Grupo Actual"</strong> para archivarlo aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ciclos.map((item, idx) => {
                    const carreraObj = CARRERAS_LOCAL.find(c => c.codigo === item.carrera_codigo || c.clave === item.carrera_codigo);
                    const esMaestria = item.carrera_codigo?.startsWith('MAE-') || carreraObj?.modalidad === 'MAESTRIA';
                    const esEjecutivo = item.carrera_codigo?.includes('EJ') || carreraObj?.modalidad === 'EJECUTIVO';
                    const modalidadLabel = esMaestria ? 'Maestría' : (esEjecutivo ? 'Plan Ejecutivo' : 'Licenciatura');
                    const carreraNombre = carreraObj?.nombre || item.carrera_codigo;

                    return (
                      <div 
                        key={`${item.ciclo_escolar}-${item.carrera_codigo}-${idx}`}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              Ciclo {item.ciclo_escolar}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              {item.carrera_codigo}
                            </span>
                            <span className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded">
                              {modalidadLabel}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-900">
                            {formatProgramName(carreraNombre)}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span className="font-bold text-slate-800">{item.total_alumnos} alumnos</span>
                            <span>·</span>
                            <span className="text-emerald-700 font-medium">{item.aptos} aptos</span>
                            <span>·</span>
                            <span className="text-rose-700 font-medium">{item.con_adeudos} con adeudo</span>
                            {item.ultima_actualizacion && (
                              <>
                                <span>·</span>
                                <span className="text-slate-400">
                                  {new Date(item.ultima_actualizacion).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                          {onLoadBatchData && (
                            <button
                              type="button"
                              onClick={() => handleCargarCiclo(item)}
                              disabled={loading}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded border border-slate-300 hover:border-slate-400 transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
                              title="Cargar estos alumnos en pantalla"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                              <span>Cargar</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEliminarCiclo(item)}
                            disabled={loading}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                            title="Eliminar este grupo de Neon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 4. Mantenimiento y Purga de Registros (Colapsable y Discreta) */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPurgeSection(!showPurgeSection)}
                  className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-800 font-medium py-1 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mantenimiento y Depuración Automática (Política 5 Meses)</span>
                  </div>
                  {showPurgeSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showPurgeSection && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Conforme al calendario académico UNID (4 meses del periodo + 1 mes de aclaraciones), puedes depurar con un clic los registros antiguos que superen los 5 meses para mantener la base de datos libre de sobrecarga.
                    </p>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleDepurar5Meses}
                        disabled={loading}
                        className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-slate-300 hover:border-rose-300 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Depurar registros con más de 5 meses</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 5. Pie del Modal */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Universidad Interamericana para el Desarrollo · Coordinación Académica</span>
          <button
            type="button"
            onClick={onClose}
            className="font-sans font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
