import { tokenFactory } from "@/services/token-factory"
import { tradingEngine } from "@/services/trading-engine"
import { performanceMonitor } from "@/services/performance-monitor"

export interface BollingerBandsStrategyConfig {
  enabled: boolean
  targetToken: string
  baseToken: string
  amount: string
  period: number
  standardDeviations: number
  stopLoss: number
  takeProfit: number
  maxExecutions: number
}

export class BollingerBandsStrategy {
  private config: BollingerBandsStrategyConfig
  private priceHistory: number[]
  private lastExecutionTime: number
  private executionCount: number
  private strategyId: string
  private isRunning: boolean
  private interval: NodeJS.Timeout | null
  private position: {
    inPosition: boolean
    entryPrice: number
    amount: number
  }

  constructor(config: BollingerBandsStrategyConfig) {
    this.config = config
    this.priceHistory = []
    this.lastExecutionTime = 0
    this.executionCount = 0
    this.strategyId = `bollinger_${Date.now()}`
    this.isRunning = false
    this.interval = null
    this.position = {
      inPosition: false,
      entryPrice: 0,
      amount: 0,
    }

    // Register strategy with performance monitor
    performanceMonitor.registerStrategy(this.strategyId, "Bollinger Bands Strategy")
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

    console.log(`Bollinger Bands strategy started for ${this.config.targetToken}`)
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

    console.log(`Bollinger Bands strategy stopped for ${this.config.targetToken}`)
  }

  /**
   * Monitor price for Bollinger Bands signals
   */
  private async monitor(): Promise<void> {
    try {
      // Get current price
      const currentPrice = await tokenFactory.getTokenPrice(this.config.targetToken)

      // Add to price history
      this.priceHistory.push(currentPrice)

      // Keep only the necessary price points
      if (this.priceHistory.length > this.config.period * 2) {
        this.priceHistory.shift()
      }

      // Need at least 'period' price points to calculate Bollinger Bands
      if (this.priceHistory.length < this.config.period) {
        return
      }

      // Calculate Bollinger Bands
      const { middle, upper, lower } = this.calculateBollingerBands()

      // Check for signals
      if (!this.position.inPosition) {
        // Look for buy signal (price below lower band)
        if (currentPrice < lower) {
          await this.executeBuyTrade(currentPrice)
        }
      } else {
        // Check for take profit or stop loss
        const profitLoss = ((currentPrice - this.position.entryPrice) / this.position.entryPrice) * 100

        if (profitLoss >= this.config.takeProfit || profitLoss <= -this.config.stopLoss || currentPrice > upper) {
          await this.executeSellTrade(currentPrice, profitLoss)
        }
      }
    } catch (error) {
      console.error("Error in Bollinger Bands strategy monitor:", error)
    }
  }

  /**
   * Calculate Bollinger Bands
   * @returns Object with middle, upper, and lower bands
   */
  private calculateBollingerBands(): { middle: number; upper: number; lower: number } {
    // Calculate simple moving average (middle band)
    const prices = this.priceHistory.slice(-this.config.period)
    const sum = prices.reduce((total, price) => total + price, 0)
    const sma = sum / this.config.period

    // Calculate standard deviation
    const squaredDifferences = prices.map((price) => Math.pow(price - sma, 2))
    const sumSquaredDiff = squaredDifferences.reduce((total, diff) => total + diff, 0)
    const standardDeviation = Math.sqrt(sumSquaredDiff / this.config.period)

    // Calculate bands
    const upper = sma + standardDeviation * this.config.standardDeviations
    const lower = sma - standardDeviation * this.config.standardDeviations

    return {
      middle: sma,
      upper,
      lower,
    }
  }

  /**
   * Execute a buy trade
   * @param currentPrice Current token price
   */
  private async executeBuyTrade(currentPrice: number): Promise<void> {
    // Check if we've reached max executions
    if (this.executionCount >= this.config.maxExecutions) {
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

      if (tradeResult.success) {
        // Update position
        this.position = {
          inPosition: true,
          entryPrice: currentPrice,
          amount: Number.parseFloat(tradeResult.outputAmount),
        }

        // Record performance
        performanceMonitor.recordTrade(
          true,
          executionTime,
          0, // Profit/loss will be calculated on sell
          this.strategyId,
        )
      } else {
        // Record failed trade
        performanceMonitor.recordTrade(false, executionTime, 0, this.strategyId)
      }

      // Update execution count and time
      this.executionCount++
      this.lastExecutionTime = Date.now()

      console.log(`Bollinger Bands strategy executed buy: ${tradeResult.success ? "Success" : "Failed"}`)
    } catch (error) {
      console.error("Error executing Bollinger Bands buy trade:", error)

      // Record failed trade
      performanceMonitor.recordTrade(false, Date.now() - startTime, 0, this.strategyId)
    }
  }

  /**
   * Execute a sell trade
   * @param currentPrice Current token price
   * @param profitLoss Profit/loss percentage
   */
  private async executeSellTrade(currentPrice: number, profitLoss: number): Promise<void> {
    // Execute trade
    const startTime = Date.now()

    try {
      const tradeResult = await tradingEngine.executeTrade({
        inputMint: this.config.targetToken,
        outputMint: this.config.baseToken,
        amount: this.position.amount.toString(),
        userPublicKey: "DUMMY_PUBLIC_KEY", // This would be replaced with actual wallet
      })

      const executionTime = Date.now() - startTime

      // Calculate profit/loss in base token
      const profit = (profitLoss * Number.parseFloat(this.config.amount)) / 100

      // Record performance
      performanceMonitor.recordTrade(
        tradeResult.success,
        executionTime,
        tradeResult.success ? profit : 0,
        this.strategyId,
      )

      // Reset position
      this.position = {
        inPosition: false,
        entryPrice: 0,
        amount: 0,
      }

      // Update execution time
      this.lastExecutionTime = Date.now()

      console.log(`Bollinger Bands strategy executed sell: ${tradeResult.success ? "Success" : "Failed"}`)
    } catch (error) {
      console.error("Error executing Bollinger Bands sell trade:", error)

      // Record failed trade
      performanceMonitor.recordTrade(false, Date.now() - startTime, 0, this.strategyId)
    }
  }

  /**
   * Update strategy configuration
   * @param config New configuration
   */
  updateConfig(config: Partial<BollingerBandsStrategyConfig>): void {
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
      inPosition: this.position.inPosition,
      entryPrice: this.position.entryPrice,
      config: this.config,
      performance: performanceMonitor.getStrategyPerformance(this.strategyId),
    }
  }
}
