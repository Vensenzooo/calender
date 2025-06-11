"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRedirectTest } from "@/hooks/use-redirect-test"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Play, RotateCcw } from "lucide-react"

export function RedirectTestPanel() {
  const { isSignedIn, userId } = useAuth()
  const { testRedirect, testResult, isTestingRedirect, clearTestResult } = useRedirectTest()
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
      >
        🧪
      </button>

      {/* Test Panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 w-96">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🧪 Redirect Test Panel
                <button onClick={() => setIsVisible(false)} className="ml-auto text-white/70 hover:text-white">
                  ×
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auth Status */}
              <div className="text-white text-sm">
                <p>Auth Status: {isSignedIn ? "✅ Signed In" : "❌ Not Signed In"}</p>
                <p>User ID: {userId || "None"}</p>
              </div>

              {/* Test Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => testRedirect("/dashboard")}
                  disabled={isTestingRedirect}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isTestingRedirect ? "Testing..." : "Test Dashboard Redirect"}
                </Button>

                <Button
                  onClick={() => testRedirect("/sign-in")}
                  disabled={isTestingRedirect}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Test Sign-In Redirect
                </Button>

                {testResult && (
                  <Button onClick={clearTestResult} className="w-full bg-gray-500 hover:bg-gray-600">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear Results
                  </Button>
                )}
              </div>

              {/* Test Results */}
              {testResult && (
                <div className="text-white text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className={testResult.success ? "text-green-400" : "text-red-400"}>
                      {testResult.success ? "Success" : "Failed"}
                    </span>
                    <span className="text-white/70">({testResult.duration}ms)</span>
                  </div>

                  <div>
                    <p className="font-medium">Final URL: {testResult.finalUrl}</p>
                  </div>

                  {testResult.errors.length > 0 && (
                    <div>
                      <p className="font-medium text-red-400">Errors:</p>
                      {testResult.errors.map((error, i) => (
                        <p key={i} className="text-red-300 text-xs">
                          • {error}
                        </p>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="font-medium">Steps:</p>
                    {testResult.steps.map((step, i) => (
                      <p key={i} className="text-white/70 text-xs">
                        {i + 1}. {step}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
