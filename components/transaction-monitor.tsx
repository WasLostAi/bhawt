"use client"

import type React from "react"

import { useState } from "react"
import { Check, X, Clock, ExternalLink } from "lucide-react"

// Mock transaction data
const mockTransactions = [
  {
    id: "tx1",
    hash: "5xGh7Uz9P...",
    type: "swap",
    status: "success",
    amount: "10.5 SOL",
    token: "BONK",
    timestamp: new Date().getTime() - 120000,
  },
  {
    id: "tx2",
    hash: "8jKl3Mn7R...",
    type: "snipe",
    status: "pending",
    amount: "5.2 SOL",
    token: "WIF",
    timestamp: new Date().getTime() - 60000,
  },
  {
    id: "tx3",
    hash: "2qWe4Rt5Y...",
    type: "sell",
    status: "failed",
    amount: "3.7 SOL",
    token: "BOME",
    timestamp: new Date().getTime() - 30000,
  },
]

export default function TransactionMonitor() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [filter, setFilter] = useState("all")

  // Filter transactions based on status
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true
    return tx.status === filter
  })

  return (
    <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Transaction Monitor</h2>
        <div className="flex space-x-2">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterButton>
          <FilterButton active={filter === "success"} onClick={() => setFilter("success")}>
            Success
          </FilterButton>
          <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")}>
            Pending
          </FilterButton>
          <FilterButton active={filter === "failed"} onClick={() => setFilter("failed")}>
            Failed
          </FilterButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[#707070] text-sm border-b border-[#30302e]">
              <th className="pb-2 text-left">Status</th>
              <th className="pb-2 text-left">Type</th>
              <th className="pb-2 text-left">Token</th>
              <th className="pb-2 text-left">Amount</th>
              <th className="pb-2 text-left">Time</th>
              <th className="pb-2 text-left">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-[#30302e] hover:bg-[#1d1d1c]">
                <td className="py-4">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="py-4 capitalize">{tx.type}</td>
                <td className="py-4">{tx.token}</td>
                <td className="py-4">{tx.amount}</td>
                <td className="py-4">{formatTime(tx.timestamp)}</td>
                <td className="py-4">
                  <a
                    href={`https://solscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[#22CCEE] hover:underline"
                  >
                    {tx.hash}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let bgColor = ""
  let textColor = ""
  let icon = null

  switch (status) {
    case "success":
      bgColor = "bg-[#1E3323]"
      textColor = "text-[#A4D756]"
      icon = <Check className="h-3 w-3 mr-1" />
      break
    case "pending":
      bgColor = "bg-[#332E1A]"
      textColor = "text-[#F9CB40]"
      icon = <Clock className="h-3 w-3 mr-1" />
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

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`px-3 py-1 rounded-md text-sm ${
        active ? "bg-[#22CCEE] text-[#0C0C0C]" : "bg-[#1d1d1c] text-[#707070] hover:bg-[#30302e]"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
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
