import { google } from "googleapis"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  startDateTime: string
  endDateTime: string
  location?: string
  attendees?: string[]
  organizer?: string
  color?: string
  day?: number
  allDay?: boolean
}

export class GoogleCalendarService {
  private oauth2Client: any
  private calendar: any

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    )

    this.oauth2Client.setCredentials({
      access_token: accessToken,
    })

    this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client })
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    try {
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
      endOfWeek.setHours(23, 59, 59, 999)

      const response = await this.calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin || startOfWeek.toISOString(),
        timeMax: timeMax || endOfWeek.toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: "startTime",
      })

      const events = response.data.items || []

      return events.map((event: any, index: number) => {
        const start = event.start?.dateTime || event.start?.date
        const end = event.end?.dateTime || event.end?.date
        const isAllDay = !event.start?.dateTime

        let startTime = "00:00"
        let endTime = "23:59"
        let day = 1

        if (start) {
          const startDate = new Date(start)
          const dayOfWeek = startDate.getDay()
          day = dayOfWeek === 0 ? 7 : dayOfWeek // Convert Sunday (0) to 7

          if (!isAllDay) {
            startTime = startDate.toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })
          }
        }

        if (end && !isAllDay) {
          const endDate = new Date(end)
          endTime = endDate.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          })
        }

        return {
          id: event.id || `event-${index}`,
          title: event.summary || "Untitled Event",
          description: event.description || "",
          startTime,
          endTime,
          startDateTime: start,
          endDateTime: end,
          location: event.location || "",
          attendees: event.attendees?.map((a: any) => a.email) || [],
          organizer: event.organizer?.email || "",
          color: this.getEventColor(index),
          day,
          allDay: isAllDay,
        }
      })
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      throw new Error("Failed to fetch calendar events")
    }
  }

  async createEvent(eventData: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      const event = {
        summary: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: "America/New_York",
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: "America/New_York",
        },
        attendees: eventData.attendees?.map((email) => ({ email })),
      }

      const response = await this.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      })

      const createdEvent = response.data
      const start = createdEvent.start?.dateTime || createdEvent.start?.date
      const end = createdEvent.end?.dateTime || createdEvent.end?.date

      return {
        id: createdEvent.id,
        title: createdEvent.summary || "Untitled Event",
        description: createdEvent.description || "",
        startTime: start
          ? new Date(start).toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })
          : "00:00",
        endTime: end
          ? new Date(end).toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })
          : "23:59",
        startDateTime: start,
        endDateTime: end,
        location: createdEvent.location || "",
        attendees: createdEvent.attendees?.map((a: any) => a.email) || [],
        organizer: createdEvent.organizer?.email || "",
        color: "bg-blue-500",
        day: start ? new Date(start).getDay() || 7 : 1,
        allDay: !createdEvent.start?.dateTime,
      }
    } catch (error) {
      console.error("Error creating calendar event:", error)
      throw new Error("Failed to create calendar event")
    }
  }

  private getEventColor(index: number): string {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-red-500",
      "bg-orange-500",
    ]
    return colors[index % colors.length]
  }
}
