"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Zap, TrendingUp, Clock, Settings, RefreshCw, Filter, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLocalStorage } from "@/hooks/use-local-storage"

// Default configuration
const DEFAULT_CONFIG = {
  minSpreadPercentage: 0.5,
  maxSpreadPercentage: 5.0,
  baseSymbols: ["SOL", "BTC", "ETH"],
  tradeSize: 100,
  leverage: 3,
  checkInterval: 30000,
  maxActiveArbitrages: 3,
  safetyChecks: true,
  enabled: false,
}

// Mock data for markets
const MOCK_MARKETS = [
  {
    marketAddress: "JUP-PERP-SOL-USDC",
    baseSymbol: "SOL",
    quoteSymbol: "USDC",
    oraclePrice: 120.45,
    markPrice: 120.52,
    fundingRate: 0.0001,
    volume24h: 15000000,
    openInterest: 5000000,
    maxLeverage: 20,
  },
  {
    marketAddress: "JUP-PERP-BTC-USDC",
    baseSymbol: "BTC",
    quoteSymbol: "USDC",
    oraclePrice: 62450.75,
    markPrice: 62475.25,
    fundingRate: 0.00015,
    volume24h: 50000000,
    openInterest: 25000000,
    maxLeverage: 20,
  },
  {
    marketAddress: "JUP-PERP-ETH-USDC",
    baseSymbol: "ETH",
    quoteSymbol: "USDC",
    oraclePrice: 3245.8,
    markPrice: 3248.5,
    fundingRate: 0.00012,
    volume24h: 30000000,
    openInterest: 15000000,
    maxLeverage: 20,
  },
  {
    marketAddress: "JUP-PERP-JTO-USDC",
    baseSymbol: "JTO",
    quoteSymbol: "USDC",
    oraclePrice: 2.45,
    markPrice: 2.46,
    fundingRate: 0.0002,
    volume24h: 5000000,
    openInterest: 2000000,
    maxLeverage: 10,
  },
]

// Mock data for opportunities
const MOCK_OPPORTUNITIES = [
  {
    baseSymbol: "SOL",
    spotPrice: 120.45,
    perpPrice: 120.85,
    spreadPercentage: 0.33,
    direction: "short",
    fundingRate: 0.0001,
    estimatedProfitPerDay: 0.42,
    timestamp: Date.now() - 300000,
  },
  {
    baseSymbol: "BTC",
    spotPrice: 62450.75,
    perpPrice: 62300.5,
    spreadPercentage: 0.24,
    direction: "long",
    fundingRate: 0.00015,
    estimatedProfitPerDay: 0.38,
    timestamp: Date.now() - 600000,
  },
]

// Mock data for active arbitrages
const MOCK_ARBITRAGES = [
  {
    id: "arb-123456",
    opportunity: {
      baseSymbol: "SOL",
      spotPrice: 119.75,
      perpPrice: 120.15,
      spreadPercentage: 0.33,
      direction: "short",
      fundingRate: 0.0001,
      estimatedProfitPerDay: 0.42,
      timestamp: Date.now() - 1800000,
    },
    perpPositionSize: 0.83,
    spotPositionSize: 0.83,
    entryTime: Date.now() - 1800000,
    targetExitSpread: 0.066,
    stopLossSpread: 0.66,
    status: "open",
  },
]

// Generate mock chart data
const generateMockChartData = (symbol = "SOL", dataPoints = 30) => {
  const data = []
  const now = Date.now()

  // Base prices for different symbols
  const basePrices = {
    SOL: 120.45,
    BTC: 62450.75,
    ETH: 3245.8,
    JTO: 2.45,
  }

  const basePrice = basePrices[symbol] || 120.45

  for (let i = dataPoints; i >= 0; i--) {
    const time = new Date(now - i * 60000)
    // Create a more realistic price movement with some randomness but also a trend
    const spotPrice =
      basePrice + Math.sin(i / 5) * (basePrice * 0.01) + (Math.random() * basePrice * 0.005 - basePrice * 0.0025)
    // Perpetual price usually has a small premium or discount
    const perpPrice = spotPrice * (1 + (Math.random() * 0.01 - 0.005))
    const spread = ((perpPrice - spotPrice) / spotPrice) * 100

    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      spotPrice,
      perpPrice,
      spread,
    })
  }

  return data
}

export default function PerpetualArbitrage() {
  const { toast } = useToast()

  // Use refs to track initialization
  const initialized = useRef(false)

  // Use local storage for persisting config
  const [config, setConfig] = useLocalStorage("perp-arbitrage-config", DEFAULT_CONFIG)

  // State variables
  const [isEnabled, setIsEnabled] = useState(false)
  const [activeArbitrages, setActiveArbitrages] = useState<any[]>(MOCK_ARBITRAGES)
  const [opportunities, setOpportunities] = useState<any[]>(MOCK_OPPORTUNITIES)
  const [markets, setMarkets] = useState<any[]>(MOCK_MARKETS)
  const [chartData, setChartData] = useState<any[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState("SOL")
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [filterDirection, setFilterDirection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date())

  // Fetch arbitrage opportunities
  const fetchOpportunities = useCallback(async () => {
    try {
      // In a real implementation, this would call the Jupiter Perpetuals API
      // For now, we'll generate mock opportunities
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockOpportunities = [...MOCK_OPPORTUNITIES]

      // Add some randomness to the opportunities
      mockOpportunities.forEach((opp) => {
        opp.spreadPercentage = opp.spreadPercentage * (1 + (Math.random() * 0.4 - 0.2))
        opp.estimatedProfitPerDay = Math.abs(opp.spreadPercentage) * 0.8 + Math.random() * 0.2
        opp.timestamp = Date.now() - Math.floor(Math.random() * 1200000)
      })

      setOpportunities(mockOpportunities)
      setLastUpdated(new Date())
      return mockOpportunities
    } catch (err: any) {
      setError(`Failed to fetch opportunities: ${err.message}`)
      console.error("Error fetching opportunities:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, []) // No dependencies needed for this mock implementation

  // Sync isEnabled with config.enabled on mount
  useEffect(() => {
    setIsEnabled(config.enabled)
  }, []) // Empty dependency array to run only once on mount

  // Refs for intervals
  const chartIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const dataIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to update chart data
  const updateChartData = useCallback(() => {
    const newChartData = generateMockChartData(selectedSymbol)
    setChartData(newChartData)
  }, [selectedSymbol])

  // Initialize once with mock data
  useEffect(() => {
    if (initialized.current) return

    setIsLoading(true)

    // Generate initial chart data
    const initialChartData = generateMockChartData(selectedSymbol)
    setChartData(initialChartData)

    setIsLoading(false)
    initialized.current = true

    // Set up polling interval for chart data
    chartIntervalRef.current = setInterval(() => {
      updateChartData()
    }, 10000)

    // Set up polling interval for market data
    dataIntervalRef.current = setInterval(() => {
      if (Math.random() > 0.7) {
        // Only update occasionally to avoid too many state updates
        fetchOpportunities()
      }
    }, 30000)

    return () => {
      // Clean up intervals
      if (chartIntervalRef.current) clearInterval(chartIntervalRef.current)
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current)
    }
  }, [updateChartData, fetchOpportunities]) // Empty dependency array to run only once

  // Update chart data when selected symbol changes
  useEffect(() => {
    if (!initialized.current) return

    setChartData(generateMockChartData(selectedSymbol))
  }, [selectedSymbol])

  // Fetch markets data
  const fetchMarkets = useCallback(async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would call the Jupiter Perpetuals API
      // For now, we'll just return the mock data
      await new Promise((resolve) => setTimeout(resolve, 800))
      setMarkets(MOCK_MARKETS)
      return MOCK_MARKETS
    } catch (err: any) {
      setError(`Failed to fetch markets: ${err.message}`)
      console.error("Error fetching markets:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Toggle strategy
  const handleToggleStrategy = useCallback(
    (enabled: boolean) => {
      if (isEnabled === enabled) return // Prevent unnecessary updates

      setIsEnabled(enabled)

      // Update config using the callback form to avoid stale closures
      setConfig((prev) => {
        if (prev.enabled === enabled) return prev
        return { ...prev, enabled }
      })

      toast({
        title: enabled ? "Perpetual Arbitrage Started" : "Perpetual Arbitrage Stopped",
        description: enabled
          ? "Now monitoring for arbitrage opportunities"
          : "No longer monitoring for arbitrage opportunities",
      })

      // If enabled, refresh data immediately
      if (enabled) {
        fetchOpportunities().catch((err) => {
          console.error("Error fetching opportunities:", err)
        })
      }
    },
    [toast, setConfig, isEnabled, fetchOpportunities],
  )

  // Update config
  const handleUpdateConfig = useCallback(() => {
    toast({
      title: "Configuration Updated",
      description: "Perpetual arbitrage configuration has been updated",
    })

    // Hide settings panel after update
    setShowSettings(false)
  }, [toast])

  // Refresh markets
  const handleRefreshMarkets = useCallback(() => {
    setIsLoading(true)

    fetchMarkets()
      .then(() => {
        toast({
          title: "Markets Refreshed",
          description: "Perpetual markets have been refreshed",
        })
      })
      .catch((err) => {
        toast({
          title: "Refresh Failed",
          description: `Failed to refresh markets: ${err.message}`,
          variant: "destructive",
        })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [toast, fetchMarkets])

  // Execute arbitrage manually
  const handleExecuteArbitrage = useCallback(
    (opportunity: any) => {
      setIsLoading(true)

      // In a real implementation, this would call the Jupiter Perpetuals API
      setTimeout(() => {
        const newArbitrage = {
          id: `arb-${Date.now()}`,
          opportunity,
          perpPositionSize: config.tradeSize / opportunity.perpPrice,
          spotPositionSize: config.tradeSize / opportunity.spotPrice,
          entryTime: Date.now(),
          targetExitSpread: opportunity.spreadPercentage * 0.2,
          stopLossSpread: opportunity.spreadPercentage * 2.0,
          status: "open",
        }

        setActiveArbitrages((prev) => [...prev, newArbitrage])
        setIsLoading(false)

        toast({
          title: "Arbitrage Executed",
          description: `${opportunity.direction.toUpperCase()} ${opportunity.baseSymbol} arbitrage executed successfully`,
        })
      }, 1500)
    },
    [config.tradeSize, toast],
  )

  // Close arbitrage position
  const handleCloseArbitrage = useCallback(
    (arbitrageId: string) => {
      setIsLoading(true)

      // Find the arbitrage
      const arbitrage = activeArbitrages.find((arb) => arb.id === arbitrageId)
      if (!arbitrage) {
        setIsLoading(false)
        return
      }

      // In a real implementation, this would call the Jupiter Perpetuals API
      setTimeout(() => {
        setActiveArbitrages((prev) =>
          prev.map((arb) =>
            arb.id === arbitrageId
              ? {
                  ...arb,
                  status: "closed",
                  pnl: Math.random() * 20 - 5,
                }
              : arb,
          ),
        )

        setIsLoading(false)

        toast({
          title: "Position Closed",
          description: "Arbitrage position has been closed",
        })
      }, 1500)
    },
    [activeArbitrages, toast],
  )

  // Memoize spread analysis calculations to improve performance
  const spreadAnalysis = useMemo(() => {
    if (chartData.length === 0) {
      return {
        current: "N/A",
        average: "N/A",
        min: "N/A",
        max: "N/A",
      }
    }

    const currentSpread = chartData[chartData.length - 1].spread.toFixed(4) + "%"
    const averageSpread = (chartData.reduce((sum, d) => sum + d.spread, 0) / chartData.length).toFixed(4) + "%"
    const minSpread = Math.min(...chartData.map((d) => d.spread)).toFixed(4) + "%"
    const maxSpread = Math.max(...chartData.map((d) => d.spread)).toFixed(4) + "%"

    return {
      current: currentSpread,
      average: averageSpread,
      min: minSpread,
      max: maxSpread,
    }
  }, [chartData])

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => filterDirection === null || opp.direction === filterDirection)
  }, [opportunities, filterDirection])

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-[#151514] border-[#30302e]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-syne">Perpetual Arbitrage</CardTitle>
              <CardDescription>Monitor and execute spot-perpetual arbitrage opportunities</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${isEnabled ? "bg-[#76D484] animate-pulse" : "bg-[#E57676]"}`}
                ></div>
                <span className="text-sm text-[#707070]">{isEnabled ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableStrategy"
                  checked={isEnabled}
                  onCheckedChange={handleToggleStrategy}
                  className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                />
                <Label htmlFor="enableStrategy">Enable</Label>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Last updated indicator */}
          {lastUpdated && (
            <div className="mt-1 text-xs text-[#707070] flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-2 p-2 bg-[#1d1d1c] rounded-md border border-[#E57676] flex items-center">
              <AlertCircle className="h-4 w-4 text-[#E57676] mr-2" />
              <span className="text-sm text-[#E57676]">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs text-[#707070] hover:text-white"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="bg-[#1d1d1c] border border-[#30302e]">
              <TabsTrigger value="chart">Price Spread</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="active">Active Arbitrages</TabsTrigger>
              <TabsTrigger value="markets">Markets</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="symbolSelect">Symbol:</Label>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger className="w-32 bg-[#1d1d1c] border-[#30302e]">
                      <SelectValue placeholder="Select symbol" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1d1d1c] border-[#30302e]">
                      {markets.map((market) => (
                        <SelectItem key={market.baseSymbol} value={market.baseSymbol}>
                          {market.baseSymbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                  onClick={() => setChartData(generateMockChartData(selectedSymbol))}
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh Chart
                </Button>
              </div>

              {isLoading && chartData.length === 0 ? (
                <div className="h-[400px] w-full flex items-center justify-center bg-[#1d1d1c] rounded-lg">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-[#22CCEE] animate-spin" />
                    <p className="mt-4 text-[#707070]">Loading chart data...</p>
                  </div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-[400px] w-full flex items-center justify-center bg-[#1d1d1c] rounded-lg">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="h-10 w-10 text-[#E57676]" />
                    <p className="mt-4 text-[#707070]">No chart data available</p>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] w-full overflow-hidden">
                  <ChartContainer
                    config={{
                      spotPrice: {
                        label: "Spot Price",
                        color: "hsl(var(--chart-1))",
                      },
                      perpPrice: {
                        label: "Perpetual Price",
                        color: "hsl(var(--chart-2))",
                      },
                      spread: {
                        label: "Spread %",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="99%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30302e" />
                        <XAxis
                          dataKey="time"
                          stroke="#707070"
                          fontSize={12}
                          tickLine={false}
                          tickCount={6}
                          minTickGap={30}
                        />
                        <YAxis
                          yAxisId="price"
                          orientation="left"
                          stroke="#707070"
                          fontSize={12}
                          tickLine={false}
                          domain={["auto", "auto"]}
                          width={80}
                        />
                        <YAxis
                          yAxisId="spread"
                          orientation="right"
                          stroke="#707070"
                          fontSize={12}
                          tickLine={false}
                          domain={[-2, 2]}
                          tickFormatter={(value) => `${value.toFixed(2)}%`}
                          width={50}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          yAxisId="price"
                          type="monotone"
                          dataKey="spotPrice"
                          stroke="var(--color-spotPrice)"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                          name="Spot Price"
                        />
                        <Line
                          yAxisId="price"
                          type="monotone"
                          dataKey="perpPrice"
                          stroke="var(--color-perpPrice)"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                          name="Perp Price"
                        />
                        <Line
                          yAxisId="spread"
                          type="monotone"
                          dataKey="spread"
                          stroke="var(--color-spread)"
                          strokeWidth={1}
                          dot={false}
                          isAnimationActive={false}
                          name="Spread %"
                        />

                        {/* Reference lines for min/max spread */}
                        <ReferenceLine
                          yAxisId="spread"
                          y={config.minSpreadPercentage}
                          stroke="#76D484"
                          strokeDasharray="3 3"
                          strokeWidth={1}
                          label={{
                            value: `+${config.minSpreadPercentage}%`,
                            position: "right",
                            fill: "#76D484",
                            fontSize: 10,
                          }}
                        />
                        <ReferenceLine
                          yAxisId="spread"
                          y={-config.minSpreadPercentage}
                          stroke="#76D484"
                          strokeDasharray="3 3"
                          strokeWidth={1}
                          label={{
                            value: `-${config.minSpreadPercentage}%`,
                            position: "right",
                            fill: "#76D484",
                            fontSize: 10,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}

              <div className="mt-4 p-4 rounded-lg bg-[#1d1d1c] border border-[#30302e]">
                <h3 className="text-sm font-medium mb-2">Spread Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#707070]">Current Spread</p>
                    <p className="text-sm">{spreadAnalysis.current}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#707070]">Average Spread (30m)</p>
                    <p className="text-sm">{spreadAnalysis.average}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#707070]">Min Spread</p>
                    <p className="text-sm">{spreadAnalysis.min}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#707070]">Max Spread</p>
                    <p className="text-sm">{spreadAnalysis.max}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="opportunities" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Arbitrage Opportunities</h3>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]">
                        <Filter className="mr-2 h-4 w-4" />
                        {filterDirection ? `${filterDirection.toUpperCase()} Only` : "All Directions"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1d1d1c] border-[#30302e]">
                      <DropdownMenuItem onClick={() => setFilterDirection(null)}>All Directions</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterDirection("long")}>Long Only</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterDirection("short")}>Short Only</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                    onClick={() => fetchOpportunities()}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {isLoading && filteredOpportunities.length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                  <p>Loading arbitrage opportunities...</p>
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No arbitrage opportunities detected yet.</p>
                  <p className="text-sm mt-2">Opportunities will appear when price spreads meet your criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1d1d1c]">
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Spread</TableHead>
                        <TableHead>Spot Price</TableHead>
                        <TableHead>Perp Price</TableHead>
                        <TableHead>Funding</TableHead>
                        <TableHead>Est. Profit/Day</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOpportunities.map((opp, index) => (
                        <TableRow key={index} className="border-[#30302e]">
                          <TableCell className="font-medium">{opp.baseSymbol}</TableCell>
                          <TableCell>
                            <Badge className={opp.direction === "long" ? "bg-[#76D484]" : "bg-[#E57676]"}>
                              {opp.direction}
                            </Badge>
                          </TableCell>
                          <TableCell>{opp.spreadPercentage.toFixed(4)}%</TableCell>
                          <TableCell>${opp.spotPrice.toFixed(2)}</TableCell>
                          <TableCell>${opp.perpPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={opp.fundingRate >= 0 ? "text-[#76D484]" : "text-[#E57676]"}>
                              {(opp.fundingRate * 100).toFixed(4)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={opp.estimatedProfitPerDay > 0 ? "text-[#76D484]" : "text-[#E57676]"}>
                              {opp.estimatedProfitPerDay.toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#22CCEE] hover:text-[#00B6E7]"
                              onClick={() => handleExecuteArbitrage(opp)}
                              disabled={isLoading}
                            >
                              <Zap className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              {activeArbitrages.length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active arbitrages at the moment.</p>
                  <p className="text-sm mt-2">Active arbitrages will appear here when executed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1d1d1c]">
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Entry Spread</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Entry Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>PnL</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeArbitrages.map((arb) => (
                        <TableRow key={arb.id} className="border-[#30302e]">
                          <TableCell className="font-medium">{arb.opportunity.baseSymbol}</TableCell>
                          <TableCell>
                            <Badge className={arb.opportunity.direction === "long" ? "bg-[#76D484]" : "bg-[#E57676]"}>
                              {arb.opportunity.direction}
                            </Badge>
                          </TableCell>
                          <TableCell>{arb.opportunity.spreadPercentage.toFixed(4)}%</TableCell>
                          <TableCell>${(arb.perpPositionSize * arb.opportunity.perpPrice).toFixed(2)}</TableCell>
                          <TableCell>{new Date(arb.entryTime).toLocaleTimeString()}</TableCell>
                          <TableCell>
                            {arb.status === "open" && <Badge className="bg-[#22CCEE]">Open</Badge>}
                            {arb.status === "closing" && <Badge className="bg-[#E57676] animate-pulse">Closing</Badge>}
                            {arb.status === "closed" && <Badge className="bg-[#76D484]">Closed</Badge>}
                            {arb.status === "failed" && <Badge className="bg-[#E57676]">Failed</Badge>}
                          </TableCell>
                          <TableCell>
                            {arb.pnl !== undefined ? (
                              <span className={arb.pnl >= 0 ? "text-[#76D484]" : "text-[#E57676]"}>
                                ${arb.pnl.toFixed(2)}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {arb.status === "open" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[#E57676] hover:text-[#ff4d4d]"
                                onClick={() => handleCloseArbitrage(arb.id)}
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
              )}
            </TabsContent>

            <TabsContent value="markets" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Available Markets</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                  onClick={handleRefreshMarkets}
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {isLoading && markets.length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                  <p>Loading markets...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1d1d1c]">
                      <TableRow>
                        <TableHead>Market</TableHead>
                        <TableHead>Oracle Price</TableHead>
                        <TableHead>Mark Price</TableHead>
                        <TableHead>Funding Rate</TableHead>
                        <TableHead>24h Volume</TableHead>
                        <TableHead>Open Interest</TableHead>
                        <TableHead>Max Leverage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {markets.map((market) => (
                        <TableRow key={market.marketAddress} className="border-[#30302e]">
                          <TableCell className="font-medium">
                            {market.baseSymbol}/{market.quoteSymbol}
                          </TableCell>
                          <TableCell>${market.oraclePrice.toFixed(2)}</TableCell>
                          <TableCell>${market.markPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={market.fundingRate >= 0 ? "text-[#76D484]" : "text-[#E57676]"}>
                              {(market.fundingRate * 100).toFixed(4)}%
                            </span>
                          </TableCell>
                          <TableCell>${(market.volume24h / 1000000).toFixed(2)}M</TableCell>
                          <TableCell>${(market.openInterest / 1000000).toFixed(2)}M</TableCell>
                          <TableCell>{market.maxLeverage}x</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Settings Panel */}
          <Collapsible open={showSettings} onOpenChange={setShowSettings}>
            <CollapsibleContent className="mt-4 p-4 rounded-lg bg-[#1d1d1c] border border-[#30302e] space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Strategy Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="text-[#707070] hover:text-white"
                >
                  Hide
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Spread Parameters</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="minSpread">Min Spread (%)</Label>
                      <span className="text-sm text-[#707070]">{config.minSpreadPercentage.toFixed(2)}%</span>
                    </div>
                    <Slider
                      id="minSpread"
                      min={0.1}
                      max={2.0}
                      step={0.05}
                      value={[config.minSpreadPercentage]}
                      onValueChange={(value) => setConfig({ ...config, minSpreadPercentage: value[0] })}
                      className="[&>span]:bg-gradient-to-r [&>span]:from-[#00B6E7] [&>span]:to-[#A4D756]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="maxSpread">Max Spread (%)</Label>
                      <span className="text-sm text-[#707070]">{config.maxSpreadPercentage.toFixed(2)}%</span>
                    </div>
                    <Slider
                      id="maxSpread"
                      min={1.0}
                      max={10.0}
                      step={0.5}
                      value={[config.maxSpreadPercentage]}
                      onValueChange={(value) => setConfig({ ...config, maxSpreadPercentage: value[0] })}
                      className="[&>span]:bg-gradient-to-r [&>span]:from-[#22CCEE] [&>span]:to-[#2ED3B7]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baseSymbols">Tokens to Monitor</Label>
                    <Input
                      id="baseSymbols"
                      value={config.baseSymbols.join(", ")}
                      onChange={(e) =>
                        setConfig({ ...config, baseSymbols: e.target.value.split(",").map((s) => s.trim()) })
                      }
                      className="bg-[#252523] border-[#30302e]"
                    />
                    <p className="text-xs text-[#707070]">Comma-separated list of tokens (e.g., SOL, BTC, ETH)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Trade Parameters</h4>

                  <div className="space-y-2">
                    <Label htmlFor="tradeSize">Trade Size (USD)</Label>
                    <Input
                      id="tradeSize"
                      type="number"
                      value={config.tradeSize}
                      onChange={(e) => setConfig({ ...config, tradeSize: Number(e.target.value) })}
                      className="bg-[#252523] border-[#30302e]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="leverage">Leverage</Label>
                      <span className="text-sm text-[#707070]">{config.leverage}x</span>
                    </div>
                    <Slider
                      id="leverage"
                      min={1}
                      max={10}
                      step={1}
                      value={[config.leverage]}
                      onValueChange={(value) => setConfig({ ...config, leverage: value[0] })}
                      className="[&>span]:bg-gradient-to-r [&>span]:from-[#2ED3B7] [&>span]:to-[#C8F284]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="checkInterval">Check Interval (seconds)</Label>
                      <span className="text-sm text-[#707070]">{config.checkInterval / 1000}</span>
                    </div>
                    <Slider
                      id="checkInterval"
                      min={10}
                      max={300}
                      step={10}
                      value={[config.checkInterval / 1000]}
                      onValueChange={(value) => setConfig({ ...config, checkInterval: value[0] * 1000 })}
                      className="[&>span]:bg-gradient-to-r [&>span]:from-[#00B6E7] [&>span]:to-[#A4D756]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="maxActiveArbitrages">Max Active Arbitrages</Label>
                      <span className="text-sm text-[#707070]">{config.maxActiveArbitrages}</span>
                    </div>
                    <Slider
                      id="maxActiveArbitrages"
                      min={1}
                      max={10}
                      step={1}
                      value={[config.maxActiveArbitrages]}
                      onValueChange={(value) => setConfig({ ...config, maxActiveArbitrages: value[0] })}
                      className="[&>span]:bg-gradient-to-r [&>span]:from-[#22CCEE] [&>span]:to-[#2ED3B7]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="safetyChecks">Safety Checks</Label>
                      <p className="text-xs text-[#707070]">Perform safety checks before executing arbitrage</p>
                    </div>
                    <Switch
                      id="safetyChecks"
                      checked={config.safetyChecks}
                      onCheckedChange={(checked) => setConfig({ ...config, safetyChecks: checked })}
                      className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
                  onClick={handleUpdateConfig}
                  disabled={isLoading}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Update Configuration
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  )
}
