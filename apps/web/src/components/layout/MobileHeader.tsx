'use client';

import { useState } from 'react';
import { Menu, X, Globe, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/providers/I18nProvider';
import Sidebar from './Sidebar';
import { AnimatedLogo } from '../shared/AnimatedLogo';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, dict } = useI18n();

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 pt-[env(safe-area-inset-top)] bg-black/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-header">
        <Link href={`/${lang}`} className="flex items-center py-4">
            <AnimatedLogo className="h-14 w-44" />
        </Link>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 -mr-2 text-white hover:bg-white/5 rounded-xl transition-colors active:scale-95"
          aria-label="Menu"
        >
          {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8 font-black" />}
        </button>
      </header>

      {/* OVERLAY / DRAWER */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[115] animate-in fade-in duration-300">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
           
           {/* Sidebar drawer content */}
           <div className="absolute top-0 right-0 w-4/5 max-w-[300px] h-full bg-neutral-950 border-l border-white/10 animate-in slide-in-from-right duration-500 overflow-y-auto pt-24 flex flex-col uppercase tracking-tighter">
              <div className="flex-1 flex flex-col h-full overflow-y-auto" onClick={() => setIsOpen(false)}>
                  <Sidebar isMobileDrawer={true} lang={lang} dict={dict} />
              </div>
           </div>
        </div>
      )}
    </>
  );
}
