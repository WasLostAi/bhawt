// Bollinger Bands Strategy
import type { Connection } from "@solana/web3.js"
import { EventEmitter } from "events"

// Types for the strategy
export interface BollingerBandsConfig {
  enabled: boolean
  tokenMint: string
  tokenSymbol?: string
  inputAmount: number // In lamports
  period: number // Number of periods for calculation
  standardDeviations: number // Number of standard deviations
  entryPercentage: number // Percentage from band to trigger entry
  exitPercentage: number // Percentage from middle band to exit
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

export interface BollingerBandsSignal {
  tokenMint: string
  tokenSymbol?: string
  direction: "BUY" | "SELL"
  price: number
  reason: string
  confidence: number // 0-100
  timestamp: number
  bands: {
    upper: number
    middle: number
    lower: number
  }
}

// Mock MetisPriceAPI for development (same as in breakout-strategy.ts)
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

// Bollinger Bands Strategy class
export class BollingerBandsStrategy extends EventEmitter {
  private metisPriceAPI: MetisPriceAPI
  private isMonitoring = false
  private monitorInterval: NodeJS.Timeout | null = null
  private lastSignalTime = 0
  private lastBands: { upper: number; middle: number; lower: number } | null = null

  constructor(
    private connection: Connection,
    private config: BollingerBandsConfig,
  ) {
    super()
    this.metisPriceAPI = new MetisPriceAPI(connection)
  }

  // Start monitoring
  public startMonitoring(): boolean {
    if (this.isMonitoring) return false

    this.isMonitoring = true
    this.monitorInterval = setInterval(() => this.checkBollingerBands(), 15000) // Check every 15 seconds

    // Initial check
    this.checkBollingerBands()

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
  public updateConfig(config: Partial<BollingerBandsConfig>): void {
    this.config = { ...this.config, ...config }

    // Reset bands if token or period changes
    if (
      (config.tokenMint && config.tokenMint !== this.config.tokenMint) ||
      (config.period && config.period !== this.config.period)
    ) {
      this.lastBands = null
    }
  }

  // Get current configuration
  public getConfig(): BollingerBandsConfig {
    return { ...this.config }
  }

  // Check Bollinger Bands
  private async checkBollingerBands(): Promise<void> {
    if (!this.config.enabled || !this.config.tokenMint) return

    try {
      // Get OHLCV data
      const prices = await this.metisPriceAPI.getOHLCV(this.config.tokenMint, "1H")

      // Calculate Bollinger Bands
      const closePrices = prices.map((p) => p.close)
      const period = Math.min(this.config.period, closePrices.length)
      const recentPrices = closePrices.slice(-period)

      // Calculate middle band (SMA)
      const middleBand = recentPrices.reduce((sum, price) => sum + price, 0) / period

      // Calculate standard deviation
      const squaredDifferences = recentPrices.map((price) => Math.pow(price - middleBand, 2))
      const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / period
      const standardDeviation = Math.sqrt(variance)

      // Calculate upper and lower bands
      const upperBand = middleBand + standardDeviation * this.config.standardDeviations
      const lowerBand = middleBand - standardDeviation * this.config.standardDeviations

      // Get current price
      const currentPrice = await this.metisPriceAPI.getPrice(this.config.tokenMint)

      // Store bands for reference
      this.lastBands = { upper: upperBand, middle: middleBand, lower: lowerBand }

      // Check cooldown period
      const now = Date.now()
      const cooldownElapsed = now - this.lastSignalTime > this.config.cooldownPeriod

      if (cooldownElapsed) {
        // Calculate entry thresholds
        const upperEntryThreshold = upperBand * (1 - this.config.entryPercentage / 100)
        const lowerEntryThreshold = lowerBand * (1 + this.config.entryPercentage / 100)

        // Check for signals
        if (currentPrice >= upperEntryThreshold && currentPrice <= upperBand) {
          // Price approaching upper band - potential sell signal
          const signal: BollingerBandsSignal = {
            tokenMint: this.config.tokenMint,
            tokenSymbol: this.config.tokenSymbol,
            direction: "SELL",
            price: currentPrice,
            reason: `Price approaching upper Bollinger Band: ${currentPrice.toFixed(8)} near ${upperBand.toFixed(8)}`,
            confidence: this.calculateConfidence(currentPrice, upperEntryThreshold, upperBand, true),
            timestamp: now,
            bands: { upper: upperBand, middle: middleBand, lower: lowerBand },
          }

          this.lastSignalTime = now
          this.emit("signal", signal)
        } else if (currentPrice <= lowerEntryThreshold && currentPrice >= lowerBand) {
          // Price approaching lower band - potential buy signal
          const signal: BollingerBandsSignal = {
            tokenMint: this.config.tokenMint,
            tokenSymbol: this.config.tokenSymbol,
            direction: "BUY",
            price: currentPrice,
            reason: `Price approaching lower Bollinger Band: ${currentPrice.toFixed(8)} near ${lowerBand.toFixed(8)}`,
            confidence: this.calculateConfidence(currentPrice, lowerEntryThreshold, lowerBand, false),
            timestamp: now,
            bands: { upper: upperBand, middle: middleBand, lower: lowerBand },
          }

          this.lastSignalTime = now
          this.emit("signal", signal)
        }
        // Check for exit signals
        else if (currentPrice >= middleBand * (1 + this.config.exitPercentage / 100)) {
          // Price above middle band + exit percentage - potential exit for buys
          const signal: BollingerBandsSignal = {
            tokenMint: this.config.tokenMint,
            tokenSymbol: this.config.tokenSymbol,
            direction: "SELL",
            price: currentPrice,
            reason: `Exit signal: Price above middle band + ${this.config.exitPercentage}%`,
            confidence: 80, // High confidence for exit signals
            timestamp: now,
            bands: { upper: upperBand, middle: middleBand, lower: lowerBand },
          }

          this.lastSignalTime = now
          this.emit("signal", signal)
        } else if (currentPrice <= middleBand * (1 - this.config.exitPercentage / 100)) {
          // Price below middle band - exit percentage - potential exit for sells
          const signal: BollingerBandsSignal = {
            tokenMint: this.config.tokenMint,
            tokenSymbol: this.config.tokenSymbol,
            direction: "BUY",
            price: currentPrice,
            reason: `Exit signal: Price below middle band - ${this.config.exitPercentage}%`,
            confidence: 80, // High confidence for exit signals
            timestamp: now,
            bands: { upper: upperBand, middle: middleBand, lower: lowerBand },
          }

          this.lastSignalTime = now
          this.emit("signal", signal)
        }
      }
    } catch (error) {
      console.error("Error checking Bollinger Bands:", error)
      this.emit("error", error)
    }
  }

  // Calculate confidence score
  private calculateConfidence(
    currentPrice: number,
    entryThreshold: number,
    band: number,
    isUpperBand: boolean,
  ): number {
    // Calculate how close to the band the price is
    const distanceToThreshold = isUpperBand
      ? (currentPrice - entryThreshold) / (band - entryThreshold)
      : (entryThreshold - currentPrice) / (entryThreshold - band)

    // Scale to a confidence score (0-100)
    // Closer to the band = higher confidence
    const baseConfidence = Math.min(distanceToThreshold * 100, 90)

    // Add some randomness for demo purposes
    return Math.min(Math.round(baseConfidence + Math.random() * 10), 100)
  }
}
