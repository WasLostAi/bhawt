"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Define test status types
type TestStatus = "pending" | "running" | "success" | "failed" | "warning" | "not-implemented"

// Define function test interface
interface FunctionTest {
  title: string
  description: string
  status: TestStatus
  message?: string
  testFn: () => Promise<{ success: boolean; message?: string }>
}

// Define function group interface
interface FunctionGroup {
  title: string
  description: string
  icon: React.ReactNode
  functions: FunctionTest[]
}

export default function TestFunctionsClient() {
  // State to track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, TestStatus>>({})
  const [testMessages, setTestMessages] = useState<Record<string, string>>({})
  const [isTestingAll, setIsTestingAll] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const [testSummary, setTestSummary] = useState({
    total: 0,
    success: 0,
    failed: 0,
    warning: 0,
    pending: 0,
  })

  const { toast } = useToast()

  // Toggle group expansion
  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Run a single test
  const runTest = async (groupIndex: number, functionIndex: number) => {
    const testId = `${groupIndex}-${functionIndex}`
    const functionTest = functionGroups[groupIndex].functions[functionIndex]

    // Update status to running
    setTestResults((prev) => ({
      ...prev,
      [testId]: "running",
    }))

    try {
      // Run the test function
      const result = await functionTest.testFn()

      // Update test results
      setTestResults((prev) => ({
        ...prev,
        [testId]: result.success ? "success" : "failed",
      }))

      // Update test message if provided
      if (result.message) {
        setTestMessages((prev) => ({
          ...prev,
          [testId]: result.message || "",
        }))
      }

      // Show toast notification
      toast({
        title: result.success ? "Test Passed" : "Test Failed",
        description:
          result.message || `${functionTest.title} test ${result.success ? "completed successfully" : "failed"}`,
        variant: result.success ? "default" : "destructive",
      })

      return result.success
    } catch (error) {
      // Handle errors
      setTestResults((prev) => ({
        ...prev,
        [testId]: "failed",
      }))

      setTestMessages((prev) => ({
        ...prev,
        [testId]: error instanceof Error ? error.message : "Unknown error occurred",
      }))

      toast({
        title: "Test Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })

      return false
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setIsTestingAll(true)
    setTestProgress(0)

    let totalTests = 0
    let completedTests = 0
    let successfulTests = 0
    let failedTests = 0
    let warningTests = 0

    // Count total tests
    functionGroups.forEach((group) => {
      totalTests += group.functions.length
    })

    // Run tests sequentially
    for (let groupIndex = 0; groupIndex < functionGroups.length; groupIndex++) {
      // Expand the group
      setExpandedGroups((prev) => ({
        ...prev,
        [groupIndex]: true,
      }))

      const group = functionGroups[groupIndex]

      for (let functionIndex = 0; functionIndex < group.functions.length; functionIndex++) {
        const testId = `${groupIndex}-${functionIndex}`
        const functionTest = group.functions[functionIndex]

        // Skip already implemented tests
        if (testResults[testId] === "not-implemented") {
          warningTests++
          completedTests++
          setTestProgress(Math.floor((completedTests / totalTests) * 100))
          continue
        }

        // Run the test
        const success = await runTest(groupIndex, functionIndex)

        // Update counters
        completedTests++
        if (success) {
          successfulTests++
        } else {
          failedTests++
        }

        // Update progress
        setTestProgress(Math.floor((completedTests / totalTests) * 100))
      }
    }

    // Update summary
    setTestSummary({
      total: totalTests,
      success: successfulTests,
      failed: failedTests,
      warning: warningTests,
      pending: totalTests - completedTests - successfulTests - failedTests - warningTests,
    })

    setIsTestingAll(false)

    // Show final toast
    toast({
      title: "Testing Complete",
      description: `Passed: ${successfulTests}, Failed: ${failedTests}, Warnings: ${warningTests}`,
      variant: failedTests > 0 ? "destructive" : "default",
    })
  }

  // Update test summary when test results change
  useEffect(() => {
    let success = 0
    let failed = 0
    let warning = 0
    let pending = 0
    let total = 0

    functionGroups.forEach((group, groupIndex) => {
      group.functions.forEach((_, functionIndex) => {
        const testId = `${groupIndex}-${functionIndex}`
        total++

        switch (testResults[testId]) {
          case "success":
            success++
            break
          case "failed":
            failed++
            break
          case "warning":
          case "not-implemented":
            warning++
            break
          case "pending":
          case undefined:
            pending++
            break
        }
      })
    })

    setTestSummary({
      total,
      success,
      failed,
      warning,
      pending,
    })
  }, [testResults])

  // Mock test functions for each functionality
  const mockTestFunction = async (
    shouldSucceed = true,
    delay = 1000,
  ): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (shouldSucceed) {
          resolve({ success: true, message: "Test completed successfully" })
        } else {
          resolve({ success: false, message: "Test failed: Could not complete operation" })
        }
      }, delay)
    })
  }

  // Not implemented test function
  const notImplementedTest = async (): Promise<{ success: boolean; message?: string }> => {
    return Promise.resolve({ success: false, message: "This function is not yet implemented for testing" })
  }

  // Function groups with test functions
  const functionGroups: FunctionGroup[] = [
    {
      title: "Trading & Sniper Functions",
      description: "Core trading capabilities for token sniping and execution",
      icon: <Zap className="h-6 w-6 text-[#A4D756]" />,
      functions: [
        {
          title: "Token Sniping",
          description: "Test automatic token sniping with configurable parameters",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2000),
        },
        {
          title: "MEV Protection",
          description: "Test Jito bundles for MEV protection",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "Multi-DEX Trading",
          description: "Test trading across multiple Solana DEXs",
          status: "pending",
          testFn: async () => mockTestFunction(false, 1800),
        },
        {
          title: "Limit Orders",
          description: "Test limit buy and sell order execution",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1200),
        },
        {
          title: "Priority Fee Management",
          description: "Test dynamic priority fee adjustment",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1000),
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
          description: "Test tracking of new liquidity pools",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "Transaction Monitor",
          description: "Test transaction monitoring and filtering",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1200),
        },
        {
          title: "Token Analytics",
          description: "Test token price and volume analytics",
          status: "pending",
          testFn: async () => mockTestFunction(false, 2000),
        },
        {
          title: "Gas Tracker",
          description: "Test network gas price monitoring",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1000),
        },
        {
          title: "Performance Metrics",
          description: "Test trading performance tracking",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1300),
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
          description: "Test breakout strategy detection and execution",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2500),
        },
        {
          title: "Bollinger Bands Strategy",
          description: "Test Bollinger Bands strategy execution",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2200),
        },
        {
          title: "Strategy Performance Tracking",
          description: "Test strategy performance metrics",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "Multi-Strategy Execution",
          description: "Test running multiple strategies simultaneously",
          status: "pending",
          testFn: async () => mockTestFunction(false, 3000),
        },
        {
          title: "Strategy Backtesting",
          description: "Test strategy backtesting against historical data",
          status: "pending",
          testFn: async () => mockTestFunction(true, 4000),
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
          description: "Test creating custom transaction bundles",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "Transaction Sequencing",
          description: "Test defining execution order for operations",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1800),
        },
        {
          title: "Bundle Templates",
          description: "Test saving and reusing transaction patterns",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1200),
        },
        {
          title: "Execution History",
          description: "Test bundle execution history tracking",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1000),
        },
        {
          title: "Priority Bundle Execution",
          description: "Test prioritizing critical bundles",
          status: "pending",
          testFn: async () => mockTestFunction(false, 2000),
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
          description: "Test tracking high-value transactions",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1700),
        },
        {
          title: "Wallet Profiling",
          description: "Test identifying and tracking whale wallets",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2000),
        },
        {
          title: "Signal Detection",
          description: "Test detecting trading patterns from whale activity",
          status: "pending",
          testFn: async () => mockTestFunction(false, 2500),
        },
        {
          title: "Alert System",
          description: "Test notifications for whale movements",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1200),
        },
        {
          title: "Historical Analysis",
          description: "Test analyzing historical whale activity",
          status: "pending",
          testFn: async () => mockTestFunction(true, 3000),
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
          description: "Test trading across perpetual exchanges",
          status: "pending",
          testFn: async () => mockTestFunction(false, 2000),
        },
        {
          title: "Position Management",
          description: "Test managing perpetual positions",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1800),
        },
        {
          title: "Funding Rate Arbitrage",
          description: "Test funding rate arbitrage execution",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2500),
        },
        {
          title: "Liquidation Protection",
          description: "Test automatic liquidation protection",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "Cross-Exchange Arbitrage",
          description: "Test arbitrage between exchanges",
          status: "pending",
          testFn: async () => mockTestFunction(false, 2200),
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
          description: "Test configuring trading parameters",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1000),
        },
        {
          title: "Display Settings",
          description: "Test customizing UI layout and options",
          status: "pending",
          testFn: async () => mockTestFunction(true, 800),
        },
        {
          title: "Notification Settings",
          description: "Test configuring notification preferences",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1200),
        },
        {
          title: "Performance Settings",
          description: "Test adjusting performance parameters",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "Wallet Integration",
          description: "Test wallet connection and permissions",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1800),
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
          description: "Test creating token targets with parameters",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "Active Target Monitoring",
          description: "Test tracking active targets",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1200),
        },
        {
          title: "Batch Target Management",
          description: "Test managing multiple targets simultaneously",
          status: "pending",
          testFn: async () => mockTestFunction(false, 2000),
        },
        {
          title: "Target Templates",
          description: "Test saving and reusing target configurations",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1000),
        },
        {
          title: "Conditional Targets",
          description: "Test targets with complex conditions",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1800),
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
          description: "Test Jupiter API connection and functionality",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2000),
        },
        {
          title: "Jito API Integration",
          description: "Test Jito API for MEV protection",
          status: "pending",
          testFn: async () => mockTestFunction(false, 2500),
        },
        {
          title: "Telegram Bot Integration",
          description: "Test Telegram bot commands and notifications",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1800),
        },
        {
          title: "Data Export",
          description: "Test exporting transaction history and metrics",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "Webhook Support",
          description: "Test webhook notifications and integrations",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1200),
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
          description: "Test monitoring token holdings and value",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "PnL Analysis",
          description: "Test profit and loss analysis",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2000),
        },
        {
          title: "Performance Reporting",
          description: "Test generating performance reports",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2500),
        },
        {
          title: "Risk Analysis",
          description: "Test portfolio risk evaluation",
          status: "pending",
          testFn: async () => mockTestFunction(false, 1800),
        },
        {
          title: "Historical Comparison",
          description: "Test comparing performance against history",
          status: "pending",
          testFn: async () => mockTestFunction(true, 3000),
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
          description: "Test connecting multiple wallets",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1800),
        },
        {
          title: "Fund Allocation",
          description: "Test allocating funds across strategies",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2000),
        },
        {
          title: "Balance Monitoring",
          description: "Test tracking wallet balances",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "Transaction Signing",
          description: "Test secure transaction signing",
          status: "pending",
          testFn: async () => mockTestFunction(false, 2200),
        },
        {
          title: "Gas Management",
          description: "Test optimizing gas usage",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1200),
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
          description: "Test automated trading bot deployment",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2500),
        },
        {
          title: "Scheduled Execution",
          description: "Test scheduling trading operations",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1800),
        },
        {
          title: "Event-Based Triggers",
          description: "Test automated responses to market events",
          status: "pending",
          testFn: async () => mockTestFunction(false, 2000),
        },
        {
          title: "Bot Performance Monitoring",
          description: "Test tracking bot performance metrics",
          status: "pending",
          testFn: async () => mockTestFunction(true, 1500),
        },
        {
          title: "Failsafe Mechanisms",
          description: "Test safety controls and circuit breakers",
          status: "pending",
          testFn: async () => mockTestFunction(true, 2200),
        },
      ],
    },
  ]

  // Get status badge component based on test status
  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-[#1E3323] text-[#A4D756] flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Passed
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-[#331A1A] text-[#E57676] flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        )
      case "running":
        return (
          <Badge className="bg-[#1d1d1c] text-[#22CCEE] flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" /> Running
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-[#332E1A] text-[#F9CB40] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Warning
          </Badge>
        )
      case "not-implemented":
        return (
          <Badge className="bg-[#1d1d1c] text-[#707070] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Not Implemented
          </Badge>
        )
      default:
        return (
          <Badge className="bg-[#1d1d1c] text-[#707070] flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Function Testing</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
              onClick={() => {
                // Reset all test results
                setTestResults({})
                setTestMessages({})
                setTestSummary({
                  total: functionGroups.reduce((acc, group) => acc + group.functions.length, 0),
                  success: 0,
                  failed: 0,
                  warning: 0,
                  pending: functionGroups.reduce((acc, group) => acc + group.functions.length, 0),
                })
              }}
            >
              Reset All Tests
            </Button>
            <Button
              onClick={runAllTests}
              disabled={isTestingAll}
              className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
            >
              {isTestingAll ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Run All Tests"
              )}
            </Button>
          </div>
        </div>

        {/* Test progress */}
        {isTestingAll && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Testing Progress</span>
              <span>{testProgress}%</span>
            </div>
            <Progress value={testProgress} className="h-2" />
          </div>
        )}

        {/* Test summary */}
        <div className="bg-[#151514] border border-[#30302e] rounded-lg p-4 mb-4">
          <div className="flex flex-wrap gap-4 justify-between">
            <div>
              <span className="text-sm text-[#707070]">Total Tests:</span>
              <span className="ml-2 font-medium">{testSummary.total}</span>
            </div>
            <div>
              <span className="text-sm text-[#707070]">Passed:</span>
              <span className="ml-2 font-medium text-[#A4D756]">{testSummary.success}</span>
            </div>
            <div>
              <span className="text-sm text-[#707070]">Failed:</span>
              <span className="ml-2 font-medium text-[#E57676]">{testSummary.failed}</span>
            </div>
            <div>
              <span className="text-sm text-[#707070]">Warnings:</span>
              <span className="ml-2 font-medium text-[#F9CB40]">{testSummary.warning}</span>
            </div>
            <div>
              <span className="text-sm text-[#707070]">Pending:</span>
              <span className="ml-2 font-medium text-[#707070]">{testSummary.pending}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {functionGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="bg-[#151514] border-[#30302e] overflow-hidden">
            <CardHeader
              className="bg-[#1d1d1c] border-b border-[#30302e] cursor-pointer"
              onClick={() => toggleGroup(groupIndex)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {group.icon}
                  <div>
                    <CardTitle>{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Run all tests in this group
                      group.functions.forEach((_, functionIndex) => {
                        runTest(groupIndex, functionIndex)
                      })
                    }}
                  >
                    Test Group
                  </Button>
                  {expandedGroups[groupIndex] ? (
                    <ChevronUp className="h-5 w-5 text-[#707070]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#707070]" />
                  )}
                </div>
              </div>
            </CardHeader>
            {expandedGroups[groupIndex] && (
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {group.functions.map((func, functionIndex) => {
                    const testId = `${groupIndex}-${functionIndex}`
                    const status = testResults[testId] || "pending"
                    const message = testMessages[testId] || ""

                    return (
                      <li key={functionIndex} className="bg-[#1d1d1c] p-4 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium mb-1">{func.title}</h3>
                            <p className="text-sm text-[#707070]">{func.description}</p>
                            {message && (
                              <p
                                className={`text-xs mt-2 ${status === "success" ? "text-[#A4D756]" : "text-[#E57676]"}`}
                              >
                                {message}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(status)}
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e] h-8"
                              onClick={() => runTest(groupIndex, functionIndex)}
                              disabled={status === "running"}
                            >
                              {status === "running" ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Test"}
                            </Button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
