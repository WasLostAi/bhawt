// Enhanced Performance Monitoring Service with better metrics and visualization
import { EventEmitter } from "events"
import { ENV } from "@/lib/env"

// Types for performance monitoring
export interface PerformanceMetrics {
  successRate: number // Percentage of successful operations
  averageExecutionTime: number // In milliseconds
  profitFactor: number // Ratio of profitable to unprofitable trades
  totalTrades: number
  profitableTrades: number
  unprofitableTrades: number
  totalProfit: number // In SOL
  largestProfit: number // In SOL
  largestLoss: number // In SOL
  averageProfit: number // In SOL
  averageLoss: number // In SOL
  winRate: number // Percentage of profitable trades
  consecutiveWins: number
  consecutiveLosses: number
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  drawdown: number // Maximum drawdown percentage
  sharpeRatio: number // Risk-adjusted return
  volatility: number // Standard deviation of returns
  dailyStats: DailyStats[]
  strategyPerformance: StrategyPerformance
}

export interface DailyStats {
  date: string // ISO date string
  trades: number
  profit: number
  successRate: number
}

export interface StrategyPerformance {
  [strategy: string]: {
    trades: number
    profit: number
    successRate: number
    averageExecutionTime: number
  }
}

export interface CircuitBreakers {
  maxConsecutiveLosses: number
  maxHourlyLoss: number // Percentage
  minSuccessRate: number // Percentage
  minLiquidity: number // In USD
  maxDrawdown: number // Maximum drawdown percentage
}

export interface TradeResult {
  tokenMint: string
  tokenSymbol?: string
  direction: "BUY" | "SELL"
  amount: number // In lamports
  price: number
  profit?: number // In SOL
  executionTime: number // In milliseconds
  success: boolean
  timestamp: number
  strategy?: string
  error?: string
}

// Performance Monitor class
export class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics
  private circuitBreakers: CircuitBreakers
  private tradeHistory: TradeResult[] = []
  private isEnabled = true
  private hourlyProfitLoss = 0
  private lastHourReset: number = Date.now()
  private dailyProfitLoss: Record<string, number> = {}
  private returns: number[] = [] // Array of percentage returns for volatility calculation

  constructor(circuitBreakers?: Partial<CircuitBreakers>) {
    super()

    // Initialize metrics
    this.metrics = {
      successRate: 100,
      averageExecutionTime: 0,
      profitFactor: 1,
      totalTrades: 0,
      profitableTrades: 0,
      unprofitableTrades: 0,
      totalProfit: 0,
      largestProfit: 0,
      largestLoss: 0,
      averageProfit: 0,
      averageLoss: 0,
      winRate: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      drawdown: 0,
      sharpeRatio: 0,
      volatility: 0,
      dailyStats: [],
      strategyPerformance: {},
    }

    // Initialize circuit breakers with defaults or from environment
    this.circuitBreakers = {
      maxConsecutiveLosses: circuitBreakers?.maxConsecutiveLosses || 3,
      maxHourlyLoss: circuitBreakers?.maxHourlyLoss || 15, // 15%
      minSuccessRate: circuitBreakers?.minSuccessRate || 85, // 85%
      minLiquidity: circuitBreakers?.minLiquidity || Number(ENV.get("MIN_LIQUIDITY_USD", "5000")),
      maxDrawdown: circuitBreakers?.maxDrawdown || 25, // 25%
    }

    // Reset hourly metrics every hour
    setInterval(() => this.resetHourlyMetrics(), 3600000) // 1 hour

    // Reset daily metrics at midnight
    this.scheduleDailyReset()
  }

  // Schedule daily reset at midnight
  private scheduleDailyReset() {
    const now = new Date()
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
      0,
      0,
      0, // midnight
    )
    const msToMidnight = night.getTime() - now.getTime()

    setTimeout(() => {
      this.resetDailyMetrics()
      this.scheduleDailyReset() // Schedule next reset
    }, msToMidnight)
  }

  // Record a trade result
  public recordTrade(result: TradeResult): void {
    this.tradeHistory.push(result)

    // Update metrics
    this.updateMetrics(result)

    // Update daily stats
    this.updateDailyStats(result)

    // Update strategy performance
    this.updateStrategyPerformance(result)

    // Check circuit breakers
    this.checkCircuitBreakers()

    // Emit trade event
    this.emit("trade", result)
  }

  // Get current metrics
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // Get trade history
  public getTradeHistory(limit = 50): TradeResult[] {
    return this.tradeHistory.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  }

  // Get trade history for a specific token
  public getTokenTradeHistory(tokenMint: string, limit = 50): TradeResult[] {
    return this.tradeHistory
      .filter((trade) => trade.tokenMint === tokenMint)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  // Get trade history for a specific strategy
  public getStrategyTradeHistory(strategy: string, limit = 50): TradeResult[] {
    return this.tradeHistory
      .filter((trade) => trade.strategy === strategy)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  // Check if trading is enabled
  public isTradingEnabled(): boolean {
    return this.isEnabled
  }

  // Enable trading
  public enableTrading(): void {
    this.isEnabled = true
    this.emit("trading-enabled")
  }

  // Disable trading
  public disableTrading(reason: string): void {
    this.isEnabled = false
    this.emit("trading-disabled", reason)
  }

  // Update circuit breakers
  public updateCircuitBreakers(circuitBreakers: Partial<CircuitBreakers>): void {
    this.circuitBreakers = { ...this.circuitBreakers, ...circuitBreakers }
    this.emit("circuit-breakers-updated", this.circuitBreakers)
  }

  // Reset metrics
  public resetMetrics(): void {
    this.metrics = {
      successRate: 100,
      averageExecutionTime: 0,
      profitFactor: 1,
      totalTrades: 0,
      profitableTrades: 0,
      unprofitableTrades: 0,
      totalProfit: 0,
      largestProfit: 0,
      largestLoss: 0,
      averageProfit: 0,
      averageLoss: 0,
      winRate: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      drawdown: 0,
      sharpeRatio: 0,
      volatility: 0,
      dailyStats: [],
      strategyPerformance: {},
    }

    this.hourlyProfitLoss = 0
    this.lastHourReset = Date.now()
    this.tradeHistory = []
    this.dailyProfitLoss = {}
    this.returns = []

    this.emit("metrics-reset")
  }

  // Reset hourly metrics
  private resetHourlyMetrics(): void {
    this.hourlyProfitLoss = 0
    this.lastHourReset = Date.now()

    this.emit("hourly-metrics-reset")
  }

  // Reset daily metrics
  private resetDailyMetrics(): void {
    const today = new Date().toISOString().split("T")[0]

    // Save daily stats before resetting
    if (this.dailyProfitLoss[today]) {
      const todayTrades = this.tradeHistory.filter((trade) => {
        const tradeDate = new Date(trade.timestamp).toISOString().split("T")[0]
        return tradeDate === today
      })

      const successfulTrades = todayTrades.filter((trade) => trade.success)

      this.metrics.dailyStats.push({
        date: today,
        trades: todayTrades.length,
        profit: this.dailyProfitLoss[today],
        successRate: todayTrades.length > 0 ? (successfulTrades.length / todayTrades.length) * 100 : 100,
      })
    }

    // Keep only the last 30 days
    if (this.metrics.dailyStats.length > 30) {
      this.metrics.dailyStats = this.metrics.dailyStats.slice(-30)
    }

    // Reset daily profit/loss
    this.dailyProfitLoss = {}

    this.emit("daily-metrics-reset")
  }

  // Update daily stats
  private updateDailyStats(result: TradeResult): void {
    const date = new Date(result.timestamp).toISOString().split("T")[0]

    if (!this.dailyProfitLoss[date]) {
      this.dailyProfitLoss[date] = 0
    }

    if (result.profit !== undefined) {
      this.dailyProfitLoss[date] += result.profit
    }
  }

  // Update strategy performance
  private updateStrategyPerformance(result: TradeResult): void {
    const strategy = result.strategy || "unknown"

    if (!this.metrics.strategyPerformance[strategy]) {
      this.metrics.strategyPerformance[strategy] = {
        trades: 0,
        profit: 0,
        successRate: 100,
        averageExecutionTime: 0,
      }
    }

    const strategyStats = this.metrics.strategyPerformance[strategy]

    // Update strategy stats
    strategyStats.trades++

    if (result.profit !== undefined) {
      strategyStats.profit += result.profit
    }

    const strategyTrades = this.tradeHistory.filter((trade) => trade.strategy === strategy)
    const successfulStrategyTrades = strategyTrades.filter((trade) => trade.success)

    strategyStats.successRate = (successfulStrategyTrades.length / strategyTrades.length) * 100

    // Update average execution time
    const totalExecutionTime = strategyTrades.reduce((sum, trade) => sum + trade.executionTime, 0)
    strategyStats.averageExecutionTime = totalExecutionTime / strategyTrades.length
  }

  // Update metrics based on trade result
  private updateMetrics(result: TradeResult): void {
    const { success, executionTime, profit } = result

    // Update total trades
    this.metrics.totalTrades++

    // Update success rate
    const successCount = this.tradeHistory.filter((t) => t.success).length
    this.metrics.successRate = (successCount / this.metrics.totalTrades) * 100

    // Update average execution time
    const totalExecutionTime = this.tradeHistory.reduce((sum, t) => sum + t.executionTime, 0)
    this.metrics.averageExecutionTime = totalExecutionTime / this.metrics.totalTrades

    // Update profit metrics if profit is provided
    if (profit !== undefined) {
      // Update hourly profit/loss
      this.hourlyProfitLoss += profit

      // Update total profit
      this.metrics.totalProfit += profit

      // Calculate return percentage for volatility
      if (this.metrics.totalProfit > 0) {
        const returnPercentage = (profit / (this.metrics.totalProfit - profit)) * 100
        this.returns.push(returnPercentage)

        // Calculate volatility (standard deviation of returns)
        if (this.returns.length > 1) {
          const mean = this.returns.reduce((sum, r) => sum + r, 0) / this.returns.length
          const squaredDiffs = this.returns.map((r) => Math.pow(r - mean, 2))
          const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / this.returns.length
          this.metrics.volatility = Math.sqrt(variance)
        }
      }

      // Calculate drawdown
      const peak = Math.max(0, ...this.tradeHistory.map((t) => t.profit || 0).filter((p) => p > 0))
      const currentDrawdown = peak > 0 ? ((peak - this.metrics.totalProfit) / peak) * 100 : 0
      this.metrics.drawdown = Math.max(this.metrics.drawdown, currentDrawdown)

      // Calculate Sharpe ratio (simplified)
      const riskFreeRate = 0 // Assume 0% risk-free rate
      const excessReturn = this.metrics.totalProfit - riskFreeRate
      this.metrics.sharpeRatio = this.metrics.volatility > 0 ? excessReturn / this.metrics.volatility : 0

      if (profit > 0) {
        // Profitable trade
        this.metrics.profitableTrades++
        this.metrics.largestProfit = Math.max(this.metrics.largestProfit, profit)

        const totalProfit = this.tradeHistory
          .filter((t) => t.profit !== undefined && t.profit > 0)
          .reduce((sum, t) => sum + (t.profit || 0), 0)
        this.metrics.averageProfit = totalProfit / this.metrics.profitableTrades

        // Update consecutive wins/losses
        this.metrics.consecutiveWins++
        this.metrics.consecutiveLosses = 0
        this.metrics.maxConsecutiveWins = Math.max(this.metrics.maxConsecutiveWins, this.metrics.consecutiveWins)
      } else if (profit < 0) {
        // Unprofitable trade
        this.metrics.unprofitableTrades++
        this.metrics.largestLoss = Math.min(this.metrics.largestLoss, profit)

        const totalLoss = this.tradeHistory
          .filter((t) => t.profit !== undefined && t.profit < 0)
          .reduce((sum, t) => sum + (t.profit || 0), 0)
        this.metrics.averageLoss = totalLoss / this.metrics.unprofitableTrades

        // Update consecutive wins/losses
        this.metrics.consecutiveLosses++
        this.metrics.consecutiveWins = 0
        this.metrics.maxConsecutiveLosses = Math.max(this.metrics.maxConsecutiveLosses, this.metrics.consecutiveLosses)
      }

      // Update win rate
      this.metrics.winRate = (this.metrics.profitableTrades / this.metrics.totalTrades) * 100

      // Update profit factor
      if (this.metrics.unprofitableTrades > 0) {
        const totalProfits = this.tradeHistory
          .filter((t) => t.profit !== undefined && t.profit > 0)
          .reduce((sum, t) => sum + (t.profit || 0), 0)
        const totalLosses = Math.abs(
          this.tradeHistory
            .filter((t) => t.profit !== undefined && t.profit < 0)
            .reduce((sum, t) => sum + (t.profit || 0), 0),
        )

        this.metrics.profitFactor = totalProfits / (totalLosses || 1)
      }
    }
  }

  // Check circuit breakers
  private checkCircuitBreakers(): void {
    if (!this.isEnabled) return

    const { maxConsecutiveLosses, maxHourlyLoss, minSuccessRate, maxDrawdown } = this.circuitBreakers

    // Check consecutive losses
    if (this.metrics.consecutiveLosses >= maxConsecutiveLosses) {
      this.disableTrading(
        `Circuit breaker triggered: ${this.metrics.consecutiveLosses} consecutive losses (max: ${maxConsecutiveLosses})`,
      )
      return
    }

    // Check hourly loss
    if (this.hourlyProfitLoss < 0) {
      const hourlyLossPercentage = (Math.abs(this.hourlyProfitLoss) / this.metrics.totalProfit) * 100
      if (hourlyLossPercentage >= maxHourlyLoss) {
        this.disableTrading(
          `Circuit breaker triggered: ${hourlyLossPercentage.toFixed(2)}% hourly loss (max: ${maxHourlyLoss}%)`,
        )
        return
      }
    }

    // Check success rate
    if (this.metrics.totalTrades >= 10 && this.metrics.successRate < minSuccessRate) {
      this.disableTrading(
        `Circuit breaker triggered: ${this.metrics.successRate.toFixed(2)}% success rate (min: ${minSuccessRate}%)`,
      )
      return
    }

    // Check drawdown
    if (this.metrics.drawdown >= maxDrawdown) {
      this.disableTrading(
        `Circuit breaker triggered: ${this.metrics.drawdown.toFixed(2)}% drawdown (max: ${maxDrawdown}%)`,
      )
      return
    }
  }

  // Get performance summary
  public getPerformanceSummary(): string {
    const m = this.metrics
    return `
Performance Summary:
-------------------
Total Trades: ${m.totalTrades}
Success Rate: ${m.successRate.toFixed(2)}%
Win Rate: ${m.winRate.toFixed(2)}%
Profit Factor: ${m.profitFactor.toFixed(2)}
Total Profit: ${m.totalProfit.toFixed(6)} SOL
Average Execution Time: ${m.averageExecutionTime.toFixed(2)}ms
Max Consecutive Wins: ${m.maxConsecutiveWins}
Max Consecutive Losses: ${m.maxConsecutiveLosses}
Maximum Drawdown: ${m.drawdown.toFixed(2)}%
Sharpe Ratio: ${m.sharpeRatio.toFixed(2)}
Volatility: ${m.volatility.toFixed(2)}%
    `
  }

  // Export performance data to CSV
  public exportToCsv(): string {
    const headers = [
      "Timestamp",
      "Token",
      "Direction",
      "Amount",
      "Price",
      "Profit",
      "Execution Time",
      "Success",
      "Strategy",
      "Error",
    ].join(",")

    const rows = this.tradeHistory.map((trade) =>
      [
        new Date(trade.timestamp).toISOString(),
        trade.tokenSymbol || trade.tokenMint,
        trade.direction,
        trade.amount,
        trade.price,
        trade.profit || "",
        trade.executionTime,
        trade.success,
        trade.strategy || "",
        trade.error || "",
      ].join(","),
    )

    return [headers, ...rows].join("\n")
  }
}

// Export a singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Export types for convenience
export type { PerformanceMetrics, CircuitBreakers, TradeResult, DailyStats, StrategyPerformance }
