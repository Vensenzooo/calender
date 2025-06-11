"use client"

import { useEffect } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { debugLog } from "@/lib/stores/debug-store"

export function useGoogleOAuthMonitor() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const { user } = useUser()

  // Monitor Google OAuth connection status
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return

    const checkGoogleConnection = async () => {
      try {
        debugLog.google("Connection Check", "Checking Google connection status", {
          userId,
          userEmail: user.primaryEmailAddress?.emailAddress,
        })

        // Check for Google account in Clerk
        const googleAccount = user.externalAccounts?.find((acc) => acc.provider === "google")

        if (googleAccount) {
          debugLog.google("Account Found", "Google account found in Clerk", {
            email: googleAccount.emailAddress,
            externalId: googleAccount.externalId,
          })

          // Check for calendar access
          const calendarConnected = user.publicMetadata?.google_calendar_connected

          if (calendarConnected) {
            debugLog.google("Calendar Connected", "Google Calendar is connected", {
              connectedAt: user.publicMetadata?.google_calendar_connected_at,
            })
          } else {
            debugLog.google("Calendar Not Connected", "Google account found but Calendar not connected", {
              googleAccount: true,
              calendarConnected: false,
            })
          }
        } else {
          debugLog.google("No Account", "No Google account connected to Clerk", {
            availableProviders: user.externalAccounts?.map((acc) => acc.provider) || [],
          })
        }

        // Check calendar API access
        try {
          const response = await fetch("/api/calendar/events")
          const data = await response.json()

          if (response.ok) {
            debugLog.google("API Success", "Calendar API access successful", {
              eventsCount: data.events?.length || 0,
              isDemo: data.isDemo,
              connected: data.connected,
            })
          } else {
            debugLog.google("API Error", "Calendar API access failed", {
              status: response.status,
              error: data.error,
              needsConnection: data.needsConnection,
            })
          }
        } catch (error) {
          debugLog.error("API Error", "Error checking calendar API", {
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      } catch (error) {
        debugLog.error("Monitor Error", "Error in Google OAuth monitor", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Check on mount and periodically
    checkGoogleConnection()
    const interval = setInterval(checkGoogleConnection, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [isLoaded, isSignedIn, user, userId])

  // Monitor OAuth redirects
  useEffect(() => {
    const handleOAuthRedirect = () => {
      const url = new URL(window.location.href)

      // Check for OAuth related parameters
      const code = url.searchParams.get("code")
      const state = url.searchParams.get("state")
      const error = url.searchParams.get("error")

      if (code || state || error) {
        debugLog.google("OAuth Params", "OAuth related parameters detected in URL", {
          hasCode: !!code,
          hasState: !!state,
          error: error || null,
          url: window.location.href,
        })
      }

      // Check for Clerk OAuth related parameters
      if (url.pathname.includes("callback") || url.pathname.includes("oauth")) {
        debugLog.clerk("OAuth Path", "OAuth related path detected", {
          pathname: url.pathname,
          search: url.search,
        })
      }
    }

    // Check on mount
    handleOAuthRedirect()
  }, [])

  return null
}
