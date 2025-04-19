"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, AlertTriangle, CheckCircle2, XCircle, Clock, RefreshCw, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data for strategies
const strategies = [
  {
    id: "breakout",
    name: "Breakout Strategy",
    description: "Identifies and trades breakout patterns with momentum confirmation",
    enabled: true,
    performance: {
      winRate: 68,
      profitFactor: 2.1,
      totalTrades: 25,
      avgProfit: 3.2,
    },
    signals: [
      {
        id: "signal1",
        token: "SOL",
        direction: "long",
        confidence: 85,
        timestamp: Date.now() - 300000,
        status: "active",
      },
      {
        id: "signal2",
        token: "JTO",
        direction: "long",
        confidence: 72,
        timestamp: Date.now() - 900000,
        status: "active",
      },
    ],
  },
  {
    id: "bollinger",
    name: "Bollinger Bands Strategy",
    description: "Uses Bollinger Bands to identify overbought and oversold conditions",
    enabled: true,
    performance: {
      winRate: 62,
      profitFactor: 1.8,
      totalTrades: 42,
      avgProfit: 2.5,
    },
    signals: [
      {
        id: "signal3",
        token: "WIF",
        direction: "short",
        confidence: 78,
        timestamp: Date.now() - 600000,
        status: "active",
      },
    ],
  },
  {
    id: "bootstrap",
    name: "Bootstrap Strategy",
    description: "Combines token creation and transaction bundling for coordinated launches",
    enabled: false,
    performance: {
      winRate: 75,
      profitFactor: 2.5,
      totalTrades: 12,
      avgProfit: 4.8,
    },
    signals: [],
  },
  {
    id: "creation-aware",
    name: "Creation Aware Trader",
    description: "Watches for new token creations and automatically executes buy/sell transactions",
    enabled: true,
    performance: {
      winRate: 58,
      profitFactor: 1.6,
      totalTrades: 36,
      avgProfit: 2.1,
    },
    signals: [
      {
        id: "signal4",
        token: "BONK",
        direction: "long",
        confidence: 65,
        timestamp: Date.now() - 1200000,
        status: "completed",
      },
    ],
  },
]

// Mock data for trades
const trades = [
  {
    id: "trade1",
    strategy: "breakout",
    token: "SOL",
    entry: 148.25,
    exit: 152.8,
    profit: 3.07,
    direction: "long",
    timestamp: Date.now() - 3600000,
    status: "completed",
  },
  {
    id: "trade2",
    strategy: "bollinger",
    token: "WIF",
    entry: 0.00022,
    exit: 0.00019,
    profit: -13.64,
    direction: "long",
    timestamp: Date.now() - 7200000,
    status: "completed",
  },
  {
    id: "trade3",
    strategy: "creation-aware",
    token: "BONK",
    entry: 0.000011,
    exit: 0.000012,
    profit: 9.09,
    direction: "long",
    timestamp: Date.now() - 10800000,
    status: "completed",
  },
  {
    id: "trade4",
    strategy: "breakout",
    token: "JTO",
    entry: 1.45,
    exit: null,
    profit: null,
    direction: "long",
    timestamp: Date.now() - 1800000,
    status: "active",
  },
]

export default function StrategyMonitor() {
  const { toast } = useToast()
  const [activeStrategies, setActiveStrategies] = useState(strategies)
  const [activeTrades, setActiveTrades] = useState(trades)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)

  // Use refs to track initialization
  const initialized = useRef(false)

  // Initialize once with mock data
  useEffect(() => {
    if (initialized.current) return

    // Set mock data
    setActiveStrategies(strategies)
    setActiveTrades(trades)
    initialized.current = true

    // Set up polling interval
    const interval = setInterval(() => {
      // In a real app, this would fetch updated data
      // For now, we'll just leave it empty to avoid state updates
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Toggle strategy enabled state
  const handleToggleStrategy = (id: string, enabled: boolean) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setActiveStrategies((prev) => prev.map((strategy) => (strategy.id === id ? { ...strategy, enabled } : strategy)))

      setIsLoading(false)

      toast({
        title: enabled ? "Strategy Enabled" : "Strategy Disabled",
        description: `${activeStrategies.find((s) => s.id === id)?.name} has been ${enabled ? "enabled" : "disabled"}`,
      })
    }, 500)
  }

  // Execute a signal
  const handleExecuteSignal = (strategyId: string, signalId: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Find the strategy and signal
      const strategy = activeStrategies.find((s) => s.id === strategyId)
      const signal = strategy?.signals.find((s) => s.id === signalId)

      if (strategy && signal) {
        // Create a new trade
        const newTrade = {
          id: `trade${Date.now()}`,
          strategy: strategyId,
          token: signal.token,
          entry:
            signal.token === "SOL"
              ? 148.25
              : signal.token === "WIF"
                ? 0.00022
                : signal.token === "JTO"
                  ? 1.45
                  : 0.000011,
          exit: null,
          profit: null,
          direction: signal.direction,
          timestamp: Date.now(),
          status: "active" as const,
        }

        // Add the new trade
        setActiveTrades((prev) => [newTrade, ...prev])

        // Update the signal status
        setActiveStrategies((prev) =>
          prev.map((s) =>
            s.id === strategyId
              ? {
                  ...s,
                  signals: s.signals.map((sig) => (sig.id === signalId ? { ...sig, status: "executing" } : sig)),
                }
              : s,
          ),
        )

        setIsLoading(false)

        toast({
          title: "Signal Executed",
          description: `${signal.token} ${signal.direction} signal has been executed`,
        })
      }
    }, 800)
  }

  // Close a trade
  const handleCloseTrade = (tradeId: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setActiveTrades((prev) =>
        prev.map((trade) => {
          if (trade.id === tradeId) {
            const exitPrice = trade.entry * (1 + (Math.random() * 0.1 - 0.05))
            const profitPercent =
              ((exitPrice - trade.entry) / trade.entry) * 100 * (trade.direction === "long" ? 1 : -1)

            return {
              ...trade,
              exit: exitPrice,
              profit: profitPercent,
              status: "completed",
            }
          }
          return trade
        }),
      )

      setIsLoading(false)

      toast({
        title: "Trade Closed",
        description: "The trade has been closed",
      })
    }, 800)
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-[#151514] border-[#30302e]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-syne">Strategy Monitor</CardTitle>
              <CardDescription>Monitor and manage trading strategies</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="bg-[#1d1d1c] border-[#30302e]"
                onClick={() => {
                  setIsLoading(true)
                  setTimeout(() => {
                    setIsLoading(false)
                    toast({
                      title: "Strategies Refreshed",
                      description: "All strategies have been refreshed",
                    })
                  }, 800)
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="strategies">
            <TabsList className="bg-[#1d1d1c] border border-[#30302e]">
              <TabsTrigger value="strategies">Active Strategies</TabsTrigger>
              <TabsTrigger value="signals">Trading Signals</TabsTrigger>
              <TabsTrigger value="trades">Recent Trades</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="strategies" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeStrategies.map((strategy) => (
                  <Card key={strategy.id} className="bg-[#1d1d1c] border-[#30302e]">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-syne">{strategy.name}</CardTitle>
                        <Switch
                          checked={strategy.enabled}
                          onCheckedChange={(checked) => handleToggleStrategy(strategy.id, checked)}
                          className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                          disabled={isLoading}
                        />
                      </div>
                      <CardDescription>{strategy.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[#707070]">Win Rate</p>
                          <div className="flex items-center">
                            <p className="text-lg font-medium">{strategy.performance.winRate}%</p>
                            <Progress
                              value={strategy.performance.winRate}
                              max={100}
                              className="h-2 ml-2 flex-1 bg-[#30302e] [&>div]:bg-gradient-to-r [&>div]:from-[#00B6E7] [&>div]:to-[#A4D756]"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[#707070]">Profit Factor</p>
                          <p className="text-lg font-medium">{strategy.performance.profitFactor.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#707070]">Total Trades</p>
                          <p className="text-lg font-medium">{strategy.performance.totalTrades}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#707070]">Avg. Profit</p>
                          <p className="text-lg font-medium">{strategy.performance.avgProfit.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div
                            className={`h-2 w-2 rounded-full ${strategy.enabled ? "bg-[#76D484] animate-pulse" : "bg-[#E57676]"}`}
                          ></div>
                          <span className="text-sm ml-2">{strategy.enabled ? "Active" : "Inactive"}</span>
                        </div>
                        <div className="text-sm text-[#707070]">{strategy.signals.length} active signals</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="signals" className="mt-4">
              {activeStrategies.flatMap((s) => s.signals).length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active signals at the moment.</p>
                  <p className="text-sm mt-2">Signals will appear here when strategies generate them.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1d1d1c]">
                      <TableRow>
                        <TableHead>Strategy</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeStrategies.flatMap((strategy) =>
                        strategy.signals.map((signal) => (
                          <TableRow key={signal.id} className="border-[#30302e]">
                            <TableCell>{strategy.name}</TableCell>
                            <TableCell className="font-medium">{signal.token}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  signal.direction === "long"
                                    ? "bg-[#76D484] text-[#0C0C0C]"
                                    : "bg-[#E57676] text-[#0C0C0C]"
                                }
                              >
                                {signal.direction}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-2">{signal.confidence}%</span>
                                <Progress
                                  value={signal.confidence}
                                  max={100}
                                  className="h-2 w-16 bg-[#30302e] [&>div]:bg-gradient-to-r [&>div]:from-[#00B6E7] [&>div]:to-[#A4D756]"
                                />
                              </div>
                            </TableCell>
                            <TableCell>{new Date(signal.timestamp).toLocaleTimeString()}</TableCell>
                            <TableCell>
                              {signal.status === "active" && (
                                <Badge className="bg-[#22CCEE] text-[#0C0C0C]">Active</Badge>
                              )}
                              {signal.status === "executing" && (
                                <Badge className="bg-[#22CCEE] text-[#0C0C0C] animate-pulse">Executing</Badge>
                              )}
                              {signal.status === "completed" && (
                                <Badge className="bg-[#76D484] text-[#0C0C0C]">Completed</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {signal.status === "active" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-[#22CCEE] hover:text-[#00B6E7]"
                                  onClick={() => handleExecuteSignal(strategy.id, signal.id)}
                                  disabled={isLoading}
                                >
                                  <Zap className="mr-2 h-4 w-4" />
                                  Execute
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )),
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trades" className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#1d1d1c]">
                    <TableRow>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>Exit</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeTrades.map((trade) => (
                      <TableRow key={trade.id} className="border-[#30302e]">
                        <TableCell>
                          {activeStrategies.find((s) => s.id === trade.strategy)?.name || trade.strategy}
                        </TableCell>
                        <TableCell className="font-medium">{trade.token}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              trade.direction === "long" ? "bg-[#76D484] text-[#0C0C0C]" : "bg-[#E57676] text-[#0C0C0C]"
                            }
                          >
                            {trade.direction}
                          </Badge>
                        </TableCell>
                        <TableCell>{trade.entry}</TableCell>
                        <TableCell>{trade.exit || "—"}</TableCell>
                        <TableCell>
                          {trade.profit !== null ? (
                            <span className={trade.profit >= 0 ? "text-[#76D484]" : "text-[#E57676]"}>
                              {trade.profit >= 0 ? "+" : ""}
                              {trade.profit.toFixed(2)}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{new Date(trade.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          {trade.status === "active" && (
                            <Badge className="bg-[#22CCEE] text-[#0C0C0C]">
                              <Clock className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {trade.status === "completed" && trade.profit !== null && trade.profit >= 0 && (
                            <Badge className="bg-[#76D484] text-[#0C0C0C]">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Profit
                            </Badge>
                          )}
                          {trade.status === "completed" && trade.profit !== null && trade.profit < 0 && (
                            <Badge className="bg-[#E57676] text-[#0C0C0C]">
                              <XCircle className="h-3 w-3 mr-1" />
                              Loss
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {trade.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-[#E57676] hover:text-[#ff4d4d]"
                              onClick={() => handleCloseTrade(trade.id)}
                              disabled={isLoading}
                            >
                              Close
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#1d1d1c] border-[#30302e]">
                  <CardHeader>
                    <CardTitle className="text-lg font-syne">Strategy Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeStrategies.map((strategy) => (
                        <div key={strategy.id} className="flex items-center">
                          <div className="w-1/3">
                            <p className="text-sm">{strategy.name}</p>
                          </div>
                          <div className="w-1/3">
                            <Progress
                              value={strategy.performance.winRate}
                              max={100}
                              className="h-2 bg-[#30302e] [&>div]:bg-gradient-to-r [&>div]:from-[#00B6E7] [&>div]:to-[#A4D756]"
                            />
                          </div>
                          <div className="w-1/3 pl-4">
                            <p className="text-sm">{strategy.performance.winRate}% win rate</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1d1d1c] border-[#30302e]">
                  <CardHeader>
                    <CardTitle className="text-lg font-syne">Token Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["SOL", "BONK", "WIF", "JTO"].map((token) => {
                        const tokenTrades = activeTrades.filter((t) => t.token === token && t.profit !== null)
                        const avgProfit =
                          tokenTrades.length > 0
                            ? tokenTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / tokenTrades.length
                            : 0

                        return (
                          <div key={token} className="flex items-center">
                            <div className="w-1/3">
                              <p className="text-sm">{token}</p>
                            </div>
                            <div className="w-1/3">
                              <Progress
                                value={50 + avgProfit}
                                max={100}
                                className="h-2 bg-[#30302e] [&>div]:bg-gradient-to-r [&>div]:from-[#00B6E7] [&>div]:to-[#A4D756]"
                              />
                            </div>
                            <div className="w-1/3 pl-4">
                              <p className="text-sm">
                                <span className={avgProfit >= 0 ? "text-[#76D484]" : "text-[#E57676]"}>
                                  {avgProfit >= 0 ? "+" : ""}
                                  {avgProfit.toFixed(2)}%
                                </span>
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1d1d1c] border-[#30302e] md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-syne">Overall Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-[#707070]">Total Trades</p>
                        <p className="text-2xl font-syne">
                          {activeStrategies.reduce((sum, s) => sum + s.performance.totalTrades, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#707070]">Win Rate</p>
                        <p className="text-2xl font-syne">
                          {Math.round(
                            activeStrategies.reduce(
                              (sum, s) => sum + s.performance.winRate * s.performance.totalTrades,
                              0,
                            ) / activeStrategies.reduce((sum, s) => sum + s.performance.totalTrades, 0),
                          )}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#707070]">Profit Factor</p>
                        <p className="text-2xl font-syne">
                          {(
                            activeStrategies.reduce(
                              (sum, s) => sum + s.performance.profitFactor * s.performance.totalTrades,
                              0,
                            ) / activeStrategies.reduce((sum, s) => sum + s.performance.totalTrades, 0)
                          ).toFixed(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#707070]">Avg. Profit</p>
                        <p className="text-2xl font-syne">
                          {(
                            activeStrategies.reduce(
                              (sum, s) => sum + s.performance.avgProfit * s.performance.totalTrades,
                              0,
                            ) / activeStrategies.reduce((sum, s) => sum + s.performance.totalTrades, 0)
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
