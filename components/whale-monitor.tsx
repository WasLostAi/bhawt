"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownRight, ExternalLink, Plus, Search, AlertTriangle, RefreshCw, Tag } from "lucide-react"
import { whaleTrackingService } from "@/services/whale-tracking-service"
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

export default function WhaleMonitor() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<any[]>([])
  const [wallets, setWallets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newWalletAddress, setNewWalletAddress] = useState("")
  const [walletLabel, setWalletLabel] = useState("")
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Load initial data
  useEffect(() => {
    fetchData()
  }, [])

  // Fetch data from the service
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [txs, wls] = await Promise.all([
        whaleTrackingService.getRecentTransactions(),
        whaleTrackingService.getTopWallets(),
      ])
      setTransactions(txs)
      setWallets(wls)
    } catch (error) {
      console.error("Error fetching whale data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch whale data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Track a new wallet
  const handleTrackWallet = async () => {
    if (!newWalletAddress) return

    setIsLoading(true)
    try {
      await whaleTrackingService.trackWallet(newWalletAddress)
      const updatedWallets = await whaleTrackingService.getTopWallets()
      setWallets(updatedWallets)
      setNewWalletAddress("")
      toast({
        title: "Wallet Tracked",
        description: "The wallet is now being tracked",
      })
    } catch (error) {
      console.error("Error tracking wallet:", error)
      toast({
        title: "Error",
        description: "Failed to track wallet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Set a label for a wallet
  const handleSetLabel = async () => {
    if (!selectedWallet || !walletLabel) return

    setIsLoading(true)
    try {
      await whaleTrackingService.setWalletLabel(selectedWallet, walletLabel)
      const updatedWallets = await whaleTrackingService.getTopWallets()
      setWallets(updatedWallets)
      setWalletLabel("")
      setSelectedWallet(null)
      toast({
        title: "Label Set",
        description: "The wallet label has been updated",
      })
    } catch (error) {
      console.error("Error setting label:", error)
      toast({
        title: "Error",
        description: "Failed to set wallet label",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter transactions by search query
  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.token.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter wallets by search query
  const filteredWallets = wallets.filter(
    (wallet) =>
      wallet.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wallet.label && wallet.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
      wallet.tokens.some((t: any) => t.symbol.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-[#151514] border-[#30302e]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-syne">Whale Tracking</CardTitle>
              <CardDescription>Monitor large transactions and whale wallets</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#707070]" />
                <Input
                  placeholder="Search transactions or wallets..."
                  className="pl-8 bg-[#1d1d1c] border-[#30302e]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="bg-[#1d1d1c] border-[#30302e]"
                onClick={fetchData}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium">
                    <Plus className="mr-2 h-4 w-4" />
                    Track Wallet
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#151514] border-[#30302e] text-white">
                  <DialogHeader>
                    <DialogTitle>Track New Wallet</DialogTitle>
                    <DialogDescription className="text-[#707070]">
                      Enter a wallet address to start tracking
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="walletAddress">Wallet Address</Label>
                      <Input
                        id="walletAddress"
                        className="bg-[#1d1d1c] border-[#30302e]"
                        value={newWalletAddress}
                        onChange={(e) => setNewWalletAddress(e.target.value)}
                        placeholder="e.g. 8xDrJGJ2VBaqBdUUqYG8jBxCULSxUgwxXjQRH9YQJjLL"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="bg-[#1d1d1c] border-[#30302e]"
                      onClick={() => setNewWalletAddress("")}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
                      onClick={handleTrackWallet}
                      disabled={isLoading || !newWalletAddress}
                    >
                      {isLoading ? "Tracking..." : "Track Wallet"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transactions">
            <TabsList className="bg-[#1d1d1c] border border-[#30302e]">
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="wallets">Whale Wallets</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="mt-4">
              {isLoading && filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                  <p>Loading transactions...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found.</p>
                  {searchQuery && <p className="text-sm mt-2">Try a different search query.</p>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1d1d1c]">
                      <TableRow>
                        <TableHead>Wallet</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>USD Value</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((tx) => (
                        <TableRow key={tx.id} className="border-[#30302e]">
                          <TableCell>
                            <div className="font-medium">
                              {tx.wallet.substring(0, 4)}...{tx.wallet.substring(tx.wallet.length - 4)}
                            </div>
                          </TableCell>
                          <TableCell>{tx.token}</TableCell>
                          <TableCell>{tx.amount.toLocaleString()}</TableCell>
                          <TableCell>${tx.usdValue.toLocaleString()}</TableCell>
                          <TableCell>
                            {tx.type === "buy" ? (
                              <Badge className="bg-[#76D484] text-[#0C0C0C]">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                Buy
                              </Badge>
                            ) : (
                              <Badge className="bg-[#E57676] text-[#0C0C0C]">
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                Sell
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(tx.timestamp).toLocaleTimeString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="wallets" className="mt-4">
              {isLoading && filteredWallets.length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                  <p>Loading wallets...</p>
                </div>
              ) : filteredWallets.length === 0 ? (
                <div className="p-8 text-center text-[#707070]">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No wallets found.</p>
                  {searchQuery && <p className="text-sm mt-2">Try a different search query.</p>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1d1d1c]">
                      <TableRow>
                        <TableHead>Wallet</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Recent Txs</TableHead>
                        <TableHead>Top Tokens</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWallets.map((wallet) => (
                        <TableRow key={wallet.address} className="border-[#30302e]">
                          <TableCell>
                            <div className="font-medium">
                              {wallet.address.substring(0, 4)}...{wallet.address.substring(wallet.address.length - 4)}
                            </div>
                          </TableCell>
                          <TableCell>{wallet.label || <span className="text-[#707070]">No label</span>}</TableCell>
                          <TableCell>${wallet.totalValue.toLocaleString()}</TableCell>
                          <TableCell>{wallet.recentTransactions}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {wallet.tokens.map((token: any, index: number) => (
                                <Badge key={index} className="bg-[#1d1d1c] text-white">
                                  {token.symbol}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setSelectedWallet(wallet.address)}
                                  >
                                    <Tag className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#151514] border-[#30302e] text-white">
                                  <DialogHeader>
                                    <DialogTitle>Set Wallet Label</DialogTitle>
                                    <DialogDescription className="text-[#707070]">
                                      Add a label to identify this wallet
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="walletLabel">Label</Label>
                                      <Input
                                        id="walletLabel"
                                        className="bg-[#1d1d1c] border-[#30302e]"
                                        value={walletLabel}
                                        onChange={(e) => setWalletLabel(e.target.value)}
                                        placeholder="e.g. Alameda Research"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      className="bg-[#1d1d1c] border-[#30302e]"
                                      onClick={() => {
                                        setWalletLabel("")
                                        setSelectedWallet(null)
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
                                      onClick={handleSetLabel}
                                      disabled={isLoading || !walletLabel}
                                    >
                                      {isLoading ? "Saving..." : "Save Label"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
