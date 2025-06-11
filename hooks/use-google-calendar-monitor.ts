"use client"

import { useAuth, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { debugLogger } from "@/lib/debug-logger"

interface GoogleCalendarStatus {
  isConnected: boolean
  hasGoogleAccount: boolean
  calendarAccess: boolean
  lastCheck: string | null
  error: string | null
}

export function useGoogleCalendarMonitor() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const [status, setStatus] = useState<GoogleCalendarStatus>({
    isConnected: false,
    hasGoogleAccount: false,
    calendarAccess: false,
    lastCheck: null,
    error: null,
  })

  const checkGoogleCalendarStatus = async () => {
    if (!isLoaded || !isSignedIn || !user) {
      debugLogger.warn("GoogleCalendarMonitor", "Cannot check status - not authenticated", {
        isLoaded,
        isSignedIn,
        hasUser: !!user,
      })
      return
    }

    debugLogger.info("GoogleCalendarMonitor", "Starting Google Calendar status check", {
      userId,
      userEmail: user.primaryEmailAddress?.emailAddress,
    })

    try {
      // Check for Google account
      const googleAccount = user.externalAccounts?.find((acc) => acc.provider === "google")
      const hasGoogleAccount = !!googleAccount

      debugLogger.info("GoogleCalendarMonitor", "Google account check", {
        hasGoogleAccount,
        googleAccountEmail: googleAccount?.emailAddress,
        allAccounts: user.externalAccounts?.map((acc) => ({
          provider: acc.provider,
          email: acc.emailAddress,
        })),
      })

      // Check calendar access
      debugLogger.info("GoogleCalendarMonitor", "Checking calendar API access")
      const response = await fetch("/api/calendar/events", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      debugLogger.info("GoogleCalendarMonitor", "Calendar API response", {
        status: response.status,
        ok: response.ok,
        data,
      })

      const calendarAccess = response.ok && !data.needsConnection
      const isConnected = hasGoogleAccount && calendarAccess

      if (response.ok) {
        debugLogger.success("GoogleCalendarMonitor", "Calendar access successful", {
          eventsCount: data.events?.length || 0,
          isDemo: data.isDemo,
          connected: data.connected,
        })
      } else {
        debugLogger.error("GoogleCalendarMonitor", "Calendar access failed", {
          status: response.status,
          error: data.error,
          needsConnection: data.needsConnection,
          details: data.details,
        })
      }

      setStatus({
        isConnected,
        hasGoogleAccount,
        calendarAccess,
        lastCheck: new Date().toISOString(),
        error: response.ok ? null : data.error,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      debugLogger.error("GoogleCalendarMonitor", "Calendar status check failed", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })

      setStatus((prev) => ({
        ...prev,
        error: errorMessage,
        lastCheck: new Date().toISOString(),
      }))
    }
  }

  // Check status when auth state changes
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkGoogleCalendarStatus()
    }
  }, [isLoaded, isSignedIn, user])

  // Periodic status check
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const interval = setInterval(checkGoogleCalendarStatus, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isLoaded, isSignedIn])

  return {
    status,
    checkStatus: checkGoogleCalendarStatus,
  }
}
