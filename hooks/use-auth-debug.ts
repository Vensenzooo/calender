"use client"

import { useAuth, useUser } from "@clerk/nextjs"
import { useEffect } from "react"

export function useAuthDebug(componentName = "Unknown") {
  const auth = useAuth()
  const { user } = useUser()

  useEffect(() => {
    const debugInfo = {
      component: componentName,
      isLoaded: auth.isLoaded,
      isSignedIn: auth.isSignedIn,
      userId: auth.userId,
      sessionId: auth.sessionId,
      pathname: typeof window !== "undefined" ? window.location.pathname : "SSR",
      search: typeof window !== "undefined" ? window.location.search : "SSR",
      user: user
        ? {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        : null,
      timestamp: new Date().toISOString(),
    }

    console.log(`[${componentName}] Auth Debug:`, debugInfo)
  }, [auth.isLoaded, auth.isSignedIn, auth.userId, auth.sessionId, user, componentName])

  return { auth, user }
}
