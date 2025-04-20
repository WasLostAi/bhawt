"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Error caught by error boundary:", error)
      setError(error.error || new Error("Unknown error occurred"))
      setHasError(true)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    if (fallback) return <>{fallback}</>

    return (
      <div className="p-6 rounded-lg bg-[#151514] border border-[#E57676] flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-[#E57676] mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-[#707070] mb-4">{error?.message || "An unexpected error occurred. Please try again."}</p>
        <Button
          onClick={() => {
            setHasError(false)
            setError(null)
            window.location.reload()
          }}
          className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload Page
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
