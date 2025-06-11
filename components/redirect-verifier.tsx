"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter, usePathname } from "next/navigation"
import { debugLog } from "@/lib/stores/debug-store"

export function RedirectVerifier() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!isLoaded) return

    // If user is signed in but still on sign-in page after 3 seconds
    if (isSignedIn && pathname === "/sign-in") {
      const timer = setTimeout(() => {
        setAttempts((prev) => prev + 1)

        debugLog.redirect("Manual Redirect", `Attempting manual redirect (attempt ${attempts + 1})`, {
          pathname,
          isSignedIn,
          method: "window.location.replace",
        })

        // Force redirect using window.location.replace
        window.location.replace("/dashboard")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isLoaded, isSignedIn, pathname, attempts])

  // Show manual redirect button after multiple failed attempts
  if (isLoaded && isSignedIn && pathname === "/sign-in" && attempts > 0) {
    return (
      <div className="fixed top-4 left-4 z-50 bg-red-500/90 text-white p-4 rounded-lg">
        <h3 className="font-bold mb-2">Redirect Issue Detected</h3>
        <p className="text-sm mb-3">You're signed in but stuck on the sign-in page.</p>
        <button
          onClick={() => {
            debugLog.redirect("Manual Button", "User clicked manual redirect button", {
              attempts,
            })
            window.location.href = "/dashboard"
          }}
          className="bg-white text-red-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return null
}
