'use client';

import React from 'react';
import { Share2, Users, CheckCircle, Globe, Instagram, Twitter, Heart, Play } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  duration?: number;
  thumbnailUrl?: string;
  genre: string;
}

interface Artist {
  name: string;
  slug: string;
  bio: string;
  isVerified: boolean;
  bannerImage: string;
  followersCount: number;
  instagram?: string;
  twitter?: string;
  website?: string;
  tracks: Track[];
}

export default function ArtistProfileClient({ artist }: { artist: Artist }) {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Banner de fondo con gradiente inmersivo */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform scale-105"
          style={{ backgroundImage: `url(${artist.bannerImage || '/logo_dignify.png'})` }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/60 to-black"></div>
      </div>

      {/* Contenido principal (Carta de Presentación) */}
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
        
        <div className="flex flex-col md:flex-row gap-8 items-end">
          {/* Foto de Perfil / Avatar Lujo */}
          <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-black shadow-2xl shadow-emerald-500/10 group relative shrink-0">
             <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundImage: `url(${artist.bannerImage || '/logo_dignify.png'})` }}
             />
          </div>

          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest text-xs uppercase mb-2 bg-emerald-400/10 px-3 py-1 rounded-full w-fit">
               <CheckCircle className="w-4 h-4" />
               Artista Verificado
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-4 flex items-center gap-4">
              {artist.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-neutral-400 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-neutral-500" />
                <span className="text-white font-bold">{artist.followersCount.toLocaleString()}</span> seguidores
              </div>
              <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                {artist.instagram && <Instagram className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />}
                {artist.twitter && <Twitter className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />}
                {artist.website && <Globe className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />}
              </div>
            </div>
          </div>

          {/* Botones de Acción (ReFi & Follow) */}
          <div className="flex flex-row md:flex-col gap-3 pb-4">
             <button className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-colors active:scale-95">
                Seguir
             </button>
             <button className="px-8 py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2">
                <Heart className="w-5 h-5 fill-current" />
                Support Artist
             </button>
          </div>
        </div>

        {/* Bio Section (Glassmorphism) */}
        <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] shadow-inner mb-16">
           <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              Sobre el artista
              <div className="h-0.5 w-12 bg-emerald-500/50 rounded-full"></div>
           </h3>
           <p className="text-neutral-300 leading-relaxed max-w-3xl italic">
              "{artist.bio || 'Este artista aún no ha definido su biografía, pero su música habla por sí sola.'}"
           </p>
        </div>

        {/* Tracks List (Catálogo) */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black tracking-tight">Catálogo Oficial</h2>
            <button className="text-emerald-400 font-bold hover:underline text-sm uppercase tracking-wider">Ver Todo</button>
          </div>

          <div className="grid gap-2">
             {artist.tracks.map((track, i) => (
                <div 
                  key={track.id} 
                  className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-900/50 border border-transparent hover:border-white/5 transition-all cursor-pointer"
                >
                  <span className="w-6 text-neutral-600 font-bold text-center group-hover:text-emerald-500">{i + 1}</span>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 shadow-lg relative">
                     {track.thumbnailUrl && <img src={track.thumbnailUrl} className="w-full h-full object-cover" />}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 fill-white text-white" />
                     </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-neutral-100 group-hover:text-white transition-colors">{track.title}</h5>
                    <span className="text-xs text-neutral-500 font-medium uppercase tracking-widest">{track.genre}</span>
                  </div>
                  <div className="flex items-center gap-6 text-neutral-500 text-sm">
                    <Share2 className="w-4 h-4 hover:text-white transition-colors" />
                    <span className="font-medium text-xs">4:20</span>
                  </div>
                </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
