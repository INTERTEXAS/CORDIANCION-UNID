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
        <div className="bg-white rounded-2xl border border-rose-200 p-8 max-w-xl mx-auto my-12 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto border border-rose-200">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
              Aviso del Sistema
            </span>
            <h3 className="text-base font-extrabold text-slate-900 pt-1">
              Ocurrió un error al procesar la vista
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {this.state.error?.message || 'Error inesperado durante la carga del documento.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reiniciar y Reintentar</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
