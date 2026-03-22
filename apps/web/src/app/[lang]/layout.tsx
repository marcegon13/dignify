import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { Player } from '@/components/player/Player';
import Sidebar from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { getDictionary } from '@/dictionaries';
import { I18nProvider } from '@/providers/I18nProvider';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import '../globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
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
  title: 'Dignify - El Catálogo ReFi',
  description: 'Descubre y colecciona tracks en la red de curación.',
  manifest: '/manifest.json',
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
    <html lang={lang} className={`${outfit.variable} dark antialiased`}>
      <body className="font-sans bg-black text-white selection:bg-emerald-500/30 h-screen overflow-hidden flex flex-col">
        <ErrorBoundary>
          <I18nProvider dict={dict} lang={lang}>
            <Providers>
              <div className="pointer-events-none fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

              <div className="flex flex-1 overflow-hidden min-h-0 relative z-10 w-full mb-0">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-neutral-950 relative md:border-l border-white/5 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] pt-[calc(7.5rem+env(safe-area-inset-top))] md:pt-0 pb-64 md:pb-8">
                  {props.children}
                </main>
              </div>

              <div className="fixed bottom-0 left-0 right-0 z-[110] md:z-50 w-full shrink-0 px-2 md:px-0 pb-[calc(2.5rem+env(safe-area-inset-bottom))] bg-black/40 backdrop-blur-md">
                <Player />
              </div>

              <div className="fixed top-0 left-0 right-0 z-[120]">
                <MobileHeader />
              </div>
            </Providers>
          </I18nProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}