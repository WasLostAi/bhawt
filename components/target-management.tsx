"use client"

import { useState } from "react"
import { Plus, Trash2, Edit, Check, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

// Mock target data
const mockTargets = [
  {
    id: "target1",
    token: "BONK",
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    amount: "100",
    maxPrice: "0.00001",
    active: true,
  },
  {
    id: "target2",
    token: "WIF",
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    amount: "50",
    maxPrice: "0.0005",
    active: true,
  },
  {
    id: "target3",
    token: "JTO",
    address: "7kbnb9z9PJVt9wUVe6TzJez3eSVP7dZEL9h6Gqh3zHAE",
    amount: "25",
    maxPrice: "0.002",
    active: false,
  },
]

export default function TargetManagement() {
  const [targets, setTargets] = useState(mockTargets)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTarget, setNewTarget] = useState({
    token: "",
    address: "",
    amount: "",
    maxPrice: "",
    active: true,
  })

  const handleAddTarget = () => {
    if (!newTarget.token || !newTarget.address || !newTarget.amount || !newTarget.maxPrice) {
      // Show error notification
      return
    }

    const target = {
      id: `target${Date.now()}`,
      ...newTarget,
    }

    setTargets([...targets, target])
    setNewTarget({
      token: "",
      address: "",
      amount: "",
      maxPrice: "",
      active: true,
    })
    setIsAdding(false)
  }

  const handleEditTarget = (id: string) => {
    const target = targets.find((t) => t.id === id)
    if (target) {
      setEditingId(id)
      setNewTarget({
        token: target.token,
        address: target.address,
        amount: target.amount,
        maxPrice: target.maxPrice,
        active: target.active,
      })
    }
  }

  const handleUpdateTarget = () => {
    if (!editingId) return

    setTargets(
      targets.map((target) =>
        target.id === editingId
          ? {
              ...target,
              token: newTarget.token,
              address: newTarget.address,
              amount: newTarget.amount,
              maxPrice: newTarget.maxPrice,
              active: newTarget.active,
            }
          : target,
      ),
    )

    setEditingId(null)
    setNewTarget({
      token: "",
      address: "",
      amount: "",
      maxPrice: "",
      active: true,
    })
  }

  const handleDeleteTarget = (id: string) => {
    setTargets(targets.filter((target) => target.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setTargets(
      targets.map((target) =>
        target.id === id
          ? {
              ...target,
              active: !target.active,
            }
          : target,
      ),
    )
  }

  return (
    <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Target Management</h2>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Target
        </Button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 border border-[#30302e] rounded-lg bg-[#1d1d1c]">
          <h3 className="text-lg font-medium mb-4">Add New Target</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="token">Token Symbol</Label>
              <Input
                id="token"
                value={newTarget.token}
                onChange={(e) => setNewTarget({ ...newTarget, token: e.target.value })}
                className="bg-[#151514] border-[#30302e]"
              />
            </div>
            <div>
              <Label htmlFor="address">Token Address</Label>
              <Input
                id="address"
                value={newTarget.address}
                onChange={(e) => setNewTarget({ ...newTarget, address: e.target.value })}
                className="bg-[#151514] border-[#30302e]"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (SOL)</Label>
              <Input
                id="amount"
                type="number"
                value={newTarget.amount}
                onChange={(e) => setNewTarget({ ...newTarget, amount: e.target.value })}
                className="bg-[#151514] border-[#30302e]"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                value={newTarget.maxPrice}
                onChange={(e) => setNewTarget({ ...newTarget, maxPrice: e.target.value })}
                className="bg-[#151514] border-[#30302e]"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="active"
              checked={newTarget.active}
              onCheckedChange={(checked) => setNewTarget({ ...newTarget, active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTarget}>Add Target</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[#707070] text-sm border-b border-[#30302e]">
              <th className="pb-2 text-left">Token</th>
              <th className="pb-2 text-left">Address</th>
              <th className="pb-2 text-left">Amount (SOL)</th>
              <th className="pb-2 text-left">Max Price</th>
              <th className="pb-2 text-left">Status</th>
              <th className="pb-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => (
              <tr key={target.id} className="border-b border-[#30302e] hover:bg-[#1d1d1c]">
                {editingId === target.id ? (
                  <>
                    <td className="py-4">
                      <Input
                        value={newTarget.token}
                        onChange={(e) => setNewTarget({ ...newTarget, token: e.target.value })}
                        className="bg-[#151514] border-[#30302e] h-8"
                      />
                    </td>
                    <td className="py-4">
                      <Input
                        value={newTarget.address}
                        onChange={(e) => setNewTarget({ ...newTarget, address: e.target.value })}
                        className="bg-[#151514] border-[#30302e] h-8"
                      />
                    </td>
                    <td className="py-4">
                      <Input
                        type="number"
                        value={newTarget.amount}
                        onChange={(e) => setNewTarget({ ...newTarget, amount: e.target.value })}
                        className="bg-[#151514] border-[#30302e] h-8"
                      />
                    </td>
                    <td className="py-4">
                      <Input
                        type="number"
                        value={newTarget.maxPrice}
                        onChange={(e) => setNewTarget({ ...newTarget, maxPrice: e.target.value })}
                        className="bg-[#151514] border-[#30302e] h-8"
                      />
                    </td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <Switch
                          checked={newTarget.active}
                          onCheckedChange={(checked) => setNewTarget({ ...newTarget, active: checked })}
                        />
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleUpdateTarget}
                          className="h-8 w-8 text-[#A4D756]"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Save</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(null)}
                          className="h-8 w-8 text-[#E57676]"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-4 font-medium">{target.token}</td>
                    <td className="py-4">
                      <span className="text-[#707070]">{truncateAddress(target.address)}</span>
                    </td>
                    <td className="py-4">{target.amount}</td>
                    <td className="py-4">{target.maxPrice}</td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${target.active ? "bg-[#A4D756]" : "bg-[#707070]"}`}
                        ></div>
                        <span>{target.active ? "Active" : "Inactive"}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(target.id)}
                          className={`h-8 w-8 ${target.active ? "text-[#F9CB40]" : "text-[#A4D756]"}`}
                        >
                          {target.active ? <AlertTriangle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          <span className="sr-only">{target.active ? "Deactivate" : "Activate"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTarget(target.id)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTarget(target.id)}
                          className="h-8 w-8 text-[#E57676]"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
