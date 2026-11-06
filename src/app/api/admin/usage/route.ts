import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // 1 hour cache

/**
 * GET /api/admin/usage — returns storage usage for Vercel Blob + Supabase DB.
 *
 * Vercel Blob: Uses Vercel Blob List API to sum all file sizes.
 * Supabase DB: Uses pg_database_size() SQL query.
 *
 * Cached for 1 hour (revalidate=3600) to avoid slow loading.
 * Admin only — normal users get 401.
 */

// Vercel Blob limits (free tier)
const BLOB_LIMIT_BYTES = 1 * 1024 * 1024 * 1024 // 1 GB
// Supabase limits (free tier)
const DB_LIMIT_BYTES = 500 * 1024 * 1024 // 500 MB

export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  // ─── 1. Vercel Blob Usage ───
  let blobUsed = 0
  let blobError: string | null = null

  try {
    // Use Vercel Blob list API to get all files + sum sizes
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
    if (blobToken) {
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

        if (!res.ok) {
          // Fallback: try the store ID approach
          break
        }

        const data = await res.json()
        const blobs = data.blobs || data || []
        for (const blob of blobs) {
          blobUsed += blob.size || 0
        }
        hasMore = data.hasMore || data.pagination?.hasMore || false
        cursor = data.cursor || data.pagination?.cursor || undefined
        if (!hasMore) break
      }
    }
  } catch (e: any) {
    blobError = e?.message || "Failed to fetch Blob usage"
    console.error("[admin/usage] Blob error:", e?.message)
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

  // ─── Build response ───
  const blobPct = Math.round((blobUsed / BLOB_LIMIT_BYTES) * 100)
  const dbPct = Math.round((dbUsed / DB_LIMIT_BYTES) * 100)

  const response = NextResponse.json({
    vercelBlob: {
      used: blobUsed,
      limit: BLOB_LIMIT_BYTES,
      percentage: blobPct,
      error: blobError,
    },
    supabaseDB: {
      used: dbUsed,
      limit: DB_LIMIT_BYTES,
      percentage: dbPct,
      error: dbError,
    },
    // Supabase Storage (file storage) — not used (images on Vercel Blob)
    supabaseStorage: {
      used: 0,
      limit: 1 * 1024 * 1024 * 1024, // 1 GB
      percentage: 0,
    },
    cachedAt: new Date().toISOString(),
  })

  // Cache for 1 hour at edge
  response.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200")
  return response
}
