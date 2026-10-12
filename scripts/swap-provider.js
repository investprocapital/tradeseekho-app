/* Swap prisma datasource provider based on DATABASE_URL.
 * - Local dev (file:./db/custom.db) → sqlite
 * - Vercel/Neon production (postgresql://...) → postgresql (default in schema)
 *
 * The committed schema.prisma uses "postgresql" (production default).
 * This script swaps to "sqlite" for local dev (when DATABASE_URL starts with "file:").
 * Runs in postinstall (build-time) AND in the dev script (local dev).
 *
 * On Vercel: DATABASE_URL is postgres → schema stays postgresql → prisma db push
 *            pushes the full schema (including BEP20 columns) to Neon. ✅
 * On local:  DATABASE_URL is file:... → swaps to sqlite → local dev works. ✅
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = "prisma/schema.prisma";

try {
  let s = fs.readFileSync(path, "utf8");
  const url = process.env.DATABASE_URL || "";
  const isSqlite = url.startsWith("file:");
  const isPostgres = url.startsWith("postgres");
  const hasSqlite = s.includes('provider = "sqlite"');
  const hasPostgres = s.includes('provider = "postgresql"');

  if (isSqlite && hasPostgres) {
    s = s.replace('provider = "postgresql"', 'provider = "sqlite"');
    fs.writeFileSync(path, s);
    console.log("✓ [swap-provider] Switched prisma provider → sqlite (local dev: file: URL)");
  } else if (isPostgres && hasSqlite) {
    s = s.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(path, s);
    console.log("✓ [swap-provider] Switched prisma provider → postgresql (Vercel/Neon)");
  } else if (isPostgres && hasPostgres) {
    console.log("✓ [swap-provider] Already postgresql (Vercel/Neon) — no change needed");
  } else if (isSqlite && hasSqlite) {
    console.log("✓ [swap-provider] Already sqlite (local dev) — no change needed");
  } else if (!url) {
    console.log("⚠ [swap-provider] DATABASE_URL not set — keeping current provider");
  } else {
    console.log("⚠ [swap-provider] Unknown DATABASE_URL format — keeping current provider");
  }
} catch (e) {
  console.warn("⚠ [swap-provider] Could not read/write prisma/schema.prisma:", e.message);
}
