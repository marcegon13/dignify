'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePlayerStore } from '@/store/playerStore';
import { useI18n } from '@/providers/I18nProvider';
import { useSession } from 'next-auth/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Loader2, ShieldAlert, X } from 'lucide-react';
import Image from 'next/image';

const YoutubeEngine = dynamic(() => import('./YoutubeEngine'), { ssr: false });
const SoundcloudEngine = dynamic(() => import('./SoundcloudEngine'), { ssr: false });
const NativeAudioEngine = dynamic(() => import('./NativeAudioEngine'), { ssr: false });

export function Player() {
  const { currentTrack, isPlaying, isBuffering, volume, setVolume, play, pause, togglePlay, toggleMute, isAdDetected, stop } = usePlayerStore();
  const { data: session } = useSession();
  const { dict } = useI18n(); 
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const [hasRecordedListen, setHasRecordedListen] = useState(false);

  // Reiniciamos el tracking cuando cambia el track
  useEffect(() => {
    setHasRecordedListen(false);
  }, [currentTrack?.id]);

  // Lógica de Tracking de Impacto: Si escuchó > 30s de un track verificado
  useEffect(() => {
    if (currentTrack?.internalTrackId && session?.user?.email && currentTime > 30 && !hasRecordedListen) {
      setHasRecordedListen(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/${currentTrack.internalTrackId}/listen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: session.user.email })
      }).catch(console.error);
    }
  }, [currentTime, currentTrack, session, hasRecordedListen]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: 'Dignify ReFi',
        artwork: [
          { 
            src: currentTrack.thumbnailUrl || '/logo_dignify.JPG', 
            sizes: '512x512', 
            type: 'image/jpeg' 
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);

      // Clean up handlers when track changes
      return () => {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      };
    }
  }, [currentTrack, play, pause]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const currentPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const renderEngine = () => {
    return (
      <div className="hidden">
        {/* Siempre montados para evitar lag de carga repetida */}
        <YoutubeEngine 
          providerId={
            currentTrack?.provider === 'YOUTUBE' 
              ? currentTrack.id 
              : currentTrack?.provider === 'SPOTIFY' || currentTrack?.provider === 'DEEZER'
              ? currentTrack.sources?.find(s => s.provider === 'YOUTUBE')?.providerId || ''
              : ''
          } 
          isPlaying={isPlaying && (currentTrack?.provider === 'YOUTUBE' || currentTrack?.provider === 'SPOTIFY' || currentTrack?.provider === 'DEEZER')} 
          volume={volume} 
          onPlay={play} 
          onPause={pause} 
        />
        
        {currentTrack?.provider === 'SOUNDCLOUD' && (
          <SoundcloudEngine 
            providerId={currentTrack.id} 
            isPlaying={isPlaying} 
            volume={volume} 
            onPlay={play} 
            onPause={pause} 
          />
        )}
        
        {currentTrack?.provider === 'DIGNIFY' && (
          <NativeAudioEngine 
            providerId={currentTrack.id} 
            isPlaying={isPlaying} 
            volume={volume} 
            onPlay={play} 
            onPause={pause} 
          />
        )}
      </div>
    );
  };

  return (
    <div className={!currentTrack ? "hidden" : "fixed bottom-0 left-0 right-0 z-player w-full px-2 md:px-0 pb-[env(safe-area-inset-bottom)] bg-black/40 backdrop-blur-md animate-in slide-in-from-bottom-full duration-300"}>
    <div className="relative w-full md:w-full h-[72px] md:h-[84px] shrink-0 bg-neutral-900/90 md:bg-neutral-950/90 backdrop-blur-3xl border md:border-t border-white/10 md:border-white/5 flex justify-between md:grid md:grid-cols-3 items-center px-3 md:px-6 z-player overflow-hidden md:rounded-none rounded-2xl mx-auto max-w-[96vw] md:max-w-none shadow-2xl md:shadow-none">
      
      {/* AI ANTI-AD OVERLAY */}
      {isAdDetected && (
        <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-md z-player flex items-center justify-center animate-in fade-in zoom-in duration-300">
           <div className="flex items-center gap-3 text-black font-black italic tracking-tighter">
             <div className="w-2 h-2 rounded-full bg-black animate-ping" />
             {dict?.player?.adBlocker || "AD DETECTED"} - DIGNIFY AI SHIELD ACTIVE
           </div>
        </div>
      )}
      
      {/* Dynamic Hidden Audio Engine */}
      {renderEngine()}

      {/* TRACK INFO (LEFT - Expand on Mobile) */}
      <div className="flex items-center min-w-0 flex-1 md:flex-none">
        {currentTrack ? (
          <>
            <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
               <Image 
                 src={currentTrack.thumbnailUrl || '/logo_dignify.JPG'} 
                 alt={currentTrack.title} 
                 fill
                 className="rounded bg-neutral-900 object-cover shadow-lg"
               />
            </div>
            <div className="flex flex-col flex-1 min-w-0 mx-3 md:mx-4 text-left">
                <h3 className="text-sm md:text-base font-bold text-white truncate max-w-[120px] md:max-w-none hover:text-emerald-400 transition-colors pointer-events-auto cursor-pointer">
                  {currentTrack.title}
                </h3>
                <p className="text-[10px] md:text-xs text-neutral-400 truncate max-w-[120px] md:max-w-none">{currentTrack.artist}</p>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3 opacity-60">
             <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-neutral-900/50 flex flex-col items-center justify-center border border-white/5 shrink-0">
                <Music className="w-3 h-3 md:w-4 md:h-4 text-neutral-600" />
             </div>
             <div className="text-[10px] md:text-xs text-neutral-500 font-medium">
               Dignify ReFi...
             </div>
          </div>
        )}
      </div>

      {/* CONTROLS (CENTER) */}
      <div className="flex flex-col items-center justify-center space-y-1 md:justify-self-center w-auto md:w-full md:max-w-[40vw]">
        {/* Buttons */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <button className="text-neutral-400 hover:text-white transition-colors hidden md:block">
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform disabled:opacity-50 shadow-xl shrink-0"
          >
            {isBuffering ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-px" />
            )}
          </button>

          <button className="text-neutral-400 hover:text-white transition-colors hidden md:block">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Hidden on Mobile) */}
        <div className="hidden md:flex items-center space-x-2 w-full max-w-[400px]">
          <span className="text-[10px] text-neutral-400 font-medium font-mono min-w-[35px] text-right">
            {formatTime(currentTime)}
          </span>
          <div 
            className="flex-1 h-1.5 bg-neutral-800 rounded-full cursor-pointer group flex items-center relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              usePlayerStore.getState().seekTo(pos * duration);
            }}
          >
            <div 
              className="absolute left-0 h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-all duration-100"
              style={{ width: `${currentPercentage}%` }}
            ></div>
            <div 
              className="absolute h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none"
              style={{ left: `calc(${currentPercentage}% - 6px)` }}
            ></div>
          </div>
          <span className="text-[10px] text-neutral-400 font-medium font-mono min-w-[35px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* VOLUME (RIGHT - Hidden on Mobile) */}
      <div className="hidden md:flex items-center justify-end space-x-3 justify-self-end w-full max-w-[200px]">
        <button onClick={toggleMute} className="text-neutral-400 hover:text-white transition-colors shrink-0 outline-none">
          {volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <div 
          className="w-full h-1.5 bg-neutral-700/50 rounded-full hover:bg-neutral-600 transition-colors cursor-pointer group flex overflow-hidden relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setVolume(pos * 100);
          }}
        >
          <div 
            className="h-full bg-emerald-400 rounded-full group-hover:bg-emerald-300 absolute left-0 top-0"
            style={{ width: `${volume}%` }}
          ></div>
        </div>
      </div>

      <button 
        onClick={stop}
        className="p-2.5 bg-black/50 md:bg-transparent text-white md:text-neutral-500 hover:text-emerald-400 transition-all hover:bg-white/5 rounded-full ml-1 md:ml-4 shrink-0 border border-white/10 md:border-transparent shadow-xl md:shadow-none active:scale-90"
        title="Cerrar reproductor"
      >
        <X className="w-6 h-6 md:w-6 md:h-6" />
      </button>

    </div>
    </div>
  );
}
