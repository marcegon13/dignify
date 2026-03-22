'use client';
import Link from 'next/link';
import { Ghost, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-center p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-32 h-32 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mb-8 shadow-2xl backdrop-blur-xl">
          <Ghost className="w-16 h-16 text-emerald-400" />
        </div>
        
        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-neutral-300 mb-6 tracking-tight">Frecuencia no encontrada</h2>
        
        <p className="text-neutral-500 max-w-md mx-auto mb-10 text-lg">
          Parece que te desviaste del catálogo. El espacio es vasto, pero esta ruta no tiene música ni causas asignadas.
        </p>
        
        <div className="flex items-center space-x-4">
          <Link href="/es" className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-xl hover:shadow-emerald-500/20 active:scale-95 flex items-center">
            Volver de forma segura
          </Link>
          <Link href="/es/explore" className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/10 flex items-center">
            <Search className="w-5 h-5 mr-2" /> Explorar
          </Link>
        </div>
      </div>
    </div>
  );
}
