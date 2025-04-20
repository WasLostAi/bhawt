import { toast } from "@/components/ui/use-toast"
import { ApiErrorType } from "@/services/api-client"

interface ErrorOptions {
  showToast?: boolean
  logToConsole?: boolean
  logToService?: boolean
}

export function handleApiError(error: any, options: ErrorOptions = {}) {
  const { showToast = true, logToConsole = true, logToService = false } = options

  // Default error message
  let errorMessage = "An unexpected error occurred. Please try again."
  let errorType = ApiErrorType.UNKNOWN_ERROR

  // Extract error information if available
  if (error && typeof error === "object") {
    if (error.type) {
      errorType = error.type
    }

    if (error.message) {
      errorMessage = error.message
    }
  }

  // Log to console
  if (logToConsole) {
    console.error(`[API Error] ${errorType}: ${errorMessage}`, error)
  }

  // Show toast notification
  if (showToast) {
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    })
  }

  // Log to error tracking service
  if (logToService) {
    // In a real app, this would send the error to a service like Sentry
    // Example: Sentry.captureException(error)
    console.log("[Error Service] Would log error to service:", error)
  }

  return {
    message: errorMessage,
    type: errorType,
    details: error,
  }
}

export function handleTransactionError(error: any, options: ErrorOptions = {}) {
  const { showToast = true, logToConsole = true, logToService = false } = options

  // Default error message
  let errorMessage = "Transaction failed. Please try again."

  // Extract error information if available
  if (error && typeof error === "object") {
    if (error.message) {
      errorMessage = error.message
    }

    // Handle specific Solana transaction errors
    if (error.logs) {
      // Parse Solana error logs
      const errorLog = error.logs.find((log: string) => log.includes("Error") || log.includes("failed"))

      if (errorLog) {
        errorMessage = `Transaction error: ${errorLog}`
      }
    }
  }

  // Log to console
  if (logToConsole) {
    console.error(`[Transaction Error]: ${errorMessage}`, error)
  }

  // Show toast notification
  if (showToast) {
    toast({
      title: "Transaction Failed",
      description: errorMessage,
      variant: "destructive",
    })
  }

  // Log to error tracking service
  if (logToService) {
    // In a real app, this would send the error to a service like Sentry
    console.log("[Error Service] Would log transaction error to service:", error)
  }

  return {
    message: errorMessage,
    details: error,
  }
}
