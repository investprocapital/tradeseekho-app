import { db } from "@/lib/db"
import { encrypt, decrypt } from "@/lib/crypto"
import { withDbRetry } from "@/lib/db-retry"

/**
 * API Keys manager — reads/writes encrypted Vercel Blob + Supabase keys
 * from the ApiKeys table (singleton row).
 *
 * Cache: decrypted keys are cached in memory for 60s (or until saveKeys
 * invalidates). This avoids a DB hit on every image upload.
 *
 * Priority: DB-saved keys > env vars. This lets admin override env vars
 * from the panel without redeploying.
 */

export interface DecryptedKeys {
  vercelBlobToken: string | null
  supabaseUrl: string | null
  supabaseKey: string | null
}

let cached: DecryptedKeys | null = null
let cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

/** Get decrypted keys (DB first, then env fallback). Cached for 60s. */
export async function getDecryptedKeys(): Promise<DecryptedKeys> {
  if (cached && Date.now() - cacheTime < CACHE_TTL) return cached

  try {
    const row = await withDbRetry(() =>
      db.apiKeys.findUnique({ where: { id: "singleton" } }),
    )
    cached = {
      vercelBlobToken: row?.vercelBlobToken ? decrypt(row.vercelBlobToken) : null,
      supabaseUrl: row?.supabaseUrl ?? null,
      supabaseKey: row?.supabaseKey ? decrypt(row.supabaseKey) : null,
    }
  } catch {
    cached = { vercelBlobToken: null, supabaseUrl: null, supabaseKey: null }
  }
  cacheTime = Date.now()
  return cached
}

/** Get the effective Vercel Blob token (DB > env). */
export async function getVercelBlobToken(): Promise<string | null> {
  const keys = await getDecryptedKeys()
  return keys.vercelBlobToken || process.env.BLOB_READ_WRITE_TOKEN || null
}

/** Get the effective Supabase config (DB > env). */
export async function getSupabaseConfig(): Promise<{
  url: string | null
  key: string | null
}> {
  const keys = await getDecryptedKeys()
  return {
    url: keys.supabaseUrl || process.env.SUPABASE_URL || null,
    key: keys.supabaseKey || process.env.SUPABASE_SERVICE_KEY || null,
  }
}

/** Is Vercel Blob configured (DB or env)? */
export async function isBlobConfiguredAsync(): Promise<boolean> {
  return !!(await getVercelBlobToken())
}

/** Is Supabase configured (DB or env)? */
export async function isSupabaseConfiguredAsync(): Promise<boolean> {
  const { url, key } = await getSupabaseConfig()
  return !!url && !!key
}

/** Save keys to DB (encrypts secrets). Invalidates cache. */
export async function saveKeys(data: {
  vercelBlobToken?: string
  supabaseUrl?: string
  supabaseKey?: string
}): Promise<void> {
  const update: {
    vercelBlobToken?: string | null
    supabaseUrl?: string | null
    supabaseKey?: string | null
  } = {}

  if (data.vercelBlobToken !== undefined) {
    update.vercelBlobToken = data.vercelBlobToken
      ? encrypt(data.vercelBlobToken)
      : null
  }
  if (data.supabaseUrl !== undefined) {
    update.supabaseUrl = data.supabaseUrl || null
  }
  if (data.supabaseKey !== undefined) {
    update.supabaseKey = data.supabaseKey ? encrypt(data.supabaseKey) : null
  }

  await withDbRetry(() =>
    db.apiKeys.upsert({
      where: { id: "singleton" },
      update,
      create: { id: "singleton", ...update },
    }),
  )

  // Invalidate cache so next read picks up new keys.
  cached = null
}
