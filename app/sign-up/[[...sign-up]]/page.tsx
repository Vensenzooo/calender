"use client"

import { SignUp } from "@clerk/nextjs"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"

function SignUpPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url")

  // Clean up the redirect URL if it's an absolute URL
  let cleanRedirectUrl = "/dashboard"
  if (redirectUrl) {
    try {
      if (redirectUrl.startsWith("http")) {
        const url = new URL(redirectUrl)
        cleanRedirectUrl = url.pathname
      } else {
        cleanRedirectUrl = redirectUrl
      }
    } catch {
      cleanRedirectUrl = "/dashboard"
    }
  }

  return (
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

      {/* Sign Up Form */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-white/70">Create your account to begin</p>
        </div>

        <SignUp routing="path" path="/sign-up" afterSignUpUrl={cleanRedirectUrl} redirectUrl={cleanRedirectUrl} />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAuth={false}>
      <SignUpPage />
    </AuthGuard>
  )
}
