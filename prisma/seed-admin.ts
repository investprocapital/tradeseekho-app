/* Create / update the owner admin user so they can log in via the normal
   email+password form and reach the admin panel.
   Run: bun run prisma/seed-admin.ts
   (Re-runnable; update the email/password below or via env to change.) */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  const email = (process.env.ADMIN_EMAIL || "imranpti588@gmail.com").trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD_USER || "seekhomjse_49A"
  const name = process.env.ADMIN_NAME || "Imran"
  const hash = await bcrypt.hash(password, 10)

  const u = await db.user.upsert({
    where: { email },
    update: { role: "admin", password: hash, name },
    create: { email, name, password: hash, role: "admin" },
  })
  console.log("✅ Admin user ready:")
  console.log("   email:", u.email)
  console.log("   name :", u.name)
  console.log("   role :", u.role)
  console.log("   id   :", u.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
