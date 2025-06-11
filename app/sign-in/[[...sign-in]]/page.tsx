"use client"

import { SignIn } from "@clerk/nextjs"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { AdvancedRedirectMonitor } from "@/components/advanced-redirect-monitor"
import { RedirectVerifier } from "@/components/redirect-verifier"

function SignInPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url")

  // Clean up the redirect URL if it's an absolute URL
  let cleanRedirectUrl = "/dashboard"
  if (redirectUrl) {
    try {
      if (redirectUrl.startsWith("http")) {
        const url = new URL(redirectUrl)
        cleanRedirectUrl = url.pathname
        console.log("[SignIn] Cleaned absolute URL:", { original: redirectUrl, cleaned: cleanRedirectUrl })
      } else {
        cleanRedirectUrl = redirectUrl
        console.log("[SignIn] Using relative URL:", cleanRedirectUrl)
      }
    } catch (error) {
      console.warn("[SignIn] Failed to parse redirect URL:", redirectUrl, error)
      cleanRedirectUrl = "/dashboard"
    }
  }

  console.log("[SignIn] Page loaded with redirect URL:", cleanRedirectUrl)

  return (
    <>
      <AdvancedRedirectMonitor />
      <RedirectVerifier />
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
          alt="Beautiful mountain landscape"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Sign In Form */}
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/70">Sign in to access your smart calendar</p>
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 text-white/60 text-sm">
                <p>Redirect URL: {cleanRedirectUrl}</p>
                <p>Original: {redirectUrl || "None"}</p>
              </div>
            )}
          </div>

          <SignIn routing="path" path="/sign-in" afterSignInUrl={cleanRedirectUrl} redirectUrl={cleanRedirectUrl} />
        </div>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAuth={false}>
      <SignInPage />
    </AuthGuard>
  )
}
