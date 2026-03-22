'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, Users, Music, Activity, Trash2, Check, Loader2 } from 'lucide-react';
import { useI18n } from '@/providers/I18nProvider';
import Image from 'next/image';


export default function AdminPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { lang } = useI18n();

  // Basic admin check (could be robust role check, for now we just verify ownership)
  const isAdmin = session?.user?.email === 'marcegon13@gmail.com' || session?.user?.email?.includes('admin');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/admin/stats`);
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return res.json();
    },
    enabled: !!isAdmin,
    refetchInterval: 10000 // Polling every 10s for stress test
  });

  const deleteMutation = useMutation({
    mutationFn: async (internalTrackId: string) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/tracks/${internalTrackId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete track');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    }
  });

  if (!session || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center text-red-500 min-h-screen">
        <ShieldAlert className="w-20 h-20 mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-widest mb-2">Acceso Restringido</h2>
        <p className="text-neutral-500">Solo administradores autorizados pueden acceder al tablero de control.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-emerald-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold tracking-widest text-sm uppercase">Cargando Tablero de Control...</p>
      </div>
    );
  }

  const { totalUsers, totalArtists, totalReFiPoints, latestTracks } = stats?.data || {};

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center">
          <ShieldAlert className="w-8 h-8 text-emerald-400 mr-4" /> Centro de Comando Real
        </h1>
        <p className="text-neutral-400 font-medium tracking-wide">Monitor de tráfico y calidad del ecosistema Dignify (Stress Test).</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl relative z-10">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-neutral-400 font-bold uppercase tracking-wider text-sm relative z-10">Total Usuarios</h3>
          </div>
          <p className="text-5xl font-black text-white relative z-10">{totalUsers || 0}</p>
          <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
            <Users className="w-40 h-40 text-blue-400" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-pink-500/10 rounded-xl relative z-10">
              <Music className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-neutral-400 font-bold uppercase tracking-wider text-sm relative z-10">Artistas Creadores</h3>
          </div>
          <p className="text-5xl font-black text-white relative z-10">{totalArtists || 0}</p>
          <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
            <Music className="w-40 h-40 text-pink-400" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-emerald-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl relative z-10">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm relative z-10">Dignity Score Global</h3>
          </div>
          <p className="text-5xl font-black text-white relative z-10">{totalReFiPoints || 0}</p>
          <p className="text-xs text-emerald-500 mt-2 font-medium relative z-10">Puntos generados y distribuidos en el ecosistema.</p>
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
            <Activity className="w-40 h-40 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Cola de Moderación (Últimos Tracks)</h2>
        <div className="bg-neutral-900/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-neutral-500 bg-black/40">
                <th className="p-5 font-bold">Track</th>
                <th className="p-5 font-bold">Artista</th>
                <th className="p-5 font-bold">Causa Asignada</th>
                <th className="p-5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {latestTracks?.map((track: any) => (
                <tr key={track.internalTrackId} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center space-x-4">
                      <Image src={track.thumbnailUrl || '/api/placeholder/40/40'} alt="cover" width={40} height={40} className="w-10 h-10 rounded-md object-cover brightness-75 group-hover:brightness-100 transition-all shadow" />
                      <span className="font-bold text-white">{track.title}</span>
                    </div>
                  </td>
                  <td className="p-5 text-neutral-400 font-medium">{track.artist}</td>
                  <td className="p-5">
                    {track.cause ? (
                      <span className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-xs font-bold border border-neutral-700">{track.cause}</span>
                    ) : (
                      <span className="text-neutral-600 italic text-xs">Sin causa</span>
                    )}
                  </td>
                  <td className="p-5 text-right flex items-center justify-end space-x-2">
                    <button className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-lg transition-colors border border-emerald-500/20" title="Aprobar (Placeholder)">
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm("¿Estás seguro de ELIMINAR este track permanentemente de la base de datos?")) {
                          deleteMutation.mutate(track.internalTrackId);
                        }
                      }}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"
                      title="Eliminar infractor"
                    >
                      {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
              {!latestTracks?.length && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-500 italic">No hay tracks para moderar todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
