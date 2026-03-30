'use client';

import React from 'react';
import { Share2, Users, CheckCircle, Globe, Instagram, Twitter, Heart, Play, Music, Leaf, Droplets, Flame } from 'lucide-react';
import Image from 'next/image';

interface Track {
  id: string;
  title: string;
  duration?: number;
  thumbnailUrl?: string;
  genre: string;
  cause?: string; // ODS Cause
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

const ODSIcon = ({ cause }: { cause?: string }) => {
  switch (cause?.toUpperCase()) {
    case 'ENVIRONMENT': return <Leaf className="w-4 h-4 text-emerald-400" />;
    case 'WATER': return <Droplets className="w-4 h-4 text-cyan-400" />;
    case 'ENERGY': return <Flame className="w-4 h-4 text-orange-400" />;
    default: return <Music className="w-4 h-4 text-neutral-500" />;
  }
};

export default function ArtistProfileClient({ artist }: { artist: Artist }) {
  return (
    <div className="min-h-screen bg-[#080808] text-white relative font-sans selection:bg-emerald-500/30">
      
      {/* 1. CINEMATIC HERO HEADER */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[3000ms] ease-out group-hover:scale-110"
          style={{ backgroundImage: `url(${artist.bannerImage || '/logo_dignify.png'})` }}
        />
        {/* Deep Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
        
        {/* Floating Artist Info over Banner */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col items-start">
          {artist.isVerified && (
            <div className="flex items-center gap-2 text-emerald-400 font-black tracking-[0.2em] text-[10px] uppercase mb-4 bg-emerald-400/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-400/20">
               <CheckCircle className="w-3.5 h-3.5" />
               Artista Verificado
            </div>
          )}
          
          <h1 className="text-6xl md:text-[120px] font-black tracking-tighter leading-[0.8] mb-6 drop-shadow-2xl">
            {artist.name}
          </h1>

          <div className="flex flex-wrap items-center gap-8 text-neutral-400 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <span className="text-white text-2xl font-black tracking-normal">{artist.followersCount.toLocaleString()}</span>
              <span>Seguidores</span>
            </div>
            <div className="hidden md:flex items-center gap-6 border-l border-white/10 pl-8">
              {artist.instagram && <Instagram className="w-5 h-5 hover:text-emerald-400 transition-all cursor-pointer hover:scale-110" />}
              {artist.twitter && <Twitter className="w-5 h-5 hover:text-emerald-400 transition-all cursor-pointer hover:scale-110" />}
              {artist.website && <Globe className="w-5 h-5 hover:text-emerald-400 transition-all cursor-pointer hover:scale-110" />}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Bio & Impact (Main content) */}
          <div className="lg:col-span-8 flex flex-col space-y-20">
            
            {/* Bio Glassmorphism Card */}
            <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />
               
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500 mb-6 flex items-center gap-4">
                  Sinfonía ReFi
                  <div className="h-px flex-1 bg-white/5"></div>
               </h3>
               
               <p className="text-xl md:text-2xl text-neutral-300 font-medium leading-relaxed italic">
                  "{artist.bio || 'Música regenerativa proyectada hacia el futuro de la curación descentralizada.'}"
               </p>

               <div className="mt-12 flex gap-4">
                  <button className="px-10 py-4 bg-emerald-500 text-black font-black rounded-full hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group">
                     FOLLOW ARTIST
                  </button>
                  <button className="p-4 bg-white/5 text-white border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-95">
                     <Share2 className="w-5 h-5" />
                  </button>
               </div>
            </section>

            {/* Tracks List (Catálogo Premium) */}
            <section>
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-black tracking-tighter">Colección</h2>
                <div className="flex gap-2">
                   <button className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-all text-neutral-400 hover:text-white">
                      <Music className="w-5 h-5" />
                   </button>
                </div>
              </div>

              <div className="grid gap-4">
                 {artist.tracks.map((track, i) => (
                    <div 
                      key={track.id} 
                      className="group flex items-center gap-6 p-5 rounded-[28px] bg-[#111111]/40 border border-transparent hover:border-white/5 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer relative"
                    >
                      <div className="w-8 text-neutral-700 font-black text-lg text-center group-hover:text-emerald-500 transition-colors">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                         {track.thumbnailUrl ? (
                           <Image src={track.thumbnailUrl} alt={track.title} fill className="object-cover" />
                         ) : (
                           <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                              <Music className="w-6 h-6 text-neutral-800" />
                           </div>
                         )}
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                            <Play className="w-8 h-8 fill-white text-white drop-shadow-xl" />
                         </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h5 className="font-bold text-lg text-neutral-100 group-hover:text-white transition-colors truncate">
                            {track.title}
                          </h5>
                          {/* Elegant ODS Badge */}
                          <div className="bg-white/5 p-1.5 rounded-lg border border-white/5 animate-in fade-in zoom-in duration-500">
                             <ODSIcon cause={track.cause} />
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.25em]">{track.genre}</span>
                      </div>

                      <div className="hidden md:flex items-center gap-8">
                        <div className="h-8 w-px bg-white/5"></div>
                        <div className="text-neutral-500 font-mono text-sm tracking-tighter">04:20</div>
                        <button className="p-3 text-neutral-600 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                           <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                 ))}
              </div>
            </section>
          </div>

          {/* Right Column: Mini Dashboard / ReFi Support */}
          <div className="lg:col-span-4 flex flex-col space-y-8">
             <div className="sticky top-24">
               <section className="bg-linear-to-br from-emerald-500/20 to-teal-500/5 backdrop-blur-3xl border border-emerald-500/20 p-8 rounded-[40px] shadow-emerald-500/5 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
                       <Heart className="w-5 h-5 text-black fill-current" />
                    </div>
                    <h4 className="font-black text-sm uppercase tracking-widest text-emerald-400">Direct Support</h4>
                  </div>
                  
                  <p className="text-neutral-400 text-sm leading-relaxed mb-10 font-medium">
                    Apoya la causa de este artista directamente. Al escucharlo, acumulas curación ReFi y recompensas del ecosistema.
                  </p>

                  <div className="space-y-3">
                     <button className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-neutral-200 transition-all active:scale-[0.98]">
                        SUPPORT WITH ReFi
                     </button>
                     <button className="w-full py-4 bg-transparent text-white border border-white/10 font-bold rounded-2xl hover:bg-white/5 transition-all text-xs tracking-widest">
                        COLECCIONAR CATALOGO
                     </button>
                  </div>
               </section>

               <div className="mt-8 px-4 text-center">
                  <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em]">Dignify Protocol - Artist Proof 2026</p>
               </div>
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}
