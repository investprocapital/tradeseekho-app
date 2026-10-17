import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { uploadFile } from "@/lib/blob-upload"
import { compressImage } from "@/lib/image-compress"

export const dynamic = "force-dynamic"

// POST /api/pro/request  (multipart/form-data: method, amount?, txHash?, note?, file)
// User uploads a payment screenshot + picks a payment method. Creates a
// ProRequest(status=pending). Admin approves via /api/admin/pro/[id]/approve.
//
// The screenshot is AUTO-COMPRESSED (WebP, 800px, ~150KB) then uploaded to
// Vercel Blob CDN. Only the URL is stored in ProRequest.screenshotPath.
//
// For crypto payments (USDT, USDT_BEP20), the txHash (Transaction Hash / TxID)
// is saved SEPARATELY from the user note — so admin can verify on BSCScan.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const form = await req.formData()
  const method = String(form.get("method") || "")
  const amount = Number(form.get("amount") || 0)
  const txHash = String(form.get("txHash") || form.get("note") || "").trim().slice(0, 100)
  const note = String(form.get("note") || "").trim().slice(0, 300)
  const file = form.get("file")

  const VALID_METHODS = ["JazzCash", "Easypaisa", "Card", "SadaPay", "USDT", "USDT_BEP20"]
  if (!VALID_METHODS.includes(method)) {
    return NextResponse.json({ error: "bad_method" }, { status: 400 })
  }

  // For crypto methods: txHash is mandatory + must be valid
  // BSC/Ethereum tx hashes: start with 0x, 66 chars total
  // Tron tx hashes: 64 chars (no 0x prefix)
  const isCrypto = method === "USDT" || method === "USDT_BEP20"
  let finalTxHash: string | null = null
  if (isCrypto) {
    if (txHash.length < 6) {
      return NextResponse.json({ error: "txid_required" }, { status: 400 })
    }
    // Validate format: 0x + 64 hex chars (BSC/ETH) OR 64 hex chars (Tron)
    const isBscEth = /^0x[a-fA-F0-9]{64}$/.test(txHash)
    const isTron = /^[a-fA-F0-9]{64}$/.test(txHash)
    if (!isBscEth && !isTron) {
      return NextResponse.json({
        error: "txid_invalid",
        message: "Tx Hash must be 66 chars (0x + 64 hex) for BSC/ETH or 64 hex chars for Tron",
      }, { status: 400 })
    }
    finalTxHash = txHash
  }

  if (method !== "Card" && !(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 })
  }
  if (file instanceof File) {
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 })
  }

  // Already Pro? skip
  const u = await db.user.findUnique({ where: { id: userId } })
  if (u?.proStatus === "active") return NextResponse.json({ error: "already_pro" }, { status: 400 })

  // Upload screenshot to Vercel Blob CDN (with auto-compress)
  let screenshotPath = ""
  if (file instanceof File) {
    try {
      // Auto-compress the screenshot (resize 800px + WebP + quality 75)
      const compressed = await compressImage(file)
      const compressedFile = new File([compressed.buffer], `pro_${userId}_${Date.now()}.webp`, {
        type: "image/webp",
      })
      const { url } = await uploadFile(compressedFile, "pro-payments", `pro_${userId}_${Date.now()}`)
      screenshotPath = url
    } catch {
      // Compression failed — upload original
      const { url } = await uploadFile(file, "pro-payments", `pro_${userId}_${Date.now()}`)
      screenshotPath = url
    }
  }

  // Save: txHash SEPARATE from note (per user requirement)
  // For crypto: txHash = the hash, note = optional user message
  // For non-crypto: txHash = null, note = optional (e.g. JazzCash TID)
  const req2 = await db.proRequest.create({
    data: {
      userId,
      method,
      amount,
      txHash: finalTxHash,
      note: note || null,
      screenshotPath,
      status: "pending",
    },
  })
  await db.user.update({ where: { id: userId }, data: { proStatus: "pending" } })
  return NextResponse.json({ ok: true, requestId: req2.id })
}
