"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RefreshCw, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTokenList } from "@/hooks/use-token-list"

// Mock strategy data
const mockStrategies = [
  {
    id: "strategy1",
    name: "BONK Breakout",
    type: "breakout",
    targetToken: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    targetTokenSymbol: "BONK",
    baseToken: "So11111111111111111111111111111111111111112",
    baseTokenSymbol: "SOL",
    status: "active",
    performance: {
      successRate: 78.5,
      profitLoss: 1.25,
      totalTrades: 14,
      successfulTrades: 11,
      failedTrades: 3,
      roi: 12.5,
      winLossRatio: 3.67,
    },
    config: {
      enabled: true,
      targetToken: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      baseToken: "So11111111111111111111111111111111111111112",
      amount: "0.5",
      breakoutPercentage: 5,
      confirmationPeriod: 60000,
      stopLoss: 3,
      takeProfit: 10,
      maxExecutions: 10,
    },
  },
  {
    id: "strategy2",
    name: "WIF Bollinger",
    type: "bollinger",
    targetToken: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    targetTokenSymbol: "WIF",
    baseToken: "So11111111111111111111111111111111111111112",
    baseTokenSymbol: "SOL",
    status: "paused",
    performance: {
      successRate: 65.0,
      profitLoss: 0.75,
      totalTrades: 20,
      successfulTrades: 13,
      failedTrades: 7,
      roi: 7.5,
      winLossRatio: 1.86,
    },
    config: {
      enabled: false,
      targetToken: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
      baseToken: "So11111111111111111111111111111111111111112",
      amount: "0.3",
      period: 20,
      standardDeviations: 2,
      stopLoss: 5,
      takeProfit: 15,
      maxExecutions: 20,
    },
  },
]

export default function StrategyMonitor() {
  const [strategies, setStrategies] = useState(mockStrategies)
  const [activeTab, setActiveTab] = useState("active")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null)
  const [newStrategy, setNewStrategy] = useState({
    name: "",
    type: "breakout",
    targetToken: "",
    baseToken: "So11111111111111111111111111111111111111112", // Default to SOL
    config: {
      amount: "0.1",
      breakoutPercentage: 5,
      confirmationPeriod: 60000,
      period: 20,
      standardDeviations: 2,
      stopLoss: 5,
      takeProfit: 15,
      maxExecutions: 10,
    },
  })
  const { tokens } = useTokenList({ onlyVerified: true })
  const { toast } = useToast()

  // Load strategies on component mount
  useEffect(() => {
    loadStrategies()
  }, [])

  // Load strategies
  const loadStrategies = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch strategies from a backend
      // For now, we'll just use the mock data
      setTimeout(() => {
        setStrategies(mockStrategies)
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error loading strategies:", error)
      toast({
        title: "Error loading strategies",
        description: "Failed to fetch strategies. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Toggle strategy status
  const toggleStrategyStatus = (id: string) => {
    setStrategies(
      strategies.map((strategy) => {
        if (strategy.id === id) {
          const newStatus = strategy.status === "active" ? "paused" : "active"

          // Update config enabled state
          const newConfig = {
            ...strategy.config,
            enabled: newStatus === "active",
          }

          return {
            ...strategy,
            status: newStatus,
            config: newConfig,
          }
        }
        return strategy
      }),
    )

    toast({
      title: "Strategy updated",
      description: `Strategy ${strategies.find((s) => s.id === id)?.name} is now ${
        strategies.find((s) => s.id === id)?.status === "active" ? "paused" : "active"
      }`,
    })
  }

  // Delete strategy
  const deleteStrategy = (id: string) => {
    setStrategies(strategies.filter((strategy) => strategy.id !== id))
    toast({
      title: "Strategy deleted",
      description: `Strategy ${strategies.find((s) => s.id === id)?.name} has been deleted`,
    })
  }

  // Create new strategy
  const createStrategy = () => {
    if (!newStrategy.name || !newStrategy.targetToken) {
      toast({
        title: "Missing information",
        description: "Please provide a name and select a target token",
        variant: "destructive",
      })
      return
    }

    const newId = `strategy${Date.now()}`
    const targetTokenInfo = tokens.find((t) => t.address === newStrategy.targetToken)
    const baseTokenInfo = tokens.find((t) => t.address === newStrategy.baseToken) || { symbol: "SOL" }

    const newStrategyObj = {
      id: newId,
      name: newStrategy.name,
      type: newStrategy.type,
      targetToken: newStrategy.targetToken,
      targetTokenSymbol: targetTokenInfo?.symbol || "Unknown",
      baseToken: newStrategy.baseToken,
      baseTokenSymbol: baseTokenInfo.symbol,
      status: "active",
      performance: {
        successRate: 0,
        profitLoss: 0,
        totalTrades: 0,
        successfulTrades: 0,
        failedTrades: 0,
        roi: 0,
        winLossRatio: 0,
      },
      config:
        newStrategy.type === "breakout"
          ? {
              enabled: true,
              targetToken: newStrategy.targetToken,
              baseToken: newStrategy.baseToken,
              amount: newStrategy.config.amount,
              breakoutPercentage: newStrategy.config.breakoutPercentage,
              confirmationPeriod: newStrategy.config.confirmationPeriod,
              stopLoss: newStrategy.config.stopLoss,
              takeProfit: newStrategy.config.takeProfit,
              maxExecutions: newStrategy.config.maxExecutions,
            }
          : {
              enabled: true,
              targetToken: newStrategy.targetToken,
              baseToken: newStrategy.baseToken,
              amount: newStrategy.config.amount,
              period: newStrategy.config.period,
              standardDeviations: newStrategy.config.standardDeviations,
              stopLoss: newStrategy.config.stopLoss,
              takeProfit: newStrategy.config.takeProfit,
              maxExecutions: newStrategy.config.maxExecutions,
            },
    }

    setStrategies([...strategies, newStrategyObj])

    // Reset form
    setNewStrategy({
      name: "",
      type: "breakout",
      targetToken: "",
      baseToken: "So11111111111111111111111111111111111111112",
      config: {
        amount: "0.1",
        breakoutPercentage: 5,
        confirmationPeriod: 60000,
        period: 20,
        standardDeviations: 2,
        stopLoss: 5,
        takeProfit: 15,
        maxExecutions: 10,
      },
    })

    toast({
      title: "Strategy created",
      description: `Strategy ${newStrategyObj.name} has been created and is now active`,
    })
  }

  // Update strategy
  const updateStrategy = () => {
    if (!selectedStrategy) return

    setStrategies(
      strategies.map((strategy) => {
        if (strategy.id === selectedStrategy.id) {
          return selectedStrategy
        }
        return strategy
      }),
    )

    toast({
      title: "Strategy updated",
      description: `Strategy ${selectedStrategy.name} has been updated`,
    })

    setSelectedStrategy(null)
  }

  // Duplicate strategy
  const duplicateStrategy = (strategy: any) => {
    const newStrategy = {
      ...strategy,
      id: `strategy${Date.now()}`,
      name: `${strategy.name} (Copy)`,
      status: "paused",
      config: {
        ...strategy.config,
        enabled: false,
      },
    }

    setStrategies([...strategies, newStrategy])

    toast({
      title: "Strategy duplicated",
      description: `Strategy ${strategy.name} has been duplicated`,
    })
  }

  // Filter strategies based on active tab
  const filteredStrategies = strategies.filter((strategy) => {
    if (activeTab === "active") return strategy.status === "active"
    if (activeTab === "paused") return strategy.status === "paused"
    return true // "all" tab
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Strategy Monitor</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStrategies}
            disabled={isLoading}
            className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium">
                <Plus className="h-4 w-4 mr-2" />
                New Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#151514] border-[#30302e] text-white">
              <DialogHeader>
                <DialogTitle>Create New Strategy</DialogTitle>
                <DialogDescription className="text-[#707070]">
                  Configure your automated trading strategy
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Strategy Name</Label>
                    <Input
                      id="name"
                      value={newStrategy.name}
                      onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                      className="bg-[#1d1d1c] border-[#30302e]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Strategy Type</Label>
                    <Select
                      value={newStrategy.type}
                      onValueChange={(value) => setNewStrategy({ ...newStrategy, type: value })}
                    >
                      <SelectTrigger id="type" className="bg-[#1d1d1c] border-[#30302e]">
                        <SelectValue placeholder="Select strategy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakout">Breakout</SelectItem>
                        <SelectItem value="bollinger">Bollinger Bands</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetToken">Target Token</Label>
                    <Select
                      value={newStrategy.targetToken}
                      onValueChange={(value) => setNewStrategy({ ...newStrategy, targetToken: value })}
                    >
                      <SelectTrigger id="targetToken" className="bg-[#1d1d1c] border-[#30302e]">
                        <SelectValue placeholder="Select target token" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.map((token) => (
                          <SelectItem key={token.address} value={token.address}>
                            {token.symbol} - {token.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="baseToken">Base Token</Label>
                    <Select
                      value={newStrategy.baseToken}
                      onValueChange={(value) => setNewStrategy({ ...newStrategy, baseToken: value })}
                    >
                      <SelectTrigger id="baseToken" className="bg-[#1d1d1c] border-[#30302e]">
                        <SelectValue placeholder="Select base token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="So11111111111111111111111111111111111111112">SOL</SelectItem>
                        <SelectItem value="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v">USDC</SelectItem>
                        <SelectItem value="Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">
                      Amount (
                      {newStrategy.baseToken === "So11111111111111111111111111111111111111112"
                        ? "SOL"
                        : newStrategy.baseToken === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                          ? "USDC"
                          : "USDT"}
                      )
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newStrategy.config.amount}
                      onChange={(e) =>
                        setNewStrategy({
                          ...newStrategy,
                          config: { ...newStrategy.config, amount: e.target.value },
                        })
                      }
                      className="bg-[#1d1d1c] border-[#30302e]"
                    />
                  </div>

                  {newStrategy.type === "breakout" ? (
                    <>
                      <div>
                        <Label htmlFor="breakoutPercentage">
                          Breakout Percentage: {newStrategy.config.breakoutPercentage}%
                        </Label>
                        <Slider
                          id="breakoutPercentage"
                          min={1}
                          max={20}
                          step={0.5}
                          value={[newStrategy.config.breakoutPercentage]}
                          onValueChange={(value) =>
                            setNewStrategy({
                              ...newStrategy,
                              config: { ...newStrategy.config, breakoutPercentage: value[0] },
                            })
                          }
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirmationPeriod">
                          Confirmation Period (ms): {newStrategy.config.confirmationPeriod}
                        </Label>
                        <Slider
                          id="confirmationPeriod"
                          min={10000}
                          max={300000}
                          step={10000}
                          value={[newStrategy.config.confirmationPeriod]}
                          onValueChange={(value) =>
                            setNewStrategy({
                              ...newStrategy,
                              config: { ...newStrategy.config, confirmationPeriod: value[0] },
                            })
                          }
                          className="mt-2"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="period">Period: {newStrategy.config.period}</Label>
                        <Slider
                          id="period"
                          min={5}
                          max={50}
                          step={1}
                          value={[newStrategy.config.period]}
                          onValueChange={(value) =>
                            setNewStrategy({
                              ...newStrategy,
                              config: { ...newStrategy.config, period: value[0] },
                            })
                          }
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="standardDeviations">
                          Standard Deviations: {newStrategy.config.standardDeviations}
                        </Label>
                        <Slider
                          id="standardDeviations"
                          min={1}
                          max={4}
                          step={0.1}
                          value={[newStrategy.config.standardDeviations]}
                          onValueChange={(value) =>
                            setNewStrategy({
                              ...newStrategy,
                              config: { ...newStrategy.config, standardDeviations: value[0] },
                            })
                          }
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="stopLoss">Stop Loss: {newStrategy.config.stopLoss}%</Label>
                    <Slider
                      id="stopLoss"
                      min={1}
                      max={20}
                      step={0.5}
                      value={[newStrategy.config.stopLoss]}
                      onValueChange={(value) =>
                        setNewStrategy({
                          ...newStrategy,
                          config: { ...newStrategy.config, stopLoss: value[0] },
                        })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="takeProfit">Take Profit: {newStrategy.config.takeProfit}%</Label>
                    <Slider
                      id="takeProfit"
                      min={1}
                      max={50}
                      step={1}
                      value={[newStrategy.config.takeProfit]}
                      onValueChange={(value) =>
                        setNewStrategy({
                          ...newStrategy,
                          config: { ...newStrategy.config, takeProfit: value[0] },
                        })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxExecutions">Max Executions: {newStrategy.config.maxExecutions}</Label>
                    <Slider
                      id="maxExecutions"
                      min={1}
                      max={50}
                      step={1}
                      value={[newStrategy.config.maxExecutions]}
                      onValueChange={(value) =>
                        setNewStrategy({
                          ...newStrategy,
                          config: { ...newStrategy.config, maxExecutions: value[0] },
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    setNewStrategy({
                      name: "",
                      type: "breakout",
                      targetToken: "",
                      baseToken: "So11111111111111111111111111111111111111112",
                      config: {
                        amount: "0.1",
                        breakoutPercentage: 5,
                        confirmationPeriod: 60000,
                        period: 20,
                        standardDeviations: 2,
                        stopLoss: 5,
                        takeProfit: 15,
                        maxExecutions: 10,
                      },
                    })
                  }
                >
                  Reset
                </Button>
                <Button onClick={createStrategy}>Create Strategy</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("all")}
          className={activeTab === "all" ? "" : "bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"}
        >
          All
        </Button>
        <Button
          variant={activeTab === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("active")}
          className={activeTab === "active" ? "" : "bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"}
        >
          Active
        </Button>
        <Button
          variant={activeTab === "paused" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("paused")}
          className={activeTab === "paused" ? "" : "bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"}
        >
          Paused
        </Button>
      </div>

      <div className="space-y-4">
        {filteredStrategies.length > 0 ? (
          filteredStrategies.map((strategy) => (
            <div key={strategy.id} className="bg-[#151514] border border-[#30302e] rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{strategy.name}</h3>
                  <p className="text-sm text-[#707070]">
                    {strategy.type === "breakout" ? "Breakout Strategy" : "Bollinger Bands Strategy"} •{" "}
                    {strategy.targetTokenSymbol}/{strategy.baseTokenSymbol}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      strategy.status === "active" ? "bg-[#1E3323] text-[#A4D756]" : "bg-[#1d1d1c] text-[#707070]"
                    }`}
                  >
                    {strategy.status === "active" ? "Active" : "Paused"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStrategyStatus(strategy.id)}
                    className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                  >
                    {strategy.status === "active" ? "Pause" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateStrategy(strategy)}
                    className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteStrategy(strategy.id)}
                    className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e] text-[#E57676]"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1d1d1c] p-3 rounded">
                  <p className="text-xs text-[#707070]">Success Rate</p>
                  <p className="text-lg font-medium">{strategy.performance.successRate.toFixed(1)}%</p>
                </div>
                <div className="bg-[#1d1d1c] p-3 rounded">
                  <p className="text-xs text-[#707070]">Profit/Loss</p>
                  <p
                    className={`text-lg font-medium ${strategy.performance.profitLoss >= 0 ? "text-[#A4D756]" : "text-[#E57676]"}`}
                  >
                    {strategy.performance.profitLoss >= 0 ? "+" : ""}
                    {strategy.performance.profitLoss.toFixed(2)} {strategy.baseTokenSymbol}
                  </p>
                </div>
                <div className="bg-[#1d1d1c] p-3 rounded">
                  <p className="text-xs text-[#707070]">Total Trades</p>
                  <p className="text-lg font-medium">{strategy.performance.totalTrades}</p>
                </div>
                <div className="bg-[#1d1d1c] p-3 rounded">
                  <p className="text-xs text-[#707070]">ROI</p>
                  <p
                    className={`text-lg font-medium ${strategy.performance.roi >= 0 ? "text-[#A4D756]" : "text-[#E57676]"}`}
                  >
                    {strategy.performance.roi >= 0 ? "+" : ""}
                    {strategy.performance.roi.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Configuration</h4>
                <div className="bg-[#1d1d1c] p-3 rounded grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-[#707070]">Amount</p>
                    <p className="text-sm">
                      {strategy.config.amount} {strategy.baseTokenSymbol}
                    </p>
                  </div>
                  {strategy.type === "breakout" ? (
                    <>
                      <div>
                        <p className="text-xs text-[#707070]">Breakout Percentage</p>
                        <p className="text-sm">{strategy.config.breakoutPercentage}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#707070]">Confirmation Period</p>
                        <p className="text-sm">{strategy.config.confirmationPeriod / 1000}s</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-[#707070]">Period</p>
                        <p className="text-sm">{strategy.config.period}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#707070]">Standard Deviations</p>
                        <p className="text-sm">{strategy.config.standardDeviations}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-xs text-[#707070]">Stop Loss</p>
                    <p className="text-sm">{strategy.config.stopLoss}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#707070]">Take Profit</p>
                    <p className="text-sm">{strategy.config.takeProfit}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#707070]">Max Executions</p>
                    <p className="text-sm">{strategy.config.maxExecutions}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#151514] border border-[#30302e] rounded-lg p-8 text-center">
            <p className="text-[#707070] mb-4">No strategies found</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Your First Strategy</Button>
              </DialogTrigger>
              <DialogContent className="bg-[#151514] border-[#30302e] text-white">
                {/* Strategy creation form would go here */}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  )
}
