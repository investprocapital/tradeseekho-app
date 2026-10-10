import { PrismaClient } from "@prisma/client"
import { seedEurUsdLessons } from "../src/lib/seed-eurusd"
import { seedIntermediateLessons } from "../src/lib/seed-intermediate"

const db = new PrismaClient()
async function main() {
  const { seedTradeSeekho } = await import("../src/lib/seed-data")
  await seedTradeSeekho(db)
  const b = await seedEurUsdLessons(db)
  console.log("beginner:", JSON.stringify(b))
  const i = await seedIntermediateLessons(db)
  console.log("intermediate:", JSON.stringify(i))
  // also seed admin user
  const bcrypt = (await import("bcryptjs")).default
  const email = "imranpti588@gmail.com"
  const hash = await bcrypt.hash("seekhomjse_49A", 10)
  await db.user.upsert({ where: { email }, update: { role: "admin", password: hash }, create: { email, name: "Imran", password: hash, role: "admin" } })
  console.log("admin user ready:", email)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
