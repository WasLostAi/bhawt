"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  tags?: string[]
  extensions?: Record<string, any>
}

export interface TokenList {
  name: string
  logoURI?: string
  keywords?: string[]
  tags?: Record<string, { name: string; description: string }>
  timestamp: string
  tokens: Token[]
}

export interface UseTokenListOptions {
  onlyVerified?: boolean
  includeUnknown?: boolean
  filterByTag?: string
  searchQuery?: string
}

// Mock token data
const mockTokens: Token[] = [
  {
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    tags: ["verified"],
  },
  {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    tags: ["verified", "stablecoin"],
  },
  {
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    tags: ["verified", "stablecoin"],
  },
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    tags: ["verified", "meme"],
  },
  {
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    symbol: "WIF",
    name: "Dogwifhat",
    decimals: 6,
    tags: ["verified", "meme"],
  },
  {
    address: "7kbnb9z9PJVt9wUVe6TzJez3eSVP7dZEL9h6Gqh3zHAE",
    symbol: "JTO",
    name: "Jito",
    decimals: 9,
    tags: ["verified"],
  },
  {
    address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    symbol: "JUP",
    name: "Jupiter",
    decimals: 6,
    tags: ["verified"],
  },
  {
    address: "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1",
    symbol: "BOME",
    name: "Book of Meme",
    decimals: 6,
    tags: ["verified", "meme"],
  },
  {
    address: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    symbol: "mSOL",
    name: "Marinade staked SOL",
    decimals: 9,
    tags: ["verified", "lsd"],
  },
  {
    address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    symbol: "ETH",
    name: "Ethereum (Wormhole)",
    decimals: 8,
    tags: ["verified", "wormhole"],
  },
  {
    address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    symbol: "RAY",
    name: "Raydium",
    decimals: 6,
    tags: ["verified"],
  },
  {
    address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    symbol: "ORCA",
    name: "Orca",
    decimals: 6,
    tags: ["verified"],
  },
]

export function useTokenList(options: UseTokenListOptions = {}) {
  const { onlyVerified = true, includeUnknown = false, filterByTag, searchQuery } = options
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([])

  // Use mock data instead of API call
  const {
    data: tokenList,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.tokens.all,
    queryFn: async () => {
      // Return mock token list
      return {
        name: "Mock Token List",
        timestamp: new Date().toISOString(),
        tokens: mockTokens,
      } as TokenList
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  // Filter tokens based on options
  useEffect(() => {
    if (!tokenList?.tokens) {
      setFilteredTokens([])
      return
    }

    let filtered = [...tokenList.tokens]

    // Filter by verified status
    if (onlyVerified) {
      filtered = filtered.filter((token) => token.tags?.includes("verified"))
    }

    // Filter by tag
    if (filterByTag) {
      filtered = filtered.filter((token) => token.tags?.includes(filterByTag))
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (token) =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.address.toLowerCase() === query,
      )
    }

    // Include unknown tokens
    if (!includeUnknown) {
      filtered = filtered.filter((token) => token.symbol !== "???")
    }

    setFilteredTokens(filtered)
  }, [tokenList, onlyVerified, includeUnknown, filterByTag, searchQuery])

  return {
    tokens: filteredTokens,
    allTokens: tokenList?.tokens || [],
    isLoading,
    error,
    refetch,
  }
}
