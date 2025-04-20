"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { Zap, TrendingUp, AlertTriangle, Clock } from "lucide-react"

export default function StatusBar() {
  const { metrics } = useAppStore()
  const [uptime, setUptime] = useState("00:00:00")

  // Calculate uptime
  useEffect(() => {
    const startTime = Date.now()

    const updateUptime = () => {
      const diff = Date.now() - startTime
      const hours = Math.floor(diff / 3600000)
        .toString()
        .padStart(2, "0")
      const minutes = Math.floor((diff % 3600000) / 60000)
        .toString()
        .padStart(2, "0")
      const seconds = Math.floor((diff % 60000) / 1000)
        .toString()
        .padStart(2, "0")
      setUptime(`${hours}:${minutes}:${seconds}`)
    }

    const interval = setInterval(updateUptime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatusCard
        title="Active Targets"
        value={metrics.activeTargets.toString()}
        icon={<Zap className="h-5 w-5 text-[#22CCEE]" />}
      />
      <StatusCard
        title="Pending Transactions"
        value={metrics.pendingTxs.toString()}
        icon={<Clock className="h-5 w-5 text-[#F9CB40]" />}
      />
      <StatusCard
        title="Successful Snipes"
        value={metrics.successfulSnipes.toString()}
        icon={<TrendingUp className="h-5 w-5 text-[#A4D756]" />}
      />
      <StatusCard
        title="Failed Snipes"
        value={metrics.failedSnipes.toString()}
        icon={<AlertTriangle className="h-5 w-5 text-[#E57676]" />}
      />
    </div>
  )
}

interface StatusCardProps {
  title: string
  value: string
  icon: React.ReactNode
}

function StatusCard({ title, value, icon }: StatusCardProps) {
  return (
    <div className="bg-[#151514] border border-[#30302e] rounded-lg p-4 flex items-center">
      <div className="mr-4 bg-[#1d1d1c] p-2 rounded-md">{icon}</div>
      <div>
        <p className="text-sm text-[#707070]">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  )
}
