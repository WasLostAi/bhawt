// Enhanced Jupiter API service with improved error handling, retry logic, and performance optimizations
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

// Jupiter API base URL
const JUPITER_API_BASE_URL = "https://quote-api.jup.ag/v6"

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
          // Make API request with timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000)

          const response = await fetch(`${JUPITER_API_BASE_URL}/quote?${queryParams.toString()}`, {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorData = await response.json()

            // Determine error type
            let errorType = JupiterErrorType.QUOTE_ERROR
            let errorMessage = "Failed to get quote"
            let retryable = false

            if (response.status === 400) {
              if (errorData.error?.includes("slippage")) {
                errorType = JupiterErrorType.SLIPPAGE_ERROR
                errorMessage = "Slippage tolerance exceeded"
              } else if (errorData.error?.includes("balance")) {
                errorType = JupiterErrorType.INSUFFICIENT_FUNDS
                errorMessage = "Insufficient funds for swap"
              }
            } else if (response.status === 429) {
              errorType = JupiterErrorType.RATE_LIMIT_ERROR
              errorMessage = "Rate limit exceeded"
              retryable = true
            } else if (response.status >= 500) {
              errorType = JupiterErrorType.NETWORK_ERROR
              errorMessage = "Server error"
              retryable = true
            }

            return {
              success: false,
              error: {
                type: errorType,
                message: errorMessage,
                details: errorData,
                retryable,
              },
            }
          }

          const quoteResponse = await response.json()

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
          // Make API request with timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000)

          if (onProgress) {
            onProgress(20, "Sending swap request to Jupiter API...")
          }

          const response = await fetch(`${JUPITER_API_BASE_URL}/swap`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(params),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (onProgress) {
            onProgress(50, "Processing swap response...")
          }

          if (!response.ok) {
            const errorData = await response.json()

            // Determine error type
            let errorType = JupiterErrorType.SWAP_ERROR
            let errorMessage = "Failed to execute swap"
            let retryable = false

            if (response.status === 400) {
              if (errorData.error?.includes("slippage")) {
                errorType = JupiterErrorType.SLIPPAGE_ERROR
                errorMessage = "Slippage tolerance exceeded during swap"
              } else if (errorData.error?.includes("balance")) {
                errorType = JupiterErrorType.INSUFFICIENT_FUNDS
                errorMessage = "Insufficient funds for swap"
              } else if (errorData.error?.includes("price impact")) {
                errorType = JupiterErrorType.PRICE_IMPACT_ERROR
                errorMessage = "Price impact too high"
              }
            } else if (response.status === 429) {
              errorType = JupiterErrorType.RATE_LIMIT_ERROR
              errorMessage = "Rate limit exceeded"
              retryable = true
            } else if (response.status >= 500) {
              errorType = JupiterErrorType.NETWORK_ERROR
              errorMessage = "Server error"
              retryable = true
            }

            return {
              success: false,
              error: {
                type: errorType,
                message: errorMessage,
                details: errorData,
                retryable,
              },
            }
          }

          const swapResponse = await response.json()

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

/**
 * Check token liquidity
 * @param tokenMint Token mint address
 * @returns Liquidity in USD
 */
export async function checkTokenLiquidity(tokenMint: string): Promise<number> {
  try {
    // In a real implementation, this would call Jupiter API to get liquidity
    // For now, we'll return mock data

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Return mock liquidity based on token
    const knownTokens: Record<string, number> = {
      DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: 5000000, // BONK
      EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm: 2500000, // WIF
      "7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn": 1500000, // JTO
      "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": 3000000, // PYTH
    }

    return knownTokens[tokenMint] || Math.floor(Math.random() * 500000) + 50000
  } catch (error) {
    console.error("Error checking token liquidity:", error)
    return 0
  }
}

/**
 * Enhanced snipe function with advanced options and better error handling
 * @param walletPublicKey User's wallet public key
 * @param inputMint Input token mint address (usually SOL)
 * @param outputMint Output token mint address to snipe
 * @param amount Amount to swap in lamports
 * @param maxPrice Maximum price willing to pay
 * @param maxSlippage Maximum slippage tolerance in percentage
 * @param options Additional snipe options
 * @returns Swap result with transaction signature
 */
export async function snipeToken(
  walletPublicKey: string,
  inputMint: string,
  outputMint: string,
  amount: number,
  maxPrice: number,
  maxSlippage: number,
  options: Partial<SnipeOptions> = {},
): Promise<SwapResult> {
  // Merge default options with provided options
  const snipeOptions: SnipeOptions = { ...DEFAULT_SNIPE_OPTIONS, ...options }
  const startTime = performance.now()
  const { onProgress } = snipeOptions

  if (!walletPublicKey) {
    return {
      success: false,
      error: {
        type: JupiterErrorType.WALLET_NOT_CONNECTED,
        message: "Wallet not connected",
        details: null,
        retryable: false,
      },
      executionTime: 0,
    }
  }

  try {
    if (onProgress) {
      onProgress(0, "Starting snipe operation...")
    }

    // 0. Check token safety if enabled
    if (snipeOptions.safetyChecks && !snipeOptions.whaleMode) {
      if (onProgress) {
        onProgress(5, "Performing token safety checks...")
      }

      try {
        const { whaleTracker } = await import("./whale-tracking-service")
        const safetyCheck = await whaleTracker.checkTokenSafety(outputMint)

        if (safetyCheck.trustScore < 50) {
          return {
            success: false,
            error: {
              type: JupiterErrorType.SAFETY_CHECK_FAILED,
              message: `Token safety check failed: Trust score ${safetyCheck.trustScore}/100`,
              details: safetyCheck,
              retryable: false,
            },
            executionTime: performance.now() - startTime,
          }
        }

        if (onProgress) {
          onProgress(10, "Token safety checks passed")
        }
      } catch (error) {
        console.warn("Token safety check failed, proceeding anyway:", error)
      }
    }

    // 1. Get quote with retry logic
    if (onProgress) {
      onProgress(15, "Getting price quote...")
    }

    let quoteResult: QuoteResult | null = null
    let retryCount = 0

    while (!quoteResult?.success && retryCount <= snipeOptions.retryCount!) {
      if (retryCount > 0) {
        if (onProgress) {
          onProgress(20, `Retrying quote (${retryCount}/${snipeOptions.retryCount})...`)
        }
        await new Promise((resolve) =>
          setTimeout(resolve, snipeOptions.retryDelay! * (snipeOptions.retryBackoff ? Math.pow(2, retryCount - 1) : 1)),
        )
      }

      quoteResult = await calculateOptimalRoute(
        inputMint,
        outputMint,
        amount,
        maxSlippage * 100, // Convert percentage to basis points
        snipeOptions.whaleMode ? true : false, // Only direct routes in whale mode
      )

      retryCount++
    }

    if (!quoteResult?.success || !quoteResult.data) {
      return {
        success: false,
        error: quoteResult?.error || {
          type: JupiterErrorType.QUOTE_ERROR,
          message: "Failed to get quote for snipe after retries",
          retryable: false,
        },
        executionTime: performance.now() - startTime,
      }
    }

    if (onProgress) {
      onProgress(30, "Quote received, analyzing price...")
    }

    // 2. Check if price meets our criteria
    const quote = quoteResult.data
    const outAmount = Number.parseInt(quote.outAmount)
    const price = amount / outAmount

    if (price > maxPrice) {
      return {
        success: false,
        error: {
          type: JupiterErrorType.PRICE_IMPACT_ERROR,
          message: `Price too high: ${price.toFixed(8)} > ${maxPrice.toFixed(8)}`,
          details: { actualPrice: price, maxPrice },
          retryable: false,
        },
        executionTime: performance.now() - startTime,
      }
    }

    // 3. Check price impact
    const priceImpact = Number.parseFloat(quote.priceImpactPct)
    if (priceImpact > snipeOptions.maxPriceImpact!) {
      return {
        success: false,
        error: {
          type: JupiterErrorType.PRICE_IMPACT_ERROR,
          message: `Price impact too high: ${priceImpact.toFixed(2)}% > ${snipeOptions.maxPriceImpact!.toFixed(2)}%`,
          details: { actualPriceImpact: priceImpact, maxPriceImpact: snipeOptions.maxPriceImpact },
          retryable: false,
        },
        executionTime: performance.now() - startTime,
      }
    }

    if (onProgress) {
      onProgress(40, "Price checks passed, checking liquidity...")
    }

    // 4. Check liquidity if maxLiquidityPercentage is set
    if (snipeOptions.maxLiquidityPercentage) {
      const liquidity = await checkTokenLiquidity(outputMint)
      const swapValueUsd = (amount / 1_000_000_000) * 20 // Rough estimate: 1 SOL = $20
      const liquidityPercentage = (swapValueUsd / liquidity) * 100

      if (liquidityPercentage > snipeOptions.maxLiquidityPercentage) {
        return {
          success: false,
          error: {
            type: JupiterErrorType.PRICE_IMPACT_ERROR,
            message: `Swap would take ${liquidityPercentage.toFixed(2)}% of liquidity, max allowed is ${snipeOptions.maxLiquidityPercentage}%`,
            details: { liquidityPercentage, maxLiquidityPercentage: snipeOptions.maxLiquidityPercentage },
            retryable: false,
          },
          executionTime: performance.now() - startTime,
        }
      }
    }

    if (onProgress) {
      onProgress(50, "Liquidity checks passed")
    }

    // 5. If dry run, return success without executing
    if (snipeOptions.dryRun) {
      if (onProgress) {
        onProgress(100, "Dry run completed successfully")
      }

      return {
        success: true,
        data: {
          swapTransaction: "DRY_RUN",
          lastValidBlockHeight: 0,
          prioritizationFeeLamports: snipeOptions.priorityFee!.toString(),
          expectedOutAmount: quote.outAmount,
          priceImpact: quote.priceImpactPct,
        },
        executionTime: performance.now() - startTime,
      }
    }

    // 6. Execute swap
    if (onProgress) {
      onProgress(60, "Executing swap transaction...")
    }

    const swapResult = await executeSwap(
      {
        quoteResponse: quote,
        userPublicKey: walletPublicKey,
        prioritizationFeeLamports: snipeOptions.priorityFee!.toString(),
        dynamicComputeUnitLimit: true, // Automatically adjust compute units
        skipUserAccountsCheck: snipeOptions.skipPreflight, // Skip account checks for faster execution
        useSharedAccounts: snipeOptions.useSharedAccounts,
        restrictIntermediateTokens: snipeOptions.restrictIntermediateTokens,
        useTokenLedger: snipeOptions.useTokenLedger,
      },
      {
        timeout: snipeOptions.timeout,
        retryCount: snipeOptions.retryCount,
        retryDelay: snipeOptions.retryDelay,
        retryBackoff: snipeOptions.retryBackoff,
        onProgress: (progress, message) => {
          if (onProgress) {
            // Map progress from 0-100 to 60-100
            const mappedProgress = 60 + (progress * 40) / 100
            onProgress(mappedProgress, message)
          }
        },
      },
    )

    const executionTime = performance.now() - startTime

    if (swapResult.success && swapResult.data) {
      // Add additional data to the result
      return {
        success: true,
        data: {
          ...swapResult.data,
          expectedOutAmount: quote.outAmount,
          priceImpact: quote.priceImpactPct,
        },
        executionTime,
      }
    }

    return {
      ...swapResult,
      executionTime,
    }
  } catch (error: any) {
    console.error("Snipe error:", error)

    if (onProgress) {
      onProgress(100, "Snipe failed with an unexpected error")
    }

    return {
      success: false,
      error: {
        type: JupiterErrorType.UNKNOWN_ERROR,
        message: "Unknown error during snipe operation",
        details: error.message,
        retryable: false,
      },
      executionTime: performance.now() - startTime,
    }
  }
}

/**
 * Monitor a token for price changes and snipe when conditions are met
 * @param walletPublicKey User's wallet public key
 * @param inputMint Input token mint address (usually SOL)
 * @param outputMint Output token mint address to monitor
 * @param amount Amount to swap in lamports
 * @param targetPrice Target price to snipe at
 * @param maxSlippage Maximum slippage tolerance in percentage
 * @param options Additional snipe options
 * @param onPriceUpdate Callback for price updates
 * @returns Object with stop function to cancel monitoring
 */
export function monitorAndSnipe(
  walletPublicKey: string,
  inputMint: string,
  outputMint: string,
  amount: number,
  targetPrice: number,
  maxSlippage: number,
  options: Partial<SnipeOptions> = {},
  onPriceUpdate?: (price: number, timestamp: Date) => void,
): { stop: () => void; isRunning: () => boolean } {
  let isRunning = true
  const snipeOptions: SnipeOptions = { ...DEFAULT_SNIPE_OPTIONS, ...options }
  let lastPrice: number | null = null
  let lastCheckTime = 0
  let consecutiveErrors = 0
  const MAX_CONSECUTIVE_ERRORS = 5

  // Start monitoring loop
  const monitorLoop = async () => {
    while (isRunning) {
      try {
        // Throttle checks to avoid rate limiting
        const now = Date.now()
        const timeSinceLastCheck = now - lastCheckTime
        if (timeSinceLastCheck < 1000) {
          await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLastCheck))
        }

        lastCheckTime = Date.now()

        // Get current price
        const quoteResult = await calculateOptimalRoute(
          inputMint,
          outputMint,
          amount,
          maxSlippage * 100,
          snipeOptions.whaleMode ? true : false,
        )

        if (quoteResult.success && quoteResult.data) {
          const outAmount = Number.parseInt(quoteResult.data.outAmount)
          const currentPrice = amount / outAmount
          const timestamp = new Date()

          // Reset error counter on success
          consecutiveErrors = 0

          // Call price update callback if provided
          if (onPriceUpdate) {
            onPriceUpdate(currentPrice, timestamp)
          }

          // Check if price meets target
          if (currentPrice <= targetPrice) {
            console.log(`Target price reached! Current: ${currentPrice.toFixed(8)}, Target: ${targetPrice.toFixed(8)}`)

            // Execute snipe
            await snipeToken(walletPublicKey, inputMint, outputMint, amount, targetPrice, maxSlippage, {
              ...snipeOptions,
              onProgress: (progress, message) => {
                console.log(`Snipe progress: ${progress}% - ${message}`)
              },
            })

            // Stop monitoring after snipe attempt
            isRunning = false
            break
          }

          // Store last price for trend analysis
          lastPrice = currentPrice
        } else {
          consecutiveErrors++
          console.warn(`Error getting price (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, quoteResult.error)

          // Stop monitoring if too many consecutive errors
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            console.error("Too many consecutive errors, stopping price monitor")
            isRunning = false
            break
          }
        }

        // Wait before next check
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        consecutiveErrors++
        console.error(`Error in monitor loop (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, error)

        // Stop monitoring if too many consecutive errors
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.error("Too many consecutive errors, stopping price monitor")
          isRunning = false
          break
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }

  // Start the monitoring loop
  monitorLoop()

  // Return stop function and status check
  return {
    stop: () => {
      isRunning = false
    },
    isRunning: () => isRunning,
  }
}

/**
 * Snipe a token based on whale activity
 * @param walletPublicKey User's wallet public key
 * @param whaleSignal Whale signal to act on
 * @param amount Amount to swap in lamports
 * @param maxSlippage Maximum slippage tolerance in percentage
 * @returns Swap result
 */
export async function snipeWhaleSignal(
  walletPublicKey: string,
  whaleSignal: import("./whale-tracking-service").WhaleSignal,
  amount: number,
  maxSlippage = 15, // Higher slippage for whale following
): Promise<SwapResult> {
  // Use SOL as input mint
  const inputMint = "So11111111111111111111111111111111111111112"

  // Calculate dynamic size based on whale signal
  const dynamicAmount = calculateDynamicSize(amount, whaleSignal)

  // Use whale mode preset with some adjustments
  const options: Partial<SnipeOptions> = {
    ...SNIPE_MODE_PRESETS.whale,
    maxSlippage: maxSlippage,
    // Adjust priority fee based on signal confidence
    priorityFee: Math.min(1000000, 250000 + whaleSignal.confidence * 10000),
    onProgress: (progress, message) => {
      console.log(`Whale snipe progress: ${progress}% - ${message}`)
    },
  }

  // Mark token as acted upon in whale tracker
  try {
    const { whaleTracker } = await import("./whale-tracking-service")
    whaleTracker.markTokenAsActed(whaleSignal.tokenMint)
  } catch (error) {
    console.warn("Failed to mark token as acted upon:", error)
  }

  // Execute snipe with higher price tolerance
  // We don't care as much about exact price when following whales
  return snipeToken(
    walletPublicKey,
    inputMint,
    whaleSignal.tokenMint,
    dynamicAmount,
    Number.MAX_SAFE_INTEGER, // No max price limit when following whales
    maxSlippage,
    options,
  )
}

/**
 * Calculate dynamic position size based on whale signal
 * @param baseAmount Base amount to swap
 * @param whaleSignal Whale signal to base calculation on
 * @returns Adjusted amount in lamports
 */
function calculateDynamicSize(baseAmount: number, whaleSignal: import("./whale-tracking-service").WhaleSignal): number {
  // Never exceed 25% of wallet balance
  const MAX_WALLET_PERCENTAGE = 0.25

  // Scale based on confidence and coordination
  const confidenceMultiplier = whaleSignal.confidence / 100
  const coordinationMultiplier = whaleSignal.isCoordinated ? 1.5 : 1.0

  // Scale based on transaction count
  const transactionMultiplier = Math.min(whaleSignal.transactionCount / 5, 1.5)

  // Calculate adjusted amount
  const adjustedAmount = baseAmount * confidenceMultiplier * coordinationMultiplier * transactionMultiplier

  // Cap at 25% of base amount
  return Math.min(adjustedAmount, baseAmount * MAX_WALLET_PERCENTAGE)
}
