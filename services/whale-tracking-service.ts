// Mock implementation of the whale tracking service

interface WhaleTransaction {
  id: string
  wallet: string
  token: string
  amount: number
  usdValue: number
  type: "buy" | "sell"
  timestamp: number
}

interface WhaleWallet {
  address: string
  label: string | null
  totalValue: number
  recentTransactions: number
  tokens: { symbol: string; balance: number; usdValue: number }[]
}

export interface WhaleSignal {
  tokenMint: string
  confidence: number
  isCoordinated: boolean
  transactionCount: number
}

class WhaleTrackingService {
  private transactions: WhaleTransaction[] = []
  private wallets: WhaleWallet[] = []
  private actedTokens: Set<string> = new Set()

  constructor() {
    // Initialize with some mock data
    this.transactions = [
      {
        id: "tx1",
        wallet: "8xDrJGJ2VBaqBdUUqYG8jBxCULSxUgwxXjQRH9YQJjLL",
        token: "BONK",
        amount: 250000000,
        usdValue: 25000,
        type: "buy",
        timestamp: Date.now() - 300000,
      },
      {
        id: "tx2",
        wallet: "7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn",
        token: "WIF",
        amount: 50000,
        usdValue: 15000,
        type: "sell",
        timestamp: Date.now() - 600000,
      },
      {
        id: "tx3",
        wallet: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        token: "JTO",
        amount: 75000,
        usdValue: 45000,
        type: "buy",
        timestamp: Date.now() - 900000,
      },
    ]

    this.wallets = [
      {
        address: "8xDrJGJ2VBaqBdUUqYG8jBxCULSxUgwxXjQRH9YQJjLL",
        label: "Whale 1",
        totalValue: 1250000,
        recentTransactions: 12,
        tokens: [
          { symbol: "SOL", balance: 5000, usdValue: 750000 },
          { symbol: "BONK", balance: 25000000000, usdValue: 250000 },
          { symbol: "JTO", balance: 150000, usdValue: 250000 },
        ],
      },
      {
        address: "7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn",
        label: "Whale 2",
        totalValue: 850000,
        recentTransactions: 8,
        tokens: [
          { symbol: "SOL", balance: 3500, usdValue: 525000 },
          { symbol: "WIF", balance: 1250000, usdValue: 325000 },
        ],
      },
    ]
  }

  // Get recent whale transactions
  async getRecentTransactions(limit = 10): Promise<WhaleTransaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.transactions.slice(0, limit))
      }, 500)
    })
  }

  // Get top whale wallets
  async getTopWallets(limit = 5): Promise<WhaleWallet[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.wallets.slice(0, limit))
      }, 500)
    })
  }

  // Track a new wallet
  async trackWallet(address: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if wallet already exists
        const exists = this.wallets.some((w) => w.address === address)

        if (!exists) {
          this.wallets.push({
            address,
            label: null,
            totalValue: Math.random() * 1000000,
            recentTransactions: Math.floor(Math.random() * 20),
            tokens: [{ symbol: "SOL", balance: Math.random() * 5000, usdValue: Math.random() * 750000 }],
          })
        }

        resolve(true)
      }, 800)
    })
  }

  // Set a label for a wallet
  async setWalletLabel(address: string, label: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const wallet = this.wallets.find((w) => w.address === address)

        if (wallet) {
          wallet.label = label
          resolve(true)
        } else {
          resolve(false)
        }
      }, 300)
    })
  }

  // Check token safety
  async checkTokenSafety(tokenMint: string): Promise<{ trustScore: number; isRugPull: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock implementation: return a random trust score
        const trustScore = Math.floor(Math.random() * 100)
        const isRugPull = Math.random() < 0.1 // 10% chance of being a rug pull
        resolve({ trustScore, isRugPull })
      }, 400)
    })
  }

  // Get whale signal
  async getWhaleSignal(tokenMint: string): Promise<WhaleSignal | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.actedTokens.has(tokenMint)) {
          resolve(null)
          return
        }

        // Mock implementation: return a random signal
        const confidence = Math.floor(Math.random() * 100)
        const isCoordinated = Math.random() < 0.5
        const transactionCount = Math.floor(Math.random() * 10)

        resolve({
          tokenMint,
          confidence,
          isCoordinated,
          transactionCount,
        })
      }, 600)
    })
  }

  // Mark token as acted upon
  markTokenAsActed(tokenMint: string): void {
    this.actedTokens.add(tokenMint)
  }
}

export const whaleTrackingService = new WhaleTrackingService()
