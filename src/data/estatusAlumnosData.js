export const CATALOGO_ESTATUS_ALUMNOS = [
  // Activos / Seguimiento
  { codigo: 'AS', descripcion: 'Activo', categoria: 'activo', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 ring-emerald-500/30' },
  { codigo: 'CO', descripcion: 'Condicionado', categoria: 'activo', color: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 ring-amber-500/30' },
  { codigo: 'CC', descripcion: 'Cursos complementarios', categoria: 'activo', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 ring-emerald-500/30' },
  { codigo: 'CI', descripcion: 'Cursando Idioma', categoria: 'activo', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 ring-emerald-500/30' },
  { codigo: 'IS', descripcion: 'Inactivo', categoria: 'inactivo', color: 'bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 ring-slate-500/30' },

  // Egreso / Titulación
  { codigo: 'EG', descripcion: 'Egresado', categoria: 'egreso', color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 ring-blue-500/30' },
  { codigo: 'PT', descripcion: 'Proceso de Titulación', categoria: 'egreso', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 ring-indigo-500/30' },
  { codigo: 'TT', descripcion: 'Taller de Titulación', categoria: 'egreso', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 ring-indigo-500/30' },
  { codigo: 'TI', descripcion: 'Titulado', categoria: 'egreso', color: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 ring-amber-500/30' },

  // Bajas
  { codigo: 'BA', descripcion: 'Baja Académica', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BC', descripcion: 'Baja Disciplinaria', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BD', descripcion: 'Baja Reglamentaria', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BE', descripcion: 'Baja Económica', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BF', descripcion: 'Baja por Documentación Falsa', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BI', descripcion: 'Baja por no inscripción', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BM', descripcion: 'Baja de materia', categoria: 'baja', color: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 ring-orange-500/30' },
  { codigo: 'BN', descripcion: 'Baja por no pago, no materias', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BP', descripcion: 'Baja por no pago', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BR', descripcion: 'Baja por no reinscripción', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BS', descripcion: 'Baja Voluntaria con Sanción', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BU', descripcion: 'Baja por ID Duplicado', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'BV', descripcion: 'Baja Voluntaria sin sanción', categoria: 'baja', color: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 ring-orange-500/30' },
  { codigo: 'FI', descripcion: 'Baja por Defunción', categoria: 'baja', color: 'bg-slate-200 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300 ring-slate-500/30' },
  { codigo: 'FP', descripcion: 'Baja Fuera de Procedimiento', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' },
  { codigo: 'GC', descripcion: 'Baja por Grupo Cerrado', categoria: 'baja', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 ring-rose-500/30' }
];

export function getEstatusInfo(codigo) {
  if (codigo === 'AC') codigo = 'AS'; // Compatibilidad con kárdex viejos
  return CATALOGO_ESTATUS_ALUMNOS.find(e => e.codigo === codigo) || {
    codigo: codigo || 'AS',
    descripcion: 'Desconocido',
    categoria: 'inactivo',
    color: 'bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 ring-slate-500/30'
  };
}
