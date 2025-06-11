"use client"

import { useEffect } from "react"
import Image from "next/image"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

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
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Oops! Something went wrong</h1>
        <p className="text-xl text-white/90 mb-8 max-w-md mx-auto drop-shadow-md">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors shadow-lg"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors backdrop-blur-sm border border-white/20"
          >
            Go Home
          </button>
        </div>
        {error.message && <p className="text-white/60 text-sm mt-4 max-w-md mx-auto">Error: {error.message}</p>}
      </div>
    </div>
  )
}
