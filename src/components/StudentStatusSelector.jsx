import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Loader2 } from 'lucide-react';
import { CATALOGO_ESTATUS_ALUMNOS, getEstatusInfo } from '../data/estatusAlumnosData';
import { saveEstatusAlumno } from '../services/neonService';

export default function StudentStatusSelector({ estudiante, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef(null);

  // Parse the current status
  const currentStatusInfo = getEstatusInfo(estudiante?.estatus);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter catalog based on search
  const filteredCatalog = CATALOGO_ESTATUS_ALUMNOS.filter(item => 
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered results by category
  const groupedCatalog = filteredCatalog.reduce((acc, item) => {
    const cat = item.categoria;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const handleSelect = async (statusItem) => {
    setIsOpen(false);
    setSearchTerm('');
    
    // Optimistic UI update
    if (onStatusChange) {
      onStatusChange(statusItem.codigo);
    }
    
    setIsSaving(true);
    try {
      await saveEstatusAlumno(
        estudiante.matricula, 
        estudiante.nombre, 
        statusItem.codigo, 
        statusItem.descripcion
      );
    } catch (e) {
      console.error('Error al guardar estatus:', e);
      // Opcional: mostrar notificación de error
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'activo': return 'Activos / Seguimiento';
      case 'egreso': return 'Egreso / Titulación';
      case 'baja': return 'Bajas';
      case 'inactivo': return 'Inactivos';
      default: return 'Otros';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer transition-all border border-transparent shadow-sm 
          ${currentStatusInfo.color} hover:ring-2 hover:ring-offset-1 dark:hover:ring-offset-slate-900 
          ${isOpen ? 'ring-2 ring-offset-1' : ''} 
          print:shadow-none print:border-none print:bg-transparent print:text-black print:px-0`}
      >
        <span>{currentStatusInfo.codigo} - {currentStatusInfo.descripcion}</span>
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin opacity-70 print:hidden" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 opacity-70 print:hidden" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-surface-0 border border-border shadow-2xl rounded-xl z-50 overflow-hidden animate-slide-down print:hidden">
          <div className="p-2 border-b border-border bg-surface-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Buscar estatus..." 
                className="w-full bg-surface-2 border border-border rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar bg-surface-0">
            {Object.keys(groupedCatalog).length === 0 ? (
              <div className="p-3 text-center text-[12px] text-text-muted">No se encontraron resultados</div>
            ) : (
              Object.keys(groupedCatalog).map((cat) => (
                <div key={cat} className="mb-2 last:mb-0">
                  <div className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider sticky top-0 bg-surface-0/90 backdrop-blur-sm z-10">
                    {getCategoryLabel(cat)}
                  </div>
                  <div className="space-y-0.5">
                    {groupedCatalog[cat].map(item => (
                      <button
                        key={item.codigo}
                        onClick={() => handleSelect(item)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-[12px] transition-colors flex items-center gap-2 hover:bg-surface-2
                          ${estudiante?.estatus === item.codigo ? 'bg-accent/10 font-bold' : 'text-text-secondary'}
                        `}
                      >
                        <span className={`inline-block w-6 text-center text-[10px] rounded px-1 py-0.5 font-bold ${item.color.split(' ')[0]} ${item.color.split(' ')[1]}`}>
                          {item.codigo}
                        </span>
                        <span>{item.descripcion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
