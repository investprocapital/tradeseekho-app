/**
 * Image upload helper — moves images OUT of the Neon database.
 *
 * PROBLEM: Storing base64 image data URLs directly in Neon (Signal.screenshot,
 * Comment.image, ProRequest.screenshotPath) bloats the DB — Neon free tier has
 * a 0.5 GB limit. A single chart screenshot can be 100-300KB of base64 text.
 *
 * SOLUTION: Upload images to Vercel Blob (CDN-backed object storage) and store
 * only the CDN URL in Neon. This keeps Neon rows tiny (just a URL string ~80
 * bytes vs ~200KB base64).
 *
 * FALLBACK: If BLOB_READ_WRITE_TOKEN is not configured (e.g. local dev, or
 * Vercel project without Blob enabled), we fall back to storing base64 in the
 * DB so the app keeps working. The migration script can move them later once
 * Blob is enabled.
 *
 * SETUP (user): In Vercel dashboard → Storage → Blob → Create store → copy
 * BLOB_READ_WRITE_TOKEN → add to Vercel env vars → redeploy.
 */

import { put } from "@vercel/blob"

export const isBlobConfigured = (): boolean => {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

/**
 * Upload a base64 data URL (or raw File/Blob) to Vercel Blob storage.
 *
 * @param imageDataUrl - base64 data URL (e.g. "data:image/png;base64,iVBOR...")
 *                      OR an HTTP URL (passes through unchanged)
 *                      OR null/undefined (returns null)
 * @param folder - logical folder prefix for organization (e.g. "signals", "comments", "pro")
 * @param id - unique identifier for the filename (e.g. signal id, comment id)
 * @returns Promise<{url: string, stored: "blob" | "base64" | "passthrough" | "none"}>
 *          - url: the image URL to store in DB (CDN URL if Blob, base64 if fallback)
 *          - stored: where it ended up
 */
export async function uploadImage(
  imageDataUrl: string | null | undefined,
  folder: string,
  id: string,
): Promise<{ url: string | null; stored: "blob" | "base64" | "passthrough" | "none" }> {
  // No image → nothing to do
  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return { url: null, stored: "none" }
  }

  // Already an HTTP URL (e.g. previously migrated, or external URL) → pass through
  if (imageDataUrl.startsWith("http://") || imageDataUrl.startsWith("https://")) {
    return { url: imageDataUrl, stored: "passthrough" }
  }

  // Must be a base64 data URL from here on
  if (!imageDataUrl.startsWith("data:")) {
    return { url: imageDataUrl, stored: "passthrough" }
  }

  // If Blob not configured → fall back to base64 in DB (keeps app working)
  if (!isBlobConfigured()) {
    return { url: imageDataUrl, stored: "base64" }
  }

  // Blob is configured → upload to Vercel Blob CDN
  try {
    // Parse the data URL: "data:image/png;base64,iVBORw0KGgo..."
    const match = imageDataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i)
    if (!match) {
      // Can't parse → fall back to base64
      return { url: imageDataUrl, stored: "base64" }
    }
    const [, mimeType, base64Data] = match
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "img"
    const buffer = Buffer.from(base64Data, "base64")

    const pathname = `${folder}/${id}.${ext}`
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: true, // avoids collisions, still under folder/
    })

    return { url: blob.url, stored: "blob" }
  } catch (e: any) {
    console.error(`[blob-upload] Failed to upload ${folder}/${id}, falling back to base64:`, e?.message)
    return { url: imageDataUrl, stored: "base64" }
  }
}

/**
 * Upload a File object (from FormData) to Vercel Blob.
 * Falls back to base64 data URL if Blob is not configured.
 */
export async function uploadFile(
  file: File,
  folder: string,
  id: string,
): Promise<{ url: string; stored: "blob" | "base64" }> {
  // If Blob not configured → return base64 data URL
  if (!isBlobConfigured()) {
    const buf = Buffer.from(await file.arrayBuffer())
    const dataUrl = `data:${file.type};base64,${buf.toString("base64")}`
    return { url: dataUrl, stored: "base64" }
  }

  try {
    const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : file.type === "image/webp" ? "webp" : "img"
    const pathname = `${folder}/${id}.${ext}`
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
    })
    return { url: blob.url, stored: "blob" }
  } catch (e: any) {
    console.error(`[blob-upload] Failed to upload ${folder}/${id}, falling back to base64:`, e?.message)
    const buf = Buffer.from(await file.arrayBuffer())
    const dataUrl = `data:${file.type};base64,${buf.toString("base64")}`
    return { url: dataUrl, stored: "base64" }
  }
}
