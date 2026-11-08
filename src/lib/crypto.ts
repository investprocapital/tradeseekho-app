import crypto from "crypto"

/**
 * AES-256-GCM encryption for sensitive API keys stored in the database.
 *
 * Why AES-256-GCM?
 *  - GCM provides authenticated encryption (detects tampering).
 *  - Industry standard for encrypting secrets at rest.
 *
 * Master key derivation:
 *  - Uses ENCRYPTION_KEY env var if set (recommended for production).
 *  - Falls back to ADMIN_PASSWORD_SECRET (already used for admin auth).
 *  - Falls back to a dev-only default (local dev, never production).
 *  - SHA-256 hash of the secret → 32-byte key.
 *
 * Stored format: JSON string { c, iv, tag } (all base64).
 */

const ALGO = "aes-256-gcm"

function getMasterKey(): Buffer {
  const raw =
    process.env.ENCRYPTION_KEY ||
    process.env.ADMIN_PASSWORD_SECRET ||
    "tradeseekho-dev-encryption-key-change-in-production"
  return crypto.createHash("sha256").update(raw).digest()
}

/** Encrypt a plaintext string → JSON {c, iv, tag} (base64). */
export function encrypt(plaintext: string): string {
  if (!plaintext) return ""
  const key = getMasterKey()
  const iv = crypto.randomBytes(12) // 96-bit IV (recommended for GCM)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return JSON.stringify({
    c: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  })
}

/** Decrypt a JSON {c, iv, tag} string → plaintext. Returns "" on failure. */
export function decrypt(encryptedJson: string): string {
  if (!encryptedJson) return ""
  try {
    const { c, iv, tag } = JSON.parse(encryptedJson)
    const key = getMasterKey()
    const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(iv, "base64"))
    decipher.setAuthTag(Buffer.from(tag, "base64"))
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(c, "base64")),
      decipher.final(),
    ])
    return decrypted.toString("utf8")
  } catch {
    return ""
  }
}

/** Mask a token to show only last 4 digits: "****1234". */
export function mask(token: string): string {
  if (!token) return ""
  if (token.length <= 4) return "****"
  return "****" + token.slice(-4)
}
