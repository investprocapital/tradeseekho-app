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
