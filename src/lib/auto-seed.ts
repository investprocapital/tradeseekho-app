/* Auto-seed: runs on server startup to ensure the full EUR/USD curriculum
   (22 lessons) is present. Seeds if the DB is empty OR if the new Intermediate
   lessons (eurusd-13..eurusd-22) are missing (migration from old generic seed). */
import { db } from "@/lib/db"

let seeded = false
let seeding: Promise<void> | null = null

export async function ensureSeeded() {
  if (seeded) return
  if (seeding) return seeding
  seeding = (async () => {
    try {
      const catCount = await db.category.count()
      // Check if the new Intermediate lessons exist (eurusd-13 is the first one)
      const hasNewIntermediate = await db.lesson.findUnique({ where: { id: "eurusd-13" } })

      if (catCount === 0) {
        // Fresh DB — run full seed
        console.log("🌱 DB empty — auto-seeding TradeSeekho...")
        const { seedTradeSeekho } = await import("@/lib/seed-data")
        await seedTradeSeekho(db)
        await ensureAdminUser()
        console.log("✅ Auto-seed complete (fresh DB).")
      } else if (!hasNewIntermediate) {
        // Existing DB with old lessons — migrate to EUR/USD curriculum
        console.log("🔄 Old lessons detected — migrating to EUR/USD curriculum (22 lessons)...")
        const { seedEurUsdLessons } = await import("@/lib/seed-eurusd")
        const { seedIntermediateLessons } = await import("@/lib/seed-intermediate")
        const eur = await seedEurUsdLessons(db)
        const inter = await seedIntermediateLessons(db)
        await ensureAdminUser()
        console.log(`✅ Migration complete: ${eur.lessons} beginner + ${inter.lessons} intermediate lessons.`)
      }
      seeded = true
    } catch (e) {
      console.error("Auto-seed failed:", e)
    } finally {
      seeding = null
    }
  })()
  return seeding
}

async function ensureAdminUser() {
  const bcrypt = (await import("bcryptjs")).default
  const email = (process.env.ADMIN_EMAIL || "imranpti588@gmail.com").trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD_USER || "seekhomjse_49A"
  const name = process.env.ADMIN_NAME || "Imran"
  const hash = await bcrypt.hash(password, 10)
  await db.user.upsert({
    where: { email },
    update: { role: "admin", password: hash, name },
    create: { email, name, password: hash, role: "admin" },
  })
}
