"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { debugLog } from "@/lib/stores/debug-store"

export function RedirectLoopDetector() {
  const { isLoaded, isSignedIn } = useAuth()
  const pathname = usePathname()
  const [loopDetected, setLoopDetected] = useState(false)
  const [visitCount, setVisitCount] = useState(0)
  const visitHistory = useRef<Array<{ path: string; timestamp: number; isSignedIn: boolean }>>([])

  useEffect(() => {
    if (!isLoaded) return

    const visit = {
      path: pathname,
      timestamp: Date.now(),
      isSignedIn,
    }

    visitHistory.current.push(visit)

    // Garder seulement les 10 dernières visites
    if (visitHistory.current.length > 10) {
      visitHistory.current = visitHistory.current.slice(-10)
    }

    // Détecter une boucle : plus de 3 visites sur sign-in en étant connecté
    const signInVisitsWhileAuthenticated = visitHistory.current.filter(
      (v) => v.path === "/sign-in" && v.isSignedIn && Date.now() - v.timestamp < 30000, // 30 secondes
    )

    if (signInVisitsWhileAuthenticated.length >= 3) {
      debugLog.error("Loop Detected", "Redirect loop detected", {
        visitHistory: visitHistory.current,
        signInVisitsCount: signInVisitsWhileAuthenticated.length,
        currentState: { pathname, isSignedIn },
      })
      setLoopDetected(true)
    }

    setVisitCount(visitHistory.current.length)
  }, [pathname, isLoaded, isSignedIn])

  const handleManualRedirect = () => {
    debugLog.redirect("Manual Override", "User manually breaking redirect loop", {
      visitHistory: visitHistory.current,
    })

    // Nettoyer l'historique et forcer la redirection
    visitHistory.current = []
    setLoopDetected(false)
    window.location.href = "/dashboard"
  }

  if (!loopDetected) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="bg-red-500 text-white p-6 rounded-lg max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">🔄 Redirect Loop Detected</h2>
        <p className="mb-4">
          You're authenticated but stuck in a redirect loop. This usually happens when the dashboard page redirects back
          to sign-in.
        </p>
        <div className="mb-4 text-sm bg-red-600 p-3 rounded">
          <p>Visits: {visitCount}</p>
          <p>Current: {pathname}</p>
          <p>Signed In: {isSignedIn ? "Yes" : "No"}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleManualRedirect}
            className="bg-white text-red-500 px-4 py-2 rounded font-medium hover:bg-gray-100"
          >
            Force Dashboard
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
