'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Acá iría un reporte de error real hacia Sentry o el logging logger = new Logger()
    console.error("Dignify Crash Reporter:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-center p-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-32 h-32 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mb-10 shadow-3xl shadow-red-500/20 backdrop-blur-3xl animate-pulse">
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tighter">Estrés Extremo: Falla del Sistema</h1>
        
        <p className="text-neutral-400 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
          Un nodo del catálogo ReFi colapsó temporalmente. ¡Tranquilo! Nuestros contratos inmutables (base de datos) están seguros. Esto fue un problema de interfaz gráfica o de conexión de red 4G.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => reset()}
            className="px-10 py-5 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-red-500 transition-all shadow-xl hover:shadow-red-500/30 flex items-center"
          >
            <RefreshCcw className="w-5 h-5 mr-3" /> Reintentar Componente
          </button>
          <Link href="/es" className="px-10 py-5 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/10 flex items-center shadow-lg">
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
