import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Routes publiques qui ne nécessitent pas d'authentification
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)", "/api/auth(.*)"])

export default clerkMiddleware(
  (auth, req) => {
    const { userId, sessionClaims } = auth()
    const isPublic = isPublicRoute(req)
    const url = req.nextUrl.clone()

    console.log("[Middleware] Processing:", {
      path: url.pathname,
      isPublic,
      hasUserId: !!userId,
      hasSessionClaims: !!sessionClaims,
      userAgent: req.headers.get("user-agent")?.slice(0, 50),
    })

    // Toujours autoriser les routes publiques
    if (isPublic) {
      console.log("[Middleware] Public route, allowing:", url.pathname)
      return NextResponse.next()
    }

    // Pour les routes protégées, vérifier l'authentification
    if (!userId && !sessionClaims) {
      console.log("[Middleware] No auth found, redirecting to sign-in:", url.pathname)

      // Éviter les redirections pour les API
      if (url.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Rediriger vers sign-in avec l'URL de retour
      const signInUrl = new URL("/sign-in", req.url)
      if (url.pathname !== "/sign-in") {
        signInUrl.searchParams.set("redirect_url", url.pathname)
      }

      return NextResponse.redirect(signInUrl)
    }

    // ✅ CRITIQUE : Autoriser explicitement /dashboard pour les utilisateurs authentifiés
    if (url.pathname === "/dashboard" && (userId || sessionClaims)) {
      console.log("[Middleware] Authenticated user accessing dashboard, allowing")
      return NextResponse.next()
    }

    console.log("[Middleware] Authenticated request, proceeding:", url.pathname)
    return NextResponse.next()
  },
  {
    debug: process.env.NODE_ENV === "development",
  },
)

export const config = {
  matcher: [
    // Exclure les fichiers statiques et Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Toujours exécuter pour les routes API
    "/(api|trpc)(.*)",
  ],
}
