'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';

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
  const [isReady, setIsReady] = useState(false);
  const { setProgress, seekPosition, clearSeek, setBuffering } = usePlayerStore();

  useEffect(() => {
    if (audioRef.current) {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current && isReady) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, isReady]);

  useEffect(() => {
    if (audioRef.current && isReady) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play error", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isReady, providerId]);

  useEffect(() => {
    if (audioRef.current && isReady && seekPosition !== null) {
      audioRef.current.currentTime = seekPosition;
      clearSeek();
    }
  }, [seekPosition, isReady]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime || 0;
      const total = audioRef.current.duration || 0;
      setProgress(current, total);
    }
  };

  return (
    <audio 
      ref={audioRef}
      src={providerId} // Using providerId as direct url for DIGNIFY provider
      onTimeUpdate={handleTimeUpdate}
      onPlay={() => { setBuffering(false); if (!isPlaying) onPlay(); }}
      onPause={() => { if (isPlaying) onPause(); }}
      onWaiting={() => setBuffering(true)}
      onCanPlay={() => setBuffering(false)}
      onEnded={() => onPause()}
      className="hidden"
    />
  );
}
