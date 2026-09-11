import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"

export async function GET() {
  return NextResponse.json({ authed: await isAdmin() })
}
