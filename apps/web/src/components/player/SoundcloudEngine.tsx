'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window { SC: any; }
}

export default function SoundcloudEngine({ 
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Inject SC Widget API script if it doesn't exist
    if (!window.SC && !document.getElementById('sc-widget-api')) {
      const script = document.createElement('script');
      script.id = 'sc-widget-api';
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => initWidget();
    } else {
      initWidget();
    }

    function initWidget() {
      // Must wait for global SC to exist
      if (!iframeRef.current || !window.SC) return;
      widgetRef.current = window.SC.Widget(iframeRef.current);
      
      widgetRef.current.bind(window.SC.Widget.Events.READY, () => {
        if (isPlaying) widgetRef.current.play();
      });

      widgetRef.current.bind(window.SC.Widget.Events.PLAY, () => {
        if (!isPlaying) onPlay();
      });
      
      widgetRef.current.bind(window.SC.Widget.Events.PAUSE, () => {
        if (isPlaying) onPause();
      });
    }
  }, []); // Run once on mount

  // Sync state changes when providerId updates
  useEffect(() => {
    if (!widgetRef.current) return;
    
    // SC load requires the track api url
    widgetRef.current.load(`https://api.soundcloud.com/tracks/${providerId}`, {
      auto_play: isPlaying,
      show_artwork: false,
    });
  }, [providerId]);

  useEffect(() => {
    if (!widgetRef.current) return;
    if (isPlaying) widgetRef.current.play();
    else widgetRef.current.pause();
  }, [isPlaying]);

  return (
    <div className="hidden">
      <iframe 
        ref={iframeRef} 
        id="sc-widget"
        width="0" 
        height="0" 
        scrolling="no" 
        frameBorder="no" 
        allow="autoplay" 
        // We initialize it with the same providerId
        src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${providerId}&auto_play=false`}
      ></iframe>
    </div>
  );
}
