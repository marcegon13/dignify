'use client';

import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Smartphone, ArrowBigDownDash } from 'lucide-react';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // 1. Detectamos si ya está instalada (en modo standalone o PWA activa)
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone) return;

    // 2. Detectamos plataforma de forma más precisa
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /android/.test(userAgent);

    if (isIos) setPlatform('ios');
    else if (isAndroid) setPlatform('android');

    // 3. Mostramos el cartel después de un pequeño retraso para no molestar al cargar
    const hasSeenPrompt = localStorage.getItem('dignify_install_prompt_hidden');
    if (!hasSeenPrompt) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
    // Lo ocultamos por 3 días para no ser pesados pero recordar la opción
    localStorage.setItem('dignify_install_prompt_hidden', 'true');
  };

  if (!showPrompt || platform === 'other') return null;

  return (
    <div className="fixed bottom-28 left-4 right-4 z-[9999] animate-in slide-in-from-bottom-5 duration-700">
      <div className="bg-neutral-900/98 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 relative overflow-hidden ring-1 ring-white/10">
        
        {/* Luces de gradientes dinámicos (Teal & Emerald) */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 blur-[80px] pointer-events-none"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 transform rotate-3">
            {platform === 'ios' ? (
              <Smartphone className="w-8 h-8 text-white" />
            ) : (
              <ArrowBigDownDash className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="flex-1 pr-4">
            <h4 className="text-white font-bold text-lg leading-tight tracking-tight">
              {platform === 'ios' ? 'Añadir a tu iPhone' : 'Instalar App Oficial'}
            </h4>
            <p className="text-neutral-300 text-sm mt-1 leading-snug">
              {platform === 'ios' 
                ? 'Sigue estos 2 pasos para tener la App en tu pantalla de inicio:' 
                : 'Instala la aplicación para una experiencia Hi-Fi completa.'}
            </p>
          </div>

          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guía Visual exclusiva para IOS (Safari) */}
        {platform === 'ios' && (
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <Share className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Paso 1</span>
              <span className="text-xs text-center text-white font-medium">Pulsa Compartir</span>
            </div>
            
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
              <div className="bg-emerald-500/20 p-2 rounded-xl">
                <PlusSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Paso 2</span>
              <span className="text-xs text-center text-white font-medium">Añadir a Inicio</span>
            </div>
          </div>
        )}

        {!platform && (
           <button className="w-full py-4 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
             Instalar Ahora
           </button>
        )}
      </div>
    </div>
  );
}
