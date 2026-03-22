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
    <div className="flex flex-col h-full bg-linear-to-b from-neutral-900/50 to-neutral-950/90 overflow-y-auto px-6 py-8 pb-16">
      <div className="flex-1 w-full max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Dignify for Artists</h1>
          <p className="text-neutral-400 mt-2 font-medium text-lg">
            Sube tu música en formato WAV o MP3 (High Fidelity).
          </p>
        </div>

        <form onSubmit={handleSimulatedUpload} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Título del Track</label>
              <input required type="text" className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors" placeholder="Ej. Horizonte Persistente" />
            </div>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-300 mb-1">Artista</label>
                <input required type="text" className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors" placeholder="Tu Nombre de Artista" />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-neutral-300 mb-1">BPM</label>
                <input type="number" className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors" placeholder="120" />
              </div>
            </div>

            <div className="mt-8 border-2 border-dashed border-neutral-700 rounded-2xl p-10 text-center hover:border-amber-400/50 transition-colors group cursor-pointer relative overflow-hidden">
              <input required type="file" accept=".mp3,.wav" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <FileAudio className="w-12 h-12 text-neutral-500 mx-auto mb-4 group-hover:text-amber-400 transition-colors" />
              <p className="text-neutral-300 font-bold">Arrastra tu master aquí</p>
              <p className="text-neutral-500 text-sm mt-1">.WAV, .FLAC o .MP3 hasta 50MB</p>
              <div className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full inline-block mt-4">
                S3 / R2 Storage Ready
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isUploading || isDone}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-xl
              ${isUploading ? 'bg-amber-500/50 cursor-not-allowed' : isDone ? 'bg-emerald-500 text-white' : 'bg-amber-400 hover:bg-amber-300 text-black hover:scale-[1.02]'}`}
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
