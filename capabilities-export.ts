/**
 * SOL Sniper Bot - Capabilities Export
 * This file contains a comprehensive list of all features and capabilities
 * available in the SOL Sniper Bot application.
 */

export const capabilities = {
  // Core Trading Features
  trading: {
    tokenSnipe: {
      description: "Execute immediate token purchases with customizable parameters",
      features: [
        "Immediate token sniping with configurable slippage",
        "Priority fee adjustment for faster transaction execution",
        "Skip preflight checks option for faster execution",
        "Advanced mode with additional configuration options",
      ],
    },
    targetedSnipe: {
      description: "Set price targets for automatic token purchases",
      features: [
        "Price monitoring with automatic execution",
        "Customizable target prices",
        "Configurable slippage tolerance",
        "Real-time price tracking",
      ],
    },
    whaleTracking: {
      description: "Monitor and follow large wallet transactions",
      features: [
        "Real-time whale transaction monitoring",
        "Wallet labeling and tracking",
        "Transaction volume analysis",
        "Configurable alert thresholds",
      ],
    },
  },

  // Market Analysis
  marketAnalysis: {
    poolMonitoring: {
      description: "Real-time monitoring of liquidity pools",
      features: ["WebSocket-based pool detection", "New pool alerts", "Liquidity tracking", "Price change monitoring"],
    },
    priceCharts: {
      description: "Interactive price charts for tracked tokens",
      features: [
        "Real-time price updates",
        "Historical price data",
        "Liquidity visualization",
        "Target price indicators",
      ],
    },
    tokenAnalytics: {
      description: "Detailed token analysis and metrics",
      features: [
        "Token metadata analysis",
        "Holder distribution tracking",
        "Transaction history analysis",
        "Safety score calculation",
      ],
    },
  },

  // Advanced Trading Strategies
  tradingStrategies: {
    breakoutStrategy: {
      description: "24H High/Low breakout detection and trading",
      features: [
        "Automatic breakout detection",
        "Configurable breakout percentage",
        "Take profit and stop loss settings",
        "Trailing stop functionality",
      ],
    },
    bollingerBands: {
      description: "Bollinger Bands-based trading strategy",
      features: [
        "Dynamic band calculation",
        "Overbought/oversold detection",
        "Entry and exit signals",
        "Customizable period and standard deviation",
      ],
    },
    bootstrapStrategy: {
      description: "Token launch and liquidity bootstrapping",
      features: [
        "Automated token creation",
        "Liquidity pool setup",
        "Initial swap execution",
        "Monitoring and auto-sell functionality",
      ],
    },
    creationAwareTrader: {
      description: "Automatic trading based on new token creation",
      features: [
        "New token detection",
        "Safety checks for new tokens",
        "Automated buy/sell execution",
        "Profit target and stop loss settings",
      ],
    },
    perpetualArbitrage: {
      description: "Spot-perpetual price difference arbitrage",
      features: [
        "Spread monitoring across spot and perpetual markets",
        "Automated arbitrage execution",
        "Position management",
        "Profit analysis and tracking",
      ],
    },
  },

  // Transaction Management
  transactionManagement: {
    bundleEngine: {
      description: "Transaction bundling for improved execution",
      features: [
        "MEV protection",
        "Transaction bundling",
        "Priority fee optimization",
        "Bundle monitoring and management",
      ],
    },
    transactionMonitor: {
      description: "Track and analyze transaction status and performance",
      features: [
        "Real-time transaction status tracking",
        "Success/failure monitoring",
        "Transaction history",
        "Performance metrics",
      ],
    },
  },

  // Configuration and Settings
  configuration: {
    targetManagement: {
      description: "Manage token targets for sniping",
      features: [
        "Add/edit/delete token targets",
        "Configure max buy price",
        "Set minimum liquidity requirements",
        "Adjust slippage tolerance per token",
      ],
    },
    quickNodeConfig: {
      description: "Configure QuickNode RPC endpoint",
      features: [
        "Custom RPC endpoint configuration",
        "Connection testing",
        "Performance metrics",
        "Fallback to public endpoints",
      ],
    },
    jitoConfig: {
      description: "Configure Jito MEV protection",
      features: [
        "Enable/disable Jito bundles",
        "Configure bundle parameters",
        "Priority fee settings",
        "Bundle strategy selection",
      ],
    },
    environmentSettings: {
      description: "Configure environment variables and feature flags",
      features: [
        "RPC endpoint configuration",
        "API key management",
        "Feature flag toggles",
        "Performance tuning parameters",
      ],
    },
  },

  // Performance Monitoring
  performanceMonitoring: {
    tradingMetrics: {
      description: "Track and analyze trading performance",
      features: [
        "Success rate tracking",
        "Profit/loss analysis",
        "Average execution time",
        "Win rate and profit factor calculation",
      ],
    },
    circuitBreakers: {
      description: "Automatic trading suspension based on performance",
      features: [
        "Maximum consecutive loss protection",
        "Maximum hourly loss limits",
        "Minimum success rate enforcement",
        "Maximum drawdown protection",
      ],
    },
    strategyMonitor: {
      description: "Monitor and compare strategy performance",
      features: ["Strategy comparison", "Performance visualization", "Signal tracking", "Strategy enabling/disabling"],
    },
  },

  // UI and Experience
  userInterface: {
    dashboard: {
      description: "Comprehensive trading dashboard",
      features: ["Status overview", "Quick access to key features", "Real-time metrics", "Responsive design"],
    },
    customizableDashboard: {
      description: "User-customizable dashboard layout",
      features: ["Drag-and-drop widget positioning", "Widget resizing", "Add/remove widgets", "Layout persistence"],
    },
    notifications: {
      description: "In-app and external notifications",
      features: [
        "Toast notifications for important events",
        "Transaction status updates",
        "Error alerts",
        "Strategy signal notifications",
      ],
    },
    walletConnect: {
      description: "Wallet connection and management",
      features: ["Connect to Solana wallets", "View wallet balance", "Transaction signing", "Wallet disconnect"],
    },
  },

  // Security and Safety
  security: {
    tokenSafety: {
      description: "Token safety analysis and protection",
      features: [
        "Rug pull risk assessment",
        "Trust score calculation",
        "Liquidity analysis",
        "Creator address verification",
      ],
    },
    transactionSimulation: {
      description: "Pre-execution transaction simulation",
      features: [
        "Transaction outcome prediction",
        "Error detection before execution",
        "Gas usage estimation",
        "Optional preflight checks",
      ],
    },
  },

  // API Integrations
  integrations: {
    jupiterAPI: {
      description: "Jupiter Aggregator integration for optimal swaps",
      features: ["Best price routing", "Slippage protection", "Quote caching", "Retry mechanisms"],
    },
    jitoAPI: {
      description: "Jito MEV protection integration",
      features: ["Bundle submission", "MEV protection", "Priority fee recommendations", "Bundle statistics"],
    },
    quickNodeAPI: {
      description: "QuickNode RPC integration",
      features: [
        "High-performance RPC access",
        "Enhanced transaction history",
        "Metis API integration",
        "Connection statistics",
      ],
    },
    jupiterPerpetuals: {
      description: "Jupiter Perpetuals integration",
      features: [
        "Perpetual market data",
        "Position management",
        "Funding rate monitoring",
        "Arbitrage opportunity detection",
      ],
    },
  },
}

// Export additional metadata
export const systemRequirements = {
  browser: "Modern browser with JavaScript enabled",
  wallet: "Solana-compatible wallet (Phantom, Solflare, etc.)",
  network: "Stable internet connection required",
  rpc: "QuickNode RPC endpoint recommended for optimal performance",
}

export const apiEndpoints = {
  jupiter: "https://quote-api.jup.ag/v6",
  jito: "https://jito-api.jup.ag/v1",
  quicknode: "Custom QuickNode endpoint",
}

export const supportedTokens = "All SPL tokens with sufficient liquidity"
