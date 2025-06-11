"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

export function useAuthRedirect() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Only run once Clerk is loaded and we haven't already redirected
    if (!isLoaded || hasRedirected.current) return

    // If user is signed in and we're on a sign-in/sign-up page
    if (
      isSignedIn &&
      (window.location.pathname.includes("/sign-in") || window.location.pathname.includes("/sign-up"))
    ) {
      const redirectUrl = searchParams.get("redirect_url")
      let targetUrl = "/dashboard"

      if (redirectUrl) {
        try {
          // Handle absolute URLs by extracting pathname
          if (redirectUrl.startsWith("http")) {
            const url = new URL(redirectUrl)
            targetUrl = url.pathname
          } else {
            targetUrl = redirectUrl
          }
        } catch {
          targetUrl = "/dashboard"
        }
      }

      console.log("useAuthRedirect: Redirecting authenticated user to:", targetUrl)
      hasRedirected.current = true
      router.replace(targetUrl)
    }
  }, [isLoaded, isSignedIn, router, searchParams])

  return { isLoaded, isSignedIn }
}
