/* Swap prisma datasource provider based on DATABASE_URL.
 * - Local dev (file:./db/custom.db) → sqlite
 * - Vercel/Neon production (postgresql://...) → postgresql
 *
 * Runs in postinstall BEFORE prisma generate/db push so the same schema.prisma
 * works in both environments without manual editing.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = "prisma/schema.prisma";

try {
  let s = fs.readFileSync(path, "utf8");
  const url = process.env.DATABASE_URL || "";
  const isPostgres = url.startsWith("postgres");
  const hasSqlite = s.includes('provider = "sqlite"');
  const hasPostgres = s.includes('provider = "postgresql"');

  if (isPostgres && hasSqlite) {
    s = s.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(path, s);
    console.log("✓ [swap-provider] Switched prisma provider → postgresql (Vercel/Neon detected)");
  } else if (!isPostgres && hasPostgres) {
    s = s.replace('provider = "postgresql"', 'provider = "sqlite"');
    fs.writeFileSync(path, s);
    console.log("✓ [swap-provider] Switched prisma provider → sqlite (local dev)");
  } else if (isPostgres && hasPostgres) {
    console.log("✓ [swap-provider] Already postgresql (Vercel/Neon) — no change");
  } else {
    console.log("✓ [swap-provider] Already sqlite (local dev) — no change");
  }
} catch (e) {
  console.warn("⚠ [swap-provider] Could not read/write prisma/schema.prisma:", e.message);
}
