import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dignify',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} text-white antialiased selection:bg-gold-text/30 min-h-screen relative bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-[#001A4D] via-[#050505] to-[#050505]`}>
        {/* WAVE WATERMARK: Environmental branding background logo with subtle cobalt tint */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none overflow-hidden opacity-[0.08] blur-[120px] scale-[2] mix-blend-screen">
          <Image 
            src="/logo_dignify.png" 
            alt="Dignify Environmental Watermark" 
            width={1000} 
            height={1000} 
            priority
            className="sepia hue-rotate-180 saturate-200 brightness-[0.4]"
          />
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
