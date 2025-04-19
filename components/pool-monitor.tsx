"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Eye, ArrowRight, AlertCircle, Clock, Target } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useJupiterContext } from "@/contexts/jupiter-context"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

// SOL mint address
const SOL_MINT = "So11111111111111111111111111111111111111112"

// Mock data for the pool monitor
const mockPools = [
  {
    id: "pool1",
    name: "SOL/BONK",
    mintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    liquidity: 245000,
    priceChange: 12.5,
    created: "2 mins ago",
    isNew: true,
  },
  {
    id: "pool2",
    name: "SOL/WIF",
    mintAddress: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    liquidity: 1250000,
    priceChange: -3.2,
    created: "1 hour ago",
    isNew: false,
  },
  {
    id: "pool3",
    name: "SOL/PYTH",
    mintAddress: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    liquidity: 780000,
    priceChange: 5.7,
    created: "3 hours ago",
    isNew: false,
  },
  {
    id: "pool4",
    name: "SOL/JTO",
    mintAddress: "7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn",
    liquidity: 520000,
    priceChange: 1.2,
    created: "5 hours ago",
    isNew: false,
  },
]

// Generate mock price data for initial render
const generateMockPriceData = () => {
  const data = []
  const now = new Date()
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000)
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      price: 0.00001 + Math.random() * 0.00001,
      liquidity: 200000 + Math.random() * 100000,
    })
  }
  return data
}

export default function PoolMonitor() {
  const { toast } = useToast()
  const {
    getTokenQuote,
    executeSnipe,
    startPriceMonitor,
    stopPriceMonitor,
    monitorState,
    isLoading,
    error,
    walletPublicKey,
  } = useJupiterContext()

  const [pools] = useState(mockPools) // Remove setPools as it's not used
  const [selectedPool, setSelectedPool] = useState(mockPools[0])
  const [priceData, setPriceData] = useState(() => generateMockPriceData()) // Use function initialization
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [chartError, setChartError] = useState(false)

  // Advanced snipe settings
  const [snipeAmount, setSnipeAmount] = useState<number>(1_000_000_000) // 1 SOL in lamports
  const [maxSlippage, setMaxSlippage] = useState<number>(1.0) // 1%
  const [priorityFee, setPriorityFee] = useState<number>(250000) // 0.00025 SOL
  const [targetPrice, setTargetPrice] = useState<number | null>(null)
  const [skipPreflight, setSkipPreflight] = useState<boolean>(true)
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  // Use refs to store mutable values that don't trigger re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const selectedPoolRef = useRef(selectedPool)

  // Update ref when selectedPool changes
  useEffect(() => {
    selectedPoolRef.current = selectedPool

    // When pool changes, update target price if monitoring is active
    if (monitorState.isMonitoring && monitorState.targetPrice) {
      setTargetPrice(monitorState.targetPrice)
    }
  }, [selectedPool, monitorState])

  // Memoize the fetchPriceData function to avoid recreating it on every render
  const fetchPriceData = useCallback(async () => {
    setIsLoadingQuote(true)
    setApiError(null)

    try {
      // For demo purposes, we'll simulate API calls with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate mock data that looks like it came from the API
      const dataPoints = []
      const currentPool = selectedPoolRef.current

      for (let i = 30; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60000)
        dataPoints.push({
          time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          price: 0.00001 * (1 + Math.sin(i / 5) * 0.3),
          liquidity: currentPool.liquidity * (1 - i * 0.01),
        })
      }

      setPriceData(dataPoints)
    } catch (err: any) {
      console.error("Error fetching price data:", err)
      setApiError("Failed to fetch price data. Please try again later.")
      toast({
        title: "Error fetching price data",
        description: err.message || "Could not fetch price data from Jupiter API",
        variant: "destructive",
      })
    } finally {
      setIsLoadingQuote(false)
    }
  }, [toast]) // Only depend on toast

  // Set up data fetching and interval
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Fetch initial data
    fetchPriceData()

    // Set up interval to update price data
    intervalRef.current = setInterval(() => {
      setPriceData((prev) => {
        if (prev.length === 0) return prev

        const newData = [...prev.slice(1)]
        const lastTime = new Date()
        const lastPrice = prev[prev.length - 1].price

        // Generate a new price point with some random variation
        newData.push({
          time: lastTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          price: lastPrice * (1 + (Math.random() * 0.04 - 0.02)),
          liquidity: prev[prev.length - 1].liquidity * (1 + (Math.random() * 0.02 - 0.01)),
        })

        return newData
      })
    }, 5000)

    // Clean up interval on unmount or when selectedPool changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [selectedPool, fetchPriceData]) // Depend on selectedPool and fetchPriceData

  // Handle immediate snipe button click
  const handleSnipe = async () => {
    if (!walletPublicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to snipe tokens",
        variant: "destructive",
      })
      return
    }

    try {
      toast({
        title: "Initiating snipe",
        description: `Attempting to snipe ${selectedPool.name}...`,
      })

      // Get current price from the latest data point
      const currentPrice = priceData[priceData.length - 1]?.price || 0

      // Execute the snipe with advanced options
      const result = await executeSnipe(
        SOL_MINT,
        selectedPool.mintAddress,
        snipeAmount,
        currentPrice * 1.05, // Allow 5% above current price for immediate execution
        maxSlippage,
        priorityFee,
        {
          skipPreflight,
          timeout: 30000, // 30 seconds
          retryCount: isAdvancedMode ? 3 : 1,
        },
      )

      if (result.success && result.data) {
        toast({
          title: "Snipe successful!",
          description: `Successfully sniped ${selectedPool.name}`,
          variant: "default",
        })
      } else {
        toast({
          title: "Snipe failed",
          description: result.error?.message || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Snipe error",
        description: err.message || "An error occurred while sniping",
        variant: "destructive",
      })
    }
  }

  // Handle target price monitoring
  const handleStartMonitor = () => {
    if (!walletPublicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to monitor prices",
        variant: "destructive",
      })
      return
    }

    if (!targetPrice) {
      toast({
        title: "Target price required",
        description: "Please set a target price to start monitoring",
        variant: "destructive",
      })
      return
    }

    const success = startPriceMonitor(SOL_MINT, selectedPool.mintAddress, snipeAmount, targetPrice, maxSlippage, {
      skipPreflight,
      priorityFee,
      retryCount: isAdvancedMode ? 3 : 1,
    })

    if (success) {
      toast({
        title: "Price monitoring started",
        description: `Monitoring ${selectedPool.name} for target price of ${targetPrice.toFixed(8)}`,
      })
      setIsDialogOpen(false)
    } else {
      toast({
        title: "Failed to start monitoring",
        description: "Please check your wallet connection and try again",
        variant: "destructive",
      })
    }
  }

  // Handle stop monitoring
  const handleStopMonitor = () => {
    const success = stopPriceMonitor()

    if (success) {
      toast({
        title: "Price monitoring stopped",
        description: "Price monitoring has been stopped",
      })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 bg-[#151514] border-[#30302e]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-syne">{selectedPool.name} Price Chart</CardTitle>
              <CardDescription>
                Mint: {selectedPool.mintAddress.substring(0, 6)}...
                {selectedPool.mintAddress.substring(selectedPool.mintAddress.length - 4)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {monitorState.isMonitoring ? (
                <Button
                  variant="outline"
                  className="bg-[#1d1d1c] hover:bg-[#30302e] border-[#E57676] text-[#E57676]"
                  onClick={handleStopMonitor}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Stop Monitoring
                </Button>
              ) : (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#1d1d1c] hover:bg-[#30302e] border-[#22CCEE] text-[#22CCEE]"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Set Target
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#151514] border-[#30302e] text-white">
                    <DialogHeader>
                      <DialogTitle>Set Target Price</DialogTitle>
                      <DialogDescription className="text-[#707070]">
                        Set a target price to automatically snipe when reached
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="targetPrice">Target Price (SOL)</Label>
                        <Input
                          id="targetPrice"
                          type="number"
                          step="0.00000001"
                          className="bg-[#1d1d1c] border-[#30302e]"
                          value={targetPrice || ""}
                          onChange={(e) => setTargetPrice(Number.parseFloat(e.target.value) || null)}
                          placeholder="e.g. 0.00001"
                        />
                        <p className="text-xs text-[#707070]">
                          Current price: {priceData[priceData.length - 1]?.price.toFixed(8) || "Loading..."}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount to Swap (SOL)</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.1"
                          className="bg-[#1d1d1c] border-[#30302e]"
                          value={snipeAmount / 1_000_000_000}
                          onChange={(e) =>
                            setSnipeAmount(Number.parseFloat(e.target.value) * 1_000_000_000 || 1_000_000_000)
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <Label htmlFor="slippage">Max Slippage (%)</Label>
                          <span className="text-sm text-[#707070]">{maxSlippage}%</span>
                        </div>
                        <Slider
                          id="slippage"
                          min={0.1}
                          max={5}
                          step={0.1}
                          value={[maxSlippage]}
                          onValueChange={(value) => setMaxSlippage(value[0])}
                          className="[&>span]:bg-gradient-to-r [&>span]:from-[#00B6E7] [&>span]:to-[#A4D756]"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="advancedMode"
                          checked={isAdvancedMode}
                          onCheckedChange={setIsAdvancedMode}
                          className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                        />
                        <Label htmlFor="advancedMode">Advanced Mode</Label>
                      </div>

                      {isAdvancedMode && (
                        <>
                          <div className="grid gap-2">
                            <div className="flex justify-between">
                              <Label htmlFor="priorityFee">Priority Fee (SOL)</Label>
                              <span className="text-sm text-[#707070]">{(priorityFee / 1_000_000_000).toFixed(6)}</span>
                            </div>
                            <Slider
                              id="priorityFee"
                              min={100000}
                              max={1000000}
                              step={10000}
                              value={[priorityFee]}
                              onValueChange={(value) => setPriorityFee(value[0])}
                              className="[&>span]:bg-gradient-to-r [&>span]:from-[#22CCEE] [&>span]:to-[#2ED3B7]"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="skipPreflight"
                              checked={skipPreflight}
                              onCheckedChange={setSkipPreflight}
                              className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                            />
                            <Label htmlFor="skipPreflight">Skip Preflight Checks</Label>
                          </div>
                        </>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        className="bg-[#1d1d1c] border-[#30302e]"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
                        onClick={handleStartMonitor}
                      >
                        Start Monitoring
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <Button
                variant="outline"
                className="bg-[#30302e] hover:bg-[#1d1d1c] border-[#707070]"
                onClick={handleSnipe}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Sniping...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Snipe Now
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Monitoring status indicator */}
          {monitorState.isMonitoring && (
            <div className="mt-2 p-2 bg-[#1d1d1c] rounded-md border border-[#22CCEE] flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-[#22CCEE] mr-2 animate-pulse" />
                <span>
                  Monitoring for target price:{" "}
                  <span className="font-medium">{monitorState.targetPrice?.toFixed(8)}</span>
                </span>
              </div>
              <div className="text-sm text-[#707070]">
                Current: {monitorState.currentPrice?.toFixed(8) || "Loading..."}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingQuote && priceData.length === 0 ? (
            <div className="h-[300px] w-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00B6E7] border-t-transparent"></div>
                <p className="mt-4 text-[#707070]">Loading price data from Jupiter API...</p>
              </div>
            </div>
          ) : apiError ? (
            <div className="h-[300px] w-full flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <AlertCircle className="h-8 w-8 text-[#E57676]" />
                <p className="mt-4 text-[#E57676]">Error loading price data</p>
                <p className="mt-2 text-sm text-[#707070]">{apiError}</p>
              </div>
            </div>
          ) : chartError ? (
            <div className="h-[300px] w-full flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <AlertCircle className="h-8 w-8 text-[#E57676]" />
                <p className="mt-4 text-[#E57676]">Error rendering chart</p>
                <p className="mt-2 text-sm text-[#707070]">Please try refreshing the page</p>
              </div>
            </div>
          ) : (
            <div className="h-[300px] w-full overflow-hidden">
              <ChartContainer
                config={{
                  price: {
                    label: "Price (SOL)",
                    color: "hsl(var(--chart-1))",
                  },
                  liquidity: {
                    label: "Liquidity (USD)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="99%" height="100%">
                  <LineChart data={priceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis
                      dataKey="time"
                      stroke="#707070"
                      fontSize={12}
                      tickLine={false}
                      tickCount={6}
                      minTickGap={30}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#707070"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => value.toFixed(8)}
                      width={80}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#707070"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      width={50}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="price"
                      stroke="var(--color-price)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="liquidity"
                      stroke="var(--color-liquidity)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />

                    {/* Target price reference line */}
                    {monitorState.isMonitoring && monitorState.targetPrice && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        data={priceData.map((d) => ({ ...d, targetPrice: monitorState.targetPrice }))}
                        dataKey="targetPrice"
                        stroke="#E57676"
                        strokeDasharray="3 3"
                        strokeWidth={1}
                        dot={false}
                        isAnimationActive={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#151514] border-[#30302e]">
        <CardHeader>
          <CardTitle className="text-xl font-syne">New Pools</CardTitle>
          <CardDescription>Real-time pool monitoring via WebSocket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pools.map((pool) => (
              <div
                key={pool.id}
                className={`p-3 rounded-lg border ${selectedPool.id === pool.id ? "bg-[#1d1d1c] border-[#22CCEE]" : "bg-[#0C0C0C] border-[#30302e]"} cursor-pointer transition-all hover:border-[#22CCEE]`}
                onClick={() => setSelectedPool(pool)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {pool.isNew ? (
                        <div className="h-2 w-2 rounded-full bg-[#A4D756] animate-pulse"></div>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-[#707070]"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{pool.name}</div>
                      <div className="text-xs text-[#707070]">Created {pool.created}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pool.isNew && (
                      <Badge className="bg-gradient-to-r from-[#2ED3B7] to-[#C8F284] text-[#0C0C0C]">NEW</Badge>
                    )}
                    <Badge className={`${pool.priceChange >= 0 ? "bg-[#76D484]" : "bg-[#E57676]"} text-[#0C0C0C]`}>
                      {pool.priceChange >= 0 ? "+" : ""}
                      {pool.priceChange}%
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-[#707070]">
                  <div>Liquidity: ${pool.liquidity.toLocaleString()}</div>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-[#707070] hover:text-white">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-[#707070] hover:text-white">
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
