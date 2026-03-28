'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { User, Award, Music, ShieldCheck, Flame, Leaf, BookOpen, Utensils, Droplets, Scale, Users, Camera } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useState, useRef } from 'react';

import { userService } from "@/lib/services/user-api.service";
import { trackService } from "@/lib/services/track-api.service";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadData, setUploadData] = useState({ title: '', genre: 'ELECTRONIC', cause: 'CLIMATE' });

  // 1. SERVICES USAGE (Hardened Layer)
  const { data: stats } = useQuery({
    queryKey: ['profile-stats', session?.user?.email],
    queryFn: () => userService.getProfileStats(session?.user?.email || ''),
    enabled: !!session?.user?.email,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', session?.user?.email],
    queryFn: () => userService.getUserProfile(session?.user?.email || ''),
    enabled: !!session?.user?.email,
  });

  const influenceScore = userProfile?.curationPoints || 0;
  const isFirstDiscoverer = userProfile?.hasFirstDiscovery || (stats?.discoveries || 0) > 0;
  const userCauses = userProfile?.causes || [];

  const causesMutation = useMutation({
    mutationFn: (causes: string[]) => userService.updateCauses(session?.user?.email || '', causes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userProfile'] })
  });

  const profileMutation = useMutation({
    mutationFn: (data: { name?: string; birthDate?: string; role?: string }) => 
      userService.updateProfile(session?.user?.email || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      alert("¡Perfil actualizado!");
    },
    onError: (err: any) => alert(err.message)
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
    onError: (err: any) => alert("Error de subida: " + err.message)
  });

  const avatarMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsAvatarUploading(true);
      return userService.uploadAvatar(session?.user?.email || '', formData.get('file') as File)
        .finally(() => setIsAvatarUploading(false));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      alert("¡Identidad actualizada!");
    },
    onError: (err: any) => alert(err.message)
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) return alert("Por favor elige un archivo");
    
    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);
    formData.append('title', uploadData.title);
    formData.append('genre', uploadData.genre);
    formData.append('cause', uploadData.cause);
    formData.append('userEmail', session?.user?.email || '');
    
    uploadMutation.mutate(formData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    avatarMutation.mutate(formData);
  };

  const toggleCause = (causeId: string) => {
    const newCauses = userCauses.includes(causeId) 
      ? userCauses.filter((c: string) => c !== causeId)
      : [...userCauses, causeId];
    causesMutation.mutate(newCauses);
  };

  if (status === "loading") {
    return <div className="p-8 text-neutral-400 font-bold animate-pulse">Cargando identidad ReFi...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-linear-to-b from-neutral-900/50 to-neutral-950/90">
        <div className="w-24 h-24 rounded-full bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center mb-8 shadow-2xl border border-white/5">
          <User className="w-10 h-10 text-neutral-500" />
        </div>
        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">El Pasaporte Musical</h2>
        <p className="text-neutral-400 max-w-md mb-8 text-lg">
          Iniciá sesión para empezar a construir tu catálogo, crear playlists e iniciar tu camino como Curador ReFi.
        </p>
        <div className="flex flex-col space-y-3 w-full max-w-xs">
          <button 
            onClick={() => signIn('credentials')}
            className="w-full px-8 py-4 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-xl hover:shadow-emerald-500/20 flex items-center justify-center space-x-2"
          >
            <span>Ingreso Directo (Recomendado)</span>
          </button>
          <button 
            onClick={() => signIn()}
            className="w-full px-8 py-3 bg-white/5 text-white font-medium rounded-2xl hover:bg-white/10 transition-all border border-white/10 text-sm"
          >
            <span>Ver más opciones...</span>
          </button>
        </div>
      </div>
    );
  }

  const discoveries = stats?.discoveries || 0;
  const totalFavorites = stats?.favorites || 0;

  const ALL_CAUSES = [
    { id: 'CLIMATE', icon: Leaf, label: 'Acción por el Clima', color: 'text-emerald-400', border: 'border-emerald-500/50', activeBg: 'bg-emerald-500/20' },
    { id: 'EDUCATION', icon: BookOpen, label: 'Educación', color: 'text-blue-400', border: 'border-blue-500/50', activeBg: 'bg-blue-500/20' },
    { id: 'HUNGER', icon: Utensils, label: 'Hambre Cero', color: 'text-amber-400', border: 'border-amber-500/50', activeBg: 'bg-amber-500/20' },
    { id: 'OCEANS', icon: Droplets, label: 'Océanos', color: 'text-cyan-400', border: 'border-cyan-500/50', activeBg: 'bg-cyan-500/20' },
    { id: 'PEACE', icon: Scale, label: 'Paz y Justicia', color: 'text-purple-400', border: 'border-purple-500/50', activeBg: 'bg-purple-500/20' },
    { id: 'GENDER', icon: Users, label: 'Igualdad de Género', color: 'text-pink-400', border: 'border-pink-500/50', activeBg: 'bg-pink-500/20' },
  ];

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-neutral-900/50 to-neutral-950/90 overflow-y-auto px-8 py-10 pb-32">
      <div className="flex items-center justify-between mb-16 p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center space-x-6">
          <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
             <input 
                type="file" 
                ref={avatarInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/*" 
             />
             <Image 
                src={userProfile?.image || session.user?.image || "/api/placeholder/100/100"} 
                alt="Profile Avatar" 
                width={96}
                height={96}
                className={`w-24 h-24 rounded-full border-4 border-emerald-500 shadow-xl object-cover transition-all ${isAvatarUploading ? 'opacity-30 blur-sm' : 'group-hover:brightness-50'}`}
             />
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white drop-shadow-lg" />
             </div>
             {isAvatarUploading && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-emerald-400 animate-pulse" />
               </div>
             )}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-1 shadow-sm">{userProfile?.name || session.user?.name}</h1>
            <p className="text-neutral-400">{session.user?.email}</p>
          </div>
        </div>
        <button 
          onClick={() => signOut()}
          className="px-4 py-2 border border-red-500/30 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all font-medium text-sm"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Profile Completion Section */}
      <div className="mb-12 p-8 bg-neutral-900/50 border border-white/5 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-6">Datos del Pasaporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Nombre de Usuario (Único)</label>
            <input 
              defaultValue={userProfile?.name || ''} 
              onBlur={(e) => {
                if (e.target.value !== userProfile?.name) {
                  profileMutation.mutate({ name: e.target.value });
                }
              }}
              className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-700"
              placeholder="Ej. artist_rebelde_1"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Fecha de Nacimiento</label>
            <input 
              type="date"
              defaultValue={userProfile?.birthDate ? new Date(userProfile.birthDate).toISOString().split('T')[0] : ''} 
              onBlur={(e) => {
                const date = e.target.value;
                if (date) {
                  profileMutation.mutate({ birthDate: new Date(date).toISOString() });
                }
              }}
              className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* ReFi / Curator Profile Section */}
      <div className="flex items-center space-x-4 mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-cyan-400">
          Perfil de Curador
        </h2>
        
        {isFirstDiscoverer && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full cursor-help relative group" title="Badge ReFi: Otorgado por ser el primero en descubrir y likear pistas en Dignify.">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-500 tracking-wide uppercase">Primer Descubridor</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-neutral-900/80 p-6 rounded-2xl border border-emerald-500/20 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Award className="w-32 h-32 text-emerald-400" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <Award className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Descubrimientos</h3>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{discoveries}</p>
          <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">Joyas encontradas primero</p>
        </div>

        <div className="bg-neutral-900/80 p-6 rounded-2xl border border-neutral-800 shadow-xl relative overflow-hidden group hover:border-neutral-600 transition-colors">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Music className="w-32 h-32 text-neutral-400" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <Music className="w-6 h-6 text-neutral-400" />
            <h3 className="text-lg font-semibold text-white">Favoritos (Catálogo)</h3>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{totalFavorites}</p>
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Tracks guardados</p>
        </div>

        <div className="bg-neutral-900/80 p-6 rounded-2xl border border-orange-500/20 shadow-xl relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Flame className="w-32 h-32 text-orange-400" />
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <Flame className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Impacto / Influencia</h3>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{influenceScore}</p>
          <p className="text-xs text-orange-400 uppercase tracking-wider font-semibold">Puntos ReFi (Proyección)</p>
        </div>
      </div>
      
      {/* ODS Causes Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2">Registro Consciente (ODS)</h2>
        <p className="text-neutral-400 mb-6 text-sm">Elige hasta 3 causas sociales para alinear tu perfil ReFi. Te conectaremos con artistas inspirados en estos propósitos.</p>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_CAUSES.map(cause => {
            const isActive = userCauses.includes(cause.id);
            const Icon = cause.icon;
            return (
              <button
                key={cause.id}
                onClick={() => toggleCause(cause.id)}
                disabled={causesMutation.isPending}
                className={`flex items-center p-4 rounded-2xl border transition-all ${
                  isActive 
                    ? `${cause.activeBg} ${cause.border} ${cause.color} shadow-lg shadow-white/5` 
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-500 hover:border-neutral-600'
                }`}
              >
                <Icon className={`w-6 h-6 mr-3 ${isActive ? cause.color : 'text-neutral-600'}`} />
                <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                  {cause.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Artist Onboarding Section */}
      {userProfile?.role !== 'ARTIST' ? (
        <div className="mb-12 p-10 bg-linear-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-[40px] relative overflow-hidden group">
           <div className="absolute -right-20 -top-20 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <Music className="w-64 h-64 text-emerald-400" />
           </div>
           
           <div className="relative z-10 max-w-xl">
             <h3 className="text-3xl font-black text-white mb-4 leading-tight">
               ¿Eres Artista o Creador?
             </h3>
             <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
               Para cargar álbumes y ver métricas de reproducción en Dignify, necesitas elevar tu Pasaporte al rol de Artista. Esto te permitirá firmar tus obras y recolectar regalías ReFi.
             </p>
             
             <button 
               onClick={() => profileMutation.mutate({ role: 'ARTIST' })}
               disabled={profileMutation.isPending}
               className="px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
             >
               Activar Rol de Artista
               <Flame className="w-5 h-5" />
             </button>
             
             <p className="mt-6 text-xs text-neutral-500 font-bold uppercase tracking-widest italic opacity-50">
               ACCIÓN IRREVOCABLE PARA EL PILOTO BETA 2026
             </p>
           </div>
        </div>
      ) : (
        /* Artist Upload Form - THE STUDIO */
        <div className="mb-12 p-10 bg-neutral-900/80 border border-emerald-500/30 rounded-[40px] relative overflow-hidden group">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                  <Music className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Tu Estudio ReFi</h3>
              </div>
              
              <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Título de la Obra</label>
                    <input 
                      required
                      value={uploadData.title}
                      onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                      className="w-full bg-black/50 border border-neutral-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-700 font-bold"
                      placeholder="Ej. Echoes of the Earth"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Género</label>
                      <select 
                        className="w-full bg-black/50 border border-neutral-800 rounded-2xl px-4 py-4 text-white focus:border-emerald-500 outline-none transition-all font-bold"
                        value={uploadData.genre}
                        onChange={(e) => setUploadData({...uploadData, genre: e.target.value})}
                      >
                        <option value="ELECTRONIC">Electronic</option>
                        <option value="AMBIENT">Ambient</option>
                        <option value="TECHNO">Techno</option>
                        <option value="ACOUSTIC">Acoustic</option>
                        <option value="REGEN">Regen Sound</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Causa ODS</label>
                      <select 
                        className="w-full bg-black/50 border border-neutral-800 rounded-2xl px-4 py-4 text-white focus:border-blue-500 outline-none transition-all font-bold"
                        value={uploadData.cause}
                        onChange={(e) => setUploadData({...uploadData, cause: e.target.value})}
                      >
                        {ALL_CAUSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-800 rounded-3xl hover:border-emerald-500/50 transition-all cursor-pointer group/upload bg-black/20" onClick={() => fileInputRef.current?.click()}>
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="audio/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploadData({...uploadData, title: uploadData.title || file.name.split('.')[0] });
                      }}
                   />
                   <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4 group-hover/upload:bg-emerald-500/20 group-hover/upload:scale-110 transition-all">
                      <Music className="w-8 h-8 text-neutral-500 group-hover/upload:text-emerald-400" />
                   </div>
                   <p className="text-white font-bold text-center">
                     {fileInputRef.current?.files?.[0]?.name || "Selecciona un Archivo de Audio"}
                   </p>
                   <p className="text-neutral-500 text-[10px] mt-2 font-bold uppercase tracking-widest">WAV, MP3, FLAC (Máx 50MB)</p>
                </div>

                <div className="md:col-span-2 flex justify-end">
                   <button 
                     type="submit"
                     disabled={isUploading}
                     className="w-full md:w-auto px-12 py-5 bg-emerald-500 text-black font-black rounded-3xl hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isUploading ? (
                       <>
                         <Flame className="w-5 h-5 animate-spin" />
                         <span>Inyectando Track...</span>
                       </>
                     ) : (
                       <>
                         <span>Publicar Track Oficial</span>
                         <ShieldCheck className="w-5 h-5" />
                       </>
                     )}
                   </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Verify badge */}
      <div className="mt-auto bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 flex flex-col md:flex-row items-center md:space-x-6">
        <ShieldCheck className="w-12 h-12 text-blue-400 mb-4 md:mb-0 shrink-0" />
        <div>
          <h4 className="text-white font-semibold text-lg mb-1">Pasaporte Verificado</h4>
          <p className="text-neutral-400 text-sm">
            Tus descubrimientos quedan estampados en la base de datos inmutable. En la siguiente fase, estas atribuciones se tokenizarán bajo la red de Polygon, pagándote regalías abstractas de influencia por tus aportes curados.
          </p>
        </div>
      </div>
    </div>
  );
}
