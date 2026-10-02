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
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  guardarAuditoriasLote, 
  obtenerResumenCiclos, 
  cargarAuditoriasPorCiclo, 
  eliminarAuditoriasPorCiclo, 
  eliminarAuditoriasAntiguas 
} from '../services/neonService';

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

  // Formulario para guardar
  const [cicloInput, setCicloInput] = useState('2026-1');
  const [cuatrimestreInput, setCuatrimestreInput] = useState(6);

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
        cuatrimestreGrupo: Number(cuatrimestreInput),
        carreraCodigo
      });

      setStatusMessage({
        type: 'success',
        text: `Se guardaron correctamente ${batchData.alumnos.length} expedientes en Neon para el Ciclo ${cicloInput.trim()}, ${cuatrimestreInput}.º Cuatrimestre.`
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
        cicloItem.cuatrimestre_grupo
      );

      if (onLoadBatchData && loadedAlumnos.length > 0) {
        onLoadBatchData({
          totalAlumnos: loadedAlumnos.length,
          alumnos: loadedAlumnos,
          carrera: batchData?.carrera || { codigo: cicloItem.carrera_codigo }
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
    const confirmar = window.confirm(
      `¿Desea eliminar permanentemente las auditorías del Ciclo ${cicloItem.ciclo_escolar} (${cicloItem.cuatrimestre_grupo}.º Cuatrimestre) de Neon Database? Esta acción liberará espacio de forma inmediata.`
    );
    if (!confirmar) return;

    setLoading(true);
    setStatusMessage(null);
    try {
      await eliminarAuditoriasPorCiclo(cicloItem.ciclo_escolar, cicloItem.cuatrimestre_grupo);
      setStatusMessage({
        type: 'success',
        text: `Cuatrimestre ${cicloItem.cuatrimestre_grupo}.º del Ciclo ${cicloItem.ciclo_escolar} eliminado exitosamente de Neon.`
      });
      await fetchCiclos();
    } catch (error) {
      console.error('Error al eliminar ciclo:', error);
      setStatusMessage({
        type: 'error',
        text: `Error al eliminar registros: ${error.message}`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="bg-[#111622] px-6 py-4 flex items-center justify-between border-b border-slate-800 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                Control Escolar en Neon Database
              </h2>
              <p className="text-[11px] text-slate-400">
                Almacenamiento estructurado, selección por cuatrimestres y depuración a 5 meses
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Modal */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          {batchData && (
            <button
              onClick={() => setActiveTab('guardar')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'guardar'
                  ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-lg border-t border-x border-slate-200 -mb-px'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Grupo Actual ({batchData.alumnos?.length || 0})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('gestionar')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'gestionar'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-lg border-t border-x border-slate-200 -mb-px'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Ciclos Guardados ({ciclos.length})</span>
          </button>
        </div>

        {/* Notificaciones de Estado */}
        {statusMessage && (
          <div className={`px-6 py-2.5 flex items-center space-x-2 text-xs font-semibold ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {activeTab === 'guardar' && batchData && (
            <form onSubmit={handleGuardar} className="space-y-5">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-indigo-950 space-y-1">
                    <p className="font-bold">Almacenamiento Estructurado y Ligero</p>
                    <p className="text-indigo-800/90 leading-relaxed">
                      Se guardarán las métricas y materias dictaminadas de <strong>{batchData.alumnos?.length} alumnos</strong>. 
                      Peso estimado en Neon: <strong>~0.2 MB</strong> (menos del 0.05% de la cuota disponible).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ciclo Escolar UNID
                  </label>
                  <input
                    type="text"
                    value={cicloInput}
                    onChange={(e) => setCicloInput(e.target.value)}
                    placeholder="Ej. 2026-1, 2026-2, 2025-3"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Periodo cuatrimestral oficial (Ej. 2026-1)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cuatrimestre del Grupo
                  </label>
                  <select
                    value={cuatrimestreInput}
                    onChange={(e) => setCuatrimestreInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((q) => (
                      <option key={q} value={q}>
                        {q}.º Cuatrimestre {q === 6 ? '(Revisión de Estadía)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Permite seleccionar y borrar específicamente este cuatrimestre después.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block font-semibold">Carrera Asociada:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {batchData.carrera?.codigo || 'LIC-COFI-18'} · {batchData.carrera?.nombre || 'Licenciatura en Contabilidad y Finanzas'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block font-semibold">Total Expedientes:</span>
                  <span className="text-base font-black text-indigo-600 font-mono">
                    {batchData.alumnos?.length || 0}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando en Neon...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Confirmar y Guardar en BD</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'gestionar' && (
            <div className="space-y-6">
              {/* Barra informativa de estado del servidor Neon */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="font-bold text-slate-800">Servidor Neon PostgreSQL:</span>
                  <span className="text-slate-600">Activo (Plan Gratuito Serverless)</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Retención sugerida: 5 meses</span>
                </div>
              </div>

              {/* Lista de Cuatrimestres Guardados */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Grupos Guardados en la Base de Datos</span>
                  </h3>
                  <button
                    onClick={fetchCiclos}
                    disabled={loading}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>Actualizar Lista</span>
                  </button>
                </div>

                {loading && ciclos.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Consultando Neon Database...</span>
                  </div>
                ) : ciclos.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-2">
                    <Archive className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No hay cuatrimestres guardados aún</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Al subir un catálogo de alumnos en la vista de grupo, presiona el botón <strong>"Guardar en BD"</strong> para archivarlo aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {ciclos.map((item, idx) => (
                      <div 
                        key={`${item.ciclo_escolar}-${item.cuatrimestre_grupo}-${idx}`}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold rounded-md font-mono">
                              Ciclo {item.ciclo_escolar}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-md">
                              {item.cuatrimestre_grupo}.º Cuatrimestre
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.carrera_codigo}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 text-xs text-slate-600">
                            <span className="font-black text-slate-900">{item.total_alumnos} alumnos</span>
                            <span>·</span>
                            <span className="text-emerald-700 font-semibold">{item.aptos} aptos</span>
                            <span>·</span>
                            <span className="text-rose-700 font-semibold">{item.con_adeudos} con adeudo</span>
                          </div>
                        </div>

                        {/* Botones de acción para este cuatrimestre */}
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {onLoadBatchData && (
                            <button
                              onClick={() => handleCargarCiclo(item)}
                              disabled={loading}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center space-x-1.5"
                              title="Cargar estos alumnos en pantalla sin volver a subir el PDF"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Cargar en Pantalla</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleEliminarCiclo(item)}
                            disabled={loading}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center space-x-1"
                            title="Eliminar únicamente este cuatrimestre de Neon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Borrar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección de Cierre y Purga Automática a 5 Meses */}
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-rose-950 space-y-1">
                    <h4 className="font-bold">Política de Depuración Automática (5 Meses)</h4>
                    <p className="text-rose-800 leading-relaxed">
                      Conforme al ciclo escolar de UNID (4 meses del periodo + 1 mes de aclaraciones e inscripciones), 
                      puedes depurar con un clic los registros antiguos que superen los 5 meses para mantener la base de datos 
                      en el nivel mínimo de almacenamiento.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={handleDepurar5Meses}
                    disabled={loading}
                    className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Depurar registros con más de 5 meses</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Universidad Interamericana para el Desarrollo · Coordinación Académica</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
