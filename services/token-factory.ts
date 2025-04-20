import { ENV } from "@/lib/env"
import { apiClient, API_ENDPOINTS } from "./api-client"

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  totalSupply: string
  circulatingSupply: string
  holders: number
  price: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  createdAt: number
  verified: boolean
  logoURI?: string
  tags?: string[]
  socials?: {
    website?: string
    twitter?: string
    telegram?: string
    discord?: string
  }
}

export interface TokenLiquidity {
  address: string
  symbol: string
  totalLiquidity: number
  pools: {
    address: string
    dex: string
    liquidity: number
    pair: string
    price: number
  }[]
}

export class TokenFactory {
  private tokenCache: Map<string, TokenInfo>
  private liquidityCache: Map<string, TokenLiquidity>
  private cacheTimeout: number

  constructor() {
    this.tokenCache = new Map()
    this.liquidityCache = new Map()
    this.cacheTimeout = ENV.get("CACHE_TIMEOUT", 60000) // Default 1 minute
  }

  /**
   * Get token information
   * @param address Token address
   * @param forceRefresh Force refresh from API
   * @returns Token information
   */
  async getTokenInfo(address: string, forceRefresh = false): Promise<TokenInfo> {
    // Check cache first
    if (!forceRefresh && this.tokenCache.has(address)) {
      return this.tokenCache.get(address)!
    }

    try {
      const response = await apiClient.get<TokenInfo>(`${API_ENDPOINTS.tokens.info}?address=${address}`)

      // Update cache
      this.tokenCache.set(address, response)

      // Clear cache after timeout
      setTimeout(() => {
        this.tokenCache.delete(address)
      }, this.cacheTimeout)

      return response
    } catch (error) {
      console.error("Error getting token info:", error)
      throw error
    }
  }

  /**
   * Get token liquidity information
   * @param address Token address
   * @param forceRefresh Force refresh from API
   * @returns Token liquidity information
   */
  async getTokenLiquidity(address: string, forceRefresh = false): Promise<TokenLiquidity> {
    // Check cache first
    if (!forceRefresh && this.liquidityCache.has(address)) {
      return this.liquidityCache.get(address)!
    }

    try {
      const response = await apiClient.get<TokenLiquidity>(`${API_ENDPOINTS.tokens.liquidity}?address=${address}`)

      // Update cache
      this.liquidityCache.set(address, response)

      // Clear cache after timeout
      setTimeout(() => {
        this.liquidityCache.delete(address)
      }, this.cacheTimeout)

      return response
    } catch (error) {
      console.error("Error getting token liquidity:", error)
      throw error
    }
  }

  /**
   * Get token price
   * @param address Token address
   * @returns Token price in USD
   */
  async getTokenPrice(address: string): Promise<number> {
    try {
      const response = await apiClient.get<{ price: number }>(`${API_ENDPOINTS.tokens.price}?address=${address}`)
      return response.price
    } catch (error) {
      console.error("Error getting token price:", error)
      throw error
    }
  }

  /**
   * Check if a token is verified
   * @param address Token address
   * @returns True if token is verified
   */
  async isTokenVerified(address: string): Promise<boolean> {
    try {
      const tokenInfo = await this.getTokenInfo(address)
      return tokenInfo.verified
    } catch (error) {
      console.error("Error checking if token is verified:", error)
      return false
    }
  }
}

export const tokenFactory = new TokenFactory()
