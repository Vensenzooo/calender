"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { PersistentDebugMonitor } from "./persistent-debug-monitor"
import { debugLog } from "@/lib/stores/debug-store"

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Only render the debug monitor on the client side
  useEffect(() => {
    setMounted(true)

    // Log initial app load
    debugLog.custom("System", "App Start", "Debug monitor initialized", {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    })

    // Log when the app is about to unload
    const handleBeforeUnload = () => {
      debugLog.custom("System", "App Exit", "Page unloading", {
        timestamp: new Date().toISOString(),
        url: window.location.href,
      })
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  return (
    <>
      {children}
      {mounted && <PersistentDebugMonitor />}
    </>
  )
}
