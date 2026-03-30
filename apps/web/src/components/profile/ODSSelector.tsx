'use client';

import { Leaf, BookOpen, Utensils, Droplets, Scale, Users } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/services/user-api.service';

const ALL_CAUSES = [
  { id: 'CLIMATE', icon: Leaf, label: 'Acción por el Clima', color: 'text-emerald-400', border: 'border-emerald-500/50', activeBg: 'bg-emerald-500/20' },
  { id: 'EDUCATION', icon: BookOpen, label: 'Educación', color: 'text-blue-400', border: 'border-blue-500/50', activeBg: 'bg-blue-500/20' },
  { id: 'HUNGER', icon: Utensils, label: 'Hambre Cero', color: 'text-amber-400', border: 'border-amber-500/50', activeBg: 'bg-amber-500/20' },
  { id: 'OCEANS', icon: Droplets, label: 'Océanos', color: 'text-cyan-400', border: 'border-cyan-500/50', activeBg: 'bg-cyan-500/20' },
  { id: 'PEACE', icon: Scale, label: 'Paz y Justicia', color: 'text-purple-400', border: 'border-purple-500/50', activeBg: 'bg-purple-500/20' },
  { id: 'GENDER', icon: Users, label: 'Igualdad de Género', color: 'text-pink-400', border: 'border-pink-500/50', activeBg: 'bg-pink-500/20' },
];

export function ODSSelector({ userCauses, email }: { userCauses: string[], email: string }) {
  const queryClient = useQueryClient();

  const causesMutation = useMutation({
    mutationFn: (causes: string[]) => userService.updateCauses(email, causes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userProfile'] })
  });

  const toggleCause = (causeId: string) => {
    const newCauses = userCauses.includes(causeId) 
      ? userCauses.filter((c: string) => c !== causeId)
      : [...userCauses, causeId];
    causesMutation.mutate(newCauses);
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-2">Registro Consciente (ODS)</h2>
      <p className="text-neutral-400 mb-6 text-sm">Elige hasta 3 causas sociales para alinear tu perfil ReFi.</p>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_CAUSES.map(cause => {
          const isActive = userCauses.includes(cause.id);
          const Icon = cause.icon;
          return (
            <button
              key={cause.id}
              onClick={() => toggleCause(cause.id)}
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
  );
}
