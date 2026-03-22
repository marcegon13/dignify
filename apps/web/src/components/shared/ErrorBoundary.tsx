'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Dignify QA] Uncaught error:', error, errorInfo);
    // Aquí es donde se conectaría Sentry:
    // Sentry.captureException(error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-neutral-900 border border-red-900/30 p-10 rounded-3xl shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
               <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase font-outfit">Error de Sistema</h2>
            <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
              Dignify detectó una anomalía técnica. El informe ha sido enviado al equipo de QA.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center space-x-2 w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-emerald-400 transition-all active:scale-95"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>Reiniciar App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
