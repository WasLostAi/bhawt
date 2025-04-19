// 24H High/Low Breakout Strategy
import type { Connection } from "@solana/web3.js"
import { EventEmitter } from "events"

// Types for the strategy
export interface BreakoutConfig {
  enabled: boolean
  tokenMint: string
  tokenSymbol?: string
  inputAmount: number // In lamports
  breakoutPercentage: number // Percentage above/below high/low to trigger
  takeProfitPercentage: number // Percentage to take profit
  stopLossPercentage: number // Percentage to stop loss
  trailingStopPercentage?: number // Percentage for trailing stop
  cooldownPeriod: number // In milliseconds
  slippage: number // In percentage
}

export interface PricePoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface BreakoutSignal {
  tokenMint: string
  tokenSymbol?: string
  direction: "BUY" | "SELL"
  price: number
  reason: string
  confidence: number // 0-100
  timestamp: number
}

// Mock MetisPriceAPI for development
class MetisPriceAPI {
  constructor(private connection: Connection) {}

  async getOHLCV(tokenMint: string, timeframe: string): Promise<PricePoint[]> {
    // In a real implementation, this would call QuickNode's Metis API
    // For now, we'll return mock data

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate mock OHLCV data
    const now = Date.now()
    const data: PricePoint[] = []

    // Generate 24 hours of hourly data
    for (let i = 24; i >= 0; i--) {
      const basePrice = 0.00001 + Math.random() * 0.00001
      const volatility = 0.1 // 10% volatility

      const open = basePrice * (1 + (Math.random() * volatility * 2 - volatility))
      const close = basePrice * (1 + (Math.random() * volatility * 2 - volatility))
      const high = Math.max(open, close) * (1 + Math.random() * volatility)
      const low = Math.min(open, close) * (1 - Math.random() * volatility)
      const volume = Math.random() * 1000000 + 100000

      data.push({
        time: now - i * 3600000, // hourly data
        open,
        high,
        low,
        close,
        volume,
      })
    }

    return data
  }

  async getPrice(tokenMint: string): Promise<number> {
    // In a real implementation, this would call QuickNode's Metis API
    // For now, we'll return mock data

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Return mock price
    return 0.00001 + Math.random() * 0.000002
  }
}

// Breakout Strategy class
export class BreakoutStrategy extends EventEmitter {
  private last24HL: { high: number; low: number } | null = null
  private metisPriceAPI: MetisPriceAPI
  private isMonitoring = false
  private monitorInterval: NodeJS.Timeout | null = null
  private lastSignalTime = 0

  constructor(
    private connection: Connection,
    private config: BreakoutConfig,
  ) {
    super()
    this.metisPriceAPI = new MetisPriceAPI(connection)
  }

  // Start monitoring for breakouts
  public startMonitoring(): boolean {
    if (this.isMonitoring) return false

    this.isMonitoring = true
    this.monitorInterval = setInterval(() => this.checkForBreakouts(), 15000) // Check every 15 seconds

    // Initial check
    this.checkForBreakouts()

    return true
  }

  // Stop monitoring
  public stopMonitoring(): boolean {
    if (!this.isMonitoring) return false

    this.isMonitoring = false
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
    }

    return true
  }

  // Update configuration
  public updateConfig(config: Partial<BreakoutConfig>): void {
    this.config = { ...this.config, ...config }

    // Reset last 24H high/low if token changes
    if (config.tokenMint && config.tokenMint !== this.config.tokenMint) {
      this.last24HL = null
    }
  }

  // Get current configuration
  public getConfig(): BreakoutConfig {
    return { ...this.config }
  }

  // Check for breakouts
  private async checkForBreakouts(): Promise<void> {
    if (!this.config.enabled || !this.config.tokenMint) return

    try {
      // Get 24H OHLCV data
      const prices = await this.metisPriceAPI.getOHLCV(this.config.tokenMint, "24H")

      // Calculate 24H high/low
      if (!this.last24HL) {
        this.last24HL = {
          high: Math.max(...prices.map((p) => p.high)),
          low: Math.min(...prices.map((p) => p.low)),
        }
        return // First run, just establish baseline
      }

      // Get current price
      const currentPrice = await this.metisPriceAPI.getPrice(this.config.tokenMint)

      // Check for breakout
      const highBreakoutThreshold = this.last24HL.high * (1 + this.config.breakoutPercentage / 100)
      const lowBreakoutThreshold = this.last24HL.low * (1 - this.config.breakoutPercentage / 100)

      // Check cooldown period
      const now = Date.now()
      const cooldownElapsed = now - this.lastSignalTime > this.config.cooldownPeriod

      if (cooldownElapsed) {
        // Check for high breakout
        if (currentPrice >= highBreakoutThreshold) {
          const signal: BreakoutSignal = {
            tokenMint: this.config.tokenMint,
            tokenSymbol: this.config.tokenSymbol,
            direction: "BUY",
            price: currentPrice,
            reason: `24H high breakout: ${currentPrice.toFixed(8)} > ${highBreakoutThreshold.toFixed(8)}`,
            confidence: this.calculateConfidence(currentPrice, highBreakoutThreshold, true),
            timestamp: now,
          }

          this.lastSignalTime = now
          this.emit("signal", signal)
        }
        // Check for low breakout
        else if (currentPrice <= lowBreakoutThreshold) {
          const signal: BreakoutSignal = {
            tokenMint: this.config.tokenMint,
            tokenSymbol: this.config.tokenSymbol,
            direction: "SELL",
            price: currentPrice,
            reason: `24H low breakout: ${currentPrice.toFixed(8)} < ${lowBreakoutThreshold.toFixed(8)}`,
            confidence: this.calculateConfidence(currentPrice, lowBreakoutThreshold, false),
            timestamp: now,
          }

          this.lastSignalTime = now
          this.emit("signal", signal)
        }
      }

      // Update 24H high/low
      this.last24HL = {
        high: Math.max(...prices.map((p) => p.high)),
        low: Math.min(...prices.map((p) => p.low)),
      }
    } catch (error) {
      console.error("Error checking for breakouts:", error)
      this.emit("error", error)
    }
  }

  // Calculate confidence score for a breakout
  private calculateConfidence(currentPrice: number, threshold: number, isHighBreakout: boolean): number {
    // Calculate how far beyond the threshold the price is
    const percentageBeyond = isHighBreakout
      ? ((currentPrice - threshold) / threshold) * 100
      : ((threshold - currentPrice) / threshold) * 100

    // Scale to a confidence score (0-100)
    // More significant breakouts get higher confidence
    const baseConfidence = Math.min(percentageBeyond * 10, 90)

    // Add some randomness for demo purposes
    return Math.min(Math.round(baseConfidence + Math.random() * 10), 100)
  }
}
