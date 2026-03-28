'use client';

import YouTube from 'react-youtube';
import { useEffect, useState, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';

export default function YoutubeEngine({ 
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
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const { setProgress, seekPosition, clearSeek, setBuffering, isAdDetected, setAdDetected } = usePlayerStore();

  useEffect(() => {
    if (playerRef.current && isReady) {
      try {
        // Verificamos que el método exista antes de llamarlo (Anti-Crash)
        if (typeof playerRef.current.setVolume === 'function') {
          const targetVolume = isAdDetected ? 0 : volume;
          playerRef.current.setVolume(targetVolume);
        }
      } catch (e) {
        console.warn("[YoutubeEngine] Failed to set volume:", e);
      }
    }
  }, [volume, isReady, isAdDetected]);

  useEffect(() => {
    if (playerRef.current && isReady && providerId) {
      try {
        if (typeof playerRef.current.playVideo === 'function' && typeof playerRef.current.pauseVideo === 'function') {
          if (isPlaying) playerRef.current.playVideo();
          else playerRef.current.pauseVideo();
        }
      } catch (e) {
        console.warn("[YoutubeEngine] Error controlling playback:", e);
      }
    }
  }, [isPlaying, isReady, providerId]);

  useEffect(() => {
    if (playerRef.current && isReady && seekPosition !== null) {
      try {
        if (typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(seekPosition, true);
        }
      } catch (e) {
        console.warn("[YoutubeEngine] Error seeking:", e);
      }
      clearSeek();
    }
  }, [seekPosition, isReady]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isReady && isPlaying) {
        // Only run if the YouTube API has actually loaded these methods
        if (typeof playerRef.current.getCurrentTime === 'function') {
           const current = playerRef.current.getCurrentTime() || 0;
           const total = playerRef.current.getDuration() || 0;
           setProgress(current, total);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isReady, setProgress]);

  // 1. Limpieza total al desmontar o cambiar de ruta
  useEffect(() => {
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ya no está en el DOM, ignoramos
        }
      }
      setIsReady(false);
      playerRef.current = null;
    };
  }, []);

  // Siempre mantenemos el componente montado para evitar que YouTube 'muera' al cambiar de tema
  // Usamos un video real de silencio para asegurar que el iframe se inicialice correctamente sin errores
  const activeVideoId = providerId || 'sc6yHj8-Y6o'; 

  return (
    <div className="pointer-events-none opacity-0 overflow-hidden w-[1px] h-[1px] fixed bottom-0 left-0 z-[-1]">
      <YouTube
        videoId={activeVideoId}
        opts={{ 
          height: '0', 
          width: '0', 
          playerVars: { 
            autoplay: isPlaying ? 1 : 0, 
            controls: 0, 
            origin: 'https://dignify.lanubecomputacion.com', 
            enablejsapi: 1,
            modestbranding: 1,
            host: 'https://www.youtube.com',
            widget_referrer: 'https://dignify.lanubecomputacion.com',
            playsinline: 1, // Vital para móviles
            iv_load_policy: 3 // Quita anotaciones pesadas
          } 
        }}
        onReady={(e: any) => {
          if (!e.target) return;
          playerRef.current = e.target;
          
          // Damos un respiro de 500ms para que el SDK de YouTube termine su magia interna
          setTimeout(() => {
            setIsReady(true);
            if (isPlaying) {
              setBuffering(true);
              try {
                 e.target.playVideo();
              } catch (err) {
                 console.warn("[MobileFix] Play blocked");
              }
            }
          }, 500);
        }}
        onStateChange={(e: any) => {
          if (!e.target || typeof e.target.getDuration !== 'function') return;
          if (e.data === 1) { // Playing
            setBuffering(false);
            if (!isPlaying && providerId) onPlay(); 
            
            // Lógica IA Anti-Interrupciones:
            const duration = e.target.getDuration();
            if (duration > 0 && duration < 61) {
               console.log("[IA] Posible anuncio detectado. Activando modo mute.");
               setAdDetected(true);
               setTimeout(() => setAdDetected(false), 6000);
            } else {
               setAdDetected(false);
            }
          }
          if (e.data === 2 && isPlaying) onPause(); // Paused
          if (e.data === 3) setBuffering(true); // Buffering
        }}
      />
    </div>
  );
}
