"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"

export default function AuthCallbackPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isLoaded) return

    const redirectUrl = searchParams.get("redirect_url") || "/dashboard"

    if (isSignedIn) {
      // Clean up absolute URLs
      let targetUrl = redirectUrl
      try {
        if (redirectUrl.startsWith("http")) {
          const url = new URL(redirectUrl)
          targetUrl = url.pathname
        }
      } catch {
        targetUrl = "/dashboard"
      }

      console.log("AuthCallback: Redirecting to", targetUrl)
      router.replace(targetUrl)
    } else {
      // If not signed in, go to sign-in page
      router.replace("/sign-in")
    }
  }, [isLoaded, isSignedIn, router, searchParams])

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
        <p className="text-white text-lg">Completing sign-in...</p>
      </div>
    </div>
  )
}
