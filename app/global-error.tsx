"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
            <button onClick={() => reset()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
