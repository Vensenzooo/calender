import { type NextRequest, NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state") // This is the userId
    const error = searchParams.get("error")

    if (error) {
      console.error("OAuth error:", error)
      return NextResponse.redirect(new URL("/dashboard?error=oauth_denied", request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard?error=oauth_invalid", request.url))
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-callback`,
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      console.error("No access token received:", tokens)
      return NextResponse.redirect(new URL("/dashboard?error=token_failed", request.url))
    }

    // Store the access token in Clerk user metadata
    await clerkClient.users.updateUserMetadata(state, {
      publicMetadata: {
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_connected: true,
      },
    })

    return NextResponse.redirect(new URL("/dashboard?connected=true", request.url))
  } catch (error) {
    console.error("Error in Google OAuth callback:", error)
    return NextResponse.redirect(new URL("/dashboard?error=callback_failed", request.url))
  }
}
