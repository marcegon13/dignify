'use client';

import { useSession, signOut } from "next-auth/react";
import { User, Award, Music, Flame, ShieldCheck } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { userService } from "@/lib/services/user-api.service";

import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { ODSSelector } from "@/components/profile/ODSSelector";
import { ArtistOnboarding } from "@/components/profile/ArtistOnboarding";

export default function ProfilePage() {
  const { data: session, status } = useSession();

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

  if (status === "loading") return <div className="p-8 text-neutral-400 font-bold animate-pulse">Cargando identidad ReFi...</div>;
  if (!session) return <GuestProfile />;

  const influenceScore = userProfile?.curationPoints || 0;
  const isFirstDiscoverer = userProfile?.hasFirstDiscovery || (stats?.discoveries || 0) > 0;
  const discoveries = stats?.discoveries || 0;
  const totalFavorites = stats?.favorites || 0;

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-neutral-900/50 to-neutral-950/90 overflow-y-auto px-8 py-10 pb-32">
      
      <ProfileEditor userProfile={userProfile} session={session} />

      <div className="mt-12 flex items-center space-x-4 mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-cyan-400">Perfil de Curador</h2>
        {isFirstDiscoverer && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-500 uppercase">Primer Descubridor</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard icon={Award} label="Descubrimientos" value={discoveries} color="emerald" />
        <StatCard icon={Music} label="Favoritos (Catálogo)" value={totalFavorites} color="neutral" />
        <StatCard icon={Flame} label="Impacto / Influencia" value={influenceScore} color="orange" />
      </div>

      <ODSSelector userCauses={userProfile?.causes || []} email={session?.user?.email || ''} />

      <ArtistOnboarding userProfile={userProfile} email={session.user?.email || ''} />

      <VerifyBadge />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    emerald: 'border-emerald-500/20 text-emerald-400',
    neutral: 'border-neutral-800 text-neutral-400',
    orange: 'border-orange-500/20 text-orange-400'
  };
  return (
    <div className={`bg-neutral-900/80 p-6 rounded-2xl border ${colors[color]} shadow-lg group hover:border-current transition-colors relative overflow-hidden`}>
      <Icon className="w-6 h-6 mb-4" />
      <p className="text-4xl font-bold text-white mb-2">{value}</p>
      <p className="text-xs uppercase tracking-wider font-semibold">{label}</p>
    </div>
  );
}

function VerifyBadge() {
  return (
    <div className="mt-auto bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 flex items-center space-x-6">
      <ShieldCheck className="w-12 h-12 text-blue-400 shrink-0" />
      <div>
        <h4 className="text-white font-semibold text-lg">Pasaporte Verificado</h4>
        <p className="text-neutral-400 text-sm">Tus descubrimientos quedan estampados en la base de datos inmutable.</p>
      </div>
    </div>
  );
}

function GuestProfile() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-linear-to-b from-neutral-900/50 to-neutral-950/90">
      <User className="w-24 h-24 text-neutral-500 mb-8" />
      <h2 className="text-4xl font-extrabold text-white mb-4">El Pasaporte Musical</h2>
      <p className="text-neutral-400 mb-8 max-w-md">Iniciá sesión para empezar a construir tu catálogo ReFi.</p>
    </div>
  );
}
