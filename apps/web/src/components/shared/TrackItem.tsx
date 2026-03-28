'use client';

import { Play, CheckCircle, Heart, ExternalLink, Music, Youtube, Headphones, PlusSquare, Sparkles, Disc } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';

interface Source {
  provider: string;
  providerId: string;
  url: string;
  quality?: string;
  isOfficial: boolean;
}

interface TrackData {
  id: string; // providerId fallback
  internalTrackId: string; // The DB id
  artist: string;
  title: string;
  thumbnailUrl?: string;
  sources: Source[];
}

interface TrackItemProps {
  track: TrackData;
}

const ProviderIcon = ({ provider, className }: { provider: string, className?: string }) => {
  if (provider === 'YOUTUBE') return <Youtube className={className} />;
  if (provider === 'SOUNDCLOUD') return <Headphones className={className} />;
  if (provider === 'BANDCAMP') return <Music className={className} />;
  if (provider === 'DEEZER') return <Disc className={className} />;
  if (provider === 'DIGNIFY') return <Sparkles className={className} />;
  return <Play className={className} />;
};

export function TrackItem({ track }: TrackItemProps) {
  const setTrack = usePlayerStore((state) => state.setTrack);
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Prefer YouTube originally if available, otherwise just use 0
  const ytIndex = track.sources.findIndex(s => s.provider === 'YOUTUBE');
  const [activeSourceIndex, setActiveSourceIndex] = useState(ytIndex !== -1 ? ytIndex : 0);

  const mainSource = track.sources[activeSourceIndex];
  const isOfficial = mainSource?.isOfficial ?? false;

  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.email) throw new Error('Not authenticated');
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, trackId: track.internalTrackId })
      });
      if (!res.ok) throw new Error('Error saving favorite');
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.status === 'added') setIsFavorite(true);
      if (data.status === 'removed') setIsFavorite(false);
      
      // Auto-update Sidebar 'Tu Biblioteca' and ReFi Profile
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
    }
  });

  const [showPlaylistsMenu, setShowPlaylistsMenu] = useState(false);

  const { data: playlists, refetch: refetchPlaylists } = useQuery({
    queryKey: ['playlists', session?.user?.email],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/playlists/${encodeURIComponent(session?.user?.email || '')}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!session?.user?.email && showPlaylistsMenu, // Load dynamically when menu is opened!
  });

  const playlistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!session?.user?.email) throw new Error('Not authenticated');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/playlists/${playlistId}/add-track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, trackId: track.internalTrackId })
      });
      if (!res.ok) throw new Error('Error saving to playlist');
      return await res.json();
    },
    onSuccess: () => alert('Agregada a la playlist!')
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user?.email) throw new Error('Not authenticated');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, name })
      });
      const data = await res.json();
      return data.id;
    },
    onSuccess: (playlistId) => {
      refetchPlaylists();
      playlistMutation.mutate(playlistId);
    }
  });

  const handlePlay = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.no-play')) return;

    setTrack({
      id: track.id, // Usamos la Llave Maestra (YouTube ID) preparada por el servidor
      internalTrackId: track.internalTrackId,
      title: track.title,
      artist: track.artist,
      thumbnailUrl: track.thumbnailUrl,
      provider: track.sources.some(s => s.provider === 'YOUTUBE') ? 'YOUTUBE' : mainSource?.provider ?? 'YOUTUBE',
      sources: track.sources,
    });
  };

  return (
    <div 
      className="group flex flex-col p-4 bg-neutral-900/50 hover:bg-neutral-800 rounded-xl transition-all duration-300 border border-transparent hover:border-neutral-700 cursor-pointer relative"
      onClick={handlePlay}
    >
      <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-lg shadow-md">
        <Image 
          src={track.thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'} 
          alt={track.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 bg-neutral-800"
        />
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-xl hover:scale-105 hover:bg-emerald-400 transition-all">
            <Play className="w-6 h-6 fill-current ml-1" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-white font-semibold truncate text-base mb-1 group-hover:text-emerald-400 transition-colors">
            {track.title}
          </h3>
        </div>
        
        <div className="flex items-center space-x-1.5 text-neutral-400 text-sm mb-3">
          <span className="truncate">{track.artist}</span>
          {isOfficial && (
            <span title="Fuente Oficial" className="flex items-center">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </span>
          )}
          {mainSource?.provider === 'DIGNIFY' && (
            <span className="flex items-center space-x-1 text-[10px] text-amber-300 bg-amber-300/10 px-2 py-0.5 rounded-full border border-amber-300/20 ml-2">
              <Sparkles className="w-3 h-3" />
              <span className="font-bold tracking-wider">High Fidelity</span>
            </span>
          )}
        </div>

        {/* Action icons row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-neutral-800/50">
          
          <div className="flex space-x-1">
            {/* Source Logos */}
            {track.sources.map((src, index) => (
              <button
                key={`${src.provider}-${index}`}
                className={`no-play p-1.5 rounded-full transition-colors ${activeSourceIndex === index ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                onClick={() => setActiveSourceIndex(index)}
                title={`Reproducir desde ${src.provider}`}
              >
                <ProviderIcon provider={src.provider} className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button 
              className="no-play text-neutral-400 hover:text-emerald-400 transition-colors"
              onClick={() => favoriteMutation.mutate()}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            </button>

            <div className="relative">
              <button 
                className="no-play block text-neutral-400 hover:text-white transition-colors p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistsMenu(!showPlaylistsMenu);
                }}
                title="Añadir a playlist"
              >
                <PlusSquare className="w-4 h-4" />
              </button>
              
              {showPlaylistsMenu && (
                <div 
                  className="absolute bottom-full right-0 mb-2 w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl p-2 z-50 text-xs no-play"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="font-bold text-neutral-400 mb-2 px-1">Tus Playlists</p>
                  {playlists ? playlists.map((pl: any) => (
                      <button
                        key={pl.id}
                        className="w-full text-left px-2 py-1.5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded transition-colors text-white font-medium truncate"
                        onClick={() => {
                          playlistMutation.mutate(pl.id);
                          setShowPlaylistsMenu(false);
                        }}
                      >
                        {pl.name}
                      </button>
                    )) : (
                      <div className="px-2 text-neutral-500">Sin playlists...</div>
                    )
                  }
                  <div className="mt-2 border-t border-neutral-800 pt-2">
                    <button 
                      className="w-full text-left px-2 py-1.5 text-emerald-400 font-bold hover:bg-emerald-500/10 rounded transition-colors"
                      onClick={() => {
                        const name = prompt('Nombre de la nueva Playlist:');
                        if (name) createPlaylistMutation.mutate(name);
                      }}
                    >
                      + Nueva Playlist
                    </button>
                  </div>
                </div>
              )}
            </div>

            {mainSource && (
              <a 
                href={mainSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="no-play text-neutral-400 hover:text-white transition-colors p-1"
                title="Ver fuente original"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
