export interface PerformanceMetrics {
  successRate: number
  avgExecutionTime: number
  profitLoss: number
  totalTrades: number
  successfulTrades: number
  failedTrades: number
}

export interface StrategyPerformance extends PerformanceMetrics {
  strategyId: string
  strategyName: string
  roi: number
  winLossRatio: number
}

export class PerformanceMonitor {
  private metrics: {
    executionTimes: number[]
    profits: number[]
    successfulTrades: number
    failedTrades: number
    strategyPerformance: Record<string, StrategyPerformance>
  }

  constructor() {
    this.metrics = {
      executionTimes: [],
      profits: [],
      successfulTrades: 0,
      failedTrades: 0,
      strategyPerformance: {},
    }
  }

  /**
   * Record a trade execution
   * @param success Whether the trade was successful
   * @param executionTime Time taken to execute the trade in ms
   * @param profit Profit/loss from the trade (can be negative)
   * @param strategyId Optional strategy ID if the trade was executed by a strategy
   */
  recordTrade(success: boolean, executionTime: number, profit: number, strategyId?: string): void {
    // Record execution time
    this.metrics.executionTimes.push(executionTime)

    // Record profit/loss
    this.metrics.profits.push(profit)

    // Update success/failure count
    if (success) {
      this.metrics.successfulTrades++
    } else {
      this.metrics.failedTrades++
    }

    // Update strategy performance if applicable
    if (strategyId && this.metrics.strategyPerformance[strategyId]) {
      const strategy = this.metrics.strategyPerformance[strategyId]

      strategy.totalTrades++
      if (success) {
        strategy.successfulTrades++
      } else {
        strategy.failedTrades++
      }

      strategy.profitLoss += profit
      strategy.avgExecutionTime =
        (strategy.avgExecutionTime * (strategy.totalTrades - 1) + executionTime) / strategy.totalTrades
      strategy.successRate = (strategy.successfulTrades / strategy.totalTrades) * 100
      strategy.roi = (strategy.profitLoss / strategy.totalTrades) * 100
      strategy.winLossRatio = strategy.successfulTrades / (strategy.failedTrades || 1)
    }
  }

  /**
   * Register a new strategy for performance tracking
   * @param strategyId Unique strategy ID
   * @param strategyName Human-readable strategy name
   */
  registerStrategy(strategyId: string, strategyName: string): void {
    if (!this.metrics.strategyPerformance[strategyId]) {
      this.metrics.strategyPerformance[strategyId] = {
        strategyId,
        strategyName,
        successRate: 0,
        avgExecutionTime: 0,
        profitLoss: 0,
        totalTrades: 0,
        successfulTrades: 0,
        failedTrades: 0,
        roi: 0,
        winLossRatio: 0,
      }
    }
  }

  /**
   * Get overall performance metrics
   * @returns Performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const totalTrades = this.metrics.successfulTrades + this.metrics.failedTrades
    const successRate = totalTrades > 0 ? (this.metrics.successfulTrades / totalTrades) * 100 : 0

    const avgExecutionTime =
      this.metrics.executionTimes.length > 0
        ? this.metrics.executionTimes.reduce((sum, time) => sum + time, 0) / this.metrics.executionTimes.length
        : 0

    const profitLoss = this.metrics.profits.reduce((sum, profit) => sum + profit, 0)

    return {
      successRate,
      avgExecutionTime,
      profitLoss,
      totalTrades,
      successfulTrades: this.metrics.successfulTrades,
      failedTrades: this.metrics.failedTrades,
    }
  }

  /**
   * Get performance metrics for a specific strategy
   * @param strategyId Strategy ID
   * @returns Strategy performance metrics or null if strategy not found
   */
  getStrategyPerformance(strategyId: string): StrategyPerformance | null {
    return this.metrics.strategyPerformance[strategyId] || null
  }

  /**
   * Get performance metrics for all strategies
   * @returns Array of strategy performance metrics
   */
  getAllStrategyPerformance(): StrategyPerformance[] {
    return Object.values(this.metrics.strategyPerformance)
  }

  /**
   * Reset all performance metrics
   */
  resetMetrics(): void {
    this.metrics = {
      executionTimes: [],
      profits: [],
      successfulTrades: 0,
      failedTrades: 0,
      strategyPerformance: {},
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()
