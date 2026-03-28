'use client';

import React, { useRef, useEffect } from 'react';

export function AnimatedLogo({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Reproducimos al 70% de velocidad para mayor fluidez y lujo
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden transition-all duration-500 ${className}`}>
      <div className="w-full h-full flex items-center justify-center overflow-hidden"> 
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto object-cover pointer-events-none"
          style={{ 
            clipPath: 'inset(2% 12% 12% 2%)',
            transform: 'scale(1.1)'
          }}
        >
          <source src="/assets/logo-wave-moon.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
