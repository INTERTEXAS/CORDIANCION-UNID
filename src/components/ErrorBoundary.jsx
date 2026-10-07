import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error capturado en componente:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="bg-surface-1 rounded-3xl border border-border p-8 max-w-xl mx-auto shadow-card text-center space-y-4 transition-theme animate-fade-in">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                Aviso del Sistema
              </span>
              <h3 className="text-[16px] font-extrabold text-text-primary pt-2">
                Ocurrió un error al procesar la vista
              </h3>
              <p className="text-[13px] text-text-muted max-w-md mx-auto leading-relaxed">
                {this.state.error?.message || 'Error inesperado durante la carga del documento.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-slate-950 text-[13px] font-bold rounded-xl transition-colors cursor-pointer shadow-sm hover:shadow-glow-gold"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                <span>Reiniciar y Reintentar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
