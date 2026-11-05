import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Save, 
  Trash2, 
  RefreshCw, 
  FolderOpen, 
  X, 
  Archive,
  CheckCircle2, 
  AlertCircle
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
import { useAuth } from '../context/AuthContext';

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

  // Permisos según Rol del usuario
  const { user, isSuperAdmin } = useAuth();
  const rolNorm = String(user?.rol || user?.role || '').toLowerCase();
  const puedeEliminar = Boolean(
    isSuperAdmin || 
    ['super_admin', 'admin_sistema', 'control_escolar', 'coordinador', 'director'].includes(rolNorm)
  );

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
        text: 'No se pudo conectar con el repositorio institucional. Verifique su conexión.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setStatusMessage(null);
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
        text: `Se archivaron correctamente ${batchData.alumnos.length} expedientes para el Ciclo ${cicloInput.trim()} (${carreraCodigo}).`
      });

      await fetchCiclos();
      setActiveTab('gestionar');
    } catch (error) {
      console.error('Error al guardar lote en Neon:', error);
      setStatusMessage({
        type: 'error',
        text: `Error al guardar en el repositorio: ${error.message || 'Fallo de conexión'}`
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
      `¿Desea eliminar permanentemente las auditorías del Ciclo ${cicloItem.ciclo_escolar} (${carreraNombre}) del repositorio institucional? Esta acción liberará el espacio de almacenamiento de inmediato.`
    );
    if (!confirmar) return;

    setLoading(true);
    setStatusMessage(null);
    try {
      await eliminarAuditoriasPorCiclo(cicloItem.ciclo_escolar, cicloItem.carrera_codigo);
      setStatusMessage({
        type: 'success',
        text: `Auditorías del Ciclo ${cicloItem.ciclo_escolar} (${cicloItem.carrera_codigo}) eliminadas exitosamente.`
      });
      await fetchCiclos();
    } catch (error) {
      console.error('Error al eliminar ciclo:', error);
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
      '¿Desea depurar todos los expedientes escolares con más de 5 meses de antigüedad? Esta acción mantendrá el repositorio optimizado conforme a la política académica de UNID.'
    );
    if (!confirmar) return;

    setLoading(true);
    setStatusMessage(null);
    try {
      await eliminarAuditoriasAntiguas(5);
      setStatusMessage({
        type: 'success',
        text: 'Depuración completada. Se eliminaron los expedientes escolares con más de 5 meses de antigüedad.'
      });
      await fetchCiclos();
    } catch (error) {
      console.error('Error al depurar registros antiguos:', error);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Cabecera Institucional sobria */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                Control Escolar · Archivo Central
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Repositorio en línea
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Historial de Auditorías y Respaldo de Generaciones
            </h2>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Pestañas de Navegación Estilo Enterprise (Underline Tabs) */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('gestionar')}
              className={`pb-3 pt-3 transition-colors cursor-pointer border-b-2 flex items-center space-x-2 ${
                activeTab === 'gestionar'
                  ? 'border-slate-900 text-slate-900 font-bold -mb-px'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-slate-400" />
              <span>Grupos Guardados</span>
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-normal">
                {ciclos.length}
              </span>
            </button>

            {batchData && (
              <button
                type="button"
                onClick={() => setActiveTab('guardar')}
                className={`pb-3 pt-3 transition-colors cursor-pointer border-b-2 flex items-center space-x-2 ${
                  activeTab === 'guardar'
                    ? 'border-slate-900 text-slate-900 font-bold -mb-px'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Save className="w-3.5 h-3.5 text-slate-400" />
                <span>Archivar Grupo Actual</span>
                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-normal">
                  {batchData.alumnos?.length || 0}
                </span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchCiclos}
            disabled={loading}
            className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center space-x-1 cursor-pointer transition-colors"
            title="Actualizar listado desde el repositorio"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-slate-700' : 'text-slate-400'}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Notificaciones de Estado */}
        {statusMessage && (
          <div className={`px-6 py-2 flex items-center space-x-2 text-xs font-medium border-b ${
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

        {/* 3. Contenido Principal */}
        <div className="overflow-y-auto flex-1 text-slate-800 text-xs">
          {/* TAB: Gestionar Ciclos Guardados */}
          {activeTab === 'gestionar' && (
            <div>
              {loading && ciclos.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                  <span>Consultando archivo central...</span>
                </div>
              ) : ciclos.length === 0 ? (
                <div className="py-16 text-center p-6 space-y-1.5">
                  <Archive className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-slate-900">No hay grupos archivados en el repositorio</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Al auditar una generación completa, utiliza la pestaña <strong>"Archivar Grupo Actual"</strong> para guardar el registro histórico aquí.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {ciclos.map((item, idx) => {
                    const carreraObj = CARRERAS_LOCAL.find(c => c.codigo === item.carrera_codigo || c.clave === item.carrera_codigo);
                    const esMaestria = item.carrera_codigo?.startsWith('MAE-') || carreraObj?.modalidad === 'MAESTRIA';
                    const esEjecutivo = item.carrera_codigo?.includes('EJ') || carreraObj?.modalidad === 'EJECUTIVO';
                    const modalidadLabel = esMaestria ? 'Posgrado' : (esEjecutivo ? 'Ejecutivo' : 'Escolarizado');
                    const carreraNombre = carreraObj?.nombre || item.carrera_codigo;

                    return (
                      <div 
                        key={`${item.ciclo_escolar}-${item.carrera_codigo}-${idx}`}
                        className="px-6 py-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                      >
                        {/* Periodo y Programa */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              Ciclo {item.ciclo_escolar}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="font-mono text-[10px] text-slate-500 uppercase">
                              {item.carrera_codigo}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase">
                              {modalidadLabel}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {formatProgramName(carreraNombre)}
                          </div>

                          {/* Estadísticas de Auditoría */}
                          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
                            <span className="text-slate-900 font-semibold">{item.total_alumnos} alumnos</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-emerald-700 font-medium">{item.aptos} aptos</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-rose-700 font-medium">{item.con_adeudos} con adeudo</span>
                            {item.ultima_actualizacion && (
                              <>
                                <span className="text-slate-300">·</span>
                                <span className="text-slate-400 font-sans text-[10px]">
                                  Registrado el {new Date(item.ultima_actualizacion).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {onLoadBatchData && (
                            <button
                              type="button"
                              onClick={() => handleCargarCiclo(item)}
                              disabled={loading}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                              title="Cargar y auditar este grupo en pantalla"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Cargar Grupo</span>
                            </button>
                          )}

                          {puedeEliminar && (
                            <button
                              type="button"
                              onClick={() => handleEliminarCiclo(item)}
                              disabled={loading}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title="Eliminar este registro del archivo histórico"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: Guardar Grupo Actual */}
          {activeTab === 'guardar' && batchData && (
            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Ciclo Escolar UNID
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={cicloInput}
                      onChange={(e) => setCicloInput(e.target.value)}
                      placeholder="Ej. 2026-1, 2026-2"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
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
                              ? 'bg-slate-900 text-white border-slate-900 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Programa Académico</span>
                    <span className="font-semibold text-slate-900">
                      {batchData.carrera?.nombre || 'Licenciatura en Contabilidad y Finanzas'}
                    </span>
                    <span className="font-mono text-slate-500 ml-1.5">
                      ({batchData.carrera?.codigo || 'LIC-COFI-18'})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Total Expedientes</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {batchData.alumnos?.length || 0} alumnos
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Confirmar Respaldo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 4. Pie Institucional de Mantenimiento y Cierre */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Retención académica: 5 meses</span>
            {puedeEliminar && (
              <>
                <span>·</span>
                <button
                  type="button"
                  onClick={handleDepurar5Meses}
                  disabled={loading}
                  className="text-slate-500 hover:text-rose-700 underline cursor-pointer transition-colors"
                >
                  Depurar registros antiguos
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
