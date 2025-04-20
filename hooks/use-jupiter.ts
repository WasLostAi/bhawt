"use client"

import { useState, useCallback, useRef } from "react"
import {
  calculateOptimalRoute,
  snipeToken,
  monitorAndSnipe,
  snipeWhaleSignal,
  type QuoteResult,
  type SwapResult,
  type SnipeOptions,
  JupiterErrorType,
} from "@/services/jupiter-service"
import type { WhaleSignal } from "@/services/whale-tracking-service"
import type { BreakoutSignal } from "@/strategies/breakout-strategy"
import type { BollingerBandsSignal } from "@/strategies/bollinger-bands-strategy"

export interface UseJupiterProps {
  walletPublicKey?: string
}

export interface MonitorState {
  isMonitoring: boolean
  targetPrice: number | null
  currentPrice: number | null
  lastUpdated: Date | null
}

export function useJupiter({ walletPublicKey = "" }: UseJupiterProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuote, setLastQuote] = useState<QuoteResult | null>(null)
  const [lastSwap, setLastSwap] = useState<SwapResult | null>(null)
  const [monitorState, setMonitorState] = useState<MonitorState>({
    isMonitoring: false,
    targetPrice: null,
    currentPrice: null,
    lastUpdated: null,
  })

  // Use ref to store the monitor controller
  const monitorControllerRef = useRef<{ stop: () => void } | null>(null)

  // Get quote for a token pair
  const getTokenQuote = useCallback(
    async (inputMint: string, outputMint: string, amount: number, slippageBps = 100, onlyDirectRoutes = false) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await calculateOptimalRoute(inputMint, outputMint, amount, slippageBps, onlyDirectRoutes)

        setLastQuote(result)

        if (!result.success && result.error) {
          setError(result.error.message)
        }

        return result
      } catch (err: any) {
        const errorMsg = err.message || "Failed to get quote"
        setError(errorMsg)
        return {
          success: false,
          error: {
            type: JupiterErrorType.UNKNOWN_ERROR,
            message: errorMsg,
          },
        }
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // Execute a snipe operation with enhanced options
  const executeSnipe = useCallback(
    async (
      inputMint: string,
      outputMint: string,
      amount: number,
      maxPrice: number,
      maxSlippage: number,
      priorityFee: number,
      additionalOptions: Partial<SnipeOptions> = {},
    ) => {
      if (!walletPublicKey) {
        setError("Wallet not connected")
        return {
          success: false,
          error: {
            type: JupiterErrorType.UNKNOWN_ERROR,
            message: "Wallet not connected",
          },
        }
      }

      setIsLoading(true)
      setError(null)

      try {
        const options: Partial<SnipeOptions> = {
          priorityFee,
          ...additionalOptions,
        }

        const result = await snipeToken(walletPublicKey, inputMint, outputMint, amount, maxPrice, maxSlippage, options)

        setLastSwap(result)

        if (!result.success && result.error) {
          setError(result.error.message)
        }

        return result
      } catch (err: any) {
        const errorMsg = err.message || "Failed to execute snipe"
        setError(errorMsg)
        return {
          success: false,
          error: {
            type: JupiterErrorType.UNKNOWN_ERROR,
            message: errorMsg,
          },
        }
      } finally {
        setIsLoading(false)
      }
    },
    [walletPublicKey],
  )

  // Start monitoring a token for price changes and snipe when target price is reached
  const startPriceMonitor = useCallback(
    (
      inputMint: string,
      outputMint: string,
      amount: number,
      targetPrice: number,
      maxSlippage: number,
      options: Partial<SnipeOptions> = {},
    ) => {
      if (!walletPublicKey) {
        setError("Wallet not connected")
        return false
      }

      // Stop any existing monitor
      if (monitorControllerRef.current) {
        monitorControllerRef.current.stop()
      }

      setMonitorState({
        isMonitoring: true,
        targetPrice,
        currentPrice: null,
        lastUpdated: null,
      })

      // Start new monitor
      const controller = monitorAndSnipe(
        walletPublicKey,
        inputMint,
        outputMint,
        amount,
        targetPrice,
        maxSlippage,
        options,
        (price, timestamp) => {
          setMonitorState((prev) => ({
            ...prev,
            currentPrice: price,
            lastUpdated: timestamp,
          }))
        },
      )

      monitorControllerRef.current = controller
      return true
    },
    [walletPublicKey],
  )

  // Stop price monitoring
  const stopPriceMonitor = useCallback(() => {
    if (monitorControllerRef.current) {
      monitorControllerRef.current.stop()
      monitorControllerRef.current = null

      setMonitorState({
        isMonitoring: false,
        targetPrice: null,
        currentPrice: null,
        lastUpdated: null,
      })

      return true
    }
    return false
  }, [])

  // Snipe based on whale signal
  const handleWhaleSignal = useCallback(
    async (whaleSignal: WhaleSignal, amount: number, maxSlippage = 15) => {
      if (!walletPublicKey) {
        setError("Wallet not connected")
        return {
          success: false,
          error: {
            type: JupiterErrorType.UNKNOWN_ERROR,
            message: "Wallet not connected",
          },
        }
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await snipeWhaleSignal(walletPublicKey, whaleSignal, amount, maxSlippage)

        setLastSwap(result)

        if (!result.success && result.error) {
          setError(result.error.message)
        }

        return result
      } catch (err: any) {
        const errorMsg = err.message || "Failed to execute whale snipe"
        setError(errorMsg)
        return {
          success: false,
          error: {
            type: JupiterErrorType.UNKNOWN_ERROR,
            message: errorMsg,
          },
        }
      } finally {
        setIsLoading(false)
      }
    },
    [walletPublicKey],
  )

  // Execute a strategy signal
  const executeStrategySignal = useCallback(
    async (
      signal: BreakoutSignal | BollingerBandsSignal,
      amount: number,
      maxSlippage: number,
      strategyName: string,
    ) => {
      if (!walletPublicKey) {
        setError("Wallet not connected")
        return {
          success: false,
          error: {
            type: JupiterErrorType.UNKNOWN_ERROR,
            message: "Wallet not connected",
          },
        }
      }

      setIsLoading(true)
      setError(null)

      try {
        // SOL mint address
        const SOL_MINT = "So11111111111111111111111111111111111111112"

        // Execute the trade based on signal direction
        const result = await executeSnipe(
          signal.direction === "BUY" ? SOL_MINT : signal.tokenMint,
          signal.direction === "BUY" ? signal.tokenMint : SOL_MINT,
          amount,
          signal.direction === "BUY" ? Number.MAX_SAFE_INTEGER : 0, // No max price for buys, 0 for sells
          maxSlippage,
          250000, // Priority fee
          {
            whaleMode: true, // Use whale mode for strategy signals
            skipPreflight: true,
            retryCount: 3,
          },
        )

        return result
      } catch (err: any) {
        const errorMsg = err.message || `Failed to execute ${strategyName} strategy signal`
        setError(errorMsg)
        return {
          success: false,
          error: {
            type: JupiterErrorType.UNKNOWN_ERROR,
            message: errorMsg,
          },
        }
      } finally {
        setIsLoading(false)
      }
    },
    [walletPublicKey, executeSnipe],
  )

  return {
    isLoading,
    error,
    lastQuote,
    lastSwap,
    monitorState,
    getTokenQuote,
    executeSnipe,
    startPriceMonitor,
    stopPriceMonitor,
    snipeWhaleSignal: handleWhaleSignal,
    executeStrategySignal,
    clearError: () => setError(null),
  }
}
