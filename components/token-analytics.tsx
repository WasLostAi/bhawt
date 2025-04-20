"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTokenList } from "@/hooks/use-token-list"
import { useTokenPrice } from "@/hooks/use-token-price"
import { RefreshCw, Search, TrendingUp, TrendingDown, Clock, BarChart3, ExternalLink, Info } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

// Mock data for token analytics
const priceHistoryData = [
  { time: "00:00", price: 0.00001234 },
  { time: "01:00", price: 0.00001245 },
  { time: "02:00", price: 0.00001256 },
  { time: "03:00", price: 0.00001278 },
  { time: "04:00", price: 0.0000129 },
  { time: "05:00", price: 0.0000131 },
  { time: "06:00", price: 0.00001298 },
  { time: "07:00", price: 0.0000132 },
  { time: "08:00", price: 0.00001345 },
  { time: "09:00", price: 0.00001367 },
  { time: "10:00", price: 0.0000139 },
  { time: "11:00", price: 0.0000141 },
  { time: "12:00", price: 0.0000143 },
  { time: "13:00", price: 0.0000145 },
  { time: "14:00", price: 0.0000147 },
  { time: "15:00", price: 0.0000149 },
  { time: "16:00", price: 0.0000151 },
  { time: "17:00", price: 0.0000153 },
  { time: "18:00", price: 0.0000155 },
  { time: "19:00", price: 0.0000157 },
  { time: "20:00", price: 0.0000159 },
  { time: "21:00", price: 0.0000161 },
  { time: "22:00", price: 0.0000163 },
  { time: "23:00", price: 0.0000165 },
]

const volumeData = [
  { time: "00:00", volume: 45000 },
  { time: "01:00", volume: 52000 },
  { time: "02:00", volume: 49000 },
  { time: "03:00", volume: 47000 },
  { time: "04:00", volume: 53000 },
  { time: "05:00", volume: 56000 },
  { time: "06:00", volume: 62000 },
  { time: "07:00", volume: 58000 },
  { time: "08:00", volume: 63000 },
  { time: "09:00", volume: 72000 },
  { time: "10:00", volume: 85000 },
  { time: "11:00", volume: 92000 },
  { time: "12:00", volume: 86000 },
  { time: "13:00", volume: 89000 },
  { time: "14:00", volume: 95000 },
  { time: "15:00", volume: 102000 },
  { time: "16:00", volume: 108000 },
  { time: "17:00", volume: 115000 },
  { time: "18:00", volume: 125000 },
  { time: "19:00", volume: 132000 },
  { time: "20:00", volume: 128000 },
  { time: "21:00", volume: 118000 },
  { time: "22:00", volume: 105000 },
  { time: "23:00", volume: 98000 },
]

export default function TokenAnalytics() {
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [timeRange, setTimeRange] = useState<string>("24h")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("price")

  const { tokens } = useTokenList({ onlyVerified: true })
  const { price, priceChange24h } = useTokenPrice(selectedToken, { refreshInterval: 30000 })

  // Handle token selection
  const handleTokenSelect = (value: string) => {
    setIsLoading(true)
    setSelectedToken(value)

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true)

    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  // Format price with appropriate decimals
  const formatPrice = (price: number) => {
    if (price < 0.00001) return price.toFixed(10)
    if (price < 0.0001) return price.toFixed(8)
    if (price < 0.01) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    return price.toFixed(2)
  }

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Token Analytics</h2>
          <p className="text-[#707070]">Comprehensive analytics for Solana tokens</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#707070]" />
            <Select value={selectedToken} onValueChange={handleTokenSelect}>
              <SelectTrigger className="pl-8 bg-[#1d1d1c] border-[#30302e] w-full">
                <SelectValue placeholder="Select a token" />
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

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full md:w-32 bg-[#1d1d1c] border-[#30302e]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {selectedToken ? (
        <div className="space-y-6">
          {/* Token Overview Card */}
          <Card className="bg-[#151514] border-[#30302e]">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-[#707070] mb-1">Price</p>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold">${formatPrice(price || 0)}</h3>
                    <span
                      className={`ml-2 flex items-center text-sm ${priceChange24h && priceChange24h >= 0 ? "text-[#A4D756]" : "text-[#E57676]"}`}
                    >
                      {priceChange24h && priceChange24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(priceChange24h || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[#707070] mb-1">24h Volume</p>
                  <h3 className="text-2xl font-bold">${formatNumber(1250000)}</h3>
                </div>

                <div>
                  <p className="text-sm text-[#707070] mb-1">Market Cap</p>
                  <h3 className="text-2xl font-bold">${formatNumber(45000000)}</h3>
                </div>

                <div>
                  <p className="text-sm text-[#707070] mb-1">Holders</p>
                  <h3 className="text-2xl font-bold">{formatNumber(12500)}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <p className="text-sm text-[#707070] mb-1">Circulating Supply</p>
                  <h3 className="text-lg font-bold">{formatNumber(850000000)}</h3>
                </div>

                <div>
                  <p className="text-sm text-[#707070] mb-1">Total Supply</p>
                  <h3 className="text-lg font-bold">{formatNumber(1000000000)}</h3>
                </div>

                <div>
                  <p className="text-sm text-[#707070] mb-1">Total Liquidity</p>
                  <h3 className="text-lg font-bold">${formatNumber(3500000)}</h3>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#30302e]">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-[#707070] mr-2" />
                    <span className="text-sm text-[#707070]">Created: 3 months ago</span>
                  </div>

                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-[#707070] mr-2" />
                    <span className="text-sm text-[#707070]">Transactions: 45,678</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#22CCEE] hover:text-[#22CCEE] hover:bg-[#1d1d1c]"
                  onClick={() => window.open(`https://solscan.io/token/${selectedToken}`, "_blank")}
                >
                  View on Solscan
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="price">
                <TrendingUp className="h-4 w-4 mr-2" />
                Price History
              </TabsTrigger>
              <TabsTrigger value="volume">
                <BarChart3 className="h-4 w-4 mr-2" />
                Volume Analysis
              </TabsTrigger>
            </TabsList>

            {/* Price History Tab */}
            <TabsContent value="price">
              <Card className="bg-[#151514] border-[#30302e]">
                <CardHeader>
                  <CardTitle>Price History</CardTitle>
                  <CardDescription>Token price over time with volume indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22CCEE" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#22CCEE" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" />
                        <YAxis domain={["auto", "auto"]} tickFormatter={(value) => `${formatPrice(value)}`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#30302e" />
                        <Tooltip
                          formatter={(value) => [`$${formatPrice(value as number)}`, "Price"]}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#22CCEE"
                          fillOpacity={1}
                          fill="url(#colorPrice)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-[#1d1d1c] p-3 rounded">
                      <p className="text-xs text-[#707070]">All-Time High</p>
                      <p className="text-lg font-medium">$0.00001650</p>
                      <p className="text-xs text-[#707070]">23:00 Today</p>
                    </div>

                    <div className="bg-[#1d1d1c] p-3 rounded">
                      <p className="text-xs text-[#707070]">All-Time Low</p>
                      <p className="text-lg font-medium">$0.00001234</p>
                      <p className="text-xs text-[#707070]">00:00 Today</p>
                    </div>

                    <div className="bg-[#1d1d1c] p-3 rounded">
                      <p className="text-xs text-[#707070]">24h Change</p>
                      <p className="text-lg font-medium text-[#A4D756]">+33.71%</p>
                    </div>

                    <div className="bg-[#1d1d1c] p-3 rounded">
                      <p className="text-xs text-[#707070]">Price Volatility</p>
                      <p className="text-lg font-medium">High</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Volume Analysis Tab */}
            <TabsContent value="volume">
              <Card className="bg-[#151514] border-[#30302e]">
                <CardHeader>
                  <CardTitle>Volume Analysis</CardTitle>
                  <CardDescription>Trading volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={volumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A4D756" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#A4D756" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#30302e" />
                        <Tooltip
                          formatter={(value) => [`$${formatNumber(value as number)}`, "Volume"]}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="volume"
                          stroke="#A4D756"
                          fillOpacity={1}
                          fill="url(#colorVolume)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-[#1d1d1c] p-3 rounded">
                      <p className="text-xs text-[#707070]">Total 24h Volume</p>
                      <p className="text-lg font-medium">$1,250,000</p>
                    </div>

                    <div className="bg-[#1d1d1c] p-3 rounded">
                      <p className="text-xs text-[#707070]">Peak Volume</p>
                      <p className="text-lg font-medium">$132,000</p>
                      <p className="text-xs text-[#707070]">19:00 Today</p>
                    </div>

                    <div className="bg-[#1d1d1c] p-3 rounded">
                      <p className="text-xs text-[#707070]">Volume Change</p>
                      <p className="text-lg font-medium text-[#A4D756]">+28.5%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card className="bg-[#151514] border-[#30302e]">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-[#707070] mb-4" />
            <h3 className="text-xl font-medium mb-2">Select a token to view analytics</h3>
            <p className="text-[#707070] mb-6">Choose a token from the dropdown above to view detailed analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
