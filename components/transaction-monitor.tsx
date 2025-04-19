"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react"

interface TransactionMonitorProps {
  setPendingTxs: (count: number) => void
  setSuccessfulSnipes: (count: number) => void
}

interface Transaction {
  id: string
  hash: string
  token: string
  amount: number
  price: number
  status: "pending" | "success" | "failed"
  timestamp: Date
  priorityFee: number
}

const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    hash: "5UxV7...8Ypz",
    token: "BONK",
    amount: 25000000,
    price: 0.000011,
    status: "pending",
    timestamp: new Date(),
    priorityFee: 0.00045,
  },
  {
    id: "tx2",
    hash: "3KmN2...9Rqx",
    token: "WIF",
    amount: 1250,
    price: 0.00022,
    status: "success",
    timestamp: new Date(Date.now() - 120000),
    priorityFee: 0.00052,
  },
  {
    id: "tx3",
    hash: "7PzQ8...2Fvb",
    token: "JTO",
    amount: 350,
    price: 0.0014,
    status: "success",
    timestamp: new Date(Date.now() - 360000),
    priorityFee: 0.00038,
  },
  {
    id: "tx4",
    hash: "9TxR5...1Hgc",
    token: "PYTH",
    amount: 125,
    price: 0.0085,
    status: "failed",
    timestamp: new Date(Date.now() - 480000),
    priorityFee: 0.00062,
  },
  {
    id: "tx5",
    hash: "2LpK7...4Dvs",
    token: "BONK",
    amount: 18000000,
    price: 0.000012,
    status: "success",
    timestamp: new Date(Date.now() - 720000),
    priorityFee: 0.00041,
  },
]

export default function TransactionMonitor({ setPendingTxs, setSuccessfulSnipes }: TransactionMonitorProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)

  useEffect(() => {
    // Update the parent component with counts
    const pendingCount = transactions.filter((tx) => tx.status === "pending").length
    const successCount = transactions.filter((tx) => tx.status === "success").length

    setPendingTxs(pendingCount)
    setSuccessfulSnipes(successCount)

    // Simulate transaction updates
    const interval = setInterval(() => {
      setTransactions((prev) => {
        const updated = [...prev]
        // Randomly update a pending transaction to success
        const pendingIndex = updated.findIndex((tx) => tx.status === "pending")
        if (pendingIndex !== -1 && Math.random() > 0.5) {
          updated[pendingIndex] = {
            ...updated[pendingIndex],
            status: "success",
          }
        }
        return updated
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [transactions, setPendingTxs, setSuccessfulSnipes])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-[#22CCEE]" />
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-[#76D484]" />
      case "failed":
        return <XCircle className="h-4 w-4 text-[#E57676]" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-[#22CCEE] text-[#0C0C0C]">Pending</Badge>
      case "success":
        return <Badge className="bg-[#76D484] text-[#0C0C0C]">Success</Badge>
      case "failed":
        return <Badge className="bg-[#E57676] text-[#0C0C0C]">Failed</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="bg-[#151514] border-[#30302e]">
      <CardHeader>
        <CardTitle className="text-xl font-[Syne]">Transaction Monitor</CardTitle>
        <CardDescription>Track your snipe transactions in real-time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 rounded-lg border border-[#30302e] bg-[#1d1d1c]">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="font-medium font-[Syne]">{tx.token}</div>
                    {getStatusBadge(tx.status)}
                  </div>
                  <div className="text-sm text-[#707070] mt-1">{tx.timestamp.toLocaleTimeString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{tx.amount.toLocaleString()} tokens</div>
                  <div className="text-sm text-[#707070]">@ {tx.price.toFixed(8)} SOL</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#30302e] flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm text-[#707070]">
                  <div className="flex items-center">
                    {getStatusIcon(tx.status)}
                    <span className="ml-1">Tx: {tx.hash}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-[#707070]">Priority Fee: {tx.priorityFee.toFixed(5)} SOL</div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
