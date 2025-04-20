import { ENV } from "@/lib/env"
import { apiClient, API_ENDPOINTS } from "./api-client"

export interface JupiterQuoteParams {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps?: number
  onlyDirectRoutes?: boolean
  asLegacyTransaction?: boolean
  maxAccounts?: number
}

export interface JupiterSwapParams extends JupiterQuoteParams {
  userPublicKey: string
  priorityFee?: number
}

export interface JupiterQuoteResponse {
  inputMint: string
  outputMint: string
  inAmount: string
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

export interface JupiterSwapResponse {
  swapTransaction: string
  lastValidBlockHeight: number
  priorityFeeEstimate?: number
}

export interface JupiterToken {
  address: string
  chainId: number
  decimals: number
  name: string
  symbol: string
  logoURI?: string
  tags?: string[]
  extensions?: Record<string, any>
}

export interface JupiterMarket {
  id: string
  inAmount: string
  outAmount: string
  lpFee: {
    amount: string
    mint: string
  }
  platformFee: {
    amount: string
    mint: string
  }
  inputMint: string
  outputMint: string
  notEnoughLiquidity: boolean
  priceImpactPct: string
}

export class JupiterService {
  private apiKey: string
  private maxPriceImpact: number
  private minLiquidityUsd: number
  private defaultPriorityFee: number
  private maxComputeUnits: number

  constructor() {
    this.apiKey = ENV.get("JUPITER_API_KEY", "")
    this.maxPriceImpact = ENV.get("NEXT_PUBLIC_MAX_PRICE_IMPACT", 5) // Default 5%
    this.minLiquidityUsd = ENV.get("NEXT_PUBLIC_MIN_LIQUIDITY_USD", 10000) // Default $10,000
    this.defaultPriorityFee = ENV.get("NEXT_PUBLIC_DEFAULT_PRIORITY_FEE", 100000) // Default 0.0001 SOL
    this.maxComputeUnits = ENV.get("NEXT_PUBLIC_MAX_COMPUTE_UNITS", 1400000) // Default 1.4M CU
  }

  /**
   * Get a quote for a swap
   * @param params Quote parameters
   * @returns Quote response
   */
  async getQuote(params: JupiterQuoteParams): Promise<JupiterQuoteResponse> {
    try {
      const response = await apiClient.post<JupiterQuoteResponse>(API_ENDPOINTS.jupiter.quote, {
        ...params,
        slippageBps: params.slippageBps || 50, // Default 0.5%
        onlyDirectRoutes: params.onlyDirectRoutes || false,
        asLegacyTransaction: params.asLegacyTransaction || false,
        maxAccounts: params.maxAccounts || ENV.get("NEXT_PUBLIC_MAX_ACCOUNTS", 64),
      })

      // Check price impact
      const priceImpact = Number.parseFloat(response.priceImpactPct) * 100
      if (priceImpact > this.maxPriceImpact) {
        throw new Error(`Price impact too high: ${priceImpact.toFixed(2)}%`)
      }

      return response
    } catch (error) {
      console.error("Error getting Jupiter quote:", error)
      throw error
    }
  }

  /**
   * Create a swap transaction
   * @param params Swap parameters
   * @returns Swap transaction
   */
  async createSwap(params: JupiterSwapParams): Promise<JupiterSwapResponse> {
    try {
      const response = await apiClient.post<JupiterSwapResponse>(API_ENDPOINTS.jupiter.swap, {
        ...params,
        slippageBps: params.slippageBps || 50, // Default 0.5%
        priorityFee: params.priorityFee || this.defaultPriorityFee,
        maxAccounts: params.maxAccounts || ENV.get("NEXT_PUBLIC_MAX_ACCOUNTS", 64),
      })

      return response
    } catch (error) {
      console.error("Error creating Jupiter swap:", error)
      throw error
    }
  }

  /**
   * Get all tokens supported by Jupiter
   * @returns List of tokens
   */
  async getTokens(): Promise<JupiterToken[]> {
    try {
      const response = await apiClient.get<{ tokens: JupiterToken[] }>(API_ENDPOINTS.jupiter.tokens)
      return response.tokens
    } catch (error) {
      console.error("Error getting Jupiter tokens:", error)
      throw error
    }
  }

  /**
   * Get markets for a token pair
   * @param inputMint Input token mint address
   * @param outputMint Output token mint address
   * @returns List of markets
   */
  async getMarkets(inputMint: string, outputMint: string): Promise<JupiterMarket[]> {
    try {
      const response = await apiClient.get<{ markets: JupiterMarket[] }>(
        `${API_ENDPOINTS.jupiter.markets}?inputMint=${inputMint}&outputMint=${outputMint}`,
      )

      // Filter out markets with not enough liquidity
      return response.markets.filter((market) => !market.notEnoughLiquidity)
    } catch (error) {
      console.error("Error getting Jupiter markets:", error)
      throw error
    }
  }
}

export const jupiterService = new JupiterService()
