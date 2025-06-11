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
  gracePeriod?: number // Nouveau : période de grâce pour éviter les redirections prématurées
}

export function AuthGuardV2({
  children,
  requireAuth = true,
  fallbackUrl,
  gracePeriod = 2000, // 2 secondes de grâce par défaut
}: AuthGuardProps) {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [isStable, setIsStable] = useState(false) // État de stabilité
  const [redirectAttempts, setRedirectAttempts] = useState(0)
  const hasRedirected = useRef(false)
  const stabilityTimer = useRef<NodeJS.Timeout>()
  const redirectTimer = useRef<NodeJS.Timeout>()

  // Phase 1: Attendre la stabilité de Clerk
  useEffect(() => {
    if (!isLoaded) {
      debugLog.auth("Guard Wait", "Waiting for Clerk to load")
      return
    }

    // Démarrer le timer de stabilité une fois Clerk chargé
    if (stabilityTimer.current) clearTimeout(stabilityTimer.current)

    stabilityTimer.current = setTimeout(() => {
      debugLog.auth("Guard Stable", "Auth state considered stable", {
        isSignedIn,
        userId,
        gracePeriod,
        pathname,
      })
      setIsStable(true)
    }, gracePeriod)

    return () => {
      if (stabilityTimer.current) clearTimeout(stabilityTimer.current)
    }
  }, [isLoaded, isSignedIn, userId, gracePeriod])

  // Phase 2: Logique de redirection une fois stable
  useEffect(() => {
    if (!isLoaded || !isStable || hasRedirected.current) return

    const redirectUrl = searchParams.get("redirect_url")

    debugLog.auth("Guard Check Stable", "Performing stable auth check", {
      requireAuth,
      isSignedIn,
      userId,
      sessionId,
      redirectUrl,
      pathname,
      redirectAttempts,
      userEmail: user?.primaryEmailAddress?.emailAddress,
    })

    if (requireAuth && !isSignedIn) {
      // Utilisateur non authentifié sur page protégée
      debugLog.redirect("Auth Redirect", "Redirecting unauthenticated user", {
        from: pathname,
        to: fallbackUrl || "/sign-in",
        method: "window.location.href",
        reason: "User not authenticated",
      })

      hasRedirected.current = true
      window.location.href = fallbackUrl || "/sign-in"
    } else if (!requireAuth && isSignedIn) {
      // Utilisateur authentifié sur page publique
      let targetUrl = "/dashboard"

      if (redirectUrl) {
        try {
          targetUrl = redirectUrl.startsWith("http") ? new URL(redirectUrl).pathname : redirectUrl
        } catch {
          targetUrl = "/dashboard"
        }
      }

      debugLog.redirect("Auth Redirect", "Redirecting authenticated user", {
        from: pathname,
        to: targetUrl,
        method: "window.location.href",
        reason: "User authenticated on public page",
        attempt: redirectAttempts + 1,
      })

      setRedirectAttempts((prev) => prev + 1)
      hasRedirected.current = true

      // Utiliser window.location.href pour forcer la navigation
      window.location.href = targetUrl
    } else {
      // État normal, afficher le contenu
      debugLog.auth("Guard Pass", "Auth check passed, showing content", {
        requireAuth,
        isSignedIn,
        pathname,
      })
    }
  }, [isLoaded, isStable, isSignedIn, requireAuth, pathname, redirectAttempts])

  // Nettoyage
  useEffect(() => {
    return () => {
      if (stabilityTimer.current) clearTimeout(stabilityTimer.current)
      if (redirectTimer.current) clearTimeout(redirectTimer.current)
    }
  }, [])

  // Interface de chargement améliorée
  if (!isLoaded || !isStable) {
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
          <p className="text-white text-lg">{!isLoaded ? "Loading authentication..." : "Stabilizing session..."}</p>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 text-white/70 text-sm space-y-1 bg-black/20 p-4 rounded">
              <p>Loaded: {isLoaded ? "✓" : "✗"}</p>
              <p>Stable: {isStable ? "✓" : "✗"}</p>
              <p>Signed In: {isSignedIn ? "✓" : "✗"}</p>
              <p>User ID: {userId || "None"}</p>
              <p>Redirect Attempts: {redirectAttempts}</p>
              <p>Has Redirected: {hasRedirected.current ? "Yes" : "No"}</p>
              <p>Grace Period: {gracePeriod}ms</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Empêcher le rendu si redirection en cours
  if (hasRedirected.current) {
    return null
  }

  return <>{children}</>
}
