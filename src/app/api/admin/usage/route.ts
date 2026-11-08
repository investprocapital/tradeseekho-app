import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { getSupabaseStorageUsage, isSupabaseConfigured } from "@/lib/supabase-storage"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // 1 hour cache

/**
 * GET /api/admin/usage — returns storage usage for Supabase Storage (images) + Supabase DB + Vercel Blob.
 *
 * Supabase Storage: Lists all files in known buckets + sums sizes (PRIMARY image storage).
 * Supabase DB: Uses pg_database_size() SQL query.
 * Vercel Blob: Only fetched if BLOB token configured (fallback image storage).
 *
 * Cached for 1 hour (revalidate=3600) to avoid slow loading.
 * Admin only — normal users get 401.
 */

// Supabase Storage limits (free tier — 1 GB total across all buckets)
const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024 // 1 GB
// Supabase DB limits (free tier — 500 MB)
const DB_LIMIT_BYTES = 500 * 1024 * 1024 // 500 MB
// Vercel Blob limits (free tier — 1 GB, only if configured)
const BLOB_LIMIT_BYTES = 1 * 1024 * 1024 * 1024 // 1 GB

export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  // ─── 1. Supabase Storage Usage (PRIMARY image storage) ───
  // Images (lessons, signals, admin-uploads) are stored here. This is the
  // real image storage the admin needs to monitor.
  let storageUsed = 0
  let storageFileCount = 0
  let storageError: string | null = null
  try {
    const usage = await getSupabaseStorageUsage()
    storageUsed = usage.used
    storageFileCount = usage.fileCount
    storageError = usage.error
  } catch (e: any) {
    storageError = e?.message || "Failed to fetch Supabase Storage usage"
    console.error("[admin/usage] Supabase Storage error:", e?.message)
  }

  // ─── 2. Supabase DB Usage ───
  let dbUsed = 0
  let dbError: string | null = null

  try {
    // Query pg_database_size for the current database
    const result = await db.$queryRaw`SELECT pg_database_size(current_database()) as size`
    dbUsed = Number((result[0] as any)?.size) || 0
  } catch (e: any) {
    dbError = e?.message || "Failed to fetch DB size"
    console.error("[admin/usage] DB error:", e?.message)
    // Fallback: estimate from table row counts
    try {
      const counts = await db.$queryRaw`
        SELECT
          (SELECT COUNT(*) FROM "User") as users,
          (SELECT COUNT(*) FROM "Lesson") as lessons,
          (SELECT COUNT(*) FROM "Signal") as signals,
          (SELECT COUNT(*) FROM "ProRequest") as proRequests,
          (SELECT COUNT(*) FROM "Progress") as progress,
          (SELECT COUNT(*) FROM "PriceAlert") as alerts,
          (SELECT COUNT(*) FROM "Comment") as comments,
          (SELECT COUNT(*) FROM "Notification") as notifications,
          (SELECT COUNT(*) FROM "Promotion") as banners,
          (SELECT COUNT(*) FROM "DeletedAccount") as deleted
      `
      const c = counts[0] as any
      // Rough estimate: 2KB per user, 5KB per lesson, 1KB per signal, etc.
      dbUsed = (Number(c?.users) || 0) * 2048
              + (Number(c?.lessons) || 0) * 5120
              + (Number(c?.signals) || 0) * 1024
              + (Number(c?.proRequests) || 0) * 1024
              + (Number(c?.progress) || 0) * 512
              + (Number(c?.alerts) || 0) * 256
              + (Number(c?.comments) || 0) * 512
              + (Number(c?.notifications) || 0) * 256
              + 1024 * 1024 // 1MB base overhead
    } catch {
      dbUsed = 0
    }
  }

  // ─── 3. Vercel Blob Usage (fallback image storage — only if configured) ───
  let blobUsed = 0
  let blobError: string | null = null
  const blobConfigured = !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)

  if (blobConfigured) {
    try {
      let cursor: string | undefined = undefined
      let hasMore = true
      while (hasMore) {
        const url = new URL("https://blob.vercel-storage.com/api/files")
        url.searchParams.set("limit", "1000")
        if (cursor) url.searchParams.set("cursor", cursor)

        const res = await fetch(url.toString(), {
          headers: {
            "Authorization": `Bearer ${process.env.BLOB_READ_WRITE_TOKEN || ""}`,
            "x-api-version": "6",
          },
        })

        if (!res.ok) break

        const data = await res.json()
        const blobs = data.blobs || data || []
        for (const blob of blobs) {
          blobUsed += blob.size || 0
        }
        hasMore = data.hasMore || data.pagination?.hasMore || false
        cursor = data.cursor || data.pagination?.cursor || undefined
        if (!hasMore) break
      }
    } catch (e: any) {
      blobError = e?.message || "Failed to fetch Blob usage"
      console.error("[admin/usage] Blob error:", e?.message)
    }
  }

  // ─── Build response ───
  const storagePct = Math.round((storageUsed / STORAGE_LIMIT_BYTES) * 100)
  const blobPct = blobConfigured ? Math.round((blobUsed / BLOB_LIMIT_BYTES) * 100) : 0
  const dbPct = Math.round((dbUsed / DB_LIMIT_BYTES) * 100)

  const response = NextResponse.json({
    // PRIMARY image storage — Supabase Storage (where lessons/signals/admin images live)
    supabaseStorage: {
      used: storageUsed,
      limit: STORAGE_LIMIT_BYTES,
      percentage: storagePct,
      fileCount: storageFileCount,
      error: storageError,
      configured: isSupabaseConfigured(),
    },
    // Postgres DB size (tables, rows)
    supabaseDB: {
      used: dbUsed,
      limit: DB_LIMIT_BYTES,
      percentage: dbPct,
      error: dbError,
    },
    // Vercel Blob (fallback — only present if BLOB token configured)
    vercelBlob: {
      used: blobUsed,
      limit: BLOB_LIMIT_BYTES,
      percentage: blobPct,
      error: blobError,
      configured: blobConfigured,
    },
    cachedAt: new Date().toISOString(),
  })

  // Cache for 1 hour at edge
  response.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200")
  return response
}
