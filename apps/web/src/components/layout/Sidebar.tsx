'use client';

import { Home, Compass, Library, User, PlayCircle, Flame, Heart, Sparkles, Globe } from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useI18n } from '@/providers/I18nProvider';
import { usePlayerStore } from '@/store/playerStore';
import Image from 'next/image';

export default function Sidebar({ isMobileDrawer = false }: { isMobileDrawer?: boolean }) {
  const { data: session } = useSession();
  const setTrack = usePlayerStore((s) => s.setTrack);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { dict, lang } = useI18n();

  const handleLanguageChange = (newLang: string) => {
    // Keep current path but switch locale
    const path = window.location.pathname.replace(`/${lang}`, `/${newLang}`);
    window.location.href = path || `/${newLang}`;
  };

  const navItems = [
    { icon: Home, label: dict.menu.home, href: `/${lang}` },
    { icon: Compass, label: dict.menu.explore, href: `/${lang}/explore` },
    { icon: Library, label: dict.menu.yourLibrary, href: `/${lang}/library` },
    { icon: User, label: dict.menu.profile, href: `/${lang}/profile` },
  ];

  const { data: favorites } = useQuery({
    queryKey: ['favorites', session?.user?.email],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/favorites/${encodeURIComponent(session?.user?.email || '')}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!session?.user?.email,
  });

  const { data: playlists } = useQuery({
    queryKey: ['playlists', session?.user?.email],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/playlists/${encodeURIComponent(session?.user?.email || '')}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!session?.user?.email,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', session?.user?.email],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/users/${encodeURIComponent(session?.user?.email || '')}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    enabled: !!session?.user?.email,
  });

  return (
    <aside className={isMobileDrawer ? "flex flex-col w-full h-full p-2" : "hidden md:flex w-60 shrink-0 bg-transparent h-full overflow-y-auto flex-col backdrop-blur-xl border-r border-white/5 relative z-20"}>
      {!isMobileDrawer && (
        <div className="p-6 pb-2">
          <Link href={`/${lang}`} className="block w-full group mb-12">
            <div className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/5 shadow-2xl group-hover:bg-black/60 transition-all duration-500">
              <Image 
                src="/logo_dignify.JPG" 
                alt="Dignify Official Logo" 
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              />
            </div>
          </Link>

        {session ? (
          <Link href={`/${lang}/profile`} className="flex items-center space-x-3 w-full p-2 bg-neutral-900/50 hover:bg-neutral-800 rounded-xl transition-all border border-transparent hover:border-white/10 group">
             {session.user?.image ? (
               <Image src={session.user.image} alt="User" width={36} height={36} className="w-9 h-9 rounded-full border-2 border-emerald-500/30 group-hover:border-emerald-500/80 object-cover transition-colors" />
             ) : (
               <div className="w-9 h-9 rounded-full border-2 border-emerald-500/30 bg-neutral-800 flex items-center justify-center font-bold text-xs">{session.user?.name?.[0] || 'U'}</div>
             )}
             <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-bold text-white truncate">{session.user?.name}</span>
                <span className="text-[10px] text-emerald-400 font-medium truncate uppercase tracking-widest">Curador ReFi</span>
             </div>
          </Link>
        ) : (
          <button onClick={() => signIn()} className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 shadow-sm flex items-center justify-center">
             <User className="w-4 h-4 mr-2" /> {dict.menu.loginToSave || "Entrar a la Comunidad"}
          </button>
        )}
      </div>
      )}

      <nav className={`flex-1 px-4 space-y-6 overflow-y-auto w-full ${isMobileDrawer ? 'py-2' : 'py-6'}`}>
        {/* Main Navigation */}
        <ul className="space-y-1 w-full">
          {navItems.map((item) => (
            <li key={item.href} className="w-full">
              <Link
                href={item.href}
                className="flex items-center space-x-4 px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group w-full"
              >
                <item.icon className="w-5 h-5 group-hover:text-emerald-400 transition-colors shrink-0" />
                <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* User Library Auth Section */}
        <div className="pt-2 w-full">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-3 mb-3">
            {dict.menu.yourLibrary}
          </h3>
          
          {!session ? (
            <div className="px-3">
              <button 
                onClick={() => signIn()} 
                className="text-xs text-emerald-500 hover:text-emerald-400 font-medium italic text-left w-full hover:underline decoration-emerald-500/30 underline-offset-4 transition-colors p-0"
              >
                {dict.menu.loginToSave}
              </button>
            </div>
          ) : (
            <ul className="space-y-1 w-full">
              {favorites && favorites.length > 0 ? (
                favorites.slice(0, 5).map((f: any) => (
                  <li key={`fav-${f.id}`}>
                    <button 
                      onClick={() => setTrack({
                        id: f.id,
                        title: f.title,
                        artist: f.artist,
                        thumbnailUrl: f.thumbnailUrl,
                        provider: f.sources?.[0]?.provider || 'YOUTUBE'
                      })}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-400 hover:text-white truncate font-medium hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                    >
                      {f.title}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-xs text-neutral-500 italic">{dict.menu.noFavoritesYet}</li>
              )}
            </ul>
          )}
        </div>

        <div className="flex-1 px-5 mt-2">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-3 mb-3 mt-8">
            {dict.menu.yourPlaylists}
          </h3>
          <ul className="space-y-1 w-full mt-2">
            {!session ? (
              <div className="px-3">
                <button 
                  onClick={() => signIn()} 
                  className="text-xs text-emerald-500 hover:text-emerald-400 font-medium italic text-left w-full hover:underline decoration-emerald-500/30 underline-offset-4 transition-colors p-0"
                >
                  {dict.menu.loginToSave}
                </button>
              </div>
            ) : playlists && playlists.length > 0 ? (
              playlists.map((pl: any) => (
                <li key={`pl-${pl.id}`}>
                  <a href="#" className="block px-3 py-2 text-sm text-neutral-400 hover:text-white truncate font-medium hover:bg-neutral-800/40 rounded-lg transition-colors border border-transparent hover:border-neutral-800">
                    {pl.name}
                  </a>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-xs text-neutral-500 italic">
                {dict.menu.noPlaylists}
              </li>
            )}
          </ul>
        </div>

        {/* REFI Button */}
        {session && userProfile && (
          <div className="px-5 mt-6 mb-2">
            <Link href={`/${lang}/refi`} className="flex items-center justify-between w-full py-2.5 px-3 bg-purple-500/10 border border-purple-500/20 rounded-xl group hover:bg-purple-500/20 transition-all shadow-lg shadow-purple-500/5">
              <span className="flex items-center text-purple-400 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 group-hover:animate-pulse" />
                {dict.refi?.myCuration || "REFI"}
              </span>
              <span className="bg-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-purple-500/20">
                {userProfile.curationPoints || 0}
              </span>
            </Link>
          </div>
        )}
      </nav>

      <div className="mt-auto p-5 w-full flex flex-col space-y-3">
        {/* Language Selector */}
        <div className="relative w-full">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center justify-between w-full py-2 px-3 bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white rounded-lg transition-colors text-xs font-semibold uppercase tracking-wider"
          >
            <span className="flex items-center"><Globe className="w-4 h-4 mr-2" /> {lang === 'es' ? 'ES' : lang === 'en' ? 'EN' : 'PT'}</span>
          </button>
          
          {showLangMenu && (
            <div className="absolute bottom-full mb-2 left-0 w-full bg-neutral-900 border border-white/10 rounded-lg shadow-xl overflow-hidden py-1 z-50">
               <button onClick={() => handleLanguageChange('es')} className="w-full text-left px-4 py-2 text-xs font-bold text-neutral-300 hover:bg-neutral-800 hover:text-emerald-400 transition-colors uppercase">🇲🇽 / 🇪🇸 Español</button>
               <button onClick={() => handleLanguageChange('en')} className="w-full text-left px-4 py-2 text-xs font-bold text-neutral-300 hover:bg-neutral-800 hover:text-emerald-400 transition-colors uppercase">🇺🇸 / 🇬🇧 English</button>
               <button onClick={() => handleLanguageChange('pt')} className="w-full text-left px-4 py-2 text-xs font-bold text-neutral-300 hover:bg-neutral-800 hover:text-emerald-400 transition-colors uppercase">🇧🇷 / 🇵🇹 Português</button>
            </div>
          )}
        </div>

        <Link href={`/${lang}/profile/artist`} className="flex items-center justify-center w-full py-3 bg-amber-400/10 text-amber-500 font-bold text-xs uppercase tracking-widest rounded-xl border border-amber-500/20 hover:bg-amber-400/20 transition-all select-none shadow-lg shadow-amber-500/5">
          <Sparkles className="w-3.5 h-3.5 mr-2" />
          {dict.menu.uploadMusic}
        </Link>
      </div>
    </aside>
  );
}
