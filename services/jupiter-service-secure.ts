// Enhanced Jupiter API service that uses the server-side API route
import { ENV } from "@/lib/env"
import { performanceMonitor } from "./performance-monitor"

// Jupiter API types
export interface QuoteGetRequest {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps?: number
  onlyDirectRoutes?: boolean
  asLegacyTransaction?: boolean
  maxAccounts?: number
  swapMode?: "ExactIn" | "ExactOut"
  feeBps?: number
}

export interface QuoteResponse {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee: {
    amount: string
    feeBps: number
  }
  priceImpactPct: string
  routePlan: Array<{
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
    percent: number
  }>
  contextSlot: number
  timeTaken: number
}

export interface SwapPostRequest {
  quoteResponse: QuoteResponse
  userPublicKey: string
  prioritizationFeeLamports?: string
  dynamicComputeUnitLimit?: boolean
  skipUserAccountsCheck?: boolean
  useSharedAccounts?: boolean
  restrictIntermediateTokens?: boolean
  useTokenLedger?: boolean
}

export interface SwapPostResponse {
  swapTransaction: string
  lastValidBlockHeight: number
  prioritizationFeeLamports: string
}

// Enhanced error types for better error handling
export enum JupiterErrorType {
  QUOTE_ERROR = "QUOTE_ERROR",
  SWAP_ERROR = "SWAP_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  SLIPPAGE_ERROR = "SLIPPAGE_ERROR",
  PRICE_IMPACT_ERROR = "PRICE_IMPACT_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  TRANSACTION_ERROR = "TRANSACTION_ERROR",
  SAFETY_CHECK_FAILED = "SAFETY_CHECK_FAILED",
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface JupiterError {
  type: JupiterErrorType
  message: string
  details?: any
  retryable: boolean
}

export interface QuoteResult {
  success: boolean
  data?: QuoteResponse
  error?: JupiterError
  executionTime?: number // Time taken to get quote in ms
}

export interface SwapResult {
  success: boolean
  data?: SwapPostResponse & {
    signature?: string
    expectedOutAmount?: string
    actualOutAmount?: string
    priceImpact?: string
  }
  error?: JupiterError
  executionTime?: number // Time taken to execute swap in ms
}

// Snipe options interface for more configurable sniping
export interface SnipeOptions {
  maxPriceImpact?: number // Maximum acceptable price impact in percentage
  priorityFee?: number // Priority fee in lamports
  computeUnits?: number // Maximum compute units to use
  timeout?: number // Timeout in milliseconds
  retryCount?: number // Number of retries on failure
  retryDelay?: number // Delay between retries in milliseconds
  retryBackoff?: boolean // Whether to use exponential backoff for retries
  confirmLevel?: "processed" | "confirmed" | "finalized" // Transaction confirmation level
  skipPreflight?: boolean // Skip preflight transaction checks for faster execution
  dryRun?: boolean // Simulate the transaction without sending it
  whaleMode?: boolean // Use more aggressive settings for whale following
  safetyChecks?: boolean // Perform token safety checks before sniping
  maxLiquidityPercentage?: number // Maximum percentage of liquidity to take
  parallelRpcCalls?: number // Number of parallel RPC calls to make
  useSharedAccounts?: boolean // Use shared accounts for faster execution
  restrictIntermediateTokens?: boolean // Restrict intermediate tokens for routing
  useTokenLedger?: boolean // Use token ledger for tracking
  maxAccounts?: number
  onProgress?: (progress: number, message: string) => void // Progress callback
}

// Snipe mode presets with improved settings
export const SNIPE_MODE_PRESETS = {
  standard: {
    maxPriceImpact: ENV.getNumber("MAX_PRICE_IMPACT", 5), // 5% max price impact
    priorityFee: ENV.getNumber("DEFAULT_PRIORITY_FEE", 250000), // 0.00025 SOL
    computeUnits: ENV.getNumber("MAX_COMPUTE_UNITS", 1400000), // Maximum compute units
    timeout: 60000, // 60 seconds
    retryCount: 2,
    retryDelay: 1000, // 1 second
    retryBackoff: true,
    confirmLevel: "processed" as const,
    skipPreflight: true,
    dryRun: false,
    whaleMode: false,
    safetyChecks: true,
    maxLiquidityPercentage: 5, // 5% of available liquidity
    parallelRpcCalls: 2,
    useSharedAccounts: true,
    restrictIntermediateTokens: false,
    useTokenLedger: true,
    maxAccounts: ENV.getNumber("MAX_ACCOUNTS", 64),
  },
  whale: {
    maxPriceImpact: 20, // 20% max price impact
    priorityFee: 1000000, // 0.001 SOL
    computeUnits: ENV.getNumber("MAX_COMPUTE_UNITS", 1400000), // Maximum compute units
    timeout: 30000, // 30 seconds
    retryCount: 3,
    retryDelay: 500, // 0.5 seconds
    retryBackoff: true,
    confirmLevel: "processed" as const,
    skipPreflight: true,
    dryRun: false,
    whaleMode: true,
    safetyChecks: false, // Skip safety checks for speed
    maxLiquidityPercentage: 15, // 15% of available liquidity
    parallelRpcCalls: 4,
    useSharedAccounts: true,
    restrictIntermediateTokens: true, // Restrict to direct routes
    useTokenLedger: true,
    maxAccounts: ENV.getNumber("MAX_ACCOUNTS", 64),
  },
  safe: {
    maxPriceImpact: 3, // 3% max price impact
    priorityFee: 100000, // 0.0001 SOL
    computeUnits: ENV.getNumber("MAX_COMPUTE_UNITS", 1400000), // Maximum compute units
    timeout: 90000, // 90 seconds
    retryCount: 1,
    retryDelay: 2000, // 2 seconds
    retryBackoff: false,
    confirmLevel: "confirmed" as const,
    skipPreflight: false,
    dryRun: false,
    whaleMode: false,
    safetyChecks: true,
    maxLiquidityPercentage: 2, // 2% of available liquidity
    parallelRpcCalls: 1,
    useSharedAccounts: false,
    restrictIntermediateTokens: false,
    useTokenLedger: true,
    maxAccounts: ENV.getNumber("MAX_ACCOUNTS", 64),
  },
}

// Default snipe options
const DEFAULT_SNIPE_OPTIONS: SnipeOptions = {
  ...SNIPE_MODE_PRESETS.standard,
  priorityFee: ENV.getNumber("DEFAULT_PRIORITY_FEE", 250000),
  computeUnits: ENV.getNumber("MAX_COMPUTE_UNITS", 1400000),
  maxAccounts: ENV.getNumber("MAX_ACCOUNTS", 64),
}

// Cache for quotes to reduce API calls
interface QuoteCache {
  [key: string]: {
    result: QuoteResult
    timestamp: number
    expiresAt: number
  }
}

const quoteCache: QuoteCache = {}
const CACHE_TTL = 10000 // 10 seconds

// Performance metrics
interface PerformanceMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageQuoteTime: number
  averageSwapTime: number
  successRate: number
  cacheHits: number
  cacheMisses: number
  cacheHitRate: number
}

// Initialize performance metrics
const performanceMetrics: PerformanceMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageQuoteTime: 0,
  averageSwapTime: 0,
  successRate: 0,
  cacheHits: 0,
  cacheMisses: 0,
  cacheHitRate: 0,
}

// Update performance metrics
function updatePerformanceMetrics(success: boolean, executionTime: number, isSwap: boolean, cacheHit = false): void {
  performanceMetrics.totalRequests++

  if (success) {
    performanceMetrics.successfulRequests++
  } else {
    performanceMetrics.failedRequests++
  }

  performanceMetrics.successRate = (performanceMetrics.successfulRequests / performanceMetrics.totalRequests) * 100

  if (isSwap) {
    // Update average swap time using weighted average
    const prevTotal = performanceMetrics.averageSwapTime * (performanceMetrics.totalRequests - 1)
    performanceMetrics.averageSwapTime = (prevTotal + executionTime) / performanceMetrics.totalRequests
  } else {
    // Update average quote time using weighted average
    const prevTotal = performanceMetrics.averageQuoteTime * (performanceMetrics.totalRequests - 1)
    performanceMetrics.averageQuoteTime = (prevTotal + executionTime) / performanceMetrics.totalRequests

    // Update cache metrics
    if (cacheHit) {
      performanceMetrics.cacheHits++
    } else {
      performanceMetrics.cacheMisses++
    }
    performanceMetrics.cacheHitRate =
      (performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses)) * 100
  }
}

// Get performance metrics
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...performanceMetrics }
}

// Clear cache
export function clearQuoteCache(): void {
  Object.keys(quoteCache).forEach((key) => delete quoteCache[key])
}

// Generate cache key for quote
function generateQuoteCacheKey(params: QuoteGetRequest): string {
  return `${params.inputMint}:${params.outputMint}:${params.amount}:${params.slippageBps || 100}:${params.onlyDirectRoutes || false}`
}

// Check if error is retryable
function isRetryableError(error: JupiterError): boolean {
  return (
    error.retryable ||
    [JupiterErrorType.NETWORK_ERROR, JupiterErrorType.TIMEOUT_ERROR, JupiterErrorType.RATE_LIMIT_ERROR].includes(
      error.type,
    )
  )
}

// Retry function with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retryCount: number
    retryDelay: number
    retryBackoff?: boolean
    shouldRetry: (result: T) => boolean
    onRetry?: (attempt: number, delay: number) => void
  },
): Promise<T> {
  let lastResult: T
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= options.retryCount; attempt++) {
    try {
      if (attempt > 0 && options.onRetry) {
        options.onRetry(attempt, options.retryDelay * (options.retryBackoff ? Math.pow(2, attempt - 1) : 1))
      }

      lastResult = await fn()

      if (!options.shouldRetry(lastResult)) {
        return lastResult
      }

      // If we should retry but this is the last attempt, return the result anyway
      if (attempt === options.retryCount) {
        return lastResult
      }
    } catch (error) {
      lastError = error as Error

      // If this is the last attempt, throw the error
      if (attempt === options.retryCount) {
        throw lastError
      }
    }

    // Wait before retrying
    const delay = options.retryDelay * (options.retryBackoff ? Math.pow(2, attempt) : 1)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  // This should never happen, but TypeScript requires a return
  throw lastError || new Error("Retry failed")
}

/**
 * Call the server-side Jupiter API route
 * @param endpoint API endpoint
 * @param params Request parameters
 * @returns API response
 */
async function callJupiterApi<T>(endpoint: string, params?: any): Promise<T> {
  try {
    const response = await fetch("/api/jupiter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint,
        params,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "API request failed")
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error calling Jupiter API:", error)
    throw error
  }
}

/**
 * Get quote for swapping tokens with enhanced error handling, caching, and performance tracking
 * @param params Quote parameters
 * @param options Additional options
 * @returns Quote result
 */
export async function getQuote(
  params: QuoteGetRequest,
  options: {
    bypassCache?: boolean
    timeout?: number
    retryCount?: number
    retryDelay?: number
    retryBackoff?: boolean
  } = {},
): Promise<QuoteResult> {
  const startTime = performance.now()
  const cacheKey = generateQuoteCacheKey(params)

  // Check cache if not bypassed
  if (!options.bypassCache && quoteCache[cacheKey] && quoteCache[cacheKey].expiresAt > Date.now()) {
    const cachedResult = quoteCache[cacheKey].result
    updatePerformanceMetrics(cachedResult.success, performance.now() - startTime, false, true)
    return cachedResult
  }

  try {
    // Build query string from params
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    // Make API request with retry logic
    const result = await withRetry<QuoteResult>(
      async () => {
        try {
          // Call the server-side API route
          const quoteResponse = await callJupiterApi<QuoteResponse>(`/quote?${queryParams.toString()}`)

          return {
            success: true,
            data: quoteResponse,
          }
        } catch (error: any) {
          // Handle timeout errors
          if (error.name === "AbortError") {
            return {
              success: false,
              error: {
                type: JupiterErrorType.TIMEOUT_ERROR,
                message: "Request timed out while fetching quote",
                details: error.message,
                retryable: true,
              },
            }
          }

          return {
            success: false,
            error: {
              type: JupiterErrorType.NETWORK_ERROR,
              message: "Network error while fetching quote",
              details: error.message,
              retryable: true,
            },
          }
        }
      },
      {
        retryCount: options.retryCount || 2,
        retryDelay: options.retryDelay || 1000,
        retryBackoff: options.retryBackoff !== undefined ? options.retryBackoff : true,
        shouldRetry: (result) => !result.success && result.error?.retryable === true,
        onRetry: (attempt, delay) => {
          console.log(`Retrying quote (${attempt}/${options.retryCount || 2}) in ${delay}ms...`)
        },
      },
    )

    const executionTime = performance.now() - startTime
    result.executionTime = executionTime

    updatePerformanceMetrics(result.success, executionTime, false, false)

    // Cache successful results
    if (result.success && result.data) {
      quoteCache[cacheKey] = {
        result,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_TTL,
      }
    }

    return result
  } catch (error: any) {
    console.error("Jupiter quote error:", error)

    const executionTime = performance.now() - startTime
    updatePerformanceMetrics(false, executionTime, false, false)

    return {
      success: false,
      error: {
        type: JupiterErrorType.UNKNOWN_ERROR,
        message: "Unknown error while fetching quote",
        details: error.message,
        retryable: false,
      },
      executionTime,
    }
  }
}

/**
 * Execute a swap transaction with enhanced error handling and performance tracking
 * @param params Swap parameters
 * @param options Additional options
 * @returns Swap result
 */
export async function executeSwap(
  params: SwapPostRequest,
  options: {
    timeout?: number
    retryCount?: number
    retryDelay?: number
    retryBackoff?: boolean
    onProgress?: (progress: number, message: string) => void
  } = {},
): Promise<SwapResult> {
  const startTime = performance.now()
  const { onProgress } = options

  if (onProgress) {
    onProgress(10, "Preparing swap transaction...")
  }

  try {
    // Make API request with retry logic
    const result = await withRetry<SwapResult>(
      async () => {
        try {
          if (onProgress) {
            onProgress(20, "Sending swap request to Jupiter API...")
          }

          // Call the server-side API route
          const swapResponse = await callJupiterApi<SwapPostResponse>("/swap", params)

          if (onProgress) {
            onProgress(80, "Swap transaction prepared successfully")
          }

          return {
            success: true,
            data: swapResponse,
          }
        } catch (error: any) {
          // Handle timeout errors
          if (error.name === "AbortError") {
            return {
              success: false,
              error: {
                type: JupiterErrorType.TIMEOUT_ERROR,
                message: "Request timed out while executing swap",
                details: error.message,
                retryable: true,
              },
            }
          }

          return {
            success: false,
            error: {
              type: JupiterErrorType.NETWORK_ERROR,
              message: "Network error while executing swap",
              details: error.message,
              retryable: true,
            },
          }
        }
      },
      {
        retryCount: options.retryCount || 2,
        retryDelay: options.retryDelay || 1000,
        retryBackoff: options.retryBackoff !== undefined ? options.retryBackoff : true,
        shouldRetry: (result) => !result.success && result.error?.retryable === true,
        onRetry: (attempt, delay) => {
          console.log(`Retrying swap (${attempt}/${options.retryCount || 2}) in ${delay}ms...`)
          if (onProgress) {
            onProgress(30, `Retrying swap (attempt ${attempt})...`)
          }
        },
      },
    )

    const executionTime = performance.now() - startTime
    result.executionTime = executionTime

    updatePerformanceMetrics(result.success, executionTime, true)

    if (onProgress) {
      onProgress(100, result.success ? "Swap completed successfully" : "Swap failed")
    }

    // Record the swap result in performance monitor
    if (result.success && result.data) {
      performanceMonitor.recordTrade({
        tokenMint: params.quoteResponse.outputMint,
        tokenSymbol: undefined, // Would need to look up from a token registry
        direction: "BUY",
        amount: Number.parseInt(params.quoteResponse.inAmount),
        price: Number.parseInt(params.quoteResponse.inAmount) / Number.parseInt(params.quoteResponse.outAmount),
        executionTime,
        success: true,
        timestamp: Date.now(),
      })
    }

    return result
  } catch (error: any) {
    console.error("Jupiter swap error:", error)

    const executionTime = performance.now() - startTime
    updatePerformanceMetrics(false, executionTime, true)

    if (onProgress) {
      onProgress(100, "Swap failed with an unexpected error")
    }

    return {
      success: false,
      error: {
        type: JupiterErrorType.UNKNOWN_ERROR,
        message: "Unknown error while executing swap",
        details: error.message,
        retryable: false,
      },
      executionTime,
    }
  }
}

/**
 * Calculate optimal swap route based on target parameters
 * @param inputMint Input token mint address
 * @param outputMint Output token mint address
 * @param amount Amount to swap in lamports
 * @param slippageBps Slippage tolerance in basis points
 * @param onlyDirectRoutes Whether to only use direct routes
 * @returns Quote result
 */
export async function calculateOptimalRoute(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps = 100, // Default 1%
  onlyDirectRoutes = false,
): Promise<QuoteResult> {
  return getQuote({
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps,
    onlyDirectRoutes,
    asLegacyTransaction: false,
    maxAccounts: ENV.getNumber("MAX_ACCOUNTS", 64),
  })
}

// Rest of the functions remain the same, just using the new API route
// ...
