"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"

interface RedirectTestResult {
  success: boolean
  steps: string[]
  errors: string[]
  finalUrl: string
  duration: number
}

export function useRedirectTest() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [testResult, setTestResult] = useState<RedirectTestResult | null>(null)
  const [isTestingRedirect, setIsTestingRedirect] = useState(false)

  const testRedirect = async (targetUrl = "/dashboard") => {
    setIsTestingRedirect(true)
    const startTime = Date.now()
    const steps: string[] = []
    const errors: string[] = []

    try {
      steps.push(`Starting redirect test to ${targetUrl}`)
      steps.push(`Current URL: ${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`)
      steps.push(`Auth state: loaded=${isLoaded}, signedIn=${isSignedIn}`)

      // Simulate the redirect
      router.push(targetUrl)
      steps.push(`Initiated redirect to ${targetUrl}`)

      // Wait a bit and check if we're at the target
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const finalUrl = window.location.pathname
      const duration = Date.now() - startTime

      const success = finalUrl === targetUrl
      if (!success) {
        errors.push(`Expected ${targetUrl}, but ended up at ${finalUrl}`)
      }

      setTestResult({
        success,
        steps,
        errors,
        finalUrl,
        duration,
      })
    } catch (error) {
      errors.push(`Redirect test failed: ${error}`)
      setTestResult({
        success: false,
        steps,
        errors,
        finalUrl: pathname,
        duration: Date.now() - startTime,
      })
    } finally {
      setIsTestingRedirect(false)
    }
  }

  return {
    testRedirect,
    testResult,
    isTestingRedirect,
    clearTestResult: () => setTestResult(null),
  }
}
