'use client';

import { useSession } from "next-auth/react";
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import { Flame, Star, Compass, User, Lock, ExternalLink, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/providers/I18nProvider';
import Image from 'next/image';

export default function MiPasaporteRefiPage() {
  const { data: session, status } = useSession();
  const { dict } = useI18n();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile', session?.user?.email],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/users/${encodeURIComponent(session?.user?.email || '')}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    enabled: !!session?.user?.email,
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center text-emerald-400">
        <Flame className="w-12 h-12 animate-pulse mb-6" />
        <p className="font-bold tracking-widest text-sm uppercase">Cargando Pasaporte ReFi...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-linear-to-b from-neutral-900/50 to-neutral-950/90">
        <div className="w-24 h-24 rounded-full bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center mb-8 shadow-2xl border border-white/5">
          <Lock className="w-10 h-10 text-neutral-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Acceso Bloqueado</h2>
        <p className="text-neutral-400 max-w-md mb-8">Debes iniciar sesión para acceder a tu Pasaporte ReFi y recolectar recompensas.</p>
      </div>
    );
  }

  const curationPoints = userProfile?.curationPoints || 0;
  const isFirstDiscoverer = userProfile?.hasFirstDiscovery || false;
  
  // Hash base64 o simple url encode para el QR value (sirve para scanear en locales o comercios afiliados a ReFi)
  const qrValue = `dignify:refi:${btoa(session.user?.email || '')}`;

  return (
    <div className="p-8 pb-32 max-w-4xl mx-auto flex flex-col items-center">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-emerald-400 mb-2">
          Mi Pasaporte ReFi
        </h1>
        <p className="text-neutral-400 font-medium">Conectando curaduría digital con valor físico.</p>
      </div>

      <div className="w-full bg-linear-to-br from-neutral-900 via-neutral-900 to-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row relative">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 p-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Info lateral izquierda */}
        <div className="md:w-1/2 p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 relative z-10">
          <div>
            <div className="flex items-center space-x-4 mb-10">
              <Image src={session.user?.image || ''} alt="User" width={64} height={64} className="w-16 h-16 rounded-full border-4 border-emerald-500/50 object-cover" />
              <div>
                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Titular</p>
                <h3 className="text-2xl font-bold text-white">{session.user?.name}</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center space-x-3 mb-2">
                  <Flame className="w-5 h-5 text-purple-400" />
                  <p className="font-semibold text-neutral-300 uppercase text-xs tracking-wider">{dict.refi?.curationPoints || "Puntos de Curación"}</p>
                </div>
                <p className="text-4xl font-black text-white">{curationPoints}</p>
                <p className="text-[10px] text-neutral-500 mt-2 uppercase">10 ReFi USD por cada 1,000 pts</p>
              </div>

              <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center space-x-3 mb-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  <p className="font-semibold text-neutral-300 uppercase text-xs tracking-wider">Badges Activos</p>
                </div>
                {isFirstDiscoverer ? (
                  <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl">
                    <Compass className="w-5 h-5 text-amber-500" />
                    <span className="text-amber-500 font-bold text-sm tracking-wide">{dict.refi?.firstDiscoverer || "Primer Descubridor"}</span>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 italic">No tienes badges activos aún. ¡Explora joyas ocultas!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Zona del CÓDIGO QR */}
        <div className="md:w-1/2 p-10 flex flex-col items-center justify-center bg-white/5 relative z-10">
          <div className="bg-white p-6 rounded-3xl shadow-2xl mb-6">
            <QRCode 
              value={qrValue} 
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </div>
          <p className="text-center text-sm text-neutral-400 max-w-xs font-medium">
            Escanea este código en comercios aliados (como <span className="text-emerald-400">Beba</span>) para canjear tus puntos por beneficios reales.
          </p>
          
          <div className="mt-8 flex items-center justify-center w-full space-x-2 text-xs font-bold text-neutral-500 uppercase tracking-widest px-4 py-2 border border-white/10 rounded-full bg-black/50">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             <span>Identidad Criptográfica Verificada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
