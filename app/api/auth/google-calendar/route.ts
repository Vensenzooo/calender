import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }

    // Redirect to Google OAuth with proper scopes
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!)
    googleAuthUrl.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI!)
    googleAuthUrl.searchParams.set("response_type", "code")
    googleAuthUrl.searchParams.set("scope", "https://www.googleapis.com/auth/calendar")
    googleAuthUrl.searchParams.set("access_type", "offline")
    googleAuthUrl.searchParams.set("prompt", "consent")
    googleAuthUrl.searchParams.set("state", userId)

    return NextResponse.redirect(googleAuthUrl.toString())
  } catch (error) {
    console.error("Error initiating Google OAuth:", error)
    return NextResponse.redirect(new URL("/dashboard?error=oauth_failed", request.url))
  }
}
