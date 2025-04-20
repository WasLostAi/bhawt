"use client"

import { useState } from "react"
import { Plus, Trash2, Play, Pause, Clock, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock bundle data
const mockBundles = [
  {
    id: "bundle1",
    name: "BONK Sniper Bundle",
    description: "Snipe BONK token with priority",
    transactions: 3,
    status: "ready",
    priority: true,
  },
  {
    id: "bundle2",
    name: "WIF Arbitrage",
    description: "Arbitrage WIF across multiple DEXs",
    transactions: 5,
    status: "running",
    priority: true,
  },
  {
    id: "bundle3",
    name: "JTO Liquidation Protection",
    description: "Protect JTO position from liquidation",
    transactions: 2,
    status: "completed",
    priority: false,
  },
]

// Mock bundle execution history
const mockHistory = [
  {
    id: "exec1",
    bundleId: "bundle2",
    bundleName: "WIF Arbitrage",
    status: "success",
    timestamp: new Date().getTime() - 3600000,
    profit: "+0.25 SOL",
  },
  {
    id: "exec2",
    bundleId: "bundle1",
    bundleName: "BONK Sniper Bundle",
    status: "failed",
    timestamp: new Date().getTime() - 7200000,
    profit: "0 SOL",
  },
  {
    id: "exec3",
    bundleId: "bundle3",
    bundleName: "JTO Liquidation Protection",
    status: "success",
    timestamp: new Date().getTime() - 86400000,
    profit: "+0.12 SOL",
  },
]

export default function BundleManager() {
  const [bundles, setBundles] = useState(mockBundles)
  const [history, setHistory] = useState(mockHistory)
  const [isAdding, setIsAdding] = useState(false)
  const [newBundle, setNewBundle] = useState({
    name: "",
    description: "",
    transactions: 0,
    status: "ready",
    priority: false,
  })

  const handleAddBundle = () => {
    if (!newBundle.name) return

    const bundle = {
      id: `bundle${Date.now()}`,
      ...newBundle,
    }

    setBundles([...bundles, bundle])
    setNewBundle({
      name: "",
      description: "",
      transactions: 0,
      status: "ready",
      priority: false,
    })
    setIsAdding(false)
  }

  const handleDeleteBundle = (id: string) => {
    setBundles(bundles.filter((bundle) => bundle.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setBundles(
      bundles.map((bundle) =>
        bundle.id === id
          ? {
              ...bundle,
              status: bundle.status === "running" ? "ready" : "running",
            }
          : bundle,
      ),
    )
  }

  const handleTogglePriority = (id: string) => {
    setBundles(
      bundles.map((bundle) =>
        bundle.id === id
          ? {
              ...bundle,
              priority: !bundle.priority,
            }
          : bundle,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bundles">
        <TabsList className="mb-6">
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="bundles">
          <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Bundle Manager</h2>
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Bundle
              </Button>
            </div>

            {isAdding && (
              <div className="mb-6 p-4 border border-[#30302e] rounded-lg bg-[#1d1d1c]">
                <h3 className="text-lg font-medium mb-4">Create New Bundle</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Bundle Name</Label>
                    <Input
                      id="name"
                      value={newBundle.name}
                      onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })}
                      className="bg-[#151514] border-[#30302e]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newBundle.description}
                      onChange={(e) => setNewBundle({ ...newBundle, description: e.target.value })}
                      className="bg-[#151514] border-[#30302e]"
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
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddBundle}>Create Bundle</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[#707070] text-sm border-b border-[#30302e]">
                    <th className="pb-2 text-left">Name</th>
                    <th className="pb-2 text-left">Description</th>
                    <th className="pb-2 text-left">Transactions</th>
                    <th className="pb-2 text-left">Status</th>
                    <th className="pb-2 text-left">Priority</th>
                    <th className="pb-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bundles.map((bundle) => (
                    <tr key={bundle.id} className="border-b border-[#30302e] hover:bg-[#1d1d1c]">
                      <td className="py-4 font-medium">{bundle.name}</td>
                      <td className="py-4 text-[#707070]">{bundle.description}</td>
                      <td className="py-4">{bundle.transactions}</td>
                      <td className="py-4">
                        <StatusBadge status={bundle.status} />
                      </td>
                      <td className="py-4">
                        <Switch
                          checked={bundle.priority}
                          onCheckedChange={() => handleTogglePriority(bundle.id)}
                          className="data-[state=checked]:bg-[#F9CB40]"
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(bundle.id)}
                            className={`h-8 w-8 ${bundle.status === "running" ? "text-[#F9CB40]" : "text-[#A4D756]"}`}
                            disabled={bundle.status === "completed"}
                          >
                            {bundle.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            <span className="sr-only">{bundle.status === "running" ? "Pause" : "Start"}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBundle(bundle.id)}
                            className="h-8 w-8 text-[#E57676]"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
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

        <TabsContent value="history">
          <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Execution History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[#707070] text-sm border-b border-[#30302e]">
                    <th className="pb-2 text-left">Bundle</th>
                    <th className="pb-2 text-left">Status</th>
                    <th className="pb-2 text-left">Time</th>
                    <th className="pb-2 text-left">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let bgColor = ""
  let textColor = ""
  let icon = null

  switch (status) {
    case "ready":
      bgColor = "bg-[#1d1d1c]"
      textColor = "text-[#707070]"
      icon = <Clock className="h-3 w-3 mr-1" />
      break
    case "running":
      bgColor = "bg-[#332E1A]"
      textColor = "text-[#F9CB40]"
      icon = <Play className="h-3 w-3 mr-1" />
      break
    case "completed":
      bgColor = "bg-[#1E3323]"
      textColor = "text-[#A4D756]"
      icon = <Check className="h-3 w-3 mr-1" />
      break
    case "success":
      bgColor = "bg-[#1E3323]"
      textColor = "text-[#A4D756]"
      icon = <Check className="h-3 w-3 mr-1" />
      break
    case "failed":
      bgColor = "bg-[#331A1A]"
      textColor = "text-[#E57676]"
      icon = <X className="h-3 w-3 mr-1" />
      break
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md ${bgColor} ${textColor} text-xs`}>
      {icon}
      <span className="capitalize">{status}</span>
    </span>
  )
}

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
