import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-mail e senha são obrigatórios.");
        }

        const emailLower = credentials.email.toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email: emailLower }
        });

        if (!user) {
          throw new Error("Nenhum usuário encontrado com este e-mail.");
        }

        const isValidPassword = user.password 
          ? await bcrypt.compare(credentials.password, user.password)
          : false;

        if (!isValidPassword) {
          if (!user.password) {
            throw new Error("Esta conta usa login com o Google. Por favor, entre usando o botão do Google.");
          }
          throw new Error("Senha incorreta.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isPremium: user.isPremium,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.isPremium = (user as any).isPremium;
        token.role = (user as any).role;
      }
      
      // Allow dynamic token updates (e.g. after subscribing to Premium)
      if (trigger === "update" && session) {
        token.isPremium = session.isPremium;
        if (session.name) token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isPremium = token.isPremium;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
