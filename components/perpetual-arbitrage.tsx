"use client"

import { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
} from "@/components/ui"
import {
  ArrowLeftRight,
  BarChart3,
  ChevronDown,
  Clock,
  LineChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

// Mock data for perpetual exchanges
const exchanges = [
  { id: "drift", name: "Drift Protocol", status: "online", fundingRate: 0.0012 },
  { id: "mango", name: "Mango Markets", status: "online", fundingRate: -0.0008 },
  { id: "zeta", name: "Zeta Markets", status: "online", fundingRate: 0.0005 },
  { id: "bonfida", name: "Bonfida", status: "maintenance", fundingRate: 0 },
  { id: "cypher", name: "Cypher", status: "online", fundingRate: -0.0003 },
  { id: "synthetify", name: "Synthetify", status: "online", fundingRate: 0.0001 },
]

// Mock data for markets
const markets = [
  { id: "sol-perp", name: "SOL-PERP", price: 148.32, change24h: 3.2, volume24h: 12500000, openInterest: 8500000 },
  { id: "btc-perp", name: "BTC-PERP", price: 62145.78, change24h: -1.5, volume24h: 45000000, openInterest: 32000000 },
  { id: "eth-perp", name: "ETH-PERP", price: 3245.67, change24h: 0.8, volume24h: 28000000, openInterest: 18500000 },
  { id: "sol-perp-1", name: "SOL-PERP", price: 148.45, change24h: 3.3, volume24h: 11800000, openInterest: 7900000 },
  { id: "btc-perp-1", name: "BTC-PERP", price: 62132.45, change24h: -1.6, volume24h: 43500000, openInterest: 31500000 },
  { id: "eth-perp-1", name: "ETH-PERP", price: 3243.21, change24h: 0.7, volume24h: 27500000, openInterest: 18000000 },
]

// Mock data for positions
const positions = [
  {
    id: "pos1",
    market: "SOL-PERP",
    exchange: "Drift Protocol",
    side: "long",
    size: 10,
    entryPrice: 142.5,
    markPrice: 148.32,
    pnl: 58.2,
    pnlPercent: 4.08,
    liquidationPrice: 128.25,
  },
  {
    id: "pos2",
    market: "BTC-PERP",
    exchange: "Mango Markets",
    side: "short",
    size: 0.15,
    entryPrice: 63100,
    markPrice: 62145.78,
    pnl: 143.13,
    pnlPercent: 1.51,
    liquidationPrice: 65420,
  },
]

// Mock data for arbitrage opportunities
const arbitrageOpportunities = [
  {
    id: "arb1",
    market: "SOL-PERP",
    exchange1: "Drift Protocol",
    price1: 148.32,
    exchange2: "Mango Markets",
    price2: 148.45,
    spread: 0.13,
    spreadPercent: 0.09,
    estimatedProfit: 12.5,
  },
  {
    id: "arb2",
    market: "BTC-PERP",
    exchange1: "Zeta Markets",
    price1: 62145.78,
    exchange2: "Cypher",
    price2: 62132.45,
    spread: 13.33,
    spreadPercent: 0.02,
    estimatedProfit: 18.2,
  },
]

export default function PerpetualArbitrage() {
  const [activeExchange, setActiveExchange] = useState("drift")
  const [isLoading, setIsLoading] = useState(false)
  const [autoArbitrageEnabled, setAutoArbitrageEnabled] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Perpetual Trading & Arbitrage</h1>
          <p className="text-[#707070]">
            Trade perpetuals across multiple Solana exchanges and find arbitrage opportunities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="auto-arbitrage" checked={autoArbitrageEnabled} onCheckedChange={setAutoArbitrageEnabled} />
            <Label htmlFor="auto-arbitrage">Auto Arbitrage</Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exchange Status Cards */}
        {exchanges.map((exchange) => (
          <Card
            key={exchange.id}
            className={`bg-[#151514] border-[#30302e] ${activeExchange === exchange.id ? "ring-2 ring-[#22CCEE]" : ""}`}
            onClick={() => setActiveExchange(exchange.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                {exchange.name}
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    exchange.status === "online" ? "bg-[#1E3323] text-[#A4D756]" : "bg-[#332E1A] text-[#F9CB40]"
                  }`}
                >
                  {exchange.status.toUpperCase()}
                </span>
              </CardTitle>
              <CardDescription>
                Funding Rate:{" "}
                <span
                  className={
                    exchange.fundingRate > 0
                      ? "text-[#A4D756]"
                      : exchange.fundingRate < 0
                        ? "text-[#E57676]"
                        : "text-[#707070]"
                  }
                >
                  {(exchange.fundingRate * 100).toFixed(4)}%
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                onClick={() => setActiveExchange(exchange.id)}
              >
                Select
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="markets">
        <TabsList className="mb-6">
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="arbitrage">Arbitrage</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
        </TabsList>

        <TabsContent value="markets">
          <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Perpetual Markets</h2>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] bg-[#1d1d1c] border-[#30302e]">
                    <SelectValue placeholder="Filter by asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assets</SelectItem>
                    <SelectItem value="sol">SOL</SelectItem>
                    <SelectItem value="btc">BTC</SelectItem>
                    <SelectItem value="eth">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[#707070] text-sm border-b border-[#30302e]">
                    <th className="pb-2 text-left">Market</th>
                    <th className="pb-2 text-left">Exchange</th>
                    <th className="pb-2 text-left">Price</th>
                    <th className="pb-2 text-left">24h Change</th>
                    <th className="pb-2 text-left">24h Volume</th>
                    <th className="pb-2 text-left">Open Interest</th>
                    <th className="pb-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map((market, index) => (
                    <tr key={market.id} className="border-b border-[#30302e] hover:bg-[#1d1d1c]">
                      <td className="py-4 font-medium">{market.name}</td>
                      <td className="py-4">{exchanges[index % exchanges.length].name}</td>
                      <td className="py-4">${market.price.toLocaleString()}</td>
                      <td className="py-4">
                        <span className={market.change24h >= 0 ? "text-[#A4D756]" : "text-[#E57676]"}>
                          {market.change24h >= 0 ? "+" : ""}
                          {market.change24h}%
                        </span>
                      </td>
                      <td className="py-4">${(market.volume24h / 1000000).toFixed(2)}M</td>
                      <td className="py-4">${(market.openInterest / 1000000).toFixed(2)}M</td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#1E3323] text-[#A4D756] border-[#A4D756] hover:bg-[#2A4A33]"
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Long
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#331A1A] text-[#E57676] border-[#E57676] hover:bg-[#4A2A2A]"
                          >
                            <TrendingDown className="h-4 w-4 mr-1" />
                            Short
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="positions">
          <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Open Positions</h2>
              <Button variant="outline" size="sm" className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]">
                <Clock className="h-4 w-4 mr-2" />
                Position History
              </Button>
            </div>

            {positions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[#707070] text-sm border-b border-[#30302e]">
                      <th className="pb-2 text-left">Market</th>
                      <th className="pb-2 text-left">Exchange</th>
                      <th className="pb-2 text-left">Side</th>
                      <th className="pb-2 text-left">Size</th>
                      <th className="pb-2 text-left">Entry Price</th>
                      <th className="pb-2 text-left">Mark Price</th>
                      <th className="pb-2 text-left">PnL</th>
                      <th className="pb-2 text-left">Liquidation</th>
                      <th className="pb-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position) => (
                      <tr key={position.id} className="border-b border-[#30302e] hover:bg-[#1d1d1c]">
                        <td className="py-4 font-medium">{position.market}</td>
                        <td className="py-4">{position.exchange}</td>
                        <td className="py-4">
                          <span className={position.side === "long" ? "text-[#A4D756]" : "text-[#E57676]"}>
                            {position.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4">{position.size}</td>
                        <td className="py-4">${position.entryPrice.toLocaleString()}</td>
                        <td className="py-4">${position.markPrice.toLocaleString()}</td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className={position.pnl >= 0 ? "text-[#A4D756]" : "text-[#E57676]"}>
                              {position.pnl >= 0 ? "+" : ""}${position.pnl.toLocaleString()}
                            </span>
                            <span className={`text-xs ${position.pnl >= 0 ? "text-[#A4D756]" : "text-[#E57676]"}`}>
                              {position.pnl >= 0 ? "+" : ""}
                              {position.pnlPercent.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4">${position.liquidationPrice.toLocaleString()}</td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                            >
                              Close
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[#707070]">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No open positions</p>
                <p className="text-sm mt-2">Open a position from the Markets tab</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="arbitrage">
          <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Arbitrage Opportunities</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="min-spread" className="text-sm">
                    Min Spread:
                  </Label>
                  <Input
                    id="min-spread"
                    type="number"
                    defaultValue="0.01"
                    className="w-20 h-8 bg-[#1d1d1c] border-[#30302e]"
                  />
                  <span className="text-sm">%</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Scan
                </Button>
              </div>
            </div>

            {arbitrageOpportunities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[#707070] text-sm border-b border-[#30302e]">
                      <th className="pb-2 text-left">Market</th>
                      <th className="pb-2 text-left">Buy Exchange</th>
                      <th className="pb-2 text-left">Buy Price</th>
                      <th className="pb-2 text-left">Sell Exchange</th>
                      <th className="pb-2 text-left">Sell Price</th>
                      <th className="pb-2 text-left">Spread</th>
                      <th className="pb-2 text-left">Est. Profit</th>
                      <th className="pb-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arbitrageOpportunities.map((arb) => (
                      <tr key={arb.id} className="border-b border-[#30302e] hover:bg-[#1d1d1c]">
                        <td className="py-4 font-medium">{arb.market}</td>
                        <td className="py-4">{arb.exchange1}</td>
                        <td className="py-4">${arb.price1.toLocaleString()}</td>
                        <td className="py-4">{arb.exchange2}</td>
                        <td className="py-4">${arb.price2.toLocaleString()}</td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="text-[#A4D756]">${arb.spread.toFixed(2)}</span>
                            <span className="text-xs text-[#A4D756]">{arb.spreadPercent.toFixed(2)}%</span>
                          </div>
                        </td>
                        <td className="py-4 text-[#A4D756]">${arb.estimatedProfit.toFixed(2)}</td>
                        <td className="py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#1E3323] text-[#A4D756] border-[#A4D756] hover:bg-[#2A4A33]"
                          >
                            <ArrowLeftRight className="h-4 w-4 mr-2" />
                            Execute
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[#707070]">
                <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No arbitrage opportunities found</p>
                <p className="text-sm mt-2">Try adjusting your minimum spread or scan again</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trading">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6 h-[500px] flex items-center justify-center">
                <div className="text-center text-[#707070]">
                  <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chart will be displayed here</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Place Order</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="market">Market</Label>
                    <Select defaultValue="sol-perp">
                      <SelectTrigger className="w-full bg-[#1d1d1c] border-[#30302e]">
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sol-perp">SOL-PERP</SelectItem>
                        <SelectItem value="btc-perp">BTC-PERP</SelectItem>
                        <SelectItem value="eth-perp">ETH-PERP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="exchange">Exchange</Label>
                    <Select defaultValue="drift">
                      <SelectTrigger className="w-full bg-[#1d1d1c] border-[#30302e]">
                        <SelectValue placeholder="Select exchange" />
                      </SelectTrigger>
                      <SelectContent>
                        {exchanges.map((exchange) => (
                          <SelectItem key={exchange.id} value={exchange.id}>
                            {exchange.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="order-type">Order Type</Label>
                    <Select defaultValue="market">
                      <SelectTrigger className="w-full bg-[#1d1d1c] border-[#30302e]">
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                        <SelectItem value="stop">Stop</SelectItem>
                        <SelectItem value="stop-limit">Stop Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="size">Size</Label>
                    <div className="flex">
                      <Input
                        id="size"
                        type="number"
                        placeholder="0.00"
                        className="flex-1 bg-[#1d1d1c] border-[#30302e]"
                      />
                      <Button variant="outline" size="sm" className="ml-2 bg-[#1d1d1c] border-[#30302e]">
                        Max
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="leverage">Leverage</Label>
                    <div className="flex items-center">
                      <Input
                        id="leverage"
                        type="number"
                        defaultValue="1"
                        className="flex-1 bg-[#1d1d1c] border-[#30302e]"
                      />
                      <span className="ml-2 text-[#707070]">×</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#707070]">Entry Price</span>
                      <span>$148.32</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#707070]">Fees</span>
                      <span>$0.15</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#707070]">Liquidation Price</span>
                      <span>$132.45</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Button className="bg-[#1E3323] text-[#A4D756] hover:bg-[#2A4A33]">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Long
                    </Button>
                    <Button className="bg-[#331A1A] text-[#E57676] hover:bg-[#4A2A2A]">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Short
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
