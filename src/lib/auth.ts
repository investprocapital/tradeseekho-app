import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { db } from "./db"

/**
 * NextAuth config: Google OAuth + Email/Password (Credentials).
 *
 * Env vars required on Vercel:
 *   NEXTAUTH_SECRET        — `openssl rand -base64 32`
 *   NEXTAUTH_URL           — https://tradeseekho-app.vercel.app
 *   GOOGLE_CLIENT_ID       — Google Cloud Console → OAuth client (Web)
 *   GOOGLE_CLIENT_SECRET   — the matching secret
 *
 * Anonymous learners (not signed in) fall back to the shared "local-learner"
 * user id, so the public demo still works without auth.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // We use a login DIALOG on "/" (no separate sign-in page route).
  pages: { signIn: "/" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const password = credentials?.password ?? ""
        if (!email || !password) return null
        const user = await db.user.findUnique({ where: { email } })
        if (!user?.password) return null
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return null
        return { id: user.id, email: user.email ?? undefined, name: user.name ?? undefined, image: user.image ?? undefined }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google: ensure a User row exists (create on first sign-in).
      if (account?.provider === "google" && user.email) {
        const exists = await db.user.findUnique({ where: { email: user.email } })
        if (!exists) {
          await db.user.create({
            data: {
              email: user.email,
              name: user.name ?? null,
              image: (user as { image?: string }).image ?? null,
            },
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      // On first sign-in, resolve the DB user id + image + role by email (works for Google + Credentials).
      if (user?.email) {
        const dbUser = await db.user.findUnique({ where: { email: user.email } })
        if (dbUser) {
          token.uid = dbUser.id
          token.image = dbUser.image
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { id?: string }).id = token.uid as string
        ;(session.user as { image?: string | null }).image = (token.image as string | null) ?? null
        ;(session.user as { role?: string }).role = (token.role as string) ?? "student"
      }
      return session
    },
  },
}

/** Resolve the acting user id: NextAuth session user, or the shared "local-learner" demo. */
export async function getCurrentUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  const id = (session?.user as { id?: string } | undefined)?.id
  return id && id.length > 0 ? id : "local-learner"
}

/** Hash a password with bcrypt (10 rounds). */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}
