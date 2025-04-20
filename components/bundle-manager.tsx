"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Zap, AlertTriangle, RefreshCw, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { useJupiterContext } from "@/contexts/jupiter-context"

// Default configuration
const DEFAULT_CONFIG = {
  bundleTtl: 100,
  priorityFee: 100000,
  maxRetries: 3,
  useDecoys: false,
  timeJitter: true,
  rpcEndpoint: "jito",
  enabled: false,
}

// Mock data for bundles and transactions
const MOCK_BUNDLES = [
  {
    id: "bundle-123456",
    strategy: "bootstrap",
    status: "pending",
    createdAt: Date.now() - 300000,
    transactions: [],
  },
  {
    id: "bundle-234567",
    strategy: "creation-aware",
    status: "confirmed",
    createdAt: Date.now() - 900000,
    transactions: ["tx1", "tx2"],
  },
]

const MOCK_TRANSACTIONS = [
  {
    id: "tx1",
    bundleId: "bundle-234567",
    type: "swap",
    status: "confirmed",
    createdAt: Date.now() - 900000,
    signature: "5UxV7...8Ypz",
  },
  {
    id: "tx2",
    bundleId: "bundle-234567",
    type: "liquidity",
    status: "confirmed",
    createdAt: Date.now() - 890000,
    signature: "3KmN2...9Rqx",
  },
]

export default function BundleManager() {
  const { toast } = useToast()
  const { walletPublicKey } = useJupiterContext()

  // Use refs to track initialization
  const initialized = useRef(false)

  const [isEnabled, setIsEnabled] = useState(false)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [bundles, setBundles] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState("bootstrap")
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize once with mock data
  useEffect(() => {
    if (initialized.current) return

    // Set mock data
    setBundles(MOCK_BUNDLES)
    setTransactions(MOCK_TRANSACTIONS)
    initialized.current = true

    // Set up polling interval
    const interval = setInterval(() => {
      // In a real app, this would fetch updated data
      // For now, we'll just leave it empty to avoid state updates
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Toggle bundle engine
  const handleToggleEngine = useCallback(
    (enabled: boolean) => {
      setIsEnabled(enabled)

      toast({
        title: enabled ? "Bundle Engine Started" : "Bundle Engine Stopped",
        description: enabled
          ? "Now monitoring for bundle opportunities"
          : "No longer monitoring for bundle opportunities",
      })
    },
    [toast],
  )

  // Update config
  const handleUpdateConfig = useCallback(() => {
    toast({
      title: "Configuration Updated",
      description: "Bundle engine configuration has been updated",
    })

    // Hide settings panel after update
    setShowSettings(false)
  }, [config, toast])

  // Create a new bundle
  const handleCreateBundle = useCallback(() => {
    if (!walletPublicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a bundle",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate bundle creation
    setTimeout(() => {
      const newBundle = {
        id: `bundle-${Date.now()}`,
        strategy: selectedStrategy,
        status: "pending",
        createdAt: Date.now(),
        transactions: [],
      }

      setBundles((prev) => [...prev, newBundle])
      setIsLoading(false)

      toast({
        title: "Bundle Created",
        description: `New ${selectedStrategy} bundle created successfully`,
      })
    }, 1500)
  }, [selectedStrategy, toast, walletPublicKey])

  // Cancel a bundle
  const handleCancelBundle = useCallback(
    (bundleId: string) => {
      setIsLoading(true)

      // Simulate cancellation
      setTimeout(() => {
        setBundles((prev) =>
          prev.map((bundle) => (bundle.id === bundleId ? { ...bundle, status: "cancelled" } : bundle)),
        )

        setIsLoading(false)

        toast({
          title: "Bundle Cancelled",
          description: "Bundle has been cancelled",
        })
      }, 1000)
    },
    [toast],
  )

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-[#151514] border-[#30302e]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-syne">Bundle Engine</CardTitle>
              <CardDescription>Manage and execute transaction bundles</CardDescription>
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
                  id="enableEngine"
                  checked={isEnabled}
                  onCheckedChange={handleToggleEngine}
                  className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                />
                <Label htmlFor="enableEngine">Enable</Label>
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
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bundles">
            <TabsList className="bg-[#1d1d1c] border border-[#30302e]">
              <TabsTrigger value="bundles">Bundles</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="bundles" className="mt-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="strategySelect">Strategy:</Label>
                    <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                      <SelectTrigger className="w-40 bg-[#1d1d1c] border-[#30302e]">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1d1d1c] border-[#30302e]">
                        <SelectItem value="bootstrap">Bootstrap</SelectItem>
                        <SelectItem value="creation-aware">Creation Aware</SelectItem>
                        <SelectItem value="breakout">Breakout</SelectItem>
                        <SelectItem value="bollinger">Bollinger Bands</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]">
                        Strategy Info
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-[#1d1d1c] border-[#30302e]">
                      {selectedStrategy === "bootstrap" && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Bootstrap Strategy</h4>
                          <p className="text-sm text-[#707070]">
                            Combines token creation and transaction bundling for coordinated launches.
                          </p>
                        </div>
                      )}
                      {selectedStrategy === "creation-aware" && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Creation Aware Strategy</h4>
                          <p className="text-sm text-[#707070]">
                            Watches for new token creations and automatically executes buy/sell transactions.
                          </p>
                        </div>
                      )}
                      {selectedStrategy === "breakout" && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Breakout Strategy</h4>
                          <p className="text-sm text-[#707070]">
                            Identifies and trades breakout patterns with momentum confirmation.
                          </p>
                        </div>
                      )}
                      {selectedStrategy === "bollinger" && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Bollinger Bands Strategy</h4>
                          <p className="text-sm text-[#707070]">
                            Uses Bollinger Bands to identify overbought and oversold conditions.
                          </p>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
                  onClick={handleCreateBundle}
                  disabled={isLoading || !walletPublicKey}
                >
                  <Zap className={`mr-2 h-4 w-4 ${isLoading ? "animate-pulse" : ""}`} />
                  Create Bundle
                </Button>
              </div>

              {bundles.length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bundles created yet.</p>
                  <p className="text-sm mt-2">Create a bundle to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1d1d1c]">
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Strategy</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bundles.map((bundle) => (
                        <TableRow key={bundle.id} className="border-[#30302e]">
                          <TableCell className="font-medium">{bundle.id.substring(0, 8)}...</TableCell>
                          <TableCell className="capitalize">{bundle.strategy}</TableCell>
                          <TableCell>
                            {bundle.status === "pending" && <Badge className="bg-[#22CCEE]">Pending</Badge>}
                            {bundle.status === "submitted" && <Badge className="bg-[#76D484]">Submitted</Badge>}
                            {bundle.status === "confirmed" && <Badge className="bg-[#76D484]">Confirmed</Badge>}
                            {bundle.status === "failed" && <Badge className="bg-[#E57676]">Failed</Badge>}
                            {bundle.status === "cancelled" && <Badge className="bg-[#707070]">Cancelled</Badge>}
                          </TableCell>
                          <TableCell>{new Date(bundle.createdAt).toLocaleTimeString()}</TableCell>
                          <TableCell>{bundle.transactions.length}</TableCell>
                          <TableCell className="text-right">
                            {bundle.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[#E57676] hover:text-[#ff4d4d]"
                                onClick={() => handleCancelBundle(bundle.id)}
                                disabled={isLoading}
                              >
                                Cancel
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

            <TabsContent value="transactions" className="mt-4">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet.</p>
                  <p className="text-sm mt-2">Transactions will appear here when bundles are created.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1d1d1c]">
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Bundle</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Signature</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id} className="border-[#30302e]">
                          <TableCell className="font-medium">{tx.id.substring(0, 8)}...</TableCell>
                          <TableCell>{tx.bundleId.substring(0, 8)}...</TableCell>
                          <TableCell className="capitalize">{tx.type}</TableCell>
                          <TableCell>
                            {tx.status === "pending" && <Badge className="bg-[#22CCEE]">Pending</Badge>}
                            {tx.status === "confirmed" && <Badge className="bg-[#76D484]">Confirmed</Badge>}
                            {tx.status === "failed" && <Badge className="bg-[#E57676]">Failed</Badge>}
                          </TableCell>
                          <TableCell>{new Date(tx.createdAt).toLocaleTimeString()}</TableCell>
                          <TableCell>
                            {tx.signature ? (
                              <a
                                href={`https://solscan.io/tx/${tx.signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#22CCEE] hover:underline"
                              >
                                {tx.signature.substring(0, 8)}...
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
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
                <h3 className="text-lg font-medium">Engine Settings</h3>
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
                  <h4 className="text-sm font-medium">Bundle Parameters</h4>

                  <div className="space-y-2">
                    <Label htmlFor="bundleTtl">Bundle TTL (slots)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="bundleTtl"
                        type="number"
                        value={config.bundleTtl}
                        onChange={(e) => setConfig({ ...config, bundleTtl: Number(e.target.value) })}
                        className="bg-[#252523] border-[#30302e]"
                      />
                      <span className="text-sm text-[#707070]">slots</span>
                    </div>
                    <p className="text-xs text-[#707070]">Time-to-live for bundles in Solana slots</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="priorityFee">Priority Fee (lamports)</Label>
                      <span className="text-sm text-[#707070]">{config.priorityFee}</span>
                    </div>
                    <Slider
                      id="priorityFee"
                      min={0}
                      max={1000000}
                      step={10000}
                      value={[config.priorityFee]}
                      onValueChange={(value) => setConfig({ ...config, priorityFee: value[0] })}
                      className="[&>span]:bg-gradient-to-r [&>span]:from-[#00B6E7] [&>span]:to-[#A4D756]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxRetries">Max Retries</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      value={config.maxRetries}
                      onChange={(e) => setConfig({ ...config, maxRetries: Number(e.target.value) })}
                      className="bg-[#252523] border-[#30302e]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Advanced Settings</h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="useDecoys">Use Decoy Transactions</Label>
                      <p className="text-xs text-[#707070]">Add decoy transactions to prevent frontrunning</p>
                    </div>
                    <Switch
                      id="useDecoys"
                      checked={config.useDecoys}
                      onCheckedChange={(checked) => setConfig({ ...config, useDecoys: checked })}
                      className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="timeJitter">Time Jitter</Label>
                      <p className="text-xs text-[#707070]">Add random time delay to transactions</p>
                    </div>
                    <Switch
                      id="timeJitter"
                      checked={config.timeJitter}
                      onCheckedChange={(checked) => setConfig({ ...config, timeJitter: checked })}
                      className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rpcEndpoint">RPC Endpoint</Label>
                    <Select
                      value={config.rpcEndpoint}
                      onValueChange={(value) => setConfig({ ...config, rpcEndpoint: value })}
                    >
                      <SelectTrigger className="bg-[#252523] border-[#30302e]">
                        <SelectValue placeholder="Select RPC endpoint" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1d1d1c] border-[#30302e]">
                        <SelectItem value="quicknode">QuickNode</SelectItem>
                        <SelectItem value="jito">Jito</SelectItem>
                        <SelectItem value="helius">Helius</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="p-3 rounded-lg bg-[#252523] border border-[#E57676] flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-[#E57676] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#707070]">
                    Bundle execution involves MEV risk. Use appropriate settings to minimize frontrunning.
                  </p>
                </div>

                <Button
                  className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
                  onClick={handleUpdateConfig}
                  disabled={isLoading}
                >
                  <Zap className="mr-2 h-4 w-4" />
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
