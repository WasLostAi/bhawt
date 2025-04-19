// Mock implementation of the perpetual arbitrage strategy

interface ArbitrageOpportunity {
  baseSymbol: string
  direction: "long" | "short"
  spotPrice: number
  perpPrice: number
  spreadPercentage: number
  fundingRate: number
  estimatedProfitPerDay: number
}

interface ActiveArbitrage {
  id: string
  opportunity: ArbitrageOpportunity
  entryTime: number
  perpPositionSize: number
  status: "open" | "closing" | "closed" | "failed"
  pnl?: number
}

interface StrategyConfig {
  minSpreadPercentage: number
  maxSpreadPercentage: number
  baseSymbols: string[]
  tradeSize: number
  leverage: number
  checkInterval: number
  maxActiveArbitrages: number
  safetyChecks: boolean
  enabled: boolean
}

class PerpetualArbitrageStrategy {
  private activeArbitrages: Map<string, ActiveArbitrage> = new Map()
  private recentOpportunities: ArbitrageOpportunity[] = []
  private config: StrategyConfig = {
    minSpreadPercentage: 0.5,
    maxSpreadPercentage: 5.0,
    baseSymbols: ["SOL", "BTC", "ETH"],
    tradeSize: 100,
    leverage: 3,
    checkInterval: 30000,
    maxActiveArbitrages: 3,
    safetyChecks: true,
    enabled: false,
  }
  private isRunning = false

  constructor() {
    // Initialize with some mock data
    this.recentOpportunities = [
      {
        baseSymbol: "SOL",
        direction: "long",
        spotPrice: 148.25,
        perpPrice: 146.75,
        spreadPercentage: 1.02,
        fundingRate: 0.0012,
        estimatedProfitPerDay: 1.45,
      },
      {
        baseSymbol: "BTC",
        direction: "short",
        spotPrice: 62450,
        perpPrice: 63100,
        spreadPercentage: -1.04,
        fundingRate: -0.0015,
        estimatedProfitPerDay: 1.62,
      },
    ]

    // Add a mock active arbitrage
    this.addActiveArbitrage({
      id: `arb-${Date.now() - 300000}`,
      opportunity: this.recentOpportunities[0],
      entryTime: Date.now() - 300000,
      perpPositionSize: 0.67,
      status: "open",
      pnl: 2.35,
    })
  }

  // Get all active arbitrages
  getActiveArbitrages(): Map<string, ActiveArbitrage> {
    return this.activeArbitrages
  }

  // Get recent opportunities
  getRecentOpportunities(): ArbitrageOpportunity[] {
    return this.recentOpportunities
  }

  // Add a new active arbitrage
  addActiveArbitrage(arbitrage: ActiveArbitrage): void {
    this.activeArbitrages.set(arbitrage.id, arbitrage)
  }

  // Update arbitrage status
  updateArbitrageStatus(arbitrageId: string, status: "open" | "closing" | "closed" | "failed"): void {
    const arbitrage = this.activeArbitrages.get(arbitrageId)
    if (arbitrage) {
      arbitrage.status = status

      // If closed, calculate final PnL
      if (status === "closed") {
        arbitrage.pnl = Math.random() * 10 - 2 // Random PnL between -2 and 8
      }
    }
  }

  // Get configuration
  getConfig(): StrategyConfig {
    return this.config
  }

  // Update configuration
  updateConfig(config: Partial<StrategyConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Start the strategy
  start(): boolean {
    this.isRunning = true
    return true
  }

  // Stop the strategy
  stop(): void {
    this.isRunning = false
  }

  // Check if the strategy is running
  isActive(): boolean {
    return this.isRunning
  }
}

export const perpetualArbitrageStrategy = new PerpetualArbitrageStrategy()
