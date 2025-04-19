// Mock implementation of environment variables

class Environment {
  private variables: Record<string, string> = {
    RPC_ENDPOINT: "https://api.mainnet-beta.solana.com",
    QUICKNODE_ENDPOINT: "https://rpc.quicknode.com/solana/mainnet",
    JITO_API_KEY: "jito_api_key_12345abcde",
    JUPITER_API_KEY: "jupiter_api_key_67890fghij",
    DEFAULT_PRIORITY_FEE: "250000",
    MAX_COMPUTE_UNITS: "1400000",
    MAX_ACCOUNTS: "64",
    MIN_LIQUIDITY_USD: "100000",
    MAX_PRICE_IMPACT: "2.5",
    TELEGRAM_BOT_TOKEN: "",
    ENABLE_JITO_BUNDLES: "true",
    ENABLE_PRIORITY_FEES: "true",
    ENABLE_WHALE_TRACKING: "true",
    ENABLE_STRATEGY_MONITOR: "true",
  }

  // Get an environment variable
  get(key: string, defaultValue = ""): string {
    return this.variables[key] || defaultValue
  }

  // Get an environment variable as a number
  getNumber(key: string, defaultValue = 0): number {
    const value = this.get(key, String(defaultValue))
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }

  // Set an environment variable
  set(key: string, value: string): void {
    this.variables[key] = value
  }

  // Check if a feature flag is enabled
  isEnabled(key: string): boolean {
    return this.get(key, "false").toLowerCase() === "true"
  }
}

export const ENV = new Environment()
