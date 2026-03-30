'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import Hls from 'hls.js';

export default function NativeAudioEngine({ 
  providerId, 
  isPlaying, 
  volume,
  onPlay, 
  onPause 
}: { 
  providerId: string, 
  isPlaying: boolean, 
  volume: number,
  onPlay: () => void, 
  onPause: () => void 
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isReady, setIsReady] = useState(false);
  const currentTrack = usePlayerStore(s => s.currentTrack);
  const { setProgress, seekPosition, clearSeek, setBuffering, queue, nextTrack: triggerNextTrack } = usePlayerStore();
  const [hasPreFetched, setHasPreFetched] = useState(false);

  const isHlsUrl = providerId.endsWith('.m3u8');

  // 1. REPRODUCCIÓN EN SEGUNDO PLANO: Media Session API (Controles Nativos)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    // Sincronizar metadatos (incluyendo WebP de Sharp)
    const artworkUrl = currentTrack.thumbnailUrl || "https://images.unsplash.com/photo-1516280440502-86ed0ee20078?q=80&w=500&auto=format&fit=crop";
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: 'Dignify WebPlayer',
      artwork: [
        { src: artworkUrl, sizes: '96x96', type: 'image/webp' },
        { src: artworkUrl, sizes: '128x128', type: 'image/webp' },
        { src: artworkUrl, sizes: '192x192', type: 'image/webp' },
        { src: artworkUrl, sizes: '256x256', type: 'image/webp' },
        { src: artworkUrl, sizes: '384x384', type: 'image/webp' },
        { src: artworkUrl, sizes: '512x512', type: 'image/webp' },
      ]
    });

    // Action Handlers
    const handlers: { [key in MediaSessionAction]?: MediaSessionActionHandler } = {
      play: () => onPlay(),
      pause: () => onPause(),
      previoustrack: () => usePlayerStore.getState().seekTo(0), // Reiniciar si no hay historial
      nexttrack: () => triggerNextTrack(),
      seekto: (details) => {
        if (details.seekTime !== undefined) usePlayerStore.getState().seekTo(details.seekTime);
      },
      seekbackward: (details) => {
        const skip = details.seekOffset || 10;
        const current = audioRef.current?.currentTime || 0;
        usePlayerStore.getState().seekTo(Math.max(current - skip, 0));
      },
      seekforward: (details) => {
        const skip = details.seekOffset || 10;
        const current = audioRef.current?.currentTime || 0;
        usePlayerStore.getState().seekTo(Math.min(current + skip, audioRef.current?.duration || 0));
      }
    };

    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler);
      } catch (e) {
        // Fallback para navegadores antiguos
      }
    });

  }, [currentTrack, onPlay, onPause, triggerNextTrack]);

  // Actualizar estado de reproducción en MediaSession
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // 2. PREVENCIÓN DE SUSPENSIÓN (Visibility Change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isPlaying && audioRef.current) {
        // Asegurarse de que el audio siga activo en background
        console.log("[ReFi-Engine] Tab hidden, manteniendo playback activo.");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  // 3. WAKE LOCK (Opcional - Durante carga de tracks)
  useEffect(() => {
    let wakeLock: any = null;
    const requestLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {}
      }
    };

    if (isPlaying && !hasPreFetched) {
      requestLock();
    }

    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, [providerId, isPlaying]);

  // PRE-FETCHING LOGIC: Carga el próximo track al 80% (Estilo Spotify)
  const currentTime = usePlayerStore(s => s.currentTime);
  const duration = usePlayerStore(s => s.duration);
  const nextTrackFromQueue = queue[0];

  useEffect(() => {
    if (duration > 0 && (currentTime / duration) > 0.8 && nextTrackFromQueue && !hasPreFetched) {
      setHasPreFetched(true);
      if (nextTrackFromQueue.id.endsWith('.m3u8')) {
        console.log(`[ReFi-Prefetch] Pre-fetching next track manifest: ${nextTrackFromQueue.title}`);
        fetch(nextTrackFromQueue.id, { priority: 'low' }).catch(() => {});
      }
    }
  }, [currentTime, duration, nextTrackFromQueue, hasPreFetched]);

  // Reset pre-fetch state on track change
  useEffect(() => {
    setHasPreFetched(false);
  }, [providerId]);

  // Inicialización de HLS o Native Audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHlsUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
        });
        hls.loadSource(providerId);
        hls.attachMedia(audio);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsReady(true);
          if (isPlaying) audio.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = providerId;
        setIsReady(true);
      }
    } else {
      audio.src = providerId;
      setIsReady(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [providerId]);

  useEffect(() => {
    if (audioRef.current && isReady) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play error", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isReady]);

  useEffect(() => {
    if (audioRef.current && isReady) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, isReady]);

  useEffect(() => {
    if (audioRef.current && isReady && seekPosition !== null) {
      audioRef.current.currentTime = seekPosition;
      clearSeek();
    }
  }, [seekPosition, isReady, clearSeek]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime || 0;
      const total = audioRef.current.duration || 0;
      setProgress(current, total);

      // Sincronizar posición con MediaSession para el Lock Screen
      if ('mediaSession' in navigator && isReady) {
        try {
          if (total > 0) {
            navigator.mediaSession.setPositionState({
              duration: total,
              playbackRate: audioRef.current.playbackRate || 1,
              position: current,
            });
          }
        } catch (e) {
          // Ignorar si el estado no es válido aún
        }
      }
    }
  };

  return (
    <audio 
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onPlay={() => { setBuffering(false); if (!isPlaying) onPlay(); }}
      onPause={() => { if (isPlaying) onPause(); }}
      onWaiting={() => setBuffering(true)}
      onCanPlay={() => setBuffering(false)}
      onEnded={() => {
        if (nextTrackFromQueue) {
          triggerNextTrack();
        } else {
          onPause();
        }
      }}
      className="hidden"
      preload="auto"
    />
  );
}
