import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchBitacoraAccesosConDispositivos, 
  fetchDispositivosAutorizados, 
  toggleEstadoDispositivo, 
  eliminarDispositivo, 
  registrarDispositivoAutorizado 
} from '../services/neonService';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Laptop, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  X, 
  AlertTriangle,
  UserCheck,
  Radio,
  MapPin,
  ExternalLink,
  Cpu,
  Lock,
  Compass,
  CheckCircle2,
  Clock,
  Layers,
  Activity
} from 'lucide-react';

export default function SecurityAdminPanel() {
  // Datos de Neon DB
  const [bitacora, setBitacora] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filtros y vista activa
  const [searchTerm, setSearchTerm] = useState('');
  const [eventoFiltro, setEventoFiltro] = useState('TODOS');
  const [activeTab, setActiveTab] = useState('bitacora'); // 'bitacora' | 'dispositivos' | 'combinada'

  // Modal para autorizar equipo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDeviceId, setModalDeviceId] = useState('');
  const [modalPropietario, setModalPropietario] = useState('');
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  // Copia temporal
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const cargarDatos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMsg(null);

    try {
      const [logs, devs] = await Promise.all([
        fetchBitacoraAccesosConDispositivos(100),
        fetchDispositivosAutorizados()
      ]);
      setBitacora(logs || []);
      setDispositivos(devs || []);
      setLastSyncTime(new Date());
      if (isRefresh) showToast('Telemetría sincronizada con Neon DB.');
    } catch (err) {
      console.error('[SecurityPanel] Error cargando datos de seguridad:', err);
      setErrorMsg('No fue posible sincronizar la telemetría con la base de datos de auditoría.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleToggleActivo = async (dispositivo) => {
    const nuevoEstado = !dispositivo.activo;
    setDispositivos(prev => prev.map(d => d.id === dispositivo.id ? { ...d, activo: nuevoEstado } : d));

    try {
      await toggleEstadoDispositivo(dispositivo.id, nuevoEstado);
      showToast(`Equipo "${dispositivo.propietario}" ${nuevoEstado ? 'activado' : 'desactivado'}.`);
      const logs = await fetchBitacoraAccesosConDispositivos(100);
      setBitacora(logs);
    } catch (err) {
      console.error('[SecurityPanel] Error al cambiar estado:', err);
      setDispositivos(prev => prev.map(d => d.id === dispositivo.id ? { ...d, activo: dispositivo.activo } : d));
      setErrorMsg('No se pudo actualizar el estado del dispositivo.');
    }
  };

  const handleEliminar = async (dispositivo) => {
    if (!window.confirm(`¿Confirmas la revocación del equipo "${dispositivo.propietario}"?`)) {
      return;
    }

    try {
      await eliminarDispositivo(dispositivo.id);
      setDispositivos(prev => prev.filter(d => d.id !== dispositivo.id));
      showToast(`Equipo "${dispositivo.propietario}" revocado.`);
      const logs = await fetchBitacoraAccesosConDispositivos(100);
      setBitacora(logs);
    } catch (err) {
      console.error('[SecurityPanel] Error al eliminar:', err);
      setErrorMsg('Error al revocar el dispositivo en Neon DB.');
    }
  };

  const abrirModalAutorizar = (devId = '', propSugerido = '') => {
    setModalDeviceId(devId);
    setModalPropietario(propSugerido);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    if (!modalDeviceId.trim() || !modalPropietario.trim()) {
      alert('Ingresa tanto el Device ID como el nombre del propietario.');
      return;
    }

    setIsSubmittingModal(true);
    try {
      await registrarDispositivoAutorizado({
        deviceId: modalDeviceId.trim(),
        propietario: modalPropietario.trim(),
        activo: true
      });

      setIsModalOpen(false);
      setModalDeviceId('');
      setModalPropietario('');
      showToast(`Equipo "${modalPropietario.trim()}" registrado correctamente.`);
      await cargarDatos(false);
    } catch (err) {
      console.error('[SecurityPanel] Error al autorizar:', err);
      alert('Error al registrar equipo en Neon DB: ' + err.message);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleCopy = (texto, idKey) => {
    try {
      navigator.clipboard.writeText(texto);
      setCopiedId(idKey);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {}
  };

  // Filtrado de la bitácora
  const bitacoraFiltrada = bitacora.filter(item => {
    const matchesSearch = 
      (item.ip_address && item.ip_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email_intentado && item.email_intentado.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.propietario_equipo && item.propietario_equipo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.device_id && item.device_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.ubicacion && item.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.direccion_exacta && item.direccion_exacta.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (eventoFiltro === 'VISITA_LINK') return item.evento === 'VISITA_LINK';
    if (eventoFiltro === 'AUTORIZADO') return Boolean(item.autorizado);
    if (eventoFiltro === 'BLOQUEADO') return !item.autorizado && item.evento !== 'VISITA_LINK';

    return true;
  });

  const totalVisitas = bitacora.filter(b => b.evento === 'VISITA_LINK').length;
  const totalBloqueados = bitacora.filter(b => !b.autorizado && b.evento !== 'VISITA_LINK').length;
  const totalEquiposActivos = dispositivos.filter(d => d.activo).length;
  const totalLoginsExitosos = bitacora.filter(b => Boolean(b.autorizado) && b.evento !== 'VISITA_LINK').length;

  return (
    <div className="w-full space-y-4 animate-fade-in text-slate-800 pb-16 font-sans">
      {/* Toast Flotante */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium flex items-center space-x-2 shadow-lg border border-slate-700 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* =========================================================================
          CABECERA INSTITUCIONAL: Control de Acceso y Seguridad
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-wider">
              <span>UNID Académica</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700">Seguridad & Acceso</span>
              <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold">
                SUPER ADMIN
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              Consola de Auditoría y Control de Dispositivos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de hardware certificado, telemetría de red y bitácora de eventos en tiempo real.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => cargarDatos(true)}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span>{isRefreshing ? 'Sincronizando…' : 'Actualizar'}</span>
            </button>

            <button
              onClick={() => abrirModalAutorizar('', '')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Dispositivo</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            KPI RIBBON CONTINUO (Limpio, sobrio y tipográfico)
            ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 block">Equipos Autorizados</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-bold font-mono text-slate-900">{totalEquiposActivos}</span>
              <span className="text-xs font-mono text-slate-400">/ {dispositivos.length} total</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{totalEquiposActivos > 0 ? 'Certificado activo' : 'Sin equipos'}</span>
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 block">Sesiones Concedidas</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-bold font-mono text-slate-900">{totalLoginsExitosos}</span>
              <span className="text-xs text-slate-400">exitosas</span>
            </div>
            <span className="text-[10px] text-slate-500">Credenciales verificadas</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 block">Visitas a la Ruta</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-bold font-mono text-slate-900">{totalVisitas}</span>
              <span className="text-xs text-slate-400">eventos</span>
            </div>
            <span className="text-[10px] text-slate-500">Telemetría de red</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 block">Bloqueos Preventivos</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-bold font-mono text-rose-600">{totalBloqueados}</span>
              <span className="text-xs text-slate-400">rechazos</span>
            </div>
            <span className="text-[10px] text-rose-600 font-medium">
              {totalBloqueados > 0 ? 'Hardware no reconocido' : 'Sin incidencias'}
            </span>
          </div>
        </div>
      </div>

      {/* Alerta de Error si ocurre */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================================
          SELECTOR SEGMENTADO DE VISTAS (Pestañas limpias para alta concentración)
          ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab('bitacora')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'bitacora'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Bitácora de Telemetría</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
              {bitacora.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dispositivos')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'dispositivos'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Dispositivos Autorizados</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
              {dispositivos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('combinada')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer hidden md:flex items-center space-x-1.5 ${
              activeTab === 'combinada'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vista Dividida</span>
          </button>
        </div>

        <div className="pb-2 text-[11px] text-slate-400 font-mono hidden sm:block">
          Sincronizado con Neon DB
        </div>
      </div>

      {/* =========================================================================
          CONTENIDO: DISPOSITIVOS AUTORIZADOS
          ========================================================================= */}
      {(activeTab === 'dispositivos' || activeTab === 'combinada') && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Dispositivos de Hardware Autorizados
              </h2>
              <p className="text-[11px] text-slate-500">
                Equipos físicos validados mediante huella digital SHA-256 para operar la consola técnica.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {dispositivos.length} {dispositivos.length === 1 ? 'equipo registrado' : 'equipos registrados'}
            </span>
          </div>

          {dispositivos.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs space-y-1">
              <Cpu className="w-6 h-6 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">No hay equipos registrados en Neon DB.</p>
              <p className="text-[11px]">Usa el botón "Registrar Dispositivo" para autorizar una computadora.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50/80">
                    <th className="py-2.5 px-5">Equipo / Propietario</th>
                    <th className="py-2.5 px-4">Huella Criptográfica (Device ID)</th>
                    <th className="py-2.5 px-4 text-center">Estado</th>
                    <th className="py-2.5 px-4">Fecha de Registro</th>
                    <th className="py-2.5 px-5 text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dispositivos.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-5 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${dev.activo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span>{dev.propietario}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="inline-flex items-center space-x-1.5 font-mono text-[11px] text-slate-600">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[240px]" title={dev.device_id}>
                            {dev.device_id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(dev.device_id, `dev_${dev.id}`)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Copiar Device ID"
                          >
                            {copiedId === `dev_${dev.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActivo(dev)}
                          className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none ${
                            dev.activo ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                          title={dev.activo ? 'Desactivar acceso' : 'Activar acceso'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-150 ease-in-out ${
                              dev.activo ? 'translate-x-3' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 text-[11px] font-medium ${dev.activo ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {dev.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {dev.fecha_registro ? new Date(dev.fecha_registro).toLocaleString('es-MX', { 
                          dateStyle: 'medium', 
                          timeStyle: 'short' 
                        }) : '—'}
                      </td>

                      <td className="py-3 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleEliminar(dev)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Revocar autorización"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          CONTENIDO: BITÁCORA DE TELEMETRÍA (Sin stickers ni burbujas saturadas)
          ========================================================================= */}
      {(activeTab === 'bitacora' || activeTab === 'combinada') && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          {/* Controles integrados de filtrado */}
          <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Registros de Auditoría en Vivo
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                ({bitacoraFiltrada.length} de {bitacora.length})
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por IP, correo o equipo…"
                  className="pl-7 pr-6 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-48 sm:w-56"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <select
                value={eventoFiltro}
                onChange={(e) => setEventoFiltro(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="TODOS">Todos los eventos</option>
                <option value="VISITA_LINK">Visitas a la ruta</option>
                <option value="AUTORIZADO">Accesos concedidos</option>
                <option value="BLOQUEADO">Bloqueos preventivos</option>
              </select>
            </div>
          </div>

          {bitacoraFiltrada.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-1">
              <p className="font-medium text-slate-700">No se encontraron eventos con los filtros actuales.</p>
              <p className="text-[11px] text-slate-400">Restablece la búsqueda o selecciona otro filtro de eventos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50/80">
                    <th className="py-2.5 px-5">Timestamp</th>
                    <th className="py-2.5 px-4">Estado del Evento</th>
                    <th className="py-2.5 px-4">Dispositivo</th>
                    <th className="py-2.5 px-4">Dirección IP</th>
                    <th className="py-2.5 px-4">Ubicación / Georreferencia</th>
                    <th className="py-2.5 px-4">Cuenta</th>
                    <th className="py-2.5 px-5 text-right">Resolución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bitacoraFiltrada.map((item) => {
                    const esVisita = item.evento === 'VISITA_LINK';
                    const esAutorizado = Boolean(item.autorizado);
                    const tieneEquipo = Boolean(item.propietario_equipo);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Timestamp en tipografía tabular técnica */}
                        <td className="py-3 px-5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {item.fecha ? new Date(item.fecha).toLocaleString('es-MX', { 
                            dateStyle: 'short', 
                            timeStyle: 'medium' 
                          }) : '—'}
                        </td>

                        {/* =========================================================================
                            COLUMNA EVENTO REDISEÑADA (Sin cápsulas ni pegatinas de IA)
                            Tipografía limpia con micro-punto indicador
                            ========================================================================= */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {esAutorizado && !esVisita ? (
                            <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>Acceso Concedido</span>
                            </div>
                          ) : esVisita ? (
                            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                              <span>Visita a ruta</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span>Bloqueo Preventivo</span>
                            </div>
                          )}
                        </td>

                        {/* Dispositivo */}
                        <td className="py-3 px-4">
                          {tieneEquipo ? (
                            <div className="flex items-center space-x-1.5 font-medium text-slate-900">
                              <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{item.propietario_equipo}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                              <Cpu className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-mono truncate max-w-[140px]" title={item.device_id}>
                                {item.device_id ? `${item.device_id.slice(0, 12)}…` : 'Sin huella'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* IP Pública */}
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-700 text-[11px]">
                          {item.ip_address || '—'}
                        </td>

                        {/* Ubicación / GPS */}
                        <td className="py-3 px-4 text-[11px] text-slate-600 max-w-[210px]">
                          <div className="truncate font-medium text-slate-800" title={item.direccion_exacta || item.ubicacion}>
                            {item.direccion_exacta || item.ubicacion || '—'}
                          </div>
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 pt-0.5">
                            {item.mapa_url ? (
                              <a
                                href={item.mapa_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-0.5 text-amber-700 hover:text-amber-800 hover:underline font-semibold"
                                title="Abrir en Google Maps"
                              >
                                <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>Google Maps</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                              </a>
                            ) : (
                              <span className="text-slate-400 font-mono text-[9px] flex items-center space-x-1">
                                <Compass className="w-2.5 h-2.5 text-slate-400" />
                                <span>Nodo ISP</span>
                              </span>
                            )}
                            {item.latitud && item.longitud && (
                              <span className="font-mono text-slate-400 text-[9px] truncate" title={`Lat: ${item.latitud}, Lon: ${item.longitud}`}>
                                [{Number(item.latitud).toFixed(2)}, {Number(item.longitud).toFixed(2)}]
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Correo */}
                        <td className="py-3 px-4 text-slate-600 text-[11px] truncate max-w-[150px]">
                          {item.email_intentado ? (
                            <span className="font-mono text-slate-800">{item.email_intentado}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Acción Rápida */}
                        <td className="py-3 px-5 text-right whitespace-nowrap">
                          {!tieneEquipo && item.device_id ? (
                            <button
                              type="button"
                              onClick={() => abrirModalAutorizar(item.device_id, `Equipo de ${item.email_intentado ? item.email_intentado.split('@')[0] : 'Desarrollador'}`)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Autorizar este dispositivo"
                            >
                              <UserCheck className="w-3 h-3 text-amber-700" />
                              <span>Autorizar</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">
                              ✓ En regla
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL DE REGISTRO INSTITUCIONAL
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div 
            className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registrar Equipo Autorizado</h3>
                <p className="text-[11px] text-slate-500">Autorización criptográfica en Neon Database</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Propietario / Nombre del Equipo
                </label>
                <input
                  type="text"
                  value={modalPropietario}
                  onChange={(e) => setModalPropietario(e.target.value)}
                  placeholder="ej. Mac de Miguel (Coordinación)"
                  required
                  autoFocus
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Huella Criptográfica (Device ID)
                </label>
                <input
                  type="text"
                  value={modalDeviceId}
                  onChange={(e) => setModalDeviceId(e.target.value)}
                  placeholder="SHA-256 fingerprint (64 caracteres)"
                  required
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmittingModal}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModal}
                  className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingModal ? 'Guardando…' : 'Autorizar Equipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
