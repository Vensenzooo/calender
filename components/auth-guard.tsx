"use client"

import type React from "react"

import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { debugLog } from "@/lib/stores/debug-store"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  fallbackUrl?: string
}

export function AuthGuard({ children, requireAuth = true, fallbackUrl }: AuthGuardProps) {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const hasRedirected = useRef(false)
  const checkCount = useRef(0)
  const redirectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Reset redirect flag when component mounts
    hasRedirected.current = false
    checkCount.current = 0

    debugLog.auth("Guard Mount", "AuthGuard component mounted", {
      requireAuth,
      pathname,
      searchParams: searchParams.toString(),
      fallbackUrl,
    })

    // Cleanup timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Don't do anything until Clerk is fully loaded
    if (!isLoaded) {
      debugLog.auth("Guard Wait", "Waiting for Clerk to load")
      return
    }

    // Prevent multiple redirections
    if (hasRedirected.current) {
      debugLog.auth("Guard Skip", "Already redirected, skipping check")
      return
    }

    checkCount.current++
    const redirectUrl = searchParams.get("redirect_url")

    debugLog.auth("Guard Check", `Auth check #${checkCount.current}`, {
      requireAuth,
      isSignedIn,
      userId,
      sessionId,
      redirectUrl,
      pathname,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      routerReady: router ? "ready" : "not ready",
    })

    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }

    // Add a longer delay to ensure everything is ready
    redirectTimeoutRef.current = setTimeout(() => {
      if (requireAuth && !isSignedIn) {
        // User needs to be authenticated but isn't
        debugLog.redirect("Auth Redirect", "User not authenticated, redirecting to sign-in", {
          from: pathname,
          to: fallbackUrl || "/sign-in",
          method: "router.push",
        })

        hasRedirected.current = true

        try {
          router.push(fallbackUrl || "/sign-in")
        } catch (error) {
          debugLog.error("Redirect Error", "Failed to redirect to sign-in", {
            error: error instanceof Error ? error.message : "Unknown error",
            targetUrl: fallbackUrl || "/sign-in",
          })
        }
      } else if (!requireAuth && isSignedIn) {
        // User is signed in but on a public page (like sign-in)
        let targetUrl = "/dashboard"

        if (redirectUrl) {
          try {
            if (redirectUrl.startsWith("http")) {
              // Extract pathname from absolute URL
              const url = new URL(redirectUrl)
              targetUrl = url.pathname
              debugLog.redirect("URL Clean", "Extracted pathname from absolute URL", {
                original: redirectUrl,
                extracted: targetUrl,
              })
            } else {
              targetUrl = redirectUrl
              debugLog.redirect("URL Use", "Using relative redirect URL", { targetUrl })
            }
          } catch (error) {
            debugLog.error("URL Parse", "Error parsing redirect URL, using default", {
              redirectUrl,
              error: error instanceof Error ? error.message : "Unknown error",
            })
            targetUrl = "/dashboard"
          }
        }

        debugLog.redirect("Auth Redirect", "User authenticated on public page, redirecting", {
          from: pathname,
          to: targetUrl,
          method: "window.location.href",
          reason: "Using window.location for more reliable redirect",
        })

        hasRedirected.current = true

        try {
          // Use window.location.href for more reliable redirect
          window.location.href = targetUrl
        } catch (error) {
          debugLog.error("Redirect Error", "Failed to redirect authenticated user", {
            error: error instanceof Error ? error.message : "Unknown error",
            targetUrl,
            fallbackMethod: "router.replace",
          })

          // Fallback to router.replace
          router.replace(targetUrl)
        }
      } else {
        // Everything is fine, show the content
        debugLog.auth("Guard Pass", "Auth check passed, showing content", {
          requireAuth,
          isSignedIn,
          willShowContent: true,
        })
        setIsChecking(false)
      }
    }, 500) // Increased delay to 500ms

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [isLoaded, isSignedIn, requireAuth, fallbackUrl, router, searchParams, userId, sessionId, pathname, user])

  // Show loading while checking authentication
  if (!isLoaded || isChecking) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
          alt="Beautiful mountain landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">{!isLoaded ? "Loading authentication..." : "Verifying access..."}</p>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 text-white/70 text-sm space-y-1">
              <p>Loaded: {isLoaded ? "✓" : "✗"}</p>
              <p>Signed In: {isSignedIn ? "✓" : "✗"}</p>
              <p>User ID: {userId || "None"}</p>
              <p>Session ID: {sessionId || "None"}</p>
              <p>Check Count: {checkCount.current}</p>
              <p>Has Redirected: {hasRedirected.current ? "Yes" : "No"}</p>
              <p>Pathname: {pathname}</p>
              <p>Require Auth: {requireAuth ? "Yes" : "No"}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // If we need auth but user is not signed in, don't render children (will redirect)
  if (requireAuth && !isSignedIn) {
    return null
  }

  // If we don't need auth but user is signed in, don't render children (will redirect)
  if (!requireAuth && isSignedIn) {
    return null
  }

  return <>{children}</>
}
