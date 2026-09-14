/* TradeSeekho seed script — run with: bun run prisma/seed.ts */
import { PrismaClient } from "@prisma/client"
import { seedTradeSeekho } from "../src/lib/seed-data"

const db = new PrismaClient()

seedTradeSeekho(db)
  .then((r) => console.log(`✅ Seed complete: ${r.categories} categories, ${r.lessons} lessons, ${r.quizzes} quizzes`))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
