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

export const jupiterPerpetuals = new JupiterPerpetualsService()
