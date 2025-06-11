"use client"

import { useGoogleCalendarMonitor } from "@/hooks/use-google-calendar-monitor"
import { useAuth, useUser } from "@clerk/nextjs"
import { useState } from "react"
import { debugLogger } from "@/lib/debug-logger"
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  User,
  Key,
  Database,
} from "lucide-react"

export function GoogleCalendarDiagnostics() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const { status, checkStatus } = useGoogleCalendarMonitor()
  const [isChecking, setIsChecking] = useState(false)

  const handleManualCheck = async () => {
    setIsChecking(true)
    debugLogger.info("GoogleCalendarDiagnostics", "Manual status check initiated")
    await checkStatus()
    setIsChecking(false)
  }

  const handleConnectGoogle = async () => {
    debugLogger.info("GoogleCalendarDiagnostics", "Initiating Google Calendar connection")
    try {
      const response = await fetch("/api/auth/connect-google-calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        debugLogger.success("GoogleCalendarDiagnostics", "Google Calendar connection successful", data)
        await checkStatus()
      } else {
        debugLogger.error("GoogleCalendarDiagnostics", "Google Calendar connection failed", {
          status: response.status,
          error: data.error,
          needsGoogleSignIn: data.needsGoogleSignIn,
        })
      }
    } catch (error) {
      debugLogger.error("GoogleCalendarDiagnostics", "Connection request failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const handleGoogleOAuth = () => {
    debugLogger.info("GoogleCalendarDiagnostics", "Redirecting to Google OAuth")
    window.location.href = "/api/auth/google-oauth"
  }

  if (process.env.NODE_ENV !== "development") return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          <h3 className="font-bold">Google Calendar Diagnostics</h3>
        </div>
        <button
          onClick={handleManualCheck}
          disabled={isChecking}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {/* Auth Status */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Authentication
          </span>
          {isSignedIn ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400" />
          )}
        </div>

        {/* Google Account */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Google Account
          </span>
          {status.hasGoogleAccount ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400" />
          )}
        </div>

        {/* Calendar Access */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Calendar Access
          </span>
          {status.calendarAccess ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400" />
          )}
        </div>

        {/* Overall Status */}
        <div className="flex items-center justify-between pt-2 border-t border-white/20">
          <span className="font-medium">Overall Status</span>
          {status.isConnected ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle className="h-4 w-4" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400">
              <XCircle className="h-4 w-4" />
              Not Connected
            </span>
          )}
        </div>

        {/* Error Display */}
        {status.error && (
          <div className="p-2 bg-red-500/20 border border-red-400/30 rounded text-red-300 text-xs">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3" />
              Error
            </div>
            {status.error}
          </div>
        )}

        {/* User Info */}
        {user && (
          <div className="text-xs text-white/70 space-y-1">
            <div>User: {user.primaryEmailAddress?.emailAddress}</div>
            <div>ID: {userId}</div>
            {status.lastCheck && <div>Last Check: {new Date(status.lastCheck).toLocaleTimeString()}</div>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-white/20">
          {!status.hasGoogleAccount && (
            <button
              onClick={handleGoogleOAuth}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Connect Google Account
            </button>
          )}

          {status.hasGoogleAccount && !status.calendarAccess && (
            <button
              onClick={handleConnectGoogle}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 rounded text-sm transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Enable Calendar Access
            </button>
          )}

          <button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 rounded text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  )
}
