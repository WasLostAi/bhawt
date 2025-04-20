"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient, API_ENDPOINTS } from "@/services/api-client"
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

export function useTokenList(options: UseTokenListOptions = {}) {
  const { onlyVerified = true, includeUnknown = false, filterByTag, searchQuery } = options
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([])

  // Fetch token list from Jupiter API
  const {
    data: tokenList,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.tokens.all,
    queryFn: async () => {
      const response = await apiClient.get<TokenList>(API_ENDPOINTS.jupiter.tokens)
      return response
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
      filtered = filtered.filter((token) => !token.tags?.includes("unverified"))
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
