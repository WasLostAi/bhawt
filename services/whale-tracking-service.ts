import { ENV } from "@/lib/env"

export interface WhaleTransaction {
  id: string
  walletAddress: string
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  amount: string
  usdValue: number
  transactionType: "buy" | "sell" | "transfer"
  timestamp: number
  txHash: string
}

export interface WhaleWallet {
  address: string
  label?: string
  totalValue: number
  transactions24h: number
  volume24h: number
  lastActive: number
}

export interface WhaleSignal {
  id: string
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  signalType: "accumulation" | "distribution" | "large_buy" | "large_sell"
  confidence: number
  whaleCount: number
  volumeChange24h: number
  timestamp: number
}

// Mock data for development
const mockTransactions: WhaleTransaction[] = [
  {
    id: "tx1",
    walletAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    tokenAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    tokenSymbol: "BONK",
    tokenName: "Bonk",
    amount: "15,000,000",
    usdValue: 25000,
    transactionType: "buy",
    timestamp: Date.now() - 1800000, // 30 minutes ago
    txHash: "5xGh7Uz9PQzXcXz5VRk6FjZpjYhzMeWHY2XnVZ1yLsDB",
  },
  {
    id: "tx2",
    walletAddress: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    tokenAddress: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    tokenSymbol: "WIF",
    tokenName: "Dogwifhat",
    amount: "50,000",
    usdValue: 75000,
    transactionType: "sell",
    timestamp: Date.now() - 3600000, // 1 hour ago
    txHash: "8jKl3Mn7RqWz2VbxpqL9h6JyN4eD5TzQXcFsGpKL1mNp",
  },
  {
    id: "tx3",
    walletAddress: "7kbnb9z9PJVt9wUVe6TzJez3eSVP7dZEL9h6Gqh3zHAE",
    tokenAddress: "7kbnb9z9PJVt9wUVe6TzJez3eSVP7dZEL9h6Gqh3zHAE",
    tokenSymbol: "JTO",
    tokenName: "Jito",
    amount: "10,000",
    usdValue: 45000,
    transactionType: "transfer",
    timestamp: Date.now() - 7200000, // 2 hours ago
    txHash: "2qWe4Rt5YuJpL8Z9XcVb3N4mKsFgH6TyWqD7JpRzxV5A",
  },
  {
    id: "tx4",
    walletAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    tokenSymbol: "USDC",
    tokenName: "USD Coin",
    amount: "100,000",
    usdValue: 100000,
    transactionType: "buy",
    timestamp: Date.now() - 10800000, // 3 hours ago
    txHash: "9aB8cD7eF6gH5iJ4kL3mN2oP1qR0sT9uV8wX7yZ6aB5c",
  },
  {
    id: "tx5",
    walletAddress: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    tokenAddress: "So11111111111111111111111111111111111111112",
    tokenSymbol: "SOL",
    tokenName: "Solana",
    amount: "5,000",
    usdValue: 500000,
    transactionType: "sell",
    timestamp: Date.now() - 14400000, // 4 hours ago
    txHash: "1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2zZ3aB4cD5e",
  },
]

const mockWallets: WhaleWallet[] = [
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    label: "Whale Alpha",
    totalValue: 15000000,
    transactions24h: 12,
    volume24h: 2500000,
    lastActive: Date.now() - 1800000, // 30 minutes ago
  },
  {
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    label: "Whale Beta",
    totalValue: 8500000,
    transactions24h: 8,
    volume24h: 1200000,
    lastActive: Date.now() - 3600000, // 1 hour ago
  },
  {
    address: "7kbnb9z9PJVt9wUVe6TzJez3eSVP7dZEL9h6Gqh3zHAE",
    totalValue: 5200000,
    transactions24h: 5,
    volume24h: 800000,
    lastActive: Date.now() - 7200000, // 2 hours ago
  },
]

const mockSignals: WhaleSignal[] = [
  {
    id: "sig1",
    tokenAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    tokenSymbol: "BONK",
    tokenName: "Bonk",
    signalType: "accumulation",
    confidence: 85,
    whaleCount: 3,
    volumeChange24h: 25,
    timestamp: Date.now() - 1800000, // 30 minutes ago
  },
  {
    id: "sig2",
    tokenAddress: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    tokenSymbol: "WIF",
    tokenName: "Dogwifhat",
    signalType: "distribution",
    confidence: 70,
    whaleCount: 2,
    volumeChange24h: -15,
    timestamp: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: "sig3",
    tokenAddress: "7kbnb9z9PJVt9wUVe6TzJez3eSVP7dZEL9h6Gqh3zHAE",
    tokenSymbol: "JTO",
    tokenName: "Jito",
    signalType: "large_buy",
    confidence: 90,
    whaleCount: 1,
    volumeChange24h: 40,
    timestamp: Date.now() - 7200000, // 2 hours ago
  },
]

export class WhaleTrackingService {
  private enableWhaleTracking: boolean
  private minTransactionValue: number

  constructor() {
    this.enableWhaleTracking = ENV.get("NEXT_PUBLIC_ENABLE_WHALE_TRACKING", false)
    this.minTransactionValue = 10000 // Default $10,000 minimum to track
  }

  /**
   * Check if whale tracking is enabled
   * @returns True if whale tracking is enabled
   */
  isEnabled(): boolean {
    return this.enableWhaleTracking
  }

  /**
   * Get recent whale transactions
   * @param limit Maximum number of transactions to return
   * @returns List of whale transactions
   */
  async getRecentTransactions(limit = 10): Promise<WhaleTransaction[]> {
    // Use mock data instead of API call
    return mockTransactions.slice(0, limit)
  }

  /**
   * Get whale wallets
   * @param limit Maximum number of wallets to return
   * @returns List of whale wallets
   */
  async getWhaleWallets(limit = 10): Promise<WhaleWallet[]> {
    // Use mock data instead of API call
    return mockWallets.slice(0, limit)
  }

  /**
   * Get whale signals
   * @param limit Maximum number of signals to return
   * @returns List of whale signals
   */
  async getWhaleSignals(limit = 5): Promise<WhaleSignal[]> {
    // Use mock data instead of API call
    return mockSignals.slice(0, limit)
  }

  /**
   * Track transactions for a specific token
   * @param tokenAddress Token address to track
   * @returns True if tracking was successful
   */
  async trackToken(tokenAddress: string): Promise<boolean> {
    // Mock implementation
    console.log(`Tracking token: ${tokenAddress}`)
    return true
  }
}

export const whaleTrackingService = new WhaleTrackingService()
