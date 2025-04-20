"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ExternalLink, TrendingUp, TrendingDown, Users, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Token analytics data types
interface TokenData {
  address: string
  name: string
  symbol: string
  price: number
  priceChange24h: number
  marketCap: number
  volume24h: number
  liquidity: number
  holders: number
  createdAt: Date
  verified: boolean
  rugPullRisk: number
  safetyScore: number
}

interface HolderDistribution {
  type: string
  percentage: number
  count: number
}

interface TransactionHistory {
  time: string
  price: number
  volume: number
  buys: number
  sells: number
}

interface WhaleActivity {
  wallet: string
  label: string | null
  type: "buy" | "sell"
  amount: number
  value: number
  time: string
}

// Mock data generator
const generateMockTokenData = (address: string): TokenData => {
  const symbols = ["BONK", "WIF", "JTO", "PYTH", "BOME", "RENDER", "MANGO"]
  const names = ["Bonk", "Wif", "Jito", "Pyth Network", "Book of Meme", "Render", "Mango Markets"]

  const symbolIndex = Math.floor(Math.random() * symbols.length)

  return {
    address,
    name: names[symbolIndex],
    symbol: symbols[symbolIndex],
    price: 0.00001 + Math.random() * 0.001,
    priceChange24h: Math.random() * 40 - 20, // -20% to +20%
    marketCap: 1000000 + Math.random() * 100000000,
    volume24h: 100000 + Math.random() * 10000000,
    liquidity: 50000 + Math.random() * 5000000,
    holders: 1000 + Math.floor(Math.random() * 100000),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 0-30 days ago
    verified: Math.random() > 0.3,
    rugPullRisk: Math.random() * 100,
    safetyScore: Math.random() * 100,
  }
}

const generateMockHolderDistribution = (): HolderDistribution[] => {
  const whalePercentage = 20 + Math.random() * 40
  const institutionalPercentage = 10 + Math.random() * 20
  const retailPercentage = 100 - whalePercentage - institutionalPercentage

  return [
    { type: "Whales", percentage: whalePercentage, count: Math.floor(Math.random() * 50) + 5 },
    { type: "Institutional", percentage: institutionalPercentage, count: Math.floor(Math.random() * 100) + 20 },
    { type: "Retail", percentage: retailPercentage, count: Math.floor(Math.random() * 10000) + 1000 },
  ]
}

const generateMockTransactionHistory = (): TransactionHistory[] => {
  const data = []
  const now = new Date()

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000)
    const basePrice = 0.00001 + Math.sin(i / 5) * 0.000005
    const volume = 10000 + Math.random() * 50000
    const buys = Math.floor(volume * (0.4 + Math.random() * 0.3))
    const sells = Math.floor(volume - buys)

    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      price: basePrice,
      volume,
      buys,
      sells,
    })
  }

  return data
}

const generateMockWhaleActivity = (): WhaleActivity[] => {
  const data = []
  const now = new Date()

  for (let i = 0; i < 10; i++) {
    const time = new Date(now.getTime() - i * Math.random() * 3600000)
    const type = Math.random() > 0.5 ? "buy" : "sell"
    const amount = 100000 + Math.random() * 10000000
    const value = amount * (0.00001 + Math.random() * 0.00001)

    data.push({
      wallet: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      label:
        Math.random() > 0.7
          ? ["Alameda Research", "Jump Crypto", "Binance", "FTX"][Math.floor(Math.random() * 4)]
          : null,
      type,
      amount,
      value,
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    })
  }

  return data
}

// Token Analytics Component
export default function TokenAnalytics() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tokenAddress, setTokenAddress] = useState<string | null>(null)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [holderDistribution, setHolderDistribution] = useState<HolderDistribution[]>([])
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([])
  const [whaleActivity, setWhaleActivity] = useState<WhaleActivity[]>([])

  // Load token data when address changes
  useEffect(() => {
    if (!tokenAddress) return

    const fetchTokenData = async () => {
      setIsLoading(true)

      try {
        // In a real implementation, this would fetch data from APIs
        // For now, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setTokenData(generateMockTokenData(tokenAddress))
        setHolderDistribution(generateMockHolderDistribution())
        setTransactionHistory(generateMockTransactionHistory())
        setWhaleActivity(generateMockWhaleActivity())
      } catch (error) {
        console.error("Error fetching token data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch token data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokenData()
  }, [tokenAddress, toast])

  // Handle search
  const handleSearch = () => {
    if (!searchQuery) return

    setTokenAddress(searchQuery)
  }

  // Safety score color
  const getSafetyColor = (score: number) => {
    if (score >= 80) return "text-[#76D484]"
    if (score >= 50) return "text-[#F9CB40]"
    return "text-[#E57676]"
  }

  // Risk level text
  const getRiskLevel = (score: number) => {
    if (score >= 80) return "Low Risk"
    if (score >= 50) return "Medium Risk"
    return "High Risk"
  }

  // Pie chart colors
  const COLORS = ["#00B6E7", "#2ED3B7", "#A4D756"]

  // Memoized transaction volume data
  const volumeData = useMemo(() => {
    if (!transactionHistory.length) return []

    return transactionHistory.map((item) => ({
      time: item.time,
      buys: item.buys,
      sells: item.sells,
    }))
  }, [transactionHistory])

  return (
    <div className="space-y-4">
      <Card className="bg-[#151514] border-[#30302e]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-syne">Token Analytics</CardTitle>
              <CardDescription>Comprehensive on-chain analysis for Solana tokens</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-80">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#707070]" />
                <Input
                  placeholder="Search by token address or symbol"
                  className="pl-8 bg-[#1d1d1c] border-[#30302e]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
                onClick={handleSearch}
                disabled={isLoading || !searchQuery}
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22CCEE]"></div>
            </div>
          ) : !tokenData ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#707070]">
              <Search className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg">Search for a token to view analytics</p>
              <p className="text-sm mt-2">Enter a token address or symbol to get started</p>
            </div>
          ) : (
            <Tabs defaultValue="overview">
              <TabsList className="bg-[#1d1d1c] border border-[#30302e]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="holders">Holders</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="whales">Whale Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-[#1d1d1c] border-[#30302e]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        {tokenData.name} ({tokenData.symbol})
                      </CardTitle>
                      <CardDescription>
                        {tokenData.address.substring(0, 8)}...
                        {tokenData.address.substring(tokenData.address.length - 8)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-[#707070]">Price</p>
                          <div className="flex items-center">
                            <p className="text-2xl font-medium">${tokenData.price.toFixed(8)}</p>
                            <Badge
                              className={`ml-2 ${tokenData.priceChange24h >= 0 ? "bg-[#76D484]" : "bg-[#E57676]"}`}
                            >
                              {tokenData.priceChange24h >= 0 ? "+" : ""}
                              {tokenData.priceChange24h.toFixed(2)}%
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-[#707070]">Market Cap</p>
                            <p className="font-medium">${tokenData.marketCap.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#707070]">24h Volume</p>
                            <p className="font-medium">${tokenData.volume24h.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#707070]">Liquidity</p>
                            <p className="font-medium">${tokenData.liquidity.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#707070]">Holders</p>
                            <p className="font-medium">{tokenData.holders.toLocaleString()}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-[#707070]">Created</p>
                          <p className="font-medium">{tokenData.createdAt.toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[#707070]">Safety Score</p>
                            <p className={`text-lg font-medium ${getSafetyColor(tokenData.safetyScore)}`}>
                              {tokenData.safetyScore.toFixed(0)}/100 - {getRiskLevel(tokenData.safetyScore)}
                            </p>
                          </div>
                          {tokenData.verified ? (
                            <Badge className="bg-[#76D484]">Verified</Badge>
                          ) : (
                            <Badge className="bg-[#707070]">Unverified</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1d1d1c] border-[#30302e] md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Price History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={transactionHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30302e" />
                            <XAxis dataKey="time" stroke="#707070" />
                            <YAxis stroke="#707070" />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1d1d1c", borderColor: "#30302e" }}
                              labelStyle={{ color: "#ffffff" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="#22CCEE"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="holders" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[#1d1d1c] border-[#30302e]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Holder Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {holderDistribution.map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{item.type}</span>
                              <span className="text-sm">
                                {item.percentage.toFixed(1)}% ({item.count.toLocaleString()})
                              </span>
                            </div>
                            <div className="w-full bg-[#30302e] rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1d1d1c] border-[#30302e]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Top Holders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Wallet</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Percentage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.from({ length: 5 }).map((_, i) => {
                            const percentage = 20 - i * 3 + Math.random() * 2
                            return (
                              <TableRow key={i}>
                                <TableCell>
                                  {Math.random().toString(36).substring(2, 8)}...
                                  {Math.random().toString(36).substring(2, 6)}
                                </TableCell>
                                <TableCell>{((tokenData.holders * percentage) / 100).toFixed(0)}</TableCell>
                                <TableCell>{percentage.toFixed(2)}%</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-[#1d1d1c] border-[#30302e] md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Transaction Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={volumeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30302e" />
                            <XAxis dataKey="time" stroke="#707070" />
                            <YAxis stroke="#707070" />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1d1d1c", borderColor: "#30302e" }}
                              labelStyle={{ color: "#ffffff" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="buys"
                              stroke="#76D484"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4 }}
                              name="Buys"
                            />
                            <Line
                              type="monotone"
                              dataKey="sells"
                              stroke="#E57676"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4 }}
                              name="Sells"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1d1d1c] border-[#30302e]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Transaction Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-[#707070]">24h Transactions</p>
                          <p className="text-2xl font-medium">{Math.floor(Math.random() * 10000).toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-[#707070]">Buys</p>
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1 text-[#76D484]" />
                              <p className="font-medium">{Math.floor(Math.random() * 6000).toLocaleString()}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-[#707070]">Sells</p>
                            <div className="flex items-center">
                              <TrendingDown className="h-4 w-4 mr-1 text-[#E57676]" />
                              <p className="font-medium">{Math.floor(Math.random() * 4000).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-[#707070]">Unique Wallets</p>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-[#22CCEE]" />
                            <p className="font-medium">{Math.floor(Math.random() * 2000).toLocaleString()}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-[#707070]">Average Transaction</p>
                          <p className="font-medium">${Math.floor(Math.random() * 1000 + 100).toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="whales" className="mt-4">
                <Card className="bg-[#1d1d1c] border-[#30302e]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Whale Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Wallet</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {whaleActivity.map((activity, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{activity.wallet}</div>
                                {activity.label && <div className="text-xs text-[#707070]">{activity.label}</div>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={activity.type === "buy" ? "bg-[#76D484]" : "bg-[#E57676]"}>
                                {activity.type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>{activity.amount.toLocaleString()} tokens</TableCell>
                            <TableCell>${activity.value.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-[#707070]" />
                                {activity.time}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 w-8">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
