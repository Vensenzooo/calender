"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Pause, Sparkles, X } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

function HomePage() {
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)

    return () => clearTimeout(popupTimer)
  }, [])

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "Looks like you don't have that many meetings today. Shall I play some Hans Zimmer essentials to help you get into your Flow State?"
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
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
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">Lovy-tech</h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl drop-shadow-md">
          Advanced e-OS system for smart glasses with real-time performance tracking and intelligent calendar management
        </p>

        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors shadow-lg"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors backdrop-blur-sm border border-white/20"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* AI Popup */}
      {showAIPopup && (
        <div className="fixed bottom-8 right-8 z-20">
          <div className="w-[450px] relative bg-gradient-to-br from-blue-400/30 via-blue-500/30 to-blue-600/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-300/30 text-white">
            <button
              onClick={() => setShowAIPopup(false)}
              className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Sparkles className="h-5 w-5 text-blue-300" />
              </div>
              <div className="min-h-[80px]">
                <p className="text-base font-light">{typedText}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={togglePlay}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
              >
                Yes
              </button>
              <button
                onClick={() => setShowAIPopup(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
              >
                No
              </button>
            </div>
            {isPlaying && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white text-sm hover:bg-white/20 transition-colors"
                  onClick={togglePlay}
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause Hans Zimmer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAuth={false}>
      <HomePage />
    </AuthGuard>
  )
}
