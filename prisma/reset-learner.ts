import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
async function main() {
  await db.progress.deleteMany({ where: { userId: "local-learner" } })
  await db.certificate.deleteMany({ where: { userId: "local-learner" } })
  await db.user.update({ where: { id: "local-learner" }, data: { lessonsCompleted: 0 } })
  console.log("reset done")
}
main().finally(() => db.$disconnect())
