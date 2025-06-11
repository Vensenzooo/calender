"use client"

import { useEffect, useRef } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { usePathname, useSearchParams } from "next/navigation"
import { debugLog } from "@/lib/stores/debug-store"

export function useDebugTracker() {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth()
  const { user } = useUser()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Refs to track previous values
  const prevPathRef = useRef(pathname)
  const prevSearchParamsRef = useRef(searchParams)
  const prevAuthStateRef = useRef({ isLoaded, isSignedIn, userId, sessionId })
  const prevUserRef = useRef(user)
  const initialLoadRef = useRef(true)

  // Track route changes
  useEffect(() => {
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

    if (initialLoadRef.current) {
      debugLog.route("Initial Load", `Page loaded at ${currentUrl}`, {
        pathname,
        searchParams: searchParams.toString(),
        fullUrl: currentUrl,
      })
      initialLoadRef.current = false
    } else if (pathname !== prevPathRef.current) {
      debugLog.route("Path Change", `Path changed from ${prevPathRef.current} to ${pathname}`, {
        from: prevPathRef.current,
        to: pathname,
        searchParams: searchParams.toString(),
        fullUrl: currentUrl,
      })
    } else if (searchParams.toString() !== prevSearchParamsRef.current.toString()) {
      debugLog.route("Query Change", `Search params changed`, {
        pathname,
        previousParams: prevSearchParamsRef.current.toString(),
        currentParams: searchParams.toString(),
        fullUrl: currentUrl,
      })
    }

    // Check for redirect parameters
    const redirectUrl = searchParams.get("redirect_url")
    if (redirectUrl) {
      debugLog.redirect("Redirect Param", `Redirect URL parameter detected`, {
        redirectUrl,
        isAbsolute: redirectUrl.startsWith("http"),
        currentPath: pathname,
      })
    }

    prevPathRef.current = pathname
    prevSearchParamsRef.current = searchParams
  }, [pathname, searchParams])

  // Track auth state changes
  useEffect(() => {
    if (!isLoaded) return

    const prev = prevAuthStateRef.current

    // Initial auth state
    if (prev.isLoaded !== isLoaded) {
      debugLog.clerk("Loaded", `Clerk loaded`, {
        isSignedIn,
        userId,
        sessionId,
      })
    }

    // Sign in/out events
    if (prev.isLoaded && prev.isSignedIn !== isSignedIn) {
      if (isSignedIn) {
        debugLog.auth("Sign In", `User signed in`, {
          userId,
          sessionId,
        })
      } else {
        debugLog.auth("Sign Out", `User signed out`, {
          previousUserId: prev.userId,
        })
      }
    }

    // Session changes
    if (prev.isLoaded && isSignedIn && prev.sessionId !== sessionId) {
      debugLog.auth("Session Change", `User session changed`, {
        previousSessionId: prev.sessionId,
        currentSessionId: sessionId,
      })
    }

    prevAuthStateRef.current = { isLoaded, isSignedIn, userId, sessionId }
  }, [isLoaded, isSignedIn, userId, sessionId])

  // Track user data changes
  useEffect(() => {
    if (!isLoaded || !user) return

    const prev = prevUserRef.current

    if (!prev && user) {
      debugLog.auth("User Loaded", `User data loaded`, {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      })

      // Check for Google account
      const googleAccount = user.externalAccounts?.find((acc) => acc.provider === "google")
      if (googleAccount) {
        debugLog.google("Account Detected", `Google account connected`, {
          email: googleAccount.emailAddress,
          provider: googleAccount.provider,
          externalId: googleAccount.externalId,
        })
      }
    }

    prevUserRef.current = user
  }, [isLoaded, user])

  // Listen for Google OAuth related events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes("oauth") || e.key?.includes("google")) {
        debugLog.google("Storage Change", `OAuth related storage change detected`, {
          key: e.key,
          oldValue: e.oldValue,
          newValue: e.newValue,
        })
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Track window focus/blur for redirect debugging
  useEffect(() => {
    const handleFocus = () => {
      debugLog.redirect("Window Focus", `Window regained focus`, {
        url: window.location.href,
        timestamp: new Date().toISOString(),
      })
    }

    const handleBlur = () => {
      debugLog.redirect("Window Blur", `Window lost focus`, {
        url: window.location.href,
        timestamp: new Date().toISOString(),
      })
    }

    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)
    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
    }
  }, [])

  // Track history changes for redirect debugging
  useEffect(() => {
    const handlePopState = () => {
      debugLog.redirect("History Change", `Browser history changed`, {
        url: window.location.href,
        timestamp: new Date().toISOString(),
      })
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return null
}
