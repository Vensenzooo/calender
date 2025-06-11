"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface TestStep {
  name: string
  expected: string
  actual: string
  success: boolean
  duration: number
}

export function AutoRedirectTest() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [testResults, setTestResults] = useState<TestStep[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runRedirectTest = async () => {
    if (!isLoaded) return

    setIsRunning(true)
    const results: TestStep[] = []

    // Test 1: Dashboard access when signed in
    if (isSignedIn) {
      const startTime = Date.now()
      const expected = "/dashboard"
      const actual = pathname

      results.push({
        name: "Dashboard Access (Signed In)",
        expected,
        actual,
        success: actual === expected,
        duration: Date.now() - startTime,
      })
    }

    // Test 2: Sign-in redirect when not signed in
    if (!isSignedIn && pathname !== "/sign-in") {
      const startTime = Date.now()
      router.push("/dashboard")

      // Wait for redirect
      await new Promise((resolve) => setTimeout(resolve, 500))

      results.push({
        name: "Sign-in Redirect (Not Signed In)",
        expected: "/sign-in",
        actual: window.location.pathname,
        success: window.location.pathname.includes("/sign-in"),
        duration: Date.now() - startTime,
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  // Auto-run test when component mounts and auth is loaded
  useEffect(() => {
    if (isLoaded && process.env.NODE_ENV === "development") {
      const timer = setTimeout(runRedirectTest, 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoaded])

  if (process.env.NODE_ENV !== "development" || !testResults.length) return null

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg max-w-sm">
      <h3 className="font-bold mb-2">Auto Redirect Test</h3>
      {testResults.map((result, index) => (
        <div key={index} className="mb-2 text-sm">
          <div className={`font-medium ${result.success ? "text-green-400" : "text-red-400"}`}>
            {result.success ? "✅" : "❌"} {result.name}
          </div>
          <div className="text-white/70">Expected: {result.expected}</div>
          <div className="text-white/70">Actual: {result.actual}</div>
          <div className="text-white/60">Duration: {result.duration}ms</div>
        </div>
      ))}
      <button
        onClick={runRedirectTest}
        disabled={isRunning}
        className="mt-2 px-3 py-1 bg-blue-500 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
      >
        {isRunning ? "Running..." : "Run Test Again"}
      </button>
    </div>
  )
}
