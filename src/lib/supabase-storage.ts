import { createClient, SupabaseClient } from "@supabase/supabase-js"

/**
 * Supabase Storage Helper
 *
 * Replaces Vercel Blob for image storage. Images are stored in Supabase
 * Storage buckets (free 1GB on Supabase free tier).
 *
 * Buckets:
 *   - "lessons" — lesson images (public)
 *   - "signals" — signal screenshots (public)
 *   - "admin-uploads" — affiliate ad images, banners, etc. (public)
 *
 * Cache-Control header is set to 1 year (31536000s) so images are cached
 * in the user's browser. First load = 1 download, subsequent loads = 0 data.
 *
 * Required env vars:
 *   SUPABASE_URL — e.g., https://fgprwlolfswhqjldgdju.supabase.co
 *   SUPABASE_SERVICE_KEY — service role key (server-side only, never expose)
 */

let client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

export function isSupabaseConfigured(): boolean {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY
}

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL or null if upload fails / not configured.
 *
 * Cache-Control: public, max-age=31536000, immutable
 * (1 year browser cache — image downloaded only once per user)
 */
export async function uploadToSupabase(
  file: File | Buffer,
  bucket: string,
  path: string,
  contentType: string = "image/webp",
): Promise<string | null> {
  const supabase = getClient()
  if (!supabase) return null

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
        upsert: true,
      })

    if (error) {
      console.error("[supabase-storage] upload error:", error.message)
      return null
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  } catch (e: any) {
    console.error("[supabase-storage] error:", e?.message)
    return null
  }
}

/**
 * Delete a file from Supabase Storage by its public URL.
 */
export async function deleteFromSupabase(url: string): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false

  try {
    // Extract path from URL
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
    if (!pathMatch) return false
    const [, bucket, path] = pathMatch

    const { error } = await supabase.storage.from(bucket).remove([path])
    return !error
  } catch {
    return false
  }
}

// Known image buckets — sum sizes across all of these for total image storage.
const KNOWN_BUCKETS = ["lessons", "signals", "admin-uploads"]

/**
 * Get total bytes used across all known Supabase Storage buckets.
 * Lists every file in every bucket (paginated, 1000/page) and sums metadata.size.
 * Returns { used, fileCount, error }.
 */
export async function getSupabaseStorageUsage(): Promise<{
  used: number
  fileCount: number
  error: string | null
}> {
  const supabase = getClient()
  if (!supabase) {
    return { used: 0, fileCount: 0, error: "Supabase not configured" }
  }

  let totalBytes = 0
  let fileCount = 0
  let firstError: string | null = null

  for (const bucket of KNOWN_BUCKETS) {
    try {
      let offset = 0
      const limit = 1000
      // Safety cap: 10,000 files per bucket (avoid infinite loops)
      for (let page = 0; page < 10; page++) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .list("", { limit, offset, sortBy: { column: "name", order: "asc" } })

        if (error) {
          // Bucket doesn't exist or access denied — skip silently
          if (!firstError) firstError = `${bucket}: ${error.message}`
          break
        }

        if (!data || data.length === 0) break

        for (const item of data) {
          // Skip folders (items without metadata.size or with id null)
          const size = (item.metadata as any)?.size
          if (typeof size === "number") {
            totalBytes += size
            fileCount++
          }
        }

        if (data.length < limit) break // last page
        offset += limit
      }
    } catch (e: any) {
      if (!firstError) firstError = `${bucket}: ${e?.message}`
    }
  }

  return { used: totalBytes, fileCount, error: firstError }
}
