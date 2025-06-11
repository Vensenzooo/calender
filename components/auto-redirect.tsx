"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AutoRedirectProps {
  to: string
  condition: boolean
  delay?: number
}

export function AutoRedirect({ to, condition, delay = 0 }: AutoRedirectProps) {
  const { isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (condition) {
      const timer = setTimeout(() => {
        console.log("AutoRedirect: Redirecting to", to)
        router.replace(to)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [isLoaded, condition, to, delay, router])

  return null
}
