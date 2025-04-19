"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, RefreshCwIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { fetchPerpMarkets, fetchSpotPrice } from "@/services/jupiter-perpetuals-service"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Define types
interface ArbitrageConfig {
  enabled: boolean
  minSpreadBps: number
  maxPositionSize: number
  targetToken: string
}

interface ArbitrageOpportunity {
  token: string
  spotPrice: number
  perpPrice: number
  spreadBps: number
  timestamp: number
}

interface ChartDataPoint {
  time: string
  spread: number
}

// Define the market type to match what fetchPerpMarkets returns
interface PerpMarket {
  symbol: string
  markPrice: number
  indexPrice: number
  fundingRate: number
  volume24h: number
  openInterest: number
}

const DEFAULT_CONFIG: ArbitrageConfig = {
  enabled: false,
  minSpreadBps: 50, // 0.5%
  maxPositionSize: 100, // in USD
  targetToken: "SOL",
}

const TOKENS = ["SOL", "BTC", "ETH", "BONK", "JTO", "JUP"]

// Export both as default and named export for backward compatibility
export function PerpetualArbitrage() {
  // Component implementation remains the same
  return <PerpetualArbitrageContent />
}

// Default export for new imports
export default PerpetualArbitrage

// Internal component to avoid duplicate code
function PerpetualArbitrageContent() {
  // Refs to prevent unnecessary re-renders
  const configRef = useRef<ArbitrageConfig>(DEFAULT_CONFIG)

  // State
  const [config, setConfig] = useLocalStorage<ArbitrageConfig>("perpetual-arbitrage-config", DEFAULT_CONFIG)
  const [isEnabled, setIsEnabled] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [markets, setMarkets] = useState<PerpMarket[]>([])
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [activePosition, setActivePosition] = useState<any | null>(null)

  const { toast } = useToast()

  // Initialize isEnabled from config only once on mount
  useEffect(() => {
    setIsEnabled(config.enabled)
    // Store the latest config in the ref
    configRef.current = config
    // Intentionally not including config in deps to prevent re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Memoize the fetchMarkets function to prevent it from changing on every render
  const fetchMarkets = useCallback(async () => {
    try {
      setIsLoading(true)
      const marketsData = await fetchPerpMarkets()
      setMarkets(marketsData)
    } catch (error) {
      console.error("Error fetching markets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch perpetual markets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Memoize the fetchOpportunities function
  const fetchOpportunities = useCallback(async () => {
    if (!markets.length) return

    let loadingStarted = false
    try {
      setIsLoading(true)
      loadingStarted = true
      const currentOpportunities: ArbitrageOpportunity[] = []

      // Process markets in parallel for better performance
      const opportunityPromises = markets
        .filter((market) => TOKENS.includes(market.symbol))
        .map(async (market) => {
          try {
            const spotPrice = await fetchSpotPrice(market.symbol)
            const perpPrice = market.markPrice

            if (spotPrice && perpPrice && spotPrice !== 0) {
              // Calculate spread in basis points (1 bp = 0.01%)
              const spreadBps = Math.abs((perpPrice - spotPrice) / spotPrice) * 10000

              return {
                token: market.symbol,
                spotPrice,
                perpPrice,
                spreadBps,
                timestamp: Date.now(),
              }
            }
            return null
          } catch (error) {
            console.error(`Error processing market ${market.symbol}:`, error)
            return null
          }
        })

      const results = await Promise.all(opportunityPromises)
      const validOpportunities = results.filter(Boolean) as ArbitrageOpportunity[]

      setOpportunities(validOpportunities)

      // Update chart data with the new opportunities
      updateChartData(validOpportunities)
    } catch (error) {
      console.error("Error fetching opportunities:", error)
    } finally {
      // Only set isLoading to false if we were the ones who set it to true
      if (loadingStarted) {
        setIsLoading(false)
      }
    }
  }, [markets]) // Only depend on markets

  // Memoize the spreadAnalysis calculation
  const spreadAnalysis = useMemo(() => {
    if (!opportunities.length) return { avgSpread: 0, maxSpread: 0, minSpread: 0 }

    const spreads = opportunities.map((opp) => opp.spreadBps)
    return {
      avgSpread: spreads.reduce((a, b) => a + b, 0) / spreads.length,
      maxSpread: Math.max(...spreads),
      minSpread: Math.min(...spreads),
    }
  }, [opportunities])

  // Memoize the updateChartData function
  const updateChartData = useCallback((newOpportunities: ArbitrageOpportunity[]) => {
    if (!newOpportunities.length) return

    // Find the opportunity for the target token
    const targetOpp = newOpportunities.find((opp) => opp.token === configRef.current.targetToken)

    if (targetOpp) {
      const time = new Date(targetOpp.timestamp).toLocaleTimeString()

      setChartData((prevData) => {
        const newData = [...prevData, { time, spread: targetOpp.spreadBps }]
        // Keep only the last 20 data points
        return newData.slice(-20)
      })
    }
  }, [])

  // Handle toggle strategy
  const handleToggleStrategy = useCallback(() => {
    const newEnabledState = !isEnabled
    setIsEnabled(newEnabledState)

    // Use the callback form of setConfig to avoid stale closures
    setConfig((prevConfig) => {
      const newConfig = { ...prevConfig, enabled: newEnabledState }
      // Update the ref with the latest config
      configRef.current = newConfig
      return newConfig
    })
  }, [isEnabled, setConfig])

  // Handle update config
  const handleUpdateConfig = useCallback(
    (key: keyof ArbitrageConfig, value: any) => {
      setConfig((prevConfig) => {
        const newConfig = { ...prevConfig, [key]: value }
        // Update the ref with the latest config
        configRef.current = newConfig
        return newConfig
      })
    },
    [setConfig],
  )

  // Handle refresh markets
  const handleRefreshMarkets = useCallback(() => {
    fetchMarkets()
  }, [fetchMarkets])

  // Handle execute arbitrage
  const handleExecuteArbitrage = useCallback(() => {
    // Find the best opportunity that meets the minimum spread requirement
    const bestOpp = opportunities
      .filter((opp) => opp.spreadBps >= configRef.current.minSpreadBps)
      .sort((a, b) => b.spreadBps - a.spreadBps)[0]

    if (!bestOpp) {
      toast({
        title: "No viable opportunity",
        description: "No arbitrage opportunity meets the minimum spread requirement",
      })
      return
    }

    // Simulate opening a position
    setActivePosition({
      token: bestOpp.token,
      entrySpotPrice: bestOpp.spotPrice,
      entryPerpPrice: bestOpp.perpPrice,
      entrySpreadBps: bestOpp.spreadBps,
      size: configRef.current.maxPositionSize,
      timestamp: Date.now(),
    })

    toast({
      title: "Arbitrage Executed",
      description: `Opened ${bestOpp.token} position with ${bestOpp.spreadBps.toFixed(2)} bps spread`,
    })
  }, [opportunities, toast])

  // Handle close arbitrage
  const handleCloseArbitrage = useCallback(() => {
    if (!activePosition) return

    // Simulate closing the position
    const pnl = (Math.random() * 2 - 1) * activePosition.size * 0.1 // Random PnL between -10% and +10%

    toast({
      title: "Position Closed",
      description: `Closed ${activePosition.token} position with ${pnl.toFixed(2)} USD ${pnl >= 0 ? "profit" : "loss"}`,
      variant: pnl >= 0 ? "default" : "destructive",
    })

    setActivePosition(null)
  }, [activePosition, toast])

  // Fetch markets on initial load
  useEffect(() => {
    fetchMarkets()
  }, [fetchMarkets])

  // Periodically fetch opportunities if strategy is enabled
  useEffect(() => {
    if (!isEnabled || !markets.length) return

    fetchOpportunities()

    const interval = setInterval(() => {
      fetchOpportunities()
    }, 30000) // Every 30 seconds

    // Clean up interval on component unmount or when dependencies change
    return () => clearInterval(interval)
  }, [isEnabled, markets, fetchOpportunities])

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Perpetual Arbitrage</CardTitle>
            <CardDescription>Monitor and execute spot-perpetual arbitrage opportunities</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleStrategy}
              aria-label="Toggle strategy"
              id="strategy-toggle"
            />
            <Label htmlFor="strategy-toggle" className={isEnabled ? "text-green-500" : "text-gray-500"}>
              {isEnabled ? "Enabled" : "Disabled"}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left column - Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="targetToken">Target Token</Label>
                <select
                  id="targetToken"
                  className="bg-background border rounded px-2 py-1"
                  value={config.targetToken}
                  onChange={(e) => handleUpdateConfig("targetToken", e.target.value)}
                >
                  {TOKENS.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="minSpread">Min Spread (bps)</Label>
                <Input
                  id="minSpread"
                  type="number"
                  value={config.minSpreadBps}
                  onChange={(e) => handleUpdateConfig("minSpreadBps", Number(e.target.value))}
                  min="0"
                  aria-label="Minimum spread in basis points"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="maxSize">Max Position Size (USD)</Label>
                <Input
                  id="maxSize"
                  type="number"
                  value={config.maxPositionSize}
                  onChange={(e) => handleUpdateConfig("maxPositionSize", Number(e.target.value))}
                  min="0"
                  aria-label="Maximum position size in USD"
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Spread Analysis</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-muted/20 p-2 rounded">
                  <div className="text-muted-foreground">Avg</div>
                  <div>{spreadAnalysis.avgSpread.toFixed(2)} bps</div>
                </div>
                <div className="bg-muted/20 p-2 rounded">
                  <div className="text-muted-foreground">Max</div>
                  <div>{spreadAnalysis.maxSpread.toFixed(2)} bps</div>
                </div>
                <div className="bg-muted/20 p-2 rounded">
                  <div className="text-muted-foreground">Min</div>
                  <div>{spreadAnalysis.minSpread.toFixed(2)} bps</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button onClick={handleRefreshMarkets} disabled={isLoading} className="w-full">
                <RefreshCwIcon className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh Markets
              </Button>
              {!activePosition ? (
                <Button
                  onClick={handleExecuteArbitrage}
                  disabled={isLoading || !opportunities.length}
                  className="w-full"
                  variant="default"
                >
                  Execute Arbitrage
                </Button>
              ) : (
                <Button onClick={handleCloseArbitrage} className="w-full" variant="destructive">
                  Close Position
                </Button>
              )}
            </div>
          </div>

          {/* Middle column - Chart */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">{config.targetToken} Spread History (bps)</h3>
            <div className="h-[300px] border rounded-lg p-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.split(":").slice(0, 2).join(":")}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(2)} bps`, "Spread"]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="spread"
                      stroke="#22CCEE"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available. Enable the strategy or refresh markets.
                </div>
              )}
            </div>

            {/* Active position */}
            {activePosition && (
              <div className="mt-4 border rounded-lg p-4 bg-muted/10">
                <h4 className="font-medium mb-2">Active Position</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Token:</span>{" "}
                    <Badge variant="outline">{activePosition.token}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span> ${activePosition.size.toFixed(2)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entry Spread:</span>{" "}
                    {activePosition.entrySpreadBps.toFixed(2)} bps
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spot Price:</span> $
                    {activePosition.entrySpotPrice.toFixed(4)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Perp Price:</span> $
                    {activePosition.entryPerpPrice.toFixed(4)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>{" "}
                    {new Date(activePosition.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Opportunities table */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Current Opportunities</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full" aria-label="Arbitrage opportunities">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-2 text-left">Token</th>
                  <th className="px-4 py-2 text-right">Spot Price</th>
                  <th className="px-4 py-2 text-right">Perp Price</th>
                  <th className="px-4 py-2 text-right">Spread (bps)</th>
                  <th className="px-4 py-2 text-right">Direction</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.length > 0 ? (
                  opportunities.map((opp, index) => (
                    <tr
                      key={`${opp.token}-${index}`}
                      className={opp.spreadBps >= config.minSpreadBps ? "bg-green-500/10" : "hover:bg-muted/5"}
                    >
                      <td className="px-4 py-2">
                        <Badge variant="outline">{opp.token}</Badge>
                      </td>
                      <td className="px-4 py-2 text-right">${opp.spotPrice.toFixed(4)}</td>
                      <td className="px-4 py-2 text-right">${opp.perpPrice.toFixed(4)}</td>
                      <td className="px-4 py-2 text-right font-medium">{opp.spreadBps.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">
                        {opp.perpPrice > opp.spotPrice ? (
                          <div className="flex items-center justify-end text-green-500">
                            <span className="mr-1">Buy Spot, Sell Perp</span>
                            <ArrowUpIcon className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-end text-red-500">
                            <span className="mr-1">Buy Perp, Sell Spot</span>
                            <ArrowDownIcon className="h-4 w-4" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      {isLoading
                        ? "Loading opportunities..."
                        : "No opportunities available. Click 'Refresh Markets' to check for new data."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
