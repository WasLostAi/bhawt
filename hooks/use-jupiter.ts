"use client"

import { useState, useCallback } from "react"
import { useJupiterContext } from "@/contexts/jupiter-context"
import { jupiterService, type JupiterQuoteParams, type JupiterQuoteResponse } from "@/services/jupiter-service"
import { tradingEngine, type TradeParams, type TradeResult } from "@/services/trading-engine"
import { useToast } from "@/components/ui/use-toast"
import { useAppStore } from "@/lib/store"

export function useJupiter() {
  const { walletPublicKey } = useJupiterContext()
  const { toast } = useToast()
  const { updateMetrics } = useAppStore()

  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<JupiterQuoteResponse | null>(null)
  const [lastTrade, setLastTrade] = useState<TradeResult | null>(null)

  // Get a quote for a swap
  const getQuote = useCallback(
    async (params: JupiterQuoteParams) => {
      if (!walletPublicKey) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to get a quote",
          variant: "destructive",
        })
        return null
      }

      setIsLoading(true)
      try {
        const quoteResponse = await jupiterService.getQuote(params)
        setQuote(quoteResponse)
        return quoteResponse
      } catch (error) {
        console.error("Error getting quote:", error)
        toast({
          title: "Error getting quote",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [walletPublicKey, toast],
  )

  // Execute a swap
  const executeSwap = useCallback(
    async (params: Omit<TradeParams, "userPublicKey">) => {
      if (!walletPublicKey) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to execute a swap",
          variant: "destructive",
        })
        return null
      }

      setIsLoading(true)
      try {
        // Update metrics to show pending transaction
        updateMetrics({ pendingTxs: 1 })

        const tradeResult = await tradingEngine.executeTrade({
          ...params,
          userPublicKey: walletPublicKey,
        })

        setLastTrade(tradeResult)

        // Update metrics based on trade result
        if (tradeResult.success) {
          updateMetrics({
            pendingTxs: 0,
            successfulSnipes: 1,
          })

          toast({
            title: "Swap successful",
            description: `Successfully swapped for ${tradeResult.outputAmount} tokens`,
          })
        } else {
          updateMetrics({
            pendingTxs: 0,
            failedSnipes: 1,
          })

          toast({
            title: "Swap failed",
            description: tradeResult.error || "Unknown error occurred",
            variant: "destructive",
          })
        }

        return tradeResult
      } catch (error) {
        console.error("Error executing swap:", error)

        updateMetrics({
          pendingTxs: 0,
          failedSnipes: 1,
        })

        toast({
          title: "Error executing swap",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        })

        return null
      } finally {
        setIsLoading(false)
      }
    },
    [walletPublicKey, toast, updateMetrics],
  )

  return {
    isLoading,
    quote,
    lastTrade,
    getQuote,
    executeSwap,
  }
}
