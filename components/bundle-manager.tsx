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
  Input,
  Textarea,
  Switch,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge,
} from "@/components/ui"
import {
  RefreshCw,
  Plus,
  Trash2,
  Play,
  Pause,
  Copy,
  ExternalLink,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { jitoService } from "@/services/jito-service"
import { useJupiterContext } from "@/contexts/jupiter-context"

// Mock bundle data
const mockBundles = [
  {
    id: "bundle1",
    name: "BONK Sniper Bundle",
    description: "Snipe BONK token with priority",
    transactions: [
      {
        id: "tx1",
        type: "swap",
        description: "Swap SOL for BONK",
        data: {
          inputToken: "SOL",
          outputToken: "BONK",
          amount: "0.5",
          slippage: "1%",
        },
      },
      {
        id: "tx2",
        type: "swap",
        description: "Swap SOL for USDC",
        data: {
          inputToken: "SOL",
          outputToken: "USDC",
          amount: "0.3",
          slippage: "0.5%",
        },
      },
      {
        id: "tx3",
        type: "transfer",
        description: "Transfer BONK to wallet",
        data: {
          token: "BONK",
          recipient: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          amount: "1000000",
        },
      },
    ],
    status: "ready",
    priority: true,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "bundle2",
    name: "WIF Arbitrage",
    description: "Arbitrage WIF across multiple DEXs",
    transactions: [
      {
        id: "tx1",
        type: "swap",
        description: "Swap SOL for WIF on Jupiter",
        data: {
          inputToken: "SOL",
          outputToken: "WIF",
          amount: "0.5",
          slippage: "1%",
          dex: "Jupiter",
        },
      },
      {
        id: "tx2",
        type: "swap",
        description: "Swap WIF for USDC on Raydium",
        data: {
          inputToken: "WIF",
          outputToken: "USDC",
          amount: "1000",
          slippage: "0.5%",
          dex: "Raydium",
        },
      },
      {
        id: "tx3",
        type: "swap",
        description: "Swap USDC for SOL on Orca",
        data: {
          inputToken: "USDC",
          outputToken: "SOL",
          amount: "10",
          slippage: "0.5%",
          dex: "Orca",
        },
      },
      {
        id: "tx4",
        type: "transfer",
        description: "Transfer profit to wallet",
        data: {
          token: "SOL",
          recipient: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          amount: "0.6",
        },
      },
    ],
    status: "running",
    priority: true,
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: "bundle3",
    name: "JTO Liquidation Protection",
    description: "Protect JTO position from liquidation",
    transactions: [
      {
        id: "tx1",
        type: "repay",
        description: "Repay loan",
        data: {
          token: "USDC",
          amount: "100",
          protocol: "Solend",
        },
      },
      {
        id: "tx2",
        type: "withdraw",
        description: "Withdraw collateral",
        data: {
          token: "JTO",
          amount: "50",
          protocol: "Solend",
        },
      },
    ],
    status: "completed",
    priority: false,
    createdAt: Date.now() - 86400000,
  },
]

// Mock bundle execution history
const mockHistory = [
  {
    id: "exec1",
    bundleId: "bundle2",
    bundleName: "WIF Arbitrage",
    status: "success",
    timestamp: Date.now() - 3600000,
    profit: "+0.25 SOL",
    txHash: "5xGh7Uz9P...",
    executionTime: 1200, // ms
    gasUsed: 0.000125,
  },
  {
    id: "exec2",
    bundleId: "bundle1",
    bundleName: "BONK Sniper Bundle",
    status: "failed",
    timestamp: Date.now() - 7200000,
    profit: "0 SOL",
    txHash: "8jKl3Mn7R...",
    executionTime: 800, // ms
    gasUsed: 0.000085,
    error: "Slippage tolerance exceeded",
  },
  {
    id: "exec3",
    bundleId: "bundle3",
    bundleName: "JTO Liquidation Protection",
    status: "success",
    timestamp: Date.now() - 86400000,
    profit: "+0.12 SOL",
    txHash: "2qWe4Rt5Y...",
    executionTime: 950, // ms
    gasUsed: 0.000105,
  },
]

// Transaction templates
const transactionTemplates = [
  {
    id: "template1",
    name: "Token Swap",
    type: "swap",
    description: "Swap one token for another",
    fields: ["inputToken", "outputToken", "amount", "slippage"],
  },
  {
    id: "template2",
    name: "Token Transfer",
    type: "transfer",
    description: "Transfer tokens to another wallet",
    fields: ["token", "recipient", "amount"],
  },
  {
    id: "template3",
    name: "Loan Repayment",
    type: "repay",
    description: "Repay a loan on a lending protocol",
    fields: ["token", "amount", "protocol"],
  },
  {
    id: "template4",
    name: "Collateral Withdrawal",
    type: "withdraw",
    description: "Withdraw collateral from a lending protocol",
    fields: ["token", "amount", "protocol"],
  },
]

// Function to format timestamps
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

export default function BundleManager() {
  const [bundles, setBundles] = useState(mockBundles)
  const [history, setHistory] = useState(mockHistory)
  const [isLoading, setIsLoading] = useState(false)
  const [isJitoEnabled, setIsJitoEnabled] = useState(false)
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null)
  const [newBundle, setNewBundle] = useState({
    name: "",
    description: "",
    transactions: [],
    priority: false,
  })
  const [newTransaction, setNewTransaction] = useState({
    type: "",
    description: "",
    data: {},
  })
  const { walletPublicKey } = useJupiterContext()
  const { toast } = useToast()

  // Check if Jito is enabled
  useEffect(() => {
    const checkJitoStatus = async () => {
      try {
        const enabled = jitoService.isEnabled()
        setIsJitoEnabled(enabled)

        if (enabled) {
          const status = await jitoService.getStatus()
          console.log("Jito status:", status)
        }
      } catch (error) {
        console.error("Error checking Jito status:", error)
      }
    }

    checkJitoStatus()
  }, [])

  // Load bundles
  const loadBundles = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch bundles from a backend
      // For now, we'll just use the mock data
      setTimeout(() => {
        setBundles(mockBundles)
        setHistory(mockHistory)
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error loading bundles:", error)
      toast({
        title: "Error loading bundles",
        description: "Failed to fetch bundles. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Toggle bundle expansion
  const toggleBundleExpansion = (id: string) => {
    if (expandedBundle === id) {
      setExpandedBundle(null)
    } else {
      setExpandedBundle(id)
    }
  }

  // Add transaction to new bundle
  const addTransaction = () => {
    if (!newTransaction.type || !newTransaction.description) {
      toast({
        title: "Missing information",
        description: "Please select a transaction type and provide a description",
        variant: "destructive",
      })
      return
    }

    setNewBundle({
      ...newBundle,
      transactions: [
        ...newBundle.transactions,
        {
          id: `tx${Date.now()}`,
          ...newTransaction,
        },
      ],
    })

    // Reset new transaction form
    setNewTransaction({
      type: "",
      description: "",
      data: {},
    })
  }

  // Create new bundle
  const createBundle = () => {
    if (!newBundle.name) {
      toast({
        title: "Missing information",
        description: "Please provide a bundle name",
        variant: "destructive",
      })
      return
    }

    if (newBundle.transactions.length === 0) {
      toast({
        title: "No transactions",
        description: "Please add at least one transaction to the bundle",
        variant: "destructive",
      })
      return
    }

    const newBundleObj = {
      id: `bundle${Date.now()}`,
      ...newBundle,
      status: "ready",
      createdAt: Date.now(),
    }

    setBundles([...bundles, newBundleObj])

    // Reset form
    setNewBundle({
      name: "",
      description: "",
      transactions: [],
      priority: false,
    })

    toast({
      title: "Bundle created",
      description: `Bundle ${newBundleObj.name} has been created`,
    })
  }

  // Delete bundle
  const deleteBundle = (id: string) => {
    setBundles(bundles.filter((bundle) => bundle.id !== id))
    toast({
      title: "Bundle deleted",
      description: `Bundle ${bundles.find((b) => b.id === id)?.name} has been deleted`,
    })
  }

  // Toggle bundle status
  const toggleBundleStatus = (id: string) => {
    setBundles(
      bundles.map((bundle) => {
        if (bundle.id === id) {
          const newStatus = bundle.status === "running" ? "ready" : "running"
          return {
            ...bundle,
            status: newStatus,
          }
        }
        return bundle
      }),
    )

    toast({
      title: "Bundle status updated",
      description: `Bundle ${bundles.find((b) => b.id === id)?.name} is now ${bundles.find((b) => b.id === id)?.status === "running" ? "paused" : "running"}`,
    })
  }

  // Toggle bundle priority
  const toggleBundlePriority = (id: string) => {
    setBundles(
      bundles.map((bundle) => {
        if (bundle.id === id) {
          return {
            ...bundle,
            priority: !bundle.priority,
          }
        }
        return bundle
      }),
    )
  }

  // Duplicate bundle
  const duplicateBundle = (bundle: any) => {
    const newBundle = {
      ...bundle,
      id: `bundle${Date.now()}`,
      name: `${bundle.name} (Copy)`,
      status: "ready",
      createdAt: Date.now(),
    }

    setBundles([...bundles, newBundle])

    toast({
      title: "Bundle duplicated",
      description: `Bundle ${bundle.name} has been duplicated`,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bundles">
        <TabsList className="mb-6">
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="bundles">
          <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Bundle Manager</h2>
                <p className="text-sm text-[#707070]">
                  {isJitoEnabled
                    ? "Jito bundles are enabled for MEV protection"
                    : "Jito bundles are disabled. Enable them in settings for MEV protection."}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadBundles}
                  disabled={isLoading}
                  className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium">
                      <Plus className="h-4 w-4 mr-2" />
                      New Bundle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#151514] border-[#30302e] text-white max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Create New Bundle</DialogTitle>
                      <DialogDescription className="text-[#707070]">
                        Configure your transaction bundle for execution
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="name">Bundle Name</Label>
                          <Input
                            id="name"
                            value={newBundle.name}
                            onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })}
                            className="bg-[#1d1d1c] border-[#30302e]"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newBundle.description}
                            onChange={(e) => setNewBundle({ ...newBundle, description: e.target.value })}
                            className="bg-[#1d1d1c] border-[#30302e]"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="priority"
                            checked={newBundle.priority}
                            onCheckedChange={(checked) => setNewBundle({ ...newBundle, priority: checked })}
                          />
                          <Label htmlFor="priority">Priority Bundle</Label>
                        </div>

                        <div className="border-t border-[#30302e] pt-4">
                          <h3 className="text-lg font-medium mb-4">Transactions</h3>

                          {newBundle.transactions.length > 0 ? (
                            <div className="space-y-2 mb-4">
                              {newBundle.transactions.map((tx, index) => (
                                <div key={tx.id} className="bg-[#1d1d1c] p-3 rounded flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{tx.description}</p>
                                    <p className="text-xs text-[#707070]">Type: {tx.type}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setNewBundle({
                                        ...newBundle,
                                        transactions: newBundle.transactions.filter((_, i) => i !== index),
                                      })
                                    }
                                    className="h-8 w-8 text-[#E57676]"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-[#1d1d1c] p-4 rounded text-center mb-4">
                              <p className="text-[#707070]">No transactions added yet</p>
                            </div>
                          )}

                          <div className="bg-[#1d1d1c] p-4 rounded">
                            <h4 className="text-sm font-medium mb-2">Add Transaction</h4>

                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="txType">Transaction Type</Label>
                                <Select
                                  value={newTransaction.type}
                                  onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value })}
                                >
                                  <SelectTrigger id="txType" className="bg-[#151514] border-[#30302e]">
                                    <SelectValue placeholder="Select transaction type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="swap">Token Swap</SelectItem>
                                    <SelectItem value="transfer">Token Transfer</SelectItem>
                                    <SelectItem value="repay">Loan Repayment</SelectItem>
                                    <SelectItem value="withdraw">Collateral Withdrawal</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="txDescription">Description</Label>
                                <Input
                                  id="txDescription"
                                  value={newTransaction.description}
                                  onChange={(e) =>
                                    setNewTransaction({ ...newTransaction, description: e.target.value })
                                  }
                                  className="bg-[#151514] border-[#30302e]"
                                />
                              </div>

                              <Button onClick={addTransaction} className="w-full">
                                Add Transaction
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setNewBundle({
                            name: "",
                            description: "",
                            transactions: [],
                            priority: false,
                          })
                        }
                      >
                        Reset
                      </Button>
                      <Button onClick={createBundle}>Create Bundle</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-4">
              {bundles.length > 0 ? (
                bundles.map((bundle) => (
                  <Card key={bundle.id} className="bg-[#151514] border-[#30302e]">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBundleExpansion(bundle.id)}
                              className="h-6 w-6 mr-2 -ml-2"
                            >
                              {expandedBundle === bundle.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <CardTitle>{bundle.name}</CardTitle>
                            <span
                              className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                bundle.status === "running"
                                  ? "bg-[#332E1A] text-[#F9CB40]"
                                  : bundle.status === "completed"
                                    ? "bg-[#1E3323] text-[#A4D756]"
                                    : "bg-[#1d1d1c] text-[#707070]"
                              }`}
                            >
                              <StatusBadge status={bundle.status} />
                            </span>
                            {bundle.priority && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-[#332E1A] text-[#F9CB40]">
                                Priority
                              </span>
                            )}
                          </div>
                          <CardDescription>
                            {bundle.description} • {bundle.transactions.length} transactions
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBundleStatus(bundle.id)}
                            className={`h-8 w-8 ${bundle.status === "running" ? "text-[#F9CB40]" : "text-[#A4D756]"}`}
                            disabled={bundle.status === "completed"}
                          >
                            {bundle.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            <span className="sr-only">{bundle.status === "running" ? "Pause" : "Start"}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateBundle(bundle)}
                            className="h-8 w-8"
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Duplicate</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBundle(bundle.id)}
                            className="h-8 w-8 text-[#E57676]"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedBundle === bundle.id && (
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="text-[#707070]">Created:</span> {formatTime(bundle.createdAt)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-[#707070]">Priority:</span>
                              <Switch
                                checked={bundle.priority}
                                onCheckedChange={() => toggleBundlePriority(bundle.id)}
                                className="data-[state=checked]:bg-[#F9CB40]"
                              />
                            </div>
                          </div>

                          <div className="border-t border-[#30302e] pt-4">
                            <h3 className="text-sm font-medium mb-2">Transactions</h3>
                            <div className="space-y-2">
                              {bundle.transactions.map((tx, index) => (
                                <div key={tx.id} className="bg-[#1d1d1c] p-3 rounded">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{tx.description}</p>
                                      <p className="text-xs text-[#707070]">Type: {tx.type}</p>
                                    </div>
                                    <span className="text-xs text-[#707070]">#{index + 1}</span>
                                  </div>

                                  <div className="mt-2 pt-2 border-t border-[#30302e] text-xs">
                                    {tx.type === "swap" && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-[#707070]">Input:</span> {tx.data.amount}{" "}
                                          {tx.data.inputToken}
                                        </div>
                                        <div>
                                          <span className="text-[#707070]">Output:</span> {tx.data.outputToken}
                                        </div>
                                        <div>
                                          <span className="text-[#707070]">Slippage:</span> {tx.data.slippage}
                                        </div>
                                        {tx.data.dex && (
                                          <div>
                                            <span className="text-[#707070]">DEX:</span> {tx.data.dex}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {tx.type === "transfer" && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-[#707070]">Token:</span> {tx.data.token}
                                        </div>
                                        <div>
                                          <span className="text-[#707070]">Amount:</span> {tx.data.amount}
                                        </div>
                                        <div className="col-span-2">
                                          <span className="text-[#707070]">Recipient:</span> {tx.data.recipient}
                                        </div>
                                      </div>
                                    )}

                                    {(tx.type === "repay" || tx.type === "withdraw") && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-[#707070]">Token:</span> {tx.data.token}
                                        </div>
                                        <div>
                                          <span className="text-[#707070]">Amount:</span> {tx.data.amount}
                                        </div>
                                        <div>
                                          <span className="text-[#707070]">Protocol:</span> {tx.data.protocol}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="bg-[#151514] border-[#30302e]">
                  <CardContent className="py-8 flex flex-col items-center justify-center">
                    {isLoading ? (
                      <div className="flex items-center">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        <p>Loading bundles...</p>
                      </div>
                    ) : (
                      <>
                        <AlertTriangle className="h-12 w-12 text-[#707070] mb-4" />
                        <h3 className="text-lg font-medium mb-1">No bundles found</h3>
                        <p className="text-[#707070] mb-4">
                          You haven't created any transaction bundles yet. Create your first bundle to get started.
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button>Create Your First Bundle</Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#151514] border-[#30302e] text-white">
                            {/* Bundle creation form would go here */}
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Execution History</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={loadBundles}
                disabled={isLoading}
                className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[#707070] text-sm border-b border-[#30302e]">
                    <th className="pb-2 text-left">Bundle</th>
                    <th className="pb-2 text-left">Status</th>
                    <th className="pb-2 text-left">Time</th>
                    <th className="pb-2 text-left">Profit/Loss</th>
                    <th className="pb-2 text-left">Execution Time</th>
                    <th className="pb-2 text-left">Gas Used</th>
                    <th className="pb-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((item) => (
                      <tr key={item.id} className="border-b border-[#30302e] hover:bg-[#1d1d1c]">
                        <td className="py-4 font-medium">{item.bundleName}</td>
                        <td className="py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-4">{formatTime(item.timestamp)}</td>
                        <td className="py-4">
                          <span
                            className={
                              item.profit.startsWith("+")
                                ? "text-[#A4D756]"
                                : item.profit === "0 SOL"
                                  ? "text-[#707070]"
                                  : "text-[#E57676]"
                            }
                          >
                            {item.profit}
                          </span>
                        </td>
                        <td className="py-4">{item.executionTime}ms</td>
                        <td className="py-4">{item.gasUsed} SOL</td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(`https://solscan.io/tx/${item.txHash}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View on Solscan</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#707070]">
                        {isLoading ? (
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                            Loading execution history...
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <AlertTriangle className="h-8 w-8 mb-2" />
                            No execution history found
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Bundle Templates</h2>
              <Button className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactionTemplates.map((template) => (
                <Card key={template.id} className="bg-[#1d1d1c] border-[#30302e]">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
