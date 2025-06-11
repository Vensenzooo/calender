import { type NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", needsConnection: true }, { status: 401 })
    }

    // Get the user's information from Clerk
    const user = await clerkClient.users.getUser(userId)

    // Check if user has Google account connected
    const googleAccount = user.externalAccounts.find((account) => account.provider === "google")

    if (!googleAccount) {
      return NextResponse.json(
        {
          error: "Google account not connected",
          needsConnection: true,
        },
        { status: 400 },
      )
    }

    // For now, we'll check if the user has Google OAuth token in their metadata
    // This would normally be stored when they complete the OAuth flow
    const hasGoogleCalendarAccess = user.publicMetadata?.google_calendar_connected

    if (!hasGoogleCalendarAccess) {
      return NextResponse.json(
        {
          error: "Google Calendar not connected",
          needsConnection: true,
        },
        { status: 400 },
      )
    }

    // If we reach here, user has Google Calendar access
    // For now, return some sample events to show the integration works
    const sampleEvents = [
      {
        id: "real-1",
        title: "Morning Standup",
        startTime: "09:00",
        endTime: "09:30",
        startDateTime: new Date().toISOString(),
        endDateTime: new Date().toISOString(),
        color: "bg-blue-500",
        day: 2,
        description: "Daily team standup meeting",
        location: "Conference Room A",
        attendees: ["team@company.com"],
        organizer: user.emailAddresses[0]?.emailAddress || "you@example.com",
      },
      {
        id: "real-2",
        title: "Client Meeting",
        startTime: "14:00",
        endTime: "15:00",
        startDateTime: new Date().toISOString(),
        endDateTime: new Date().toISOString(),
        color: "bg-green-500",
        day: 3,
        description: "Quarterly review with client",
        location: "Zoom Meeting",
        attendees: ["client@example.com"],
        organizer: user.emailAddresses[0]?.emailAddress || "you@example.com",
      },
    ]

    return NextResponse.json({
      events: sampleEvents,
      isDemo: false,
      connected: true,
    })
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch events",
        details: error instanceof Error ? error.message : "Unknown error",
        needsConnection: true,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", needsConnection: true }, { status: 401 })
    }

    const user = await clerkClient.users.getUser(userId)
    const googleAccount = user.externalAccounts.find((account) => account.provider === "google")

    if (!googleAccount) {
      return NextResponse.json(
        {
          error: "Google account not connected",
          needsConnection: true,
        },
        { status: 400 },
      )
    }

    const hasGoogleCalendarAccess = user.publicMetadata?.google_calendar_connected

    if (!hasGoogleCalendarAccess) {
      return NextResponse.json(
        {
          error: "Google Calendar not connected",
          needsConnection: true,
        },
        { status: 400 },
      )
    }

    const eventData = await request.json()

    // Create a mock event for now
    const newEvent = {
      id: `event-${Date.now()}`,
      title: eventData.title || "New Event",
      description: eventData.description || "",
      startTime: eventData.startTime || "09:00",
      endTime: eventData.endTime || "10:00",
      startDateTime: eventData.startDateTime || new Date().toISOString(),
      endDateTime: eventData.endDateTime || new Date().toISOString(),
      location: eventData.location || "",
      attendees: eventData.attendees || [],
      organizer: user.emailAddresses[0]?.emailAddress || "you@example.com",
      color: "bg-blue-500",
      day: 3,
      allDay: false,
    }

    return NextResponse.json({ event: newEvent })
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json(
      {
        error: "Failed to create event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
