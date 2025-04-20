"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0C0C0C]">
      <div className="flex flex-col items-center text-center max-w-md px-4">
        <AlertTriangle className="h-16 w-16 text-[#E57676] mb-6" />
        <h1 className="text-3xl font-bold font-syne mb-2">Something went wrong</h1>
        <p className="text-[#707070] mb-6">{error.message || "An unexpected error occurred. Please try again."}</p>
        <Button
          onClick={reset}
          className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  )
}
