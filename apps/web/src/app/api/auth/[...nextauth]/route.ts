import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import SpotifyProvider from 'next-auth/providers/spotify';
import { PrismaAdapter } from '@auth/prisma-adapter';
// En lugar de importar desde `@prisma/client` directamente y sufrir problemas de paths
// Importamos de nuestro package monorepo que ya tiene el cliente generado
import { PrismaClient } from '@dignify/database';

import CredentialsProvider from 'next-auth/providers/credentials';

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Modo Desarrollo (Ingreso Directo)',
      credentials: {
        email: { label: "Tu Email de Prueba", type: "email", placeholder: "artista@dignify.xyz" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        let user = await prisma.user.findUnique({ where: { email: credentials.email } });
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop"
            }
          });
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'ID-simulado',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'Secret-simulado',
    }),
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || 'ID-simulado',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || 'Secret-simulado',
    }),
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as any;
        token.role = u.role || 'USER';
        token.id = u.id;
      }

      // Handle profile updates manually if needed
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
