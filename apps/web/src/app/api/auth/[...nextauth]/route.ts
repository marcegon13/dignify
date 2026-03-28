import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
// 1. IMPORTA LA INSTANCIA DESDE TU NUEVO ARCHIVO
import { prisma } from "@/lib/prisma"; // Ajusta la ruta según dónde guardaste prisma.ts

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret",

  // 2. USA LA INSTANCIA COMPARTIDA
  adapter: PrismaAdapter(prisma as any),

  providers: [
    CredentialsProvider({
      name: "Modo Desarrollo",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email) return null;

        // 3. AQUÍ YA USAS EL PRISMA QUE VIENE DEL SINGLETON
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };