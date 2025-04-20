"use client"

import { useState } from "react"
import { RefreshCw, ExternalLink, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock pool data
const mockPools = [
  {
    id: "pool1",
    token0: "SOL",
    token1: "USDC",
    liquidity: "$2,345,678",
    volume24h: "$456,789",
    apy: "12.5%",
    created: new Date().getTime() - 3600000 * 24 * 2, // 2 days ago
  },
  {
    id: "pool2",
    token0: "BONK",
    token1: "SOL",
    liquidity: "$987,654",
    volume24h: "$123,456",
    apy: "45.2%",
    created: new Date().getTime() - 3600000 * 2, // 2 hours ago
  },
  {
    id: "pool3",
    token0: "WIF",
    token1: "USDC",
    liquidity: "$567,890",
    volume24h: "$78,901",
    apy: "32.1%",
    created: new Date().getTime() - 3600000 * 0.5, // 30 minutes ago
  },
  {
    id: "pool4",
    token0: "JTO",
    token1: "SOL",
    liquidity: "$345,678",
    volume24h: "$23,456",
    apy: "18.7%",
    created: new Date().getTime() - 60000 * 5, // 5 minutes ago
  },
]

export default function PoolMonitor() {
  const [pools, setPools] = useState(mockPools)
  const [isLoading, setIsLoading] = useState(false)

  const refreshPools = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setPools([
        ...pools,
        {
          id: `pool${pools.length + 1}`,
          token0: "BOME",
          token1: "USDC",
          liquidity: "$123,456",
          volume24h: "$12,345",
          apy: "28.9%",
          created: new Date().getTime(),
        },
      ])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-bold">Pool Monitor</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                  <Info className="h-4 w-4 text-[#707070]" />
                  <span className="sr-only">Info</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Monitor new liquidity pools as they are created</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshPools}
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
              <th className="pb-2 text-left">Pair</th>
              <th className="pb-2 text-left">Liquidity</th>
              <th className="pb-2 text-left">Volume (24h)</th>
              <th className="pb-2 text-left">APY</th>
              <th className="pb-2 text-left">Created</th>
              <th className="pb-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool) => (
              <tr key={pool.id} className="border-b border-[#30302e] hover:bg-[#1d1d1c]">
                <td className="py-4">
                  <div className="flex items-center">
                    <span className="font-medium">
                      {pool.token0}/{pool.token1}
                    </span>
                    {isNew(pool.created) && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#1E3323] text-[#A4D756] rounded">New</span>
                    )}
                  </div>
                </td>
                <td className="py-4">{pool.liquidity}</td>
                <td className="py-4">{pool.volume24h}</td>
                <td className="py-4">{pool.apy}</td>
                <td className="py-4">{formatTime(pool.created)}</td>
                <td className="py-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e] h-8 px-2"
                    >
                      Add Target
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`https://solscan.io/token/${pool.id}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View on Solscan</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function isNew(timestamp: number): boolean {
  // Consider pools created in the last hour as "new"
  return Date.now() - timestamp < 3600000
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
