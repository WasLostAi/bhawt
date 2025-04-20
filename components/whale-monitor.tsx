"use client"

import { useState, useEffect } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
} from "@/components/ui"
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Bell,
  BellOff,
  Search,
  TrendingUp,
} from "lucide-react"
import {
  whaleTrackingService,
  type WhaleTransaction,
  type WhaleWallet,
  type WhaleSignal,
} from "@/services/whale-tracking-service"
import { useToast } from "@/components/ui/use-toast"

export default function WhaleMonitor() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [wallets, setWallets] = useState<WhaleWallet[]>([])
  const [signals, setSignals] = useState<WhaleSignal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [watchedTokens, setWatchedTokens] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [timeRange, setTimeRange] = useState("24h")
  const [transactionType, setTransactionType] = useState("all")
  const { toast } = useToast()

  // Load data on component mount
  useEffect(() => {
    loadData()
    // Poll for updates every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Load all whale data
  const loadData = async () => {
    setIsLoading(true)
    try {
      // Use Promise.allSettled to handle potential failures in individual requests
      const results = await Promise.allSettled([
        whaleTrackingService.getRecentTransactions(20),
        whaleTrackingService.getWhaleWallets(10),
        whaleTrackingService.getWhaleSignals(10),
      ])

      // Process results safely
      if (results[0].status === "fulfilled") {
        setTransactions(results[0].value)
      }

      if (results[1].status === "fulfilled") {
        setWallets(results[1].value)
      }

      if (results[2].status === "fulfilled") {
        setSignals(results[2].value)
      }

      // If any request failed, show a toast
      const hasFailures = results.some((result) => result.status === "rejected")
      if (hasFailures) {
        console.error(
          "Some whale data requests failed:",
          results.filter((r) => r.status === "rejected").map((r) => (r as PromiseRejectedResult).reason),
        )
        toast({
          title: "Partial data loaded",
          description: "Some whale data could not be loaded. Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading whale data:", error)
      toast({
        title: "Error loading whale data",
        description: "Failed to fetch whale activity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter((tx) => {
    // Filter by search query
    if (
      searchQuery &&
      !tx.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tx.tokenAddress.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tx.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filter by transaction type
    if (transactionType !== "all" && tx.transactionType !== transactionType) {
      return false
    }

    // Filter by time range
    const now = Date.now()
    if (timeRange === "1h" && now - tx.timestamp > 3600000) return false
    if (timeRange === "24h" && now - tx.timestamp > 86400000) return false
    if (timeRange === "7d" && now - tx.timestamp > 604800000) return false

    return true
  })

  // Watch/unwatch a token
  const toggleWatchToken = async (tokenAddress: string) => {
    try {
      if (watchedTokens.includes(tokenAddress)) {
        setWatchedTokens(watchedTokens.filter((addr) => addr !== tokenAddress))
        toast({
          title: "Token unwatched",
          description: "You will no longer receive alerts for this token",
        })
      } else {
        await whaleTrackingService.trackToken(tokenAddress)
        setWatchedTokens([...watchedTokens, tokenAddress])
        toast({
          title: "Token watched",
          description: "You will receive alerts for significant whale movements",
        })
      }
    } catch (error) {
      console.error("Error toggling token watch:", error)
      toast({
        title: "Error",
        description: "Failed to update token watch status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Whale Monitor</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={isLoading}
          className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="wallets">Top Wallets</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="bg-[#151514] border-[#30302e]">
            <CardHeader className="pb-2">
              <CardTitle>Whale Transactions</CardTitle>
              <CardDescription>Recent high-value transactions from whale wallets</CardDescription>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#707070]" />
                  <Input
                    placeholder="Search by token or wallet"
                    className="pl-8 bg-[#1d1d1c] border-[#30302e]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[100px] bg-[#1d1d1c] border-[#30302e]">
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger className="w-[120px] bg-[#1d1d1c] border-[#30302e]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[#707070] text-sm border-b border-[#30302e]">
                      <th className="pb-2 text-left">Token</th>
                      <th className="pb-2 text-left">Type</th>
                      <th className="pb-2 text-left">Amount</th>
                      <th className="pb-2 text-left">Value (USD)</th>
                      <th className="pb-2 text-left">Time</th>
                      <th className="pb-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#30302e] hover:bg-[#1d1d1c]">
                          <td className="py-4">
                            <div className="flex items-center">
                              <span className="font-medium">{tx.tokenSymbol}</span>
                              <span className="ml-2 text-xs text-[#707070]">
                                {tx.tokenAddress.substring(0, 4)}...
                                {tx.tokenAddress.substring(tx.tokenAddress.length - 4)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center">
                              {tx.transactionType === "buy" ? (
                                <ArrowUpRight className="h-4 w-4 text-[#A4D756] mr-1" />
                              ) : tx.transactionType === "sell" ? (
                                <ArrowDownRight className="h-4 w-4 text-[#E57676] mr-1" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-[#22CCEE] mr-1" />
                              )}
                              <span className="capitalize">{tx.transactionType}</span>
                            </div>
                          </td>
                          <td className="py-4">{tx.amount}</td>
                          <td className="py-4">${tx.usdValue.toLocaleString()}</td>
                          <td className="py-4">{formatTime(tx.timestamp)}</td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleWatchToken(tx.tokenAddress)}
                              >
                                {watchedTokens.includes(tx.tokenAddress) ? (
                                  <BellOff className="h-4 w-4" />
                                ) : (
                                  <Bell className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {watchedTokens.includes(tx.tokenAddress) ? "Unwatch" : "Watch"}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => window.open(`https://solscan.io/tx/${tx.txHash}`, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">View on Solscan</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#707070]">
                          {isLoading ? (
                            <div className="flex justify-center items-center">
                              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                              Loading transactions...
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <AlertTriangle className="h-8 w-8 mb-2" />
                              No transactions found matching your filters
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets">
          <Card className="bg-[#151514] border-[#30302e]">
            <CardHeader>
              <CardTitle>Top Whale Wallets</CardTitle>
              <CardDescription>Most active and highest value wallets in the ecosystem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.address}
                    className="p-4 border border-[#30302e] rounded-lg bg-[#1d1d1c] hover:bg-[#30302e] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {wallet.label ||
                            `Whale ${wallet.address.substring(0, 4)}...${wallet.address.substring(wallet.address.length - 4)}`}
                        </h3>
                        <p className="text-sm text-[#707070] mt-1">{wallet.address}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(`https://solscan.io/account/${wallet.address}`, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="bg-[#151514] p-2 rounded">
                        <p className="text-xs text-[#707070]">Total Value</p>
                        <p className="font-medium">${wallet.totalValue.toLocaleString()}</p>
                      </div>
                      <div className="bg-[#151514] p-2 rounded">
                        <p className="text-xs text-[#707070]">24h Volume</p>
                        <p className="font-medium">${wallet.volume24h.toLocaleString()}</p>
                      </div>
                      <div className="bg-[#151514] p-2 rounded">
                        <p className="text-xs text-[#707070]">24h Transactions</p>
                        <p className="font-medium">{wallet.transactions24h}</p>
                      </div>
                      <div className="bg-[#151514] p-2 rounded">
                        <p className="text-xs text-[#707070]">Last Active</p>
                        <p className="font-medium">{formatTime(wallet.lastActive)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {wallets.length === 0 && (
                <div className="py-8 text-center text-[#707070]">
                  {isLoading ? (
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      Loading wallets...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <AlertTriangle className="h-8 w-8 mb-2" />
                      No whale wallets found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signals Tab */}
        <TabsContent value="signals">
          <Card className="bg-[#151514] border-[#30302e]">
            <CardHeader>
              <CardTitle>Whale Signals</CardTitle>
              <CardDescription>Detected patterns and signals from whale activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signals.map((signal) => (
                  <div key={signal.id} className="p-4 border border-[#30302e] rounded-lg bg-[#1d1d1c]">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {signal.signalType === "accumulation" ? (
                          <div className="bg-[#1E3323] p-1 rounded mr-3">
                            <TrendingUp className="h-5 w-5 text-[#A4D756]" />
                          </div>
                        ) : signal.signalType === "distribution" ? (
                          <div className="bg-[#331A1A] p-1 rounded mr-3">
                            <TrendingUp className="h-5 w-5 text-[#E57676]" />
                          </div>
                        ) : signal.signalType === "large_buy" ? (
                          <div className="bg-[#1E3323] p-1 rounded mr-3">
                            <ArrowUpRight className="h-5 w-5 text-[#A4D756]" />
                          </div>
                        ) : (
                          <div className="bg-[#331A1A] p-1 rounded mr-3">
                            <ArrowDownRight className="h-5 w-5 text-[#E57676]" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{signal.tokenSymbol}</h3>
                          <p className="text-sm text-[#707070]">{formatSignalType(signal.signalType)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium">
                            {signal.volumeChange24h > 0 ? "+" : ""}
                            {signal.volumeChange24h}% 24h
                          </p>
                          <p className="text-xs text-[#707070]">{formatTime(signal.timestamp)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleWatchToken(signal.tokenAddress)}
                        >
                          {watchedTokens.includes(signal.tokenAddress) ? (
                            <BellOff className="h-4 w-4" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 bg-[#151514] p-3 rounded text-sm">
                      <div className="flex justify-between mb-2">
                        <span>Signal Confidence:</span>
                        <span className="font-medium">{signal.confidence}%</span>
                      </div>
                      <div className="w-full bg-[#30302e] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getConfidenceColor(signal.confidence)}`}
                          style={{ width: `${signal.confidence}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm">
                      <p>
                        <span className="text-[#707070]">Whales Involved:</span> {signal.whaleCount}
                      </p>
                      <p className="mt-1">
                        <span className="text-[#707070]">Description:</span> {getSignalDescription(signal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {signals.length === 0 && (
                <div className="py-8 text-center text-[#707070]">
                  {isLoading ? (
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      Loading signals...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <AlertTriangle className="h-8 w-8 mb-2" />
                      No whale signals detected
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions
function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) {
    return "Just now"
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`
  } else {
    return `${Math.floor(diff / 86400000)}d ago`
  }
}

function formatSignalType(type: string): string {
  switch (type) {
    case "accumulation":
      return "Accumulation Pattern"
    case "distribution":
      return "Distribution Pattern"
    case "large_buy":
      return "Large Buy"
    case "large_sell":
      return "Large Sell"
    default:
      return type.replace("_", " ")
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "bg-[#A4D756]"
  if (confidence >= 60) return "bg-[#F9CB40]"
  return "bg-[#E57676]"
}

function getSignalDescription(signal: WhaleSignal): string {
  switch (signal.signalType) {
    case "accumulation":
      return `${signal.whaleCount} whales have been accumulating ${signal.tokenSymbol} over the past 24 hours, with a volume increase of ${signal.volumeChange24h}%.`
    case "distribution":
      return `${signal.whaleCount} whales have been distributing ${signal.tokenSymbol} over the past 24 hours, with a volume increase of ${signal.volumeChange24h}%.`
    case "large_buy":
      return `A significant buy of ${signal.tokenSymbol} was detected from ${signal.whaleCount} whale wallets.`
    case "large_sell":
      return `A significant sell of ${signal.tokenSymbol} was detected from ${signal.whaleCount} whale wallets.`
    default:
      return `Unusual activity detected for ${signal.tokenSymbol}.`
  }
}
