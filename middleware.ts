import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)", "/api/auth(.*)"])

export default clerkMiddleware(
  (auth, req) => {
    const { userId, sessionClaims } = auth()
    const isPublic = isPublicRoute(req)

    // Always allow public routes
    if (isPublic) {
      return NextResponse.next()
    }

    // For protected routes, only redirect if we're sure there's no session
    // This prevents premature redirections during the OAuth flow
    if (!userId && !sessionClaims) {
      // Only redirect to sign-in for non-API routes
      if (!req.nextUrl.pathname.startsWith("/api/")) {
        console.log("[Middleware] Redirecting unauthenticated user to sign-in:", req.nextUrl.pathname)
        const signInUrl = new URL("/sign-in", req.url)
        return NextResponse.redirect(signInUrl)
      }
    }

    // Allow the request to proceed
    return NextResponse.next()
  },
  {
    debug: process.env.NODE_ENV === "development",
  },
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
