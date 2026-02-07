import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authConfig = {
  pages: {
    signIn: "/login",
    //error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;

      const isDashboard =
        nextUrl.pathname.startsWith("/patient") ||
        nextUrl.pathname.startsWith("/doctor") ||
        nextUrl.pathname.startsWith("/admin");

      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      if (isDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      if (isAuthRoute && isLoggedIn) {
        switch (userRole) {
          case "patient":
            return Response.redirect(new URL("/patient/dashboard", nextUrl));
          case "doctor":
            return Response.redirect(new URL("/doctor/dashboard", nextUrl));
          case "admin":
            return Response.redirect(new URL("/admin/dashboard", nextUrl));
          default:
            return Response.redirect(new URL("/", nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        if (token.role) session.user.role = token.role;
        if (token.id) session.user.id = token.id;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return user;
          }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
});
