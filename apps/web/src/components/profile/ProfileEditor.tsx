'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera, Flame } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/services/user-api.service';

interface ProfileEditorProps {
  userProfile: any;
  session: any;
}

export function ProfileEditor({ userProfile, session }: ProfileEditorProps) {
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      return userService.uploadAvatar(session?.user?.email || '', file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      alert("¡Identidad actualizada!");
    },
  });

  const profileMutation = useMutation({
    mutationFn: (data: { name?: string; birthDate?: string }) => 
      userService.updateProfile(session?.user?.email || '', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center space-x-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
           <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
           <Image 
              src={userProfile?.image || session.user?.image || "https://dignify.lanubecomputacion.com/logo-square.png"} 
              alt="Avatar" width={96} height={96}
              className={`w-24 h-24 rounded-full border-4 border-emerald-500 shadow-xl object-cover transition-all ${avatarMutation.isPending ? 'opacity-30 blur-sm' : 'group-hover:brightness-50'}`}
           />
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
           </div>
           {avatarMutation.isPending && (
             <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="w-6 h-6 text-emerald-400 animate-pulse" />
             </div>
           )}
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">{userProfile?.name || session.user?.name}</h1>
          <p className="text-neutral-400">{session.user?.email}</p>
        </div>
      </div>

      <div className="p-8 bg-neutral-900/50 border border-white/5 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-6">Datos del Pasaporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Nombre de Usuario</label>
            <input 
              defaultValue={userProfile?.name || ''} 
              onBlur={(e) => e.target.value !== userProfile?.name && profileMutation.mutate({ name: e.target.value })}
              className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Fecha de Nacimiento</label>
            <input 
              type="date"
              defaultValue={userProfile?.birthDate ? new Date(userProfile.birthDate).toISOString().split('T')[0] : ''} 
              onBlur={(e) => profileMutation.mutate({ birthDate: new Date(e.target.value).toISOString() })}
              className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
