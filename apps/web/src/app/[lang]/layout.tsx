import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { Player } from '@/components/player/Player';
import Sidebar from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { getDictionary } from '@/dictionaries';
import { I18nProvider } from '@/providers/I18nProvider';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { InstallPrompt } from '@/components/shared/InstallPrompt';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dignify.lanubecomputacion.com'),
  title: 'Dignify - El Catálogo ReFi',
  description: 'Descubre y colecciona tracks en la red de curación.',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/logo_dignify.png',
  },
  openGraph: {
    title: 'Dignify - El Catálogo ReFi',
    description: 'Descubre y colecciona tracks en la red de curación.',
    images: [
      {
        url: '/logo_dignify.png',
        width: 1200,
        height: 630,
        alt: 'Dignify Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dignify - El Catálogo ReFi',
    description: 'Descubre y colecciona tracks en la red de curación.',
    images: ['/logo_dignify.png'],
  },
};

export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }, { lang: 'pt' }];
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as 'en' | 'es' | 'pt') || await getDictionary('es');

  if (!dict) return null;

  return (
    <div className={`${inter.variable} font-sans dark flex flex-col min-h-screen`}>
      <ErrorBoundary>
        <I18nProvider dict={dict} lang={lang}>
          <Providers>
            <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>

            {/* Contenedor Principal con Scroll Global */}
            <div className="flex w-full mb-0 relative">
              {/* Sidebar Fijo a la izquierda en Desktop */}
              <div className="hidden md:block w-60 shrink-0">
                <Sidebar lang={lang} dict={dict} />
              </div>
              
              {/* Contenido que fluye con el scroll de la página */}
              <main className="flex-1 bg-neutral-950 relative md:border-l border-white/5 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] pt-[calc(7.5rem+env(safe-area-inset-top))] md:pt-0 pb-64 md:pb-32 w-full min-h-screen">
                {props.children}
              </main>
            </div>

            <Player />
            <InstallPrompt />

            <div className="fixed top-0 left-0 right-0 z-header">
              <MobileHeader />
            </div>
          </Providers>
        </I18nProvider>
      </ErrorBoundary>
    </div>
  );
}