"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Zap, AlertCircle } from "lucide-react"
import { useJupiterContext } from "@/contexts/jupiter-context"
import { useToast } from "@/components/ui/use-toast"

// SOL mint address
const SOL_MINT = "So11111111111111111111111111111111111111112"

interface TargetProps {
  setActiveTargets: (count: number) => void
}

interface SnipeTarget {
  id: string
  name: string
  mintAddress: string
  maxBuyPrice: number
  minLiquidity: number
  maxSlippage: number
  active: boolean
  currentPrice?: number
  priceLoading?: boolean
  priceError?: boolean
}

const initialTargets: SnipeTarget[] = [
  {
    id: "1",
    name: "BONK",
    mintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    maxBuyPrice: 0.000012,
    minLiquidity: 100000,
    maxSlippage: 2.5,
    active: true,
  },
  {
    id: "2",
    name: "WIF",
    mintAddress: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    maxBuyPrice: 0.00023,
    minLiquidity: 250000,
    maxSlippage: 1.5,
    active: true,
  },
  {
    id: "3",
    name: "JTO",
    mintAddress: "7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn",
    maxBuyPrice: 0.0015,
    minLiquidity: 500000,
    maxSlippage: 1.0,
    active: true,
  },
]

export default function TargetManagement({ setActiveTargets }: TargetProps) {
  const { toast } = useToast()
  const { getTokenQuote, executeSnipe, isLoading } = useJupiterContext()
  const [targets, setTargets] = useState<SnipeTarget[]>(initialTargets)
  const [newTarget, setNewTarget] = useState<Partial<SnipeTarget>>({
    name: "",
    mintAddress: "",
    maxBuyPrice: 0.0001,
    minLiquidity: 100000,
    maxSlippage: 1.0,
    active: true,
  })

  // Fetch current prices for all targets
  useEffect(() => {
    const fetchPrices = async () => {
      const updatedTargets = [...targets]

      for (let i = 0; i < updatedTargets.length; i++) {
        if (updatedTargets[i].active) {
          updatedTargets[i].priceLoading = true
          setTargets([...updatedTargets])

          try {
            const quoteResult = await getTokenQuote(
              SOL_MINT,
              updatedTargets[i].mintAddress,
              1_000_000_000, // 1 SOL in lamports
              100, // 1% slippage
              true, // Only direct routes
            )

            if (quoteResult.success && quoteResult.data) {
              const outAmount = Number.parseInt(quoteResult.data.outAmount)
              const price = 1_000_000_000 / outAmount

              updatedTargets[i].currentPrice = price
              updatedTargets[i].priceLoading = false
              updatedTargets[i].priceError = false
            } else {
              updatedTargets[i].priceLoading = false
              updatedTargets[i].priceError = true
            }
          } catch (err) {
            console.error(`Error fetching price for ${updatedTargets[i].name}:`, err)
            updatedTargets[i].priceLoading = false
            updatedTargets[i].priceError = true
          }

          setTargets([...updatedTargets])
        }
      }
    }

    fetchPrices()

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000)

    return () => clearInterval(interval)
  }, [targets, getTokenQuote])

  const handleAddTarget = () => {
    if (!newTarget.name || !newTarget.mintAddress) return

    const target: SnipeTarget = {
      id: Date.now().toString(),
      name: newTarget.name || "",
      mintAddress: newTarget.mintAddress || "",
      maxBuyPrice: newTarget.maxBuyPrice || 0.0001,
      minLiquidity: newTarget.minLiquidity || 100000,
      maxSlippage: newTarget.maxSlippage || 1.0,
      active: true,
      priceLoading: true,
    }

    setTargets([...targets, target])
    setNewTarget({
      name: "",
      mintAddress: "",
      maxBuyPrice: 0.0001,
      minLiquidity: 100000,
      maxSlippage: 1.0,
      active: true,
    })

    updateActiveTargets([...targets, target])

    // Fetch price for the new target
    getTokenQuote(
      SOL_MINT,
      target.mintAddress,
      1_000_000_000, // 1 SOL in lamports
      100, // 1% slippage
      true, // Only direct routes
    )
      .then((quoteResult) => {
        if (quoteResult.success && quoteResult.data) {
          const outAmount = Number.parseInt(quoteResult.data.outAmount)
          const price = 1_000_000_000 / outAmount

          setTargets((prev) =>
            prev.map((t) =>
              t.id === target.id ? { ...t, currentPrice: price, priceLoading: false, priceError: false } : t,
            ),
          )
        } else {
          setTargets((prev) =>
            prev.map((t) => (t.id === target.id ? { ...t, priceLoading: false, priceError: true } : t)),
          )
        }
      })
      .catch((err) => {
        console.error(`Error fetching price for ${target.name}:`, err)
        setTargets((prev) =>
          prev.map((t) => (t.id === target.id ? { ...t, priceLoading: false, priceError: true } : t)),
        )
      })
  }

  const handleToggleActive = (id: string) => {
    const updatedTargets = targets.map((target) => (target.id === id ? { ...target, active: !target.active } : target))
    setTargets(updatedTargets)
    updateActiveTargets(updatedTargets)
  }

  const handleDeleteTarget = (id: string) => {
    const updatedTargets = targets.filter((target) => target.id !== id)
    setTargets(updatedTargets)
    updateActiveTargets(updatedTargets)
  }

  const handleSnipeTarget = async (target: SnipeTarget) => {
    try {
      toast({
        title: "Initiating snipe",
        description: `Attempting to snipe ${target.name}...`,
      })

      const result = await executeSnipe(
        SOL_MINT,
        target.mintAddress,
        1_000_000_000, // 1 SOL in lamports
        target.maxBuyPrice,
        target.maxSlippage,
        250000, // Priority fee (0.00025 SOL)
      )

      if (result.success && result.data) {
        toast({
          title: "Snipe successful!",
          description: `Successfully sniped ${target.name}`,
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

  const updateActiveTargets = (targetList: SnipeTarget[]) => {
    const activeCount = targetList.filter((t) => t.active).length
    setActiveTargets(activeCount)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 bg-[#151514] border-[#30302e]">
        <CardHeader>
          <CardTitle className="text-xl font-[Syne]">Target Tokens</CardTitle>
          <CardDescription>Configure tokens to snipe when conditions are met</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-[#1d1d1c]">
              <TableRow>
                <TableHead className="w-[80px]">Active</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Max Buy Price</TableHead>
                <TableHead>Max Slippage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {targets.map((target) => (
                <TableRow key={target.id} className="border-[#30302e]">
                  <TableCell>
                    <Switch
                      checked={target.active}
                      onCheckedChange={() => handleToggleActive(target.id)}
                      className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{target.name}</div>
                      <div className="text-xs text-[#707070]">
                        {target.mintAddress.substring(0, 6)}...
                        {target.mintAddress.substring(target.mintAddress.length - 4)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {target.priceLoading ? (
                      <div className="flex items-center">
                        <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-[#22CCEE] border-t-transparent"></div>
                        <span>Loading...</span>
                      </div>
                    ) : target.priceError ? (
                      <div className="flex items-center text-[#E57676]">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Error</span>
                      </div>
                    ) : (
                      <div
                        className={
                          target.currentPrice && target.currentPrice <= target.maxBuyPrice ? "text-[#76D484]" : ""
                        }
                      >
                        {target.currentPrice?.toFixed(8) || "N/A"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{target.maxBuyPrice.toFixed(8)}</TableCell>
                  <TableCell>{target.maxSlippage}%</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#22CCEE] hover:text-[#00B6E7]"
                        onClick={() => handleSnipeTarget(target)}
                        disabled={isLoading}
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400"
                        onClick={() => handleDeleteTarget(target.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-[#151514] border-[#30302e]">
        <CardHeader>
          <CardTitle className="text-xl font-[Syne]">Add New Target</CardTitle>
          <CardDescription>Configure parameters for token sniping</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenName">Token Name</Label>
              <Input
                id="tokenName"
                placeholder="e.g. BONK"
                className="bg-[#1d1d1c] border-[#30302e]"
                value={newTarget.name}
                onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mintAddress">Mint Address</Label>
              <Input
                id="mintAddress"
                placeholder="Token mint address"
                className="bg-[#1d1d1c] border-[#30302e]"
                value={newTarget.mintAddress}
                onChange={(e) => setNewTarget({ ...newTarget, mintAddress: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="maxBuyPrice">Max Buy Price</Label>
                <span className="text-sm text-[#707070]">{newTarget.maxBuyPrice?.toFixed(8)}</span>
              </div>
              <Slider
                id="maxBuyPrice"
                min={0.00000001}
                max={0.001}
                step={0.00000001}
                value={[newTarget.maxBuyPrice || 0.0001]}
                onValueChange={(value) => setNewTarget({ ...newTarget, maxBuyPrice: value[0] })}
                className="[&>span]:bg-gradient-to-r [&>span]:from-[#00B6E7] [&>span]:to-[#A4D756]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="minLiquidity">Min Liquidity (USD)</Label>
                <span className="text-sm text-[#707070]">${newTarget.minLiquidity?.toLocaleString()}</span>
              </div>
              <Slider
                id="minLiquidity"
                min={10000}
                max={1000000}
                step={10000}
                value={[newTarget.minLiquidity || 100000]}
                onValueChange={(value) => setNewTarget({ ...newTarget, minLiquidity: value[0] })}
                className="[&>span]:bg-gradient-to-r [&>span]:from-[#22CCEE] [&>span]:to-[#2ED3B7]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="maxSlippage">Max Slippage (%)</Label>
                <span className="text-sm text-[#707070]">{newTarget.maxSlippage}%</span>
              </div>
              <Slider
                id="maxSlippage"
                min={0.1}
                max={5}
                step={0.1}
                value={[newTarget.maxSlippage || 1.0]}
                onValueChange={(value) => setNewTarget({ ...newTarget, maxSlippage: value[0] })}
                className="[&>span]:bg-gradient-to-r [&>span]:from-[#2ED3B7] [&>span]:to-[#C8F284]"
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
              onClick={handleAddTarget}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Target
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
