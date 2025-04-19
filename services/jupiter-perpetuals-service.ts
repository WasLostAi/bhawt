// Mock implementation of the Jupiter perpetuals service

interface Market {
  marketAddress: string
  baseSymbol: string
  quoteSymbol: string
  oraclePrice: number
  markPrice: number
  fundingRate: number
  volume24h: number
  openInterest: number
  maxLeverage: number
}

// Define the type that matches what fetchPerpMarkets returns
export interface PerpMarket {
  symbol: string
  markPrice: number
  indexPrice: number
  fundingRate: number
  volume24h: number
  openInterest: number
}

class JupiterPerpetualsService {
  private markets: Market[] = [
    {
      marketAddress: "SOL-PERP-MARKET",
      baseSymbol: "SOL",
      quoteSymbol: "USDC",
      oraclePrice: 148.25,
      markPrice: 146.75,
      fundingRate: 0.0012,
      volume24h: 125000000,
      openInterest: 45000000,
      maxLeverage: 10,
    },
    {
      marketAddress: "BTC-PERP-MARKET",
      baseSymbol: "BTC",
      quoteSymbol: "USDC",
      oraclePrice: 62450,
      markPrice: 63100,
      fundingRate: -0.0015,
      volume24h: 450000000,
      openInterest: 180000000,
      maxLeverage: 10,
    },
    {
      marketAddress: "ETH-PERP-MARKET",
      baseSymbol: "ETH",
      quoteSymbol: "USDC",
      oraclePrice: 3450,
      markPrice: 3425,
      fundingRate: 0.0008,
      volume24h: 250000000,
      openInterest: 95000000,
      maxLeverage: 10,
    },
  ]

  // Get all markets
  async getMarkets(): Promise<Market[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.markets)
      }, 500)
    })
  }

  // Get price difference between spot and perp for a symbol
  async getPriceDifference(
    symbol: string,
  ): Promise<{ spotPrice: number; perpPrice: number; percentDifference: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const market = this.markets.find((m) => m.baseSymbol === symbol)
        if (market) {
          const spotPrice = market.oraclePrice
          const perpPrice = market.markPrice
          const percentDifference = ((spotPrice - perpPrice) / spotPrice) * 100

          // Add some random variation
          const randomVariation = Math.random() * 0.4 - 0.2 // -0.2 to 0.2

          resolve({
            spotPrice,
            perpPrice,
            percentDifference: percentDifference + randomVariation,
          })
        } else {
          resolve({
            spotPrice: 0,
            perpPrice: 0,
            percentDifference: 0,
          })
        }
      }, 300)
    })
  }
}

// Export the service instance for direct method access
export const jupiterPerpetuals = new JupiterPerpetualsService()

// Mock data for development purposes
const MOCK_PERP_MARKETS: PerpMarket[] = [
  {
    symbol: "SOL",
    markPrice: 148.32,
    indexPrice: 148.15,
    fundingRate: 0.0001,
    volume24h: 12500000,
    openInterest: 45000000,
  },
  {
    symbol: "BTC",
    markPrice: 62450.75,
    indexPrice: 62475.25,
    fundingRate: -0.0002,
    volume24h: 98700000,
    openInterest: 345000000,
  },
  {
    symbol: "ETH",
    markPrice: 3245.5,
    indexPrice: 3242.75,
    fundingRate: 0.00005,
    volume24h: 45600000,
    openInterest: 178000000,
  },
  {
    symbol: "BONK",
    markPrice: 0.00002145,
    indexPrice: 0.00002138,
    fundingRate: 0.0003,
    volume24h: 3400000,
    openInterest: 12000000,
  },
  {
    symbol: "JTO",
    markPrice: 3.87,
    indexPrice: 3.85,
    fundingRate: 0.0001,
    volume24h: 5600000,
    openInterest: 18000000,
  },
  {
    symbol: "JUP",
    markPrice: 0.78,
    indexPrice: 0.775,
    fundingRate: 0.00015,
    volume24h: 7800000,
    openInterest: 25000000,
  },
]

// Mock spot prices for development
const MOCK_SPOT_PRICES: Record<string, number> = {
  SOL: 147.85,
  BTC: 62510.25,
  ETH: 3238.75,
  BONK: 0.00002165,
  JTO: 3.82,
  JUP: 0.785,
}

/**
 * Fetches perpetual markets data
 * @returns Array of perpetual market data
 */
export async function fetchPerpMarkets(): Promise<PerpMarket[]> {
  // In a real implementation, this would call the Jupiter Perpetuals API
  // For now, we'll return mock data with a simulated delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Add some random variation to prices
  return MOCK_PERP_MARKETS.map((market) => ({
    ...market,
    markPrice: market.markPrice * (1 + (Math.random() * 0.01 - 0.005)), // ±0.5% random variation
  }))
}

/**
 * Fetches spot price for a given token
 * @param token Token symbol
 * @returns Spot price
 */
export async function fetchSpotPrice(token: string): Promise<number> {
  // In a real implementation, this would call the Jupiter API
  // For now, we'll return mock data with a simulated delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const basePrice = MOCK_SPOT_PRICES[token] || 0
  // Add some random variation
  return basePrice * (1 + (Math.random() * 0.01 - 0.005)) // ±0.5% random variation
}

/**
 * Executes a perpetual arbitrage trade
 * @param token Token to trade
 * @param size Position size in USD
 * @param direction 'long' or 'short'
 * @returns Transaction result
 */
export async function executePerpArbitrage(
  token: string,
  size: number,
  direction: "long" | "short",
): Promise<{
  success: boolean
  txId: string
  executedSize: number
  executedPrice: number
  fee: number
}> {
  // In a real implementation, this would execute trades via Jupiter APIs
  // For now, we'll simulate a successful trade
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    txId: `mock-tx-${Math.random().toString(36).substring(2, 15)}`,
    executedSize: size,
    executedPrice:
      direction === "long"
        ? MOCK_SPOT_PRICES[token] * 1.001
        : // Slight slippage for long
          MOCK_SPOT_PRICES[token] * 0.999, // Slight slippage for short
    fee: size * 0.0005, // 5 bps fee
  }
}

/**
 * Closes a perpetual position
 * @param positionId Position ID
 * @returns Close position result
 */
export async function closePerpPosition(positionId: string): Promise<{
  success: boolean
  txId: string
  pnl: number
  fee: number
}> {
  // In a real implementation, this would close a position via Jupiter APIs
  // For now, we'll simulate a successful close
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    success: true,
    txId: `mock-close-tx-${Math.random().toString(36).substring(2, 15)}`,
    pnl: (Math.random() * 2 - 1) * 0.05, // Random PnL between -5% and +5%
    fee: 0.0005, // 5 bps fee
  }
}
