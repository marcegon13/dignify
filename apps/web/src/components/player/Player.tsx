'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePlayerStore } from '@/store/playerStore';
import { useI18n } from '@/providers/I18nProvider';
import { useSession } from 'next-auth/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Loader2, X } from 'lucide-react';
import Image from 'next/image';

const YoutubeEngine = dynamic(() => import('./YoutubeEngine'), { ssr: false });
const SoundcloudEngine = dynamic(() => import('./SoundcloudEngine'), { ssr: false });
const NativeAudioEngine = dynamic(() => import('./NativeAudioEngine'), { ssr: false });

export function Player() {
  const { currentTrack, queue, isPlaying, isBuffering, volume, setVolume, play, pause, togglePlay, toggleMute, isAdDetected, stop, nextTrack } = usePlayerStore();
  const { data: session } = useSession();
  const { dict } = useI18n(); 
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const [hasRecordedListen, setHasRecordedListen] = useState(false);

  useEffect(() => {
    setHasRecordedListen(false);
  }, [currentTrack?.id]);

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
        artwork: [{ src: currentTrack.thumbnailUrl || '/logo_dignify.JPG', sizes: '512x512', type: 'image/jpeg' }],
      });
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
      return () => {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      };
    }
  }, [currentTrack, play, pause, nextTrack]);

  const currentPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const renderEngine = () => {
    if (!currentTrack) return null;
    return (
      <div className="hidden">
        {currentTrack.provider === 'YOUTUBE' && (
          <YoutubeEngine providerId={currentTrack.id} isPlaying={isPlaying} volume={volume} onPlay={play} onPause={pause} />
        )}
        {currentTrack.provider === 'SOUNDCLOUD' && (
          <SoundcloudEngine providerId={currentTrack.id} isPlaying={isPlaying} volume={volume} onPlay={play} onPause={pause} />
        )}
        {currentTrack.provider === 'DIGNIFY' && (
          <NativeAudioEngine providerId={currentTrack.id} isPlaying={isPlaying} volume={volume} onPlay={play} onPause={pause} />
        )}
      </div>
    );
  };

  return (
    <div className={!currentTrack ? "hidden" : "fixed bottom-4 left-4 right-4 z-player px-2 md:px-0 animate-in slide-in-from-bottom-full duration-300"}>
      <div className="relative w-full h-[72px] md:h-[84px] glass-effect !border border-white/10 rounded-2xl flex justify-between md:grid md:grid-cols-3 items-center px-3 md:px-6 overflow-hidden mx-auto shadow-2xl">
        
        {isAdDetected && (
          <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-md z-player flex items-center justify-center animate-in fade-in zoom-in duration-300">
             <div className="flex items-center gap-3 text-black font-black italic tracking-tighter">
               DIGNIFY AI SHIELD ACTIVE
             </div>
          </div>
        )}
        
        {renderEngine()}

        {/* INFO */}
        <div className="flex items-center min-w-0 flex-1 md:flex-none">
          {currentTrack && (
            <>
              <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
                 <Image src={currentTrack.thumbnailUrl || '/logo_dignify.JPG'} alt={currentTrack.title} fill className="rounded bg-neutral-900 object-cover" />
              </div>
              <div className="flex flex-col flex-1 min-w-0 mx-3 md:mx-4 text-left">
                  <h3 className="text-sm md:text-base font-bold text-white truncate">{currentTrack.title}</h3>
                  <p className="text-[10px] md:text-xs text-neutral-400 truncate">{currentTrack.artist}</p>
              </div>
            </>
          )}
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col items-center justify-center space-y-1 md:justify-self-center w-auto md:w-full md:max-w-[40vw]">
          <div className="flex items-center space-x-4 md:space-x-6">
            <button className="text-neutral-400 hover:text-white transition-colors hidden md:block" disabled><SkipBack className="w-5 h-5" /></button>
            <button 
              onClick={togglePlay}
              className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cobalt-deep to-cobalt-light flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-cobalt-light/20"
            >
              {isBuffering ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-px" />}
            </button>
            <button 
              onClick={nextTrack}
              disabled={queue.length === 0}
              className="text-neutral-400 hover:text-white transition-colors disabled:opacity-30"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-2 w-full max-w-[400px]">
            <span className="text-[10px] text-neutral-400 font-mono min-w-[35px] text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full cursor-pointer relative" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              usePlayerStore.getState().seekTo(pos * duration);
            }}>
              <div className="absolute left-0 h-full bg-cobalt-light rounded-full" style={{ width: `${currentPercentage}%` }}></div>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono min-w-[35px]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* VOLUME */}
        <div className="hidden md:flex items-center justify-end space-x-3 justify-self-end w-full max-w-[200px]">
          <button onClick={toggleMute} className="text-neutral-400 hover:text-white transition-colors"><Volume2 className="w-5 h-5" /></button>
          <div className="w-full h-1.5 bg-neutral-700/50 rounded-full cursor-pointer relative" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setVolume(pos * 100);
          }}>
            <div className="h-full bg-cobalt-light rounded-full" style={{ width: `${volume}%` }}></div>
          </div>
          <button onClick={stop} className="p-2 text-neutral-500 hover:text-red-400 transition-all ml-4"><X className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
