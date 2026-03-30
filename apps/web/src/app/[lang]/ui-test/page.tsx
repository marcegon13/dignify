import { Inter } from 'next/font/google';
import Image from 'next/image';
import { Leaf, Droplets, Flame, Play, Pause, SkipBack, SkipForward, Volume2, Music, Heart } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function UITestPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-[#080808] text-white relative overflow-hidden flex flex-col`}>
      
      {/* BACKGROUND WATERMARK (LA OLA) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none w-[120vw] h-[120vh]">
         {/* Wave Placeholder */}
         <svg viewBox="0 0 1440 320" className="w-full h-full text-emerald-500 fill-current">
            <path d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,181.3C672,203,768,213,864,192C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
         </svg>
      </div>

      <main className="flex-1 relative z-10 px-6 py-12 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* ARTIST PROFILE (LEFT SIDE ON PC, TOP ON MOBILE) */}
        <section className="md:col-span-4 lg:col-span-3 flex flex-col items-center md:items-start text-center md:text-left">
           <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-emerald-500/50 shadow-2xl mb-8">
              <Image 
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600" 
                alt="Artist Profile" 
                fill 
                className="object-cover"
              />
           </div>
           <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-4">
              LUNA & <br/> THE WAVE
           </h1>
           <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-sm mb-6">
              Sinfonía oceánica y electrónica regenerativa. Pioneros en el sonido ReFi.
           </p>
           <div className="flex gap-4">
              <button className="px-8 py-3 bg-emerald-500 text-black font-black rounded-full hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                 FOLLOW
              </button>
              <button className="px-8 py-3 border border-white/20 text-white font-black rounded-full hover:bg-white/5 transition-all">
                 INFO
              </button>
           </div>
        </section>

        {/* TRACK LIST (RIGHT SIDE ON PC) */}
        <section className="md:col-span-8 lg:col-span-9 flex flex-col">
           <h2 className="text-xs font-black tracking-[0.2em] text-neutral-500 uppercase mb-8 border-b border-white/5 pb-4">
              Pistas Destacadas
           </h2>
           
           <div className="space-y-4">
              <TrackItem title="Deep Blue Rising" artist="Luna & The Wave" duration="4:22" icon={Droplets} color="text-cyan-400" />
              <TrackItem title="Corals of Light" artist="Luna & The Wave" duration="3:45" icon={Leaf} color="text-emerald-400" />
              <TrackItem title="Geothermal Pulse" artist="Luna & The Wave" duration="5:10" icon={Flame} color="text-orange-400" />
           </div>
        </section>
      </main>

      {/* FIXED BOTTOM PLAYER (GLASSMORPHISM) */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 z-50">
         <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 md:px-8 py-4 flex items-center justify-between shadow-2xl">
            
            {/* Info */}
            <div className="flex items-center gap-4 min-w-0">
               <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200" alt="Now Playing" fill className="object-cover" />
               </div>
               <div className="hidden md:block overflow-hidden">
                  <h4 className="font-black text-sm truncate">Deep Blue Rising</h4>
                  <p className="text-xs text-neutral-500 truncate">Luna & The Wave</p>
               </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
               <div className="flex items-center gap-6">
                  <button className="text-neutral-500 hover:text-white"><SkipBack size={20} /></button>
                  <button className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                     <Play size={20} fill="black" />
                  </button>
                  <button className="text-neutral-500 hover:text-white"><SkipForward size={20} /></button>
               </div>
               <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden hidden md:block">
                  <div className="w-1/3 h-full bg-emerald-500 rounded-full" />
               </div>
            </div>

            {/* Volume/Actions */}
            <div className="flex items-center gap-4">
               <button className="text-neutral-500 hover:text-red-400 Transition-colors"><Heart size={20} /></button>
               <div className="hidden md:flex items-center gap-2">
                  <Volume2 size={20} className="text-neutral-500" />
                  <div className="w-20 h-1 bg-white/10 rounded-full" />
               </div>
            </div>

         </div>
      </footer>
    </div>
  );
}

function TrackItem({ title, artist, duration, icon: Icon, color }: any) {
  return (
    <div className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer">
       <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
             <Music size={20} className="text-neutral-500 group-hover:text-emerald-400" />
          </div>
          <div className="overflow-hidden">
             <h4 className="font-bold text-lg truncate">{title}</h4>
             <p className="text-sm text-neutral-500 truncate">{artist}</p>
          </div>
       </div>
       <div className="flex items-center gap-6">
          <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${color} flex items-center gap-2`}>
             <Icon size={16} />
             <span className="text-[10px] font-black uppercase tracking-wider hidden md:block">Impact</span>
          </div>
          <span className="text-neutral-600 font-mono text-sm">{duration}</span>
       </div>
    </div>
  );
}
