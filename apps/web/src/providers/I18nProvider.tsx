'use client';

import { createContext, useContext, ReactNode } from 'react';

type Dictionary = typeof import('../dictionaries/es.json');

const I18nContext = createContext<{ dict: Dictionary; lang: string } | null>(null);

export function I18nProvider({ children, dict, lang }: { children: ReactNode; dict: Dictionary; lang: string }) {
  return <I18nContext.Provider value={{ dict, lang }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
