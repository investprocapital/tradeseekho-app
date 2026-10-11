import { db } from "@/lib/db"

/**
 * Runtime auto-migration — ensures BEP20 columns exist in the ProSettings table.
 *
 * PROBLEM: On Vercel, `prisma db push` runs in postinstall with `|| true`, which
 * silently swallows migration failures (e.g. if DATABASE_URL isn't available at
 * build time, or Neon is cold-starting). The prisma client is generated with the
 * new schema (expecting bep20Enabled / bep20Address columns), but the Neon DB
 * might not have them yet → every ProSettings query 500s.
 *
 * FIX: Before querying ProSettings, run raw `ALTER TABLE ... ADD COLUMN IF NOT
 * EXISTS` to add the missing columns. This is idempotent and safe to run on
 * every cold start. Memoized so it only executes once per serverless instance.
 */

let migrated = false
let migrating: Promise<void> | null = null

export async function ensureProSettingsSchema() {
  if (migrated) return
  if (migrating) return migrating
  migrating = (async () => {
    try {
      // Postgres: add BEP20 columns if they don't exist
      // SQLite would use different syntax, but production (Vercel) is Postgres.
      // The IF NOT EXISTS clause makes this safe to run repeatedly.
      await db.$executeRawUnsafe(
        `ALTER TABLE "ProSettings" ADD COLUMN IF NOT EXISTS "bep20Enabled" BOOLEAN NOT NULL DEFAULT true`
      )
      await db.$executeRawUnsafe(
        `ALTER TABLE "ProSettings" ADD COLUMN IF NOT EXISTS "bep20Address" TEXT NOT NULL DEFAULT '0xaa889030e6e69ef3eb55a2e94f1226628a8a19c3'`
      )
      migrated = true
    } catch (e) {
      // Don't crash — the query below will fail with a clearer error if columns
      // are truly missing. Log for debugging.
      console.error("[ensureProSettingsSchema] migration failed:", e)
    } finally {
      migrating = null
    }
  })()
  return migrating
}
