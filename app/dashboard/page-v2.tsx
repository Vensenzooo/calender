"use client"

import { useAuth, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { AuthGuardV2 } from "@/components/auth-guard-v2"
import { RedirectLoopDetector } from "@/components/redirect-loop-detector"
import { debugLog } from "@/lib/stores/debug-store"

function DashboardContent() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      debugLog.auth("Dashboard Load", "Dashboard component loaded successfully", {
        userId,
        userEmail: user.primaryEmailAddress?.emailAddress,
        pathname: "/dashboard",
      })
      setIsReady(true)
    } else if (isLoaded && !isSignedIn) {
      debugLog.error("Dashboard Error", "Dashboard accessed without authentication", {
        isLoaded,
        isSignedIn,
        userId,
      })
    }
  }, [isLoaded, isSignedIn, user, userId])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading dashboard...</p>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Loaded: {isLoaded ? "✓" : "✗"}</p>
              <p>Signed In: {isSignedIn ? "✓" : "✗"}</p>
              <p>User: {user ? "✓" : "✗"}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Votre contenu dashboard existant ici
  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold p-8">Dashboard - Welcome {user?.firstName}!</h1>
      {/* Reste du contenu dashboard */}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <>
      <RedirectLoopDetector />
      <AuthGuardV2 requireAuth={true} gracePeriod={3000}>
        <DashboardContent />
      </AuthGuardV2>
    </>
  )
}
