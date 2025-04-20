import { tokenFactory } from "@/services/token-factory"
import { tradingEngine } from "@/services/trading-engine"
import { performanceMonitor } from "@/services/performance-monitor"

export interface BreakoutStrategyConfig {
  enabled: boolean
  targetToken: string
  baseToken: string
  amount: string
  breakoutPercentage: number
  confirmationPeriod: number
  stopLoss: number
  takeProfit: number
  maxExecutions: number
}

export class BreakoutStrategy {
  private config: BreakoutStrategyConfig
  private priceHistory: number[]
  private lastExecutionTime: number
  private executionCount: number
  private strategyId: string
  private isRunning: boolean
  private interval: NodeJS.Timeout | null

  constructor(config: BreakoutStrategyConfig) {
    this.config = config
    this.priceHistory = []
    this.lastExecutionTime = 0
    this.executionCount = 0
    this.strategyId = `breakout_${Date.now()}`
    this.isRunning = false
    this.interval = null

    // Register strategy with performance monitor
    performanceMonitor.registerStrategy(this.strategyId, "Breakout Strategy")
  }

  /**
   * Start the strategy
   */
  start(): void {
    if (this.isRunning || !this.config.enabled) {
      return
    }

    this.isRunning = true

    // Start monitoring price
    this.interval = setInterval(() => this.monitor(), 10000) // Check every 10 seconds

    console.log(`Breakout strategy started for ${this.config.targetToken}`)
  }

  /**
   * Stop the strategy
   */
  stop(): void {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false

    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }

    console.log(`Breakout strategy stopped for ${this.config.targetToken}`)
  }

  /**
   * Monitor price for breakout
   */
  private async monitor(): Promise<void> {
    try {
      // Get current price
      const currentPrice = await tokenFactory.getTokenPrice(this.config.targetToken)

      // Add to price history
      this.priceHistory.push(currentPrice)

      // Keep only the last 100 price points
      if (this.priceHistory.length > 100) {
        this.priceHistory.shift()
      }

      // Need at least 10 price points to detect breakout
      if (this.priceHistory.length < 10) {
        return
      }

      // Check for breakout
      const breakout = this.detectBreakout()

      if (breakout) {
        await this.executeBreakoutTrade()
      }
    } catch (error) {
      console.error("Error in breakout strategy monitor:", error)
    }
  }

  /**
   * Detect if a breakout has occurred
   * @returns True if breakout detected
   */
  private detectBreakout(): boolean {
    // Need enough price history
    if (this.priceHistory.length < 10) {
      return false
    }

    // Calculate moving average
    const ma20 = this.calculateMA(20)

    // Get current price
    const currentPrice = this.priceHistory[this.priceHistory.length - 1]

    // Calculate percentage change from MA
    const percentageChange = ((currentPrice - ma20) / ma20) * 100

    // Check if we have a breakout
    return percentageChange > this.config.breakoutPercentage
  }

  /**
   * Calculate moving average
   * @param period Period for MA
   * @returns Moving average value
   */
  private calculateMA(period: number): number {
    if (this.priceHistory.length < period) {
      return this.priceHistory[this.priceHistory.length - 1]
    }

    const prices = this.priceHistory.slice(-period)
    const sum = prices.reduce((total, price) => total + price, 0)
    return sum / period
  }

  /**
   * Execute a trade based on breakout
   */
  private async executeBreakoutTrade(): Promise<void> {
    // Check if we've reached max executions
    if (this.executionCount >= this.config.maxExecutions) {
      return
    }

    // Check if enough time has passed since last execution
    const now = Date.now()
    if (now - this.lastExecutionTime < this.config.confirmationPeriod) {
      return
    }

    // Execute trade
    const startTime = Date.now()

    try {
      const tradeResult = await tradingEngine.executeTrade({
        inputMint: this.config.baseToken,
        outputMint: this.config.targetToken,
        amount: this.config.amount,
        userPublicKey: "DUMMY_PUBLIC_KEY", // This would be replaced with actual wallet
      })

      const executionTime = Date.now() - startTime

      // Record performance
      performanceMonitor.recordTrade(
        tradeResult.success,
        executionTime,
        tradeResult.success ? Number.parseFloat(tradeResult.outputAmount) : 0,
        this.strategyId,
      )

      // Update execution count and time
      this.executionCount++
      this.lastExecutionTime = now

      console.log(`Breakout strategy executed trade: ${tradeResult.success ? "Success" : "Failed"}`)
    } catch (error) {
      console.error("Error executing breakout trade:", error)

      // Record failed trade
      performanceMonitor.recordTrade(false, Date.now() - startTime, 0, this.strategyId)
    }
  }

  /**
   * Update strategy configuration
   * @param config New configuration
   */
  updateConfig(config: Partial<BreakoutStrategyConfig>): void {
    this.config = { ...this.config, ...config }

    // Restart if running and enabled
    if (this.isRunning) {
      this.stop()
      if (this.config.enabled) {
        this.start()
      }
    } else if (this.config.enabled) {
      this.start()
    }
  }

  /**
   * Get strategy status
   * @returns Strategy status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      executionCount: this.executionCount,
      lastExecutionTime: this.lastExecutionTime,
      config: this.config,
      performance: performanceMonitor.getStrategyPerformance(this.strategyId),
    }
  }
}
