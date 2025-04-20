"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeftRight,
  BarChart3,
  Bot,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Cpu,
  LineChart,
  Package,
  Settings,
  Target,
  Wallet,
  FishIcon as Whale,
  Zap,
} from "lucide-react"

interface FunctionItem {
  title: string
  description: string
}

interface FunctionGroup {
  title: string
  description: string
  icon: React.ReactNode
  functions: FunctionItem[]
}

export default function ManifestoClientPage() {
  // State to track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({})

  // Toggle group expansion
  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const functionGroups: FunctionGroup[] = [
    {
      title: "Trading & Sniper Functions",
      description: "Core trading capabilities for token sniping and execution",
      icon: <Zap className="h-6 w-6 text-[#A4D756]" />,
      functions: [
        {
          title: "Token Sniping",
          description:
            "Automatically detect and snipe new token listings with configurable parameters for slippage, gas, and execution timing",
        },
        {
          title: "MEV Protection",
          description:
            "Utilize Jito bundles to protect trades from MEV attacks and front-running with priority fee configuration",
        },
        {
          title: "Multi-DEX Trading",
          description:
            "Execute trades across multiple Solana DEXs including Jupiter, Raydium, and Orca for optimal pricing",
        },
        {
          title: "Limit Orders",
          description: "Set limit buy and sell orders that execute automatically when price conditions are met",
        },
        {
          title: "Priority Fee Management",
          description: "Dynamically adjust transaction priority fees based on network congestion for faster execution",
        },
      ],
    },
    {
      title: "Monitoring Functions",
      description: "Real-time monitoring of pools, transactions, and market activity",
      icon: <LineChart className="h-6 w-6 text-[#22CCEE]" />,
      functions: [
        {
          title: "Pool Monitor",
          description:
            "Track new liquidity pools as they are created across multiple DEXs with filtering by liquidity thresholds",
        },
        {
          title: "Transaction Monitor",
          description:
            "View and filter pending and completed transactions with detailed status information and error handling",
        },
        {
          title: "Token Analytics",
          description:
            "Analyze token price movements, liquidity changes, and trading volume with customizable time ranges",
        },
        {
          title: "Gas Tracker",
          description: "Monitor network gas prices and congestion levels to optimize transaction timing and fees",
        },
        {
          title: "Performance Metrics",
          description: "Track trading performance including success rates, profit/loss, and execution times",
        },
      ],
    },
    {
      title: "Strategy Functions",
      description: "Automated trading strategies with customizable parameters",
      icon: <BrainCircuit className="h-6 w-6 text-[#F9CB40]" />,
      functions: [
        {
          title: "Breakout Strategy",
          description:
            "Automatically detect and trade price breakouts with configurable percentage thresholds and confirmation periods",
        },
        {
          title: "Bollinger Bands Strategy",
          description:
            "Trade based on Bollinger Bands indicators with adjustable period and standard deviation parameters",
        },
        {
          title: "Strategy Performance Tracking",
          description: "Monitor strategy performance with metrics for success rate, ROI, and win/loss ratio",
        },
        {
          title: "Multi-Strategy Execution",
          description: "Run multiple strategies simultaneously with resource allocation and priority settings",
        },
        {
          title: "Strategy Backtesting",
          description: "Test strategies against historical data to evaluate performance before live deployment",
        },
      ],
    },
    {
      title: "Bundle Management",
      description: "Create and manage transaction bundles for complex operations",
      icon: <Package className="h-6 w-6 text-[#E57676]" />,
      functions: [
        {
          title: "Bundle Creation",
          description: "Create custom transaction bundles with multiple operations that execute atomically",
        },
        {
          title: "Transaction Sequencing",
          description: "Define precise execution order for complex multi-step trading operations",
        },
        {
          title: "Bundle Templates",
          description: "Save and reuse common transaction patterns with customizable parameters",
        },
        {
          title: "Execution History",
          description: "Track bundle execution with detailed performance metrics and error reporting",
        },
        {
          title: "Priority Bundle Execution",
          description: "Prioritize critical bundles with higher gas fees and Jito integration for faster processing",
        },
      ],
    },
    {
      title: "Whale Tracking",
      description: "Monitor large wallet activity and market signals",
      icon: <Whale className="h-6 w-6 text-[#22CCEE]" />,
      functions: [
        {
          title: "Whale Transaction Monitoring",
          description: "Track high-value transactions from known whale wallets with configurable thresholds",
        },
        {
          title: "Wallet Profiling",
          description: "Identify and track whale wallets based on transaction patterns and holdings",
        },
        {
          title: "Signal Detection",
          description: "Detect accumulation, distribution, and other significant trading patterns from whale activity",
        },
        {
          title: "Alert System",
          description: "Receive notifications for significant whale movements with customizable filters",
        },
        {
          title: "Historical Analysis",
          description: "Analyze historical whale activity and correlate with price movements for predictive insights",
        },
      ],
    },
    {
      title: "Perpetual Trading",
      description: "Trade perpetual contracts across Solana exchanges",
      icon: <ArrowLeftRight className="h-6 w-6 text-[#A4D756]" />,
      functions: [
        {
          title: "Multi-Exchange Integration",
          description: "Trade perpetuals across Drift, Mango Markets, Zeta, and other Solana perpetual exchanges",
        },
        {
          title: "Position Management",
          description: "Open, modify, and close perpetual positions with leverage and risk management settings",
        },
        {
          title: "Funding Rate Arbitrage",
          description: "Identify and execute funding rate arbitrage opportunities between different exchanges",
        },
        {
          title: "Liquidation Protection",
          description: "Automatically manage positions to prevent liquidation with configurable safety thresholds",
        },
        {
          title: "Cross-Exchange Arbitrage",
          description: "Detect and capitalize on price differences for the same perpetual contract across exchanges",
        },
      ],
    },
    {
      title: "Configuration & Settings",
      description: "Customize application behavior and trading parameters",
      icon: <Settings className="h-6 w-6 text-[#707070]" />,
      functions: [
        {
          title: "Trading Settings",
          description: "Configure default slippage, priority fees, and other trading parameters",
        },
        {
          title: "Display Settings",
          description: "Customize UI layout, data precision, and compact mode options",
        },
        {
          title: "Notification Settings",
          description: "Configure in-app, sound, and desktop notifications for various events",
        },
        {
          title: "Performance Settings",
          description: "Adjust request concurrency, data prefetching, and caching for optimal performance",
        },
        {
          title: "Wallet Integration",
          description: "Connect and manage wallets with customizable permissions and transaction signing",
        },
      ],
    },
    {
      title: "Target Management",
      description: "Define and manage trading targets with execution parameters",
      icon: <Target className="h-6 w-6 text-[#F9CB40]" />,
      functions: [
        {
          title: "Target Creation",
          description: "Define token targets with buy/sell parameters, amount, and maximum price thresholds",
        },
        {
          title: "Active Target Monitoring",
          description: "Track active targets with real-time status updates and execution progress",
        },
        {
          title: "Batch Target Management",
          description: "Create and manage multiple targets simultaneously with bulk operations",
        },
        {
          title: "Target Templates",
          description: "Save and reuse common target configurations for quick deployment",
        },
        {
          title: "Conditional Targets",
          description: "Create targets with complex conditions based on price movements, volume, or other metrics",
        },
      ],
    },
    {
      title: "API & Integration",
      description: "External integrations and API functionality",
      icon: <Cpu className="h-6 w-6 text-[#22CCEE]" />,
      functions: [
        {
          title: "Jupiter API Integration",
          description: "Connect to Jupiter API for token swaps, quotes, and market data with API key management",
        },
        {
          title: "Jito API Integration",
          description: "Utilize Jito for MEV protection and bundle execution with configurable parameters",
        },
        {
          title: "Telegram Bot Integration",
          description: "Control the application and receive notifications via Telegram with command support",
        },
        {
          title: "Data Export",
          description: "Export transaction history, performance metrics, and other data in various formats",
        },
        {
          title: "Webhook Support",
          description: "Configure webhooks for external notifications and integrations with other systems",
        },
      ],
    },
    {
      title: "Portfolio & Analytics",
      description: "Track portfolio performance and analyze trading results",
      icon: <BarChart3 className="h-6 w-6 text-[#A4D756]" />,
      functions: [
        {
          title: "Portfolio Tracking",
          description: "Monitor token holdings, value, and performance across connected wallets",
        },
        {
          title: "PnL Analysis",
          description: "Analyze profit and loss by token, strategy, and time period with detailed metrics",
        },
        {
          title: "Performance Reporting",
          description: "Generate comprehensive reports on trading performance with exportable data",
        },
        {
          title: "Risk Analysis",
          description: "Evaluate portfolio risk exposure with diversification metrics and concentration analysis",
        },
        {
          title: "Historical Comparison",
          description: "Compare current performance against historical periods with customizable benchmarks",
        },
      ],
    },
    {
      title: "Wallet Management",
      description: "Manage wallets and funds for trading operations",
      icon: <Wallet className="h-6 w-6 text-[#F9CB40]" />,
      functions: [
        {
          title: "Multi-Wallet Support",
          description: "Connect and manage multiple wallets with different roles and permissions",
        },
        {
          title: "Fund Allocation",
          description: "Allocate funds across different strategies, targets, and trading activities",
        },
        {
          title: "Balance Monitoring",
          description: "Track wallet balances and token holdings with real-time updates",
        },
        {
          title: "Transaction Signing",
          description: "Securely sign transactions with configurable approval workflows and limits",
        },
        {
          title: "Gas Management",
          description: "Optimize gas usage across wallets with automatic refilling and allocation",
        },
      ],
    },
    {
      title: "Automation & Bots",
      description: "Automated trading bots and execution systems",
      icon: <Bot className="h-6 w-6 text-[#E57676]" />,
      functions: [
        {
          title: "Trading Bots",
          description: "Configure and deploy automated trading bots with customizable strategies and parameters",
        },
        {
          title: "Scheduled Execution",
          description: "Schedule trading operations and strategy adjustments based on time or market conditions",
        },
        {
          title: "Event-Based Triggers",
          description: "Create automated responses to market events, whale movements, or other triggers",
        },
        {
          title: "Bot Performance Monitoring",
          description: "Track bot performance with detailed metrics and automatic optimization",
        },
        {
          title: "Failsafe Mechanisms",
          description: "Implement safety controls and circuit breakers to prevent losses during extreme conditions",
        },
      ],
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {functionGroups.map((group, index) => (
          <Card
            key={index}
            className="bg-[#151514] border-[#30302e] overflow-hidden cursor-pointer"
            onClick={() => toggleGroup(index)}
          >
            <CardHeader className="bg-[#1d1d1c] border-b border-[#30302e]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {group.icon}
                  <div>
                    <CardTitle>{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                </div>
                {expandedGroups[index] ? (
                  <ChevronUp className="h-5 w-5 text-[#707070]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#707070]" />
                )}
              </div>
            </CardHeader>
            {expandedGroups[index] && (
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {group.functions.map((func, funcIndex) => (
                    <li key={funcIndex} className="bg-[#1d1d1c] p-4 rounded-md">
                      <h3 className="font-medium mb-1">{func.title}</h3>
                      <p className="text-sm text-[#707070]">{func.description}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
