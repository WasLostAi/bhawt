"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient, API_ENDPOINTS } from "@/services/api-client"
import { queryKeys } from "@/lib/query-client"

export interface TokenPrice {
  address: string
  price: number
  priceChange24h: number
  volume24h: number
  liquidity: number
  lastUpdated: number
}

export interface UseTokenPriceOptions {
  refreshInterval?: number
  enabled?: boolean
  onPriceUpdate?: (price: TokenPrice) => void
}

export function useTokenPrice(tokenAddress: string, options: UseTokenPriceOptions = {}) {
  const { refreshInterval = 0, enabled = true, onPriceUpdate } = options
  const [priceHistory, setPriceHistory] = useState<number[]>([])

  // Fetch token price
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tokens.price(tokenAddress),
    queryFn: async () => {
      const response = await apiClient.get<TokenPrice>(`${API_ENDPOINTS.tokens.price}?address=${tokenAddress}`)
      return response
    },
    enabled: enabled && !!tokenAddress,
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined,
  })

  // Update price history when price changes
  useEffect(() => {
    if (data?.price) {
      setPriceHistory((prev) => {
        const newHistory = [...prev, data.price]
        // Keep only the last 30 price points
        return newHistory.slice(-30)
      })

      // Call onPriceUpdate callback if provided
      if (onPriceUpdate) {
        onPriceUpdate(data)
      }
    }
  }, [data, onPriceUpdate])

  return {
    price: data?.price,
    priceChange24h: data?.priceChange24h,
    volume24h: data?.volume24h,
    liquidity: data?.liquidity,
    lastUpdated: data?.lastUpdated,
    priceHistory,
    isLoading,
    error,
    refetch,
  }
}
