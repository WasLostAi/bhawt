// Environment configuration with QuickNode integration

// Default environment variables
const defaultEnv = {
  RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com",
  QUICKNODE_ENDPOINT: process.env.NEXT_PUBLIC_QUICKNODE_ENDPOINT || "",
  // Remove Jupiter API key from client-side environment variables
  DEFAULT_PRIORITY_FEE: process.env.NEXT_PUBLIC_DEFAULT_PRIORITY_FEE || "250000",
  MAX_COMPUTE_UNITS: process.env.NEXT_PUBLIC_MAX_COMPUTE_UNITS || "1400000",
  MAX_ACCOUNTS: process.env.NEXT_PUBLIC_MAX_ACCOUNTS || "64",
  MIN_LIQUIDITY_USD: process.env.NEXT_PUBLIC_MIN_LIQUIDITY_USD || "100000",
  MAX_PRICE_IMPACT: process.env.NEXT_PUBLIC_MAX_PRICE_IMPACT || "2.5",
  ENABLE_JITO_BUNDLES: process.env.NEXT_PUBLIC_ENABLE_JITO_BUNDLES || "false", // Changed to false
  ENABLE_PRIORITY_FEES: process.env.NEXT_PUBLIC_ENABLE_PRIORITY_FEES || "true",
  ENABLE_WHALE_TRACKING: process.env.NEXT_PUBLIC_ENABLE_WHALE_TRACKING || "true",
  ENABLE_STRATEGY_MONITOR: process.env.NEXT_PUBLIC_ENABLE_STRATEGY_MONITOR || "true",
}

// Environment variables stored in memory (for development)
const envStore: Record<string, string> = { ...defaultEnv }

// Environment class for managing environment variables
class Environment {
  // Get an environment variable
  get(key: string, defaultValue = ""): string {
    // First check browser storage for overrides
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(`env_${key}`)
      if (storedValue) return storedValue
    }

    // Then check the env store
    return envStore[key] || defaultValue
  }

  // Get an environment variable as a number
  getNumber(key: string, defaultValue = 0): number {
    const value = this.get(key, String(defaultValue))
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }

  // Set an environment variable
  set(key: string, value: string): void {
    envStore[key] = value

    // Also store in browser storage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem(`env_${key}`, value)
    }
  }

  // Check if a feature flag is enabled
  isEnabled(key: string): boolean {
    return this.get(key, "false").toLowerCase() === "true"
  }

  // Set QuickNode endpoint
  setQuickNodeEndpoint(endpoint: string): void {
    this.set("QUICKNODE_ENDPOINT", endpoint)
    // If no RPC endpoint is set, use QuickNode as the default
    if (!this.get("RPC_ENDPOINT") || this.get("RPC_ENDPOINT") === "https://api.mainnet-beta.solana.com") {
      this.set("RPC_ENDPOINT", endpoint)
    }
  }

  // Get all environment variables
  getAll(): Record<string, string> {
    return { ...envStore }
  }

  // Reset to defaults
  reset(): void {
    Object.keys(defaultEnv).forEach((key) => {
      envStore[key] = defaultEnv[key]
      if (typeof window !== "undefined") {
        localStorage.removeItem(`env_${key}`)
      }
    })
  }
}

export const ENV = new Environment()
