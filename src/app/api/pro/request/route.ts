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
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const form = await req.formData()
  const method = String(form.get("method") || "")
  const amount = Number(form.get("amount") || 0)
  const txHash = String(form.get("txHash") || form.get("note") || "").trim().slice(0, 100)
  const note = String(form.get("note") || "").trim().slice(0, 300)
  const planType = String(form.get("planType") || "all") // all | lessons | alerts | signals
  const file = form.get("file")

  const VALID_METHODS = ["JazzCash", "Easypaisa", "Card", "SadaPay", "USDT", "USDT_BEP20", "Payoneer"]
  if (!VALID_METHODS.includes(method)) {
    return NextResponse.json({ error: "bad_method" }, { status: 400 })
  }
  const VALID_PLANS = ["all", "lessons", "alerts", "signals"]
  if (!VALID_PLANS.includes(planType)) {
    return NextResponse.json({ error: "bad_plan" }, { status: 400 })
  }

  // For crypto methods: txHash is mandatory + must be valid
  // BSC/Ethereum tx hashes: start with 0x, 66 chars total (0x + 64 hex)
  // Tron tx hashes: 64 chars (no 0x prefix)
  // We accept a RANGE of lengths (min 40, max 80) to handle edge cases +
  // future chains. The admin verifies on BSCScan/Tronscan anyway.
  //
  // For Payoneer: txHash is mandatory but validation is LENIENT (alphanumeric,
  // 6-30 chars) — Payoneer Transaction IDs are 16-20 digits, no 0x prefix.
  const isCrypto = method === "USDT" || method === "USDT_BEP20"
  const isPayoneer = method === "Payoneer"
  let finalTxHash: string | null = null
  if (isCrypto) {
    if (txHash.length < 6) {
      return NextResponse.json({ error: "txid_required" }, { status: 400 })
    }
    // Basic validation: alphanumeric + starts with 0x (BSC/ETH) OR all hex (Tron)
    // Lenient check — admin will verify on blockchain explorer
    const isBscEth = /^0x[a-fA-F0-9]{40,80}$/.test(txHash)
    const isTron = /^[a-fA-F0-9]{40,80}$/.test(txHash)
    if (!isBscEth && !isTron) {
      return NextResponse.json({
        error: "txid_invalid",
        message: "Tx Hash format looks invalid. Please paste the full Transaction Hash.",
      }, { status: 400 })
    }
    finalTxHash = txHash
  } else if (isPayoneer) {
    // Payoneer Transaction ID: alphanumeric, 6-30 chars (lenient)
    if (txHash.length < 6) {
      return NextResponse.json({ error: "txid_required" }, { status: 400 })
    }
    if (!/^[a-zA-Z0-9_-]{6,30}$/.test(txHash)) {
      return NextResponse.json({
        error: "txid_invalid",
        message: "Payoneer Transaction ID looks invalid. Please enter the full ID.",
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

  // Already has THIS specific plan? Block duplicate purchase.
  // But allow buying a DIFFERENT plan (user can have multiple plans).
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { proStatus: true, isProLessons: true, isProAlerts: true, isProSignals: true },
  })
  if (u?.proStatus === "active") {
    const alreadyHas = planType === "lessons" ? u.isProLessons
      : planType === "alerts" ? u.isProAlerts
      : planType === "signals" ? u.isProSignals
      : planType === "all" ? (u.isProLessons && u.isProAlerts && u.isProSignals)
      : false
    if (alreadyHas) {
      return NextResponse.json({ error: "already_has_plan", message: `You already have the ${planType} plan.` }, { status: 400 })
    }
  }

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
      planType,
      screenshotPath,
      status: "pending",
    },
  })
    await db.user.update({ where: { id: userId }, data: { proStatus: "pending" } })
    return NextResponse.json({ ok: true, requestId: req2.id })
  } catch (e: any) {
    console.error("[pro/request] error:", e?.message)
    return NextResponse.json({ error: "server_error", message: e?.message || "Submission failed" }, { status: 500 })
  }
}
