"use client"

import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface RedirectStep {
  timestamp: string
  step: string
  data: any
  url: string
}

export function RedirectMonitor() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [steps, setSteps] = useState<RedirectStep[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const addStep = (step: string, data: any) => {
    const newStep: RedirectStep = {
      timestamp: new Date().toISOString(),
      step,
      data,
      url: `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    }
    setSteps((prev) => [...prev, newStep])
    console.log(`[RedirectMonitor] ${step}:`, data)
  }

  useEffect(() => {
    addStep("Component Mount", {
      pathname,
      searchParams: searchParams.toString(),
      isLoaded,
      isSignedIn,
      userId,
    })
  }, [])

  useEffect(() => {
    if (isLoaded) {
      addStep("Clerk Loaded", {
        isSignedIn,
        userId,
        userEmail: user?.primaryEmailAddress?.emailAddress,
      })
    }
  }, [isLoaded, isSignedIn, userId, user])

  useEffect(() => {
    addStep("Route Change", {
      pathname,
      searchParams: searchParams.toString(),
    })
  }, [pathname, searchParams])

  // Show monitor in development or when there's a redirect_url parameter
  useEffect(() => {
    const shouldShow =
      process.env.NODE_ENV === "development" ||
      searchParams.has("redirect_url") ||
      pathname.includes("sign-in") ||
      pathname.includes("sign-up")
    setIsVisible(shouldShow)
  }, [searchParams, pathname])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg max-w-md max-h-96 overflow-y-auto text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Redirect Monitor</h3>
        <button onClick={() => setIsVisible(false)} className="text-white/70 hover:text-white">
          ×
        </button>
      </div>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="border-l-2 border-blue-400 pl-2">
            <div className="font-medium text-blue-300">{step.step}</div>
            <div className="text-white/70">{step.timestamp.split("T")[1].split(".")[0]}</div>
            <div className="text-white/60">{step.url}</div>
            <pre className="text-white/80 text-xs overflow-x-auto">{JSON.stringify(step.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}
