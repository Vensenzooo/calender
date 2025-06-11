"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import type { CalendarEvent } from "@/lib/google-calendar"

export function useCalendar() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsConnection, setNeedsConnection] = useState(true)

  const fetchEvents = useCallback(
    async (timeMin?: string, timeMax?: string) => {
      if (!isLoaded || !isSignedIn) return

      try {
        setLoading(true)
        setError(null)
        setNeedsConnection(false)

        const params = new URLSearchParams()
        if (timeMin) params.append("timeMin", timeMin)
        if (timeMax) params.append("timeMax", timeMax)

        const response = await fetch(`/api/calendar/events?${params}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.needsConnection) {
            setNeedsConnection(true)
            setEvents([])
          } else {
            throw new Error(data.error || "Failed to fetch events")
          }
        } else {
          setEvents(data.events || [])
          setNeedsConnection(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching calendar events:", err)
        setEvents([])
        setNeedsConnection(true)
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, isSignedIn],
  )

  const createEvent = useCallback(
    async (eventData: Partial<CalendarEvent>) => {
      if (!isLoaded || !isSignedIn) return null

      try {
        setLoading(true)

        // Convert time inputs to proper DateTime strings
        const today = new Date()
        const startDateTime = new Date(today.toDateString() + " " + eventData.startTime).toISOString()
        const endDateTime = new Date(today.toDateString() + " " + eventData.endTime).toISOString()

        const response = await fetch("/api/calendar/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...eventData,
            startDateTime,
            endDateTime,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.needsConnection) {
            setNeedsConnection(true)
          }
          throw new Error(data.error || "Failed to create event")
        }

        // Refresh events after creating
        await fetchEvents()

        return data.event
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create event")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchEvents, isLoaded, isSignedIn],
  )

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchEvents()
    }
  }, [fetchEvents, isLoaded, isSignedIn])

  return {
    events,
    loading,
    error,
    needsConnection,
    fetchEvents,
    createEvent,
    refetch: fetchEvents,
  }
}
