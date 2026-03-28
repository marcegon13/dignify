'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, Library, Plus, Languages, LogIn, LogOut, Settings, User, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AnimatedLogo } from '../shared/AnimatedLogo';
import Image from 'next/image';

interface SidebarProps {
  lang: string;
  dict: any;
  isMobileDrawer?: boolean;
}

const SidebarNav = ({ lang, currentPath }: { lang: string; currentPath: string }) => {
  const items = [
    { name: 'Home', href: `/${lang}`, icon: Home },
    { name: 'Explore', href: `/${lang}/explore`, icon: Compass },
    { name: 'Profile', href: `/${lang}/profile`, icon: User },
  ];

  // Si hay sesión, inyectamos el perfil en el menú principal para visibilidad total
  // const { data: session } = useSession(); // Necesito pasarlo por props o usar hook dentro del componente
  
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive = currentPath === item.href;
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-500 font-bold border-r-2 border-emerald-500' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`} />
              <span className="text-sm tracking-wide">{item.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

const LibraryNav = ({ lang, currentPath }: { lang: string; currentPath: string }) => {
  const items = [
    { name: 'Your Library', href: `/${lang}/library`, icon: Library },
  ];

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive = currentPath === item.href;
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-500 font-bold border-r-2 border-emerald-500' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`} />
              <span className="text-sm tracking-wide">{item.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

const UserMenu = ({ lang, session }: { lang: string; session: any }) => {
  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-white/10 active:scale-95"
      >
        <LogIn className="w-4 h-4" />
        <span className="text-sm">Log in to save.</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Link 
        href={`/${lang}/profile`}
        className="flex items-center gap-3 w-full p-2 bg-neutral-900/50 hover:bg-neutral-800 rounded-xl transition-all border border-transparent hover:border-emerald-500/30 group cursor-pointer"
      >
        {session.user?.image ? (
          <Image src={session.user.image} alt="User" width={36} height={36} className="w-9 h-9 rounded-full border-2 border-emerald-500/30 group-hover:border-emerald-500/80 object-cover transition-colors" />
        ) : (
          <div className="w-9 h-9 rounded-full border-2 border-emerald-500/30 bg-neutral-800 flex items-center justify-center font-bold text-xs">{session.user?.name?.[0] || 'U'}</div>
        )}
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{session.user?.name}</p>
          <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Ver Perfil</p>
        </div>
      </Link>
      
      <button 
        onClick={() => signOut()}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-neutral-600 hover:text-red-400 hover:bg-red-400/5 transition-all text-[10px] font-bold uppercase tracking-widest"
      >
        <LogOut className="w-3 h-3" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
};

export default function Sidebar({ lang, dict, isMobileDrawer }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className={isMobileDrawer ? "flex flex-col w-full h-full p-2" : "hidden md:flex fixed top-0 w-60 bg-transparent h-screen overflow-y-auto flex-col backdrop-blur-xl border-r border-white/5 z-20 pb-32 no-scrollbar"}>
      {!isMobileDrawer && (
        <div className="p-6 pb-2">
          <Link href={`/${lang}`} className="block w-full group mb-12">
            <AnimatedLogo className="w-full h-full" />
          </Link>
        </div>
      )}

      {/* Contenido principal del Sidebar */}
      <div className="flex-1 px-4">
        <nav className="space-y-1">
          <SidebarNav lang={lang} currentPath={pathname} />
          <div className="pt-8 mb-4 px-2">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {dict?.menu?.yourLibrary || 'Your Library'}
            </h2>
          </div>
          <LibraryNav lang={lang} currentPath={pathname} />
          
          <div className="pt-8 space-y-4">
            {session && (
              <Link
                href={`/${lang}/upload`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all group shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                <span className="text-sm font-bold uppercase tracking-tight">{dict?.menu?.uploadMusic || 'Upload'}</span>
              </Link>
            )}
            
            <div className="flex items-center justify-between px-2 pt-4">
              <div className="flex items-center gap-2 text-neutral-400 text-[10px] uppercase font-bold tracking-tighter">
                <Languages className="w-3 h-3" />
                <span>{lang === 'es' ? 'Español' : 'English'}</span>
              </div>
              <div className="flex gap-1.5">
                <Link 
                  href={pathname ? pathname.replace(`/${lang}`, '/es') : '/es'}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all transform hover:scale-110 ${lang === 'es' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-neutral-500 hover:text-white hover:bg-white/10'}`}
                >
                  ES
                </Link>
                <Link 
                  href={pathname ? pathname.replace(`/${lang}`, '/en') : '/en'}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all transform hover:scale-110 ${lang === 'en' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-neutral-500 hover:text-white hover:bg-white/10'}`}
                >
                  EN
                </Link>
              </div>
            </div>

            <div className="flex gap-4 px-2 mt-6 text-[9px] font-medium text-neutral-600 uppercase tracking-widest border-t border-white/5 pt-4">
              <Link href={`/${lang}/privacy`} className="hover:text-emerald-500 transition-colors">Privacidad</Link>
              <Link href={`/${lang}/terms`} className="hover:text-emerald-500 transition-colors">Términos</Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Menú de Usuario (Perfil/Login) al fondo - Visible en PC y Móvil */}
      <div className="p-4 border-t border-white/5 bg-black/40 mt-auto">
        <UserMenu lang={lang} session={session} />
      </div>
    </aside>
  );
}
