import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Simple redirect back to dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
