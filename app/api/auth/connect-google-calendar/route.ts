import { type NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's information from Clerk
    const user = await clerkClient.users.getUser(userId)

    // Check if user has Google account connected via Clerk
    const googleAccount = user.externalAccounts.find((account) => account.provider === "google")

    if (!googleAccount) {
      return NextResponse.json(
        {
          error: "Please sign in with Google first",
          needsGoogleSignIn: true,
        },
        { status: 400 },
      )
    }

    // Mark Google Calendar as connected in user metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        google_calendar_connected: true,
        google_calendar_connected_at: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Google Calendar connected successfully",
    })
  } catch (error) {
    console.error("Error connecting Google Calendar:", error)
    return NextResponse.json(
      {
        error: "Failed to connect Google Calendar",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
