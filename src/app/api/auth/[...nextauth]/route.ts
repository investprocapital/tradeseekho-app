import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// NextAuth v4 + Next.js App Router route handler.
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
