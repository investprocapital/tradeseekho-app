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
 *   NEXTAUTH_SECRET        — `openssl rand -base64 32` (REQUIRED in production,
 *                            otherwise NextAuth throws "Server error" on signin)
 *   NEXTAUTH_URL           — https://tradeseekho-app.vercel.app
 *   GOOGLE_CLIENT_ID       — Google Cloud Console → OAuth client (Web) [optional]
 *   GOOGLE_CLIENT_SECRET   — the matching secret [optional]
 *
 * Anonymous learners (not signed in) fall back to the shared "local-learner"
 * user id, so the public demo still works without auth.
 */

// Only register the Google provider when real credentials are present — avoids
// NextAuth config errors ("missing secret" / "Server error") when Google OAuth
// hasn't been set up yet.
const providers: NextAuthOptions["providers"] = [
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

      // AUTO-PROVISION ADMIN USER: if ADMIN_EMAIL + ADMIN_PASSWORD_USER env vars
      // are set and match the credentials being submitted, but the user doesn't
      // exist yet in the DB (e.g. fresh Neon database), create it on the fly as
      // role=admin. This avoids needing to run a seed script against production.
      const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase()
      const adminPassword = process.env.ADMIN_PASSWORD_USER || ""
      if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
        const existing = await db.user.findUnique({ where: { email } })
        if (!existing) {
          const created = await db.user.create({
            data: { email, name: "Admin", role: "admin", password: await bcrypt.hash(password, 10) },
          })
          return { id: created.id, email: created.email ?? undefined, name: created.name ?? undefined, image: created.image ?? undefined }
        }
      }

      const user = await db.user.findUnique({ where: { email } })
      if (!user?.password) return null
      const ok = await bcrypt.compare(password, user.password)
      if (!ok) return null
      return { id: user.id, email: user.email ?? undefined, name: user.name ?? undefined, image: user.image ?? undefined }
    },
  }),
]
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  )
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // Fall back to a dev secret so local dev never throws "no secret". In
  // production ALWAYS set NEXTAUTH_SECRET on Vercel.
  secret: process.env.NEXTAUTH_SECRET || "tradeseekho-dev-secret-not-for-production",
  // We use a login DIALOG on "/" (no separate sign-in page route).
  pages: { signIn: "/" },
  providers,
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
