"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, AlertCircle, CheckCircle } from "lucide-react"

interface GoogleCalendarConnectProps {
  needsConnection: boolean
  onConnect: () => void
}

export function GoogleCalendarConnect({ needsConnection, onConnect }: GoogleCalendarConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/connect-google-calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsGoogleSignIn) {
          setError("Please sign out and sign back in with your Google account to enable calendar access.")
        } else {
          setError(data.error || "Failed to connect Google Calendar")
        }
        return
      }

      // Success! Refresh the calendar data
      onConnect()
    } catch (err) {
      setError("Failed to connect Google Calendar. Please try again.")
      console.error("Error connecting Google Calendar:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  if (!needsConnection) {
    return (
      <Card className="bg-green-500/20 border-green-400/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Google Calendar Connected</span>
          </div>
          <p className="text-green-300/80 text-xs mt-1">Your calendar is synced and ready to use</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-yellow-500/20 border-yellow-400/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          Connect Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/80 text-sm">
          You're signed in with Google! Now connect your calendar to view and manage your real events.
        </p>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-md">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm">What you'll get:</h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• Real-time calendar synchronization</li>
            <li>• Create and edit events</li>
            <li>• View all your calendars</li>
            <li>• Smart notifications and reminders</li>
          </ul>
        </div>

        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {isConnecting ? "Connecting..." : "Connect Google Calendar"}
        </Button>

        <p className="text-white/60 text-xs">This will enable calendar access using your existing Google account.</p>
      </CardContent>
    </Card>
  )
}
