'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { TrackItem } from '@/components/shared/TrackItem';
import { Heart, Loader2 } from 'lucide-react';

export default function LibraryPage() {
  const { data: session } = useSession();

  const { data: favorites, isFetching } = useQuery({
    queryKey: ['favorites', session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return [];
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/favorites/${encodeURIComponent(session.user.email)}`);
      if (!res.ok) throw new Error('Búsqueda fallida');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!session?.user?.email,
  });

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-neutral-900/50 to-neutral-950/90 overflow-y-auto px-6 py-8 pb-16">
      <div className="flex-1 w-full max-w-[1400px] mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center">
            <Heart className="w-10 h-10 mr-4 text-emerald-400 fill-emerald-500/20" />
            Mis Favoritos
          </h1>
          <p className="text-neutral-400 mt-2 font-medium text-lg">Tracks que marcaron tu vibra temporal.</p>
        </div>

        {!session ? (
          <div className="text-center mt-32 p-12 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-lg">
            <span className="text-5xl block mb-6">🔒</span>
            <p className="text-neutral-300 font-medium text-xl">Inicia sesión para ver tu biblioteca.</p>
          </div>
        ) : isFetching ? (
          <div className="flex items-center justify-center mt-32">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
            {favorites.map((f: any) => {
              // Reconstruct track format for TrackItem
              const track = {
                id: f.id,
                internalTrackId: f.internalTrackId,
                title: f.title,
                artist: f.artist,
                thumbnailUrl: f.thumbnailUrl,
                sources: f.sources
              };
              return <TrackItem key={track.id} track={track} />;
            })}
          </div>
        ) : (
          <div className="text-center mt-32 p-12 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-lg">
            <Heart className="w-16 h-16 mx-auto mb-6 text-neutral-600" />
            <p className="text-neutral-300 font-medium text-xl">Tu biblioteca está vacía.</p>
            <p className="text-sm text-neutral-500 mt-2">Dá tu primer like en el buscador y el tema vivirá acá para siempre.</p>
          </div>
        )}
      </div>
    </div>
  );
}
