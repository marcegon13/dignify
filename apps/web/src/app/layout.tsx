import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dignify',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  );
}
