"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
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

// Mock price data for common tokens
const mockPrices: Record<string, number> = {
  So11111111111111111111111111111111111111112: 150.25, // SOL
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 1.0, // USDC
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: 1.0, // USDT
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: 0.00001234, // BONK
  EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm: 0.00045678, // WIF
  "7kbnb9z9PJVt9wUVe6TzJez3eSVP7dZEL9h6Gqh3zHAE": 2.34, // JTO
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: 1.23, // JUP
  bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1: 0.00002345, // BOME
  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: 165.75, // mSOL
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": 3500.5, // ETH
}

export function useTokenPrice(tokenAddress: string, options: UseTokenPriceOptions = {}) {
  const { refreshInterval = 0, enabled = true, onPriceUpdate } = options
  const [priceHistory, setPriceHistory] = useState<number[]>([])

  // Use mock data instead of API call
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tokens.price(tokenAddress),
    queryFn: async () => {
      // Generate a random price if the token is not in our mock data
      const basePrice = mockPrices[tokenAddress] || (Math.random() * 10).toFixed(6)

      // Add some randomness to simulate price changes
      const randomFactor = 0.98 + Math.random() * 0.04 // Random between 0.98 and 1.02
      const price = basePrice * randomFactor

      // Generate random data for other fields
      const priceChange24h = Math.random() * 10 - 5 // Random between -5% and 5%
      const volume24h = Math.random() * 1000000 + 100000 // Random volume
      const liquidity = Math.random() * 5000000 + 500000 // Random liquidity

      return {
        address: tokenAddress,
        price,
        priceChange24h,
        volume24h,
        liquidity,
        lastUpdated: Date.now(),
      } as TokenPrice
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
