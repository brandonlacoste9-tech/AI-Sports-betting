import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.string().optional(),
});

/** Session length: 30d with remember me, else 24h */
const SESSION_MAX_REMEMBER = 30 * 24 * 60 * 60;
const SESSION_MAX_DEFAULT = 24 * 60 * 60;

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      remember: { label: "Remember me", type: "text" },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });

      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!valid) return null;

      const remember =
        parsed.data.remember === "true" || parsed.data.remember === "on";

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        plan: user.plan,
        remember,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.remember = Boolean(user.remember);
        // Load role/plan from DB for OAuth users
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id! },
          select: { role: true, plan: true },
        });
        token.role = dbUser?.role ?? "USER";
        token.plan = dbUser?.plan ?? "FREE";

        // Enforce shorter JWT life when Remember me is off
        const maxAge = token.remember ? SESSION_MAX_REMEMBER : SESSION_MAX_DEFAULT;
        token.exp = Math.floor(Date.now() / 1000) + maxAge;
      }

      if (trigger === "update" && session) {
        if (session.plan) token.plan = session.plan;
        if (session.role) token.role = session.role;
      }

      // Refresh plan periodically from DB
      if (token.id && !user) {
        // Drop expired short sessions even if cookie still present
        if (
          !token.remember &&
          typeof token.exp === "number" &&
          token.exp < Math.floor(Date.now() / 1000)
        ) {
          return {} as typeof token;
        }

        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, plan: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.plan = dbUser.plan;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
        session.user.plan = (token.plan as "FREE" | "BASIC" | "PRO") ?? "FREE";
      }
      return session;
    },
  },
});
