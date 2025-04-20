import { QueryClient } from "@tanstack/react-query"

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Define query keys for better organization
export const queryKeys = {
  tokens: {
    all: ["tokens"] as const,
    details: (address: string) => ["tokens", address] as const,
    price: (address: string) => ["tokens", address, "price"] as const,
    liquidity: (address: string) => ["tokens", address, "liquidity"] as const,
  },
  pools: {
    all: ["pools"] as const,
    new: ["pools", "new"] as const,
    details: (address: string) => ["pools", address] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    pending: ["transactions", "pending"] as const,
    completed: ["transactions", "completed"] as const,
  },
  whales: {
    all: ["whales"] as const,
    transactions: ["whales", "transactions"] as const,
    wallets: ["whales", "wallets"] as const,
  },
  strategies: {
    all: ["strategies"] as const,
    active: ["strategies", "active"] as const,
    performance: ["strategies", "performance"] as const,
  },
}
