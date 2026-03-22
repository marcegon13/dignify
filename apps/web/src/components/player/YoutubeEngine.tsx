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
      // Si la IA detecta un anuncio, forzamos volumen 0
      const targetVolume = isAdDetected ? 0 : volume;
      playerRef.current.setVolume(targetVolume);
    }
  }, [volume, isReady, isAdDetected]);

  useEffect(() => {
    if (playerRef.current && isReady) {
      if (isPlaying) Object.values(playerRef.current).length && playerRef.current.playVideo();
      else Object.values(playerRef.current).length && playerRef.current.pauseVideo();
    }
  }, [isPlaying, isReady, providerId]);

  useEffect(() => {
    if (playerRef.current && isReady && seekPosition !== null) {
      playerRef.current.seekTo(seekPosition, true);
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

  return (
    <div className="hidden">
      <YouTube
        videoId={providerId}
        opts={{ height: '0', width: '0', playerVars: { autoplay: isPlaying ? 1 : 0, controls: 0 } }}
        onReady={(e: any) => {
          playerRef.current = e.target;
          setIsReady(true);
          if (isPlaying) setBuffering(true);
        }}
        onStateChange={(e: any) => {
          if (e.data === 1) { // Playing
            setBuffering(false);
            if (!isPlaying) onPlay(); 
            
            // Lógica IA Anti-Interrupciones:
            // Detectamos si la duración reportada es < 60s y no coincide con la esperada en DB
            // O si el título del video en el iframe ha cambiado a algo genérico de ads
            const duration = e.target.getDuration();
            if (duration > 0 && duration < 61) {
               console.log("[IA] Posible anuncio detectado por duración corta. Activando modo mute.");
               setAdDetected(true);
               // Simulamos que el anuncio dura un tiempo fijo para el overlay
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
