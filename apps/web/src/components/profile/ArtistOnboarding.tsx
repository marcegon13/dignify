'use client';

import { useState, useRef } from 'react';
import { Music, Flame, ShieldCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/services/user-api.service';
import { trackService } from '@/lib/services/track-api.service';

interface ArtistOnboardingProps {
  userProfile: any;
  email: string;
}

export function ArtistOnboarding({ userProfile, email }: ArtistOnboardingProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', genre: 'ELECTRONIC', cause: 'CLIMATE' });

  const profileMutation = useMutation({
    mutationFn: (data: { role: string }) => userService.updateProfile(email, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      alert("¡Rol de artista activado!");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      return trackService.uploadTrack(formData).finally(() => setIsUploading(false));
    },
    onSuccess: () => {
      alert("¡Track subido con éxito!");
      setUploadData({ title: '', genre: 'ELECTRONIC', cause: 'CLIMATE' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) return alert("Elige un archivo");
    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);
    formData.append('title', uploadData.title);
    formData.append('genre', uploadData.genre);
    formData.append('cause', uploadData.cause);
    formData.append('userEmail', email);
    uploadMutation.mutate(formData);
  };

  if (userProfile?.role !== 'ARTIST') {
    return (
      <div className="mb-12 p-10 bg-linear-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-[40px] relative overflow-hidden group">
         <div className="absolute -right-20 -top-20 opacity-10"><Music className="w-64 h-64 text-emerald-400" /></div>
         <div className="relative z-10 max-w-xl">
           <h3 className="text-3xl font-black text-white mb-4">¿Eres Artista o Creador?</h3>
           <p className="text-neutral-400 mb-8">Eleva tu Pasaporte al rol de Artista para cargar álbumes y recolectar regalías ReFi.</p>
           <button onClick={() => profileMutation.mutate({ role: 'ARTIST' })} className="px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all flex items-center gap-2">
             Activar Rol de Artista <Flame className="w-5 h-5" />
           </button>
         </div>
      </div>
    );
  }

  return (
    <div className="mb-12 p-10 bg-neutral-900/80 border border-emerald-500/30 rounded-[40px]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/20 rounded-2xl"><Music className="w-8 h-8 text-emerald-400" /></div>
        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Tu Estudio ReFi</h3>
      </div>
      
      <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <input required value={uploadData.title} onChange={(e) => setUploadData({...uploadData, title: e.target.value})} className="w-full bg-black/50 border border-neutral-800 rounded-2xl px-6 py-4 text-white" placeholder="Título de la Obra" />
          <div className="grid grid-cols-2 gap-4">
            <select className="w-full bg-black/50 border border-neutral-800 rounded-2xl px-4 py-4 text-white" value={uploadData.genre} onChange={(e) => setUploadData({...uploadData, genre: e.target.value})}>
              <option value="ELECTRONIC">Electronic</option>
              {/* ... otros géneros */}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-800 rounded-3xl cursor-pointer bg-black/20" onClick={() => fileInputRef.current?.click()}>
           <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={(e) => setUploadData({...uploadData, title: uploadData.title || e.target.files?.[0]?.name.split('.')[0] || ''})} />
           <p className="text-white font-bold">{fileInputRef.current?.files?.[0]?.name || "Selecciona un Archivo de Audio"}</p>
        </div>

        <button type="submit" disabled={isUploading} className="md:col-span-2 px-12 py-5 bg-emerald-500 text-black font-black rounded-3xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3">
          {isUploading ? "Inyectando Track..." : "Publicar Track Oficial"} <ShieldCheck className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
