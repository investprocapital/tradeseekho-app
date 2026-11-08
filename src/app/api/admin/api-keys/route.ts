import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { getDecryptedKeys, saveKeys } from "@/lib/api-keys"
import { mask } from "@/lib/crypto"

export const dynamic = "force-dynamic"

/**
 * GET /api/admin/api-keys
 *   → returns MASKED tokens: { vercelBlobToken: "****1234", supabaseUrl: "...", supabaseKey: "****5678" }
 *
 * GET /api/admin/api-keys?reveal=true
 *   → returns FULL decrypted tokens (admin only, for the "Show" button).
 *     Admin is already authed via requireAdmin() — this is the explicit reveal.
 *
 * PUT /api/admin/api-keys  body: { vercelBlobToken?, supabaseUrl?, supabaseKey? }
 *   → encrypts secrets (AES-256-GCM) and saves to DB. Empty string = clear.
 *   → Only fields present in the body are updated (partial update).
 */
export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { searchParams } = new URL(req.url)
  const reveal = searchParams.get("reveal") === "true"

  const keys = await getDecryptedKeys()

  return NextResponse.json({
    vercelBlobToken: reveal
      ? keys.vercelBlobToken || ""
      : mask(keys.vercelBlobToken || ""),
    supabaseUrl: keys.supabaseUrl || "",
    supabaseKey: reveal
      ? keys.supabaseKey || ""
      : mask(keys.supabaseKey || ""),
    // Whether each is currently configured (DB or env)
    vercelBlobConfigured: !!keys.vercelBlobToken || !!process.env.BLOB_READ_WRITE_TOKEN,
    supabaseConfigured:
      (!!keys.supabaseUrl || !!process.env.SUPABASE_URL) &&
      (!!keys.supabaseKey || !!process.env.SUPABASE_SERVICE_KEY),
    // env fallback flags (so admin knows if env is being used)
    vercelBlobFromEnv: !keys.vercelBlobToken && !!process.env.BLOB_READ_WRITE_TOKEN,
    supabaseFromEnv:
      (!keys.supabaseUrl && !!process.env.SUPABASE_URL) ||
      (!keys.supabaseKey && !!process.env.SUPABASE_SERVICE_KEY),
  })
}

export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const body = await req.json().catch(() => ({} as Record<string, string>))

  // Only save fields that are present in the body (partial update).
  // Empty string → clear the stored value.
  const data: {
    vercelBlobToken?: string
    supabaseUrl?: string
    supabaseKey?: string
  } = {}

  if (typeof body.vercelBlobToken === "string") {
    data.vercelBlobToken = body.vercelBlobToken.trim()
  }
  if (typeof body.supabaseUrl === "string") {
    data.supabaseUrl = body.supabaseUrl.trim()
  }
  if (typeof body.supabaseKey === "string") {
    data.supabaseKey = body.supabaseKey.trim()
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 })
  }

  try {
    await saveKeys(data)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[admin/api-keys PUT]", e?.message)
    return NextResponse.json(
      { error: "db_error", message: e?.message },
      { status: 500 },
    )
  }
}
