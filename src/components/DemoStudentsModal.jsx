import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { ALUMNOS_DEMO } from '../data/demoStudents';

const SCENARIO_TAGS = {
  'demo-maria': {
    badge: 'Retenido en Egreso',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: AlertCircle,
    color: 'rose',
    description: 'Adeudo en requisito de titulación (EGEL / materia co-curricular omitida).'
  },
  'demo-yareli': {
    badge: '100% Aprobado',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
    color: 'emerald',
    description: 'Malla 100% acreditada. Cumple con todos los requisitos curriculares y de estadía.'
  },
  'demo-1': {
    badge: 'Elegible a Estadía',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
    color: 'emerald',
    description: 'Avance en 7.° cuatrimestre sin adeudos en 1.º a 6.º. Elegible para Estadía Empresarial.'
  },
  'demo-2': {
    badge: 'Retenido en 1.º-6.º',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: ShieldAlert,
    color: 'amber',
    description: 'Presenta adeudo en materia troncal (CFT08) y Conecta omitida en cuatrimestre inicial.'
  },
  'demo-3': {
    badge: 'En Curso (5.° Cuat)',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    icon: Clock,
    color: 'sky',
    description: 'Estudiante activo regular con asignaturas en curso y recursamientos acreditados.'
  }
};

export default function DemoStudentsModal({ isOpen, onClose, onSelectStudent }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
        className="relative w-full max-w-2xl bg-surface-1 border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
      >
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="demo-modal-title" className="text-base font-bold text-text-primary">
                Expedientes de Prueba Institucionales
              </h2>
              <p className="text-xs text-text-muted">
                Selecciona un caso práctico para probar el motor de auditoría sin subir archivos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Casos */}
        <div className="p-6 overflow-y-auto space-y-3">
          {ALUMNOS_DEMO.map((demo, idx) => {
            const meta = SCENARIO_TAGS[demo.id] || {
              badge: 'Caso Demo',
              badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              icon: GraduationCap,
              description: 'Expediente académico de prueba institucional.'
            };
            const Icon = meta.icon;

            return (
              <button
                key={demo.id}
                onClick={() => {
                  onSelectStudent(demo);
                  onClose();
                }}
                className="w-full text-left p-4 rounded-2xl bg-surface-2/50 hover:bg-surface-2 border border-border hover:border-amber-500/40 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-amber-500/5 relative overflow-hidden flex items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-surface-3 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 text-text-secondary group-hover:text-amber-400 transition-colors" />
                  </div>
                  
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                        {demo.matricula}
                      </span>
                      <span className="text-sm font-bold text-text-primary truncate">
                        {demo.nombre}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted uppercase">
                        · {demo.programa}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {meta.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.badgeClass} whitespace-nowrap`}>
                    {meta.badge}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-surface-3/80 flex items-center justify-center text-text-muted group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-surface-2/30 flex items-center justify-between text-xs text-text-muted">
          <span>5 expedientes estructurados con planes oficiales UNID</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
