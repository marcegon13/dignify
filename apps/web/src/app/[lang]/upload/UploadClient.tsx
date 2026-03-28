'use client';

import { useState } from 'react';
import { UploadCloud, Sparkles, FileAudio, CheckCircle } from 'lucide-react';


export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    // Simular subida a S3 / R2
    setTimeout(() => {
      setIsUploading(false);
      setIsDone(true);
    }, 2500);
  };

  return (
    <div className="flex flex-col bg-linear-to-b from-neutral-900/50 to-neutral-950/90 px-6 py-4 pb-48">
      <div className="flex-1 w-full max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-amber-500/10 rounded-full mb-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dignify for Artists</h1>
          <p className="text-neutral-400 mt-1 font-medium text-sm">
            Formatos WAV o MP3 (High Fidelity).
          </p>
        </div>

        <form onSubmit={handleSimulatedUpload} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-wider">Título del Track</label>
              <input required type="text" className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors text-sm" placeholder="Ej. Horizonte Persistente" />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-wider">Artista</label>
              <input required type="text" className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors text-sm" placeholder="Tu Nombre" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-wider">BPM</label>
              <input type="number" className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors text-sm" placeholder="120" />
            </div>
          </div>

          <div className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center hover:border-amber-400/50 transition-colors group cursor-pointer relative overflow-hidden bg-black/20">
            <input required type="file" accept=".mp3,.wav" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <FileAudio className="w-8 h-8 text-neutral-500 mx-auto mb-2 group-hover:text-amber-400 transition-colors" />
            <p className="text-neutral-300 font-bold text-sm">Arrastra tu master aquí</p>
            <p className="text-neutral-500 text-[10px] mt-1">.WAV, .FLAC o .MP3 hasta 50MB</p>
          </div>

          <button 
            type="submit" 
            disabled={isUploading || isDone}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all shadow-xl text-sm
              ${isUploading ? 'bg-amber-500/50 cursor-not-allowed' : isDone ? 'bg-emerald-500 text-white' : 'bg-amber-400 hover:bg-amber-300 text-black hover:scale-[1.01]'}`}
          >
            {isUploading ? (
              <span className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 animate-bounce" />
                <span>Enviando al Storage...</span>
              </span>
            ) : isDone ? (
               <span className="flex items-center space-x-2">
                 <CheckCircle className="w-5 h-5" />
                 <span>¡Track Subido Oficialmente!</span>
               </span>
            ) : (
              'Subir Track'
            )}
          </button>
        </form>

        <div className="mt-8 text-center px-8">
          <p className="text-neutral-500 text-xs">
            Al subir audio directo ("DIGNIFY Provider"), habilitás a tus usuarios el procesamiento de DSP y EQs directos (Web Audio API) gracias al bypass nativo de CORS.
          </p>
        </div>
      </div>
    </div>
  );
}
