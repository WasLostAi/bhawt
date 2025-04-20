"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, Check, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ENV } from "@/lib/env"
import { Connection } from "@solana/web3.js"

export default function QuickNodeConfig() {
  const { toast } = useToast()
  const [endpoint, setEndpoint] = useState(ENV.get("QUICKNODE_ENDPOINT", ""))
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [useQuickNode, setUseQuickNode] = useState(!!endpoint)
  const [connectionStats, setConnectionStats] = useState<{
    latency: number
    slot: number
  } | null>(null)

  // Load saved endpoint on mount
  useEffect(() => {
    const savedEndpoint = ENV.get("QUICKNODE_ENDPOINT", "")
    if (savedEndpoint) {
      setEndpoint(savedEndpoint)
      setUseQuickNode(true)
      testConnection(savedEndpoint)
    }
  }, [])

  // Test the connection to the QuickNode endpoint
  const testConnection = async (url: string) => {
    if (!url) return

    setIsLoading(true)
    try {
      const startTime = performance.now()
      const connection = new Connection(url)
      const slot = await connection.getSlot()
      const endTime = performance.now()

      setConnectionStats({
        latency: Math.round(endTime - startTime),
        slot,
      })

      setIsConnected(true)
      toast({
        title: "Connection Successful",
        description: `Connected to QuickNode (Slot: ${slot})`,
      })
    } catch (error) {
      console.error("Connection error:", error)
      setIsConnected(false)
      setConnectionStats(null)
      toast({
        title: "Connection Failed",
        description: "Could not connect to QuickNode endpoint",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save the QuickNode configuration
  const saveConfig = () => {
    if (useQuickNode && !endpoint) {
      toast({
        title: "Error",
        description: "Please enter a QuickNode endpoint URL",
        variant: "destructive",
      })
      return
    }

    if (useQuickNode) {
      ENV.setQuickNodeEndpoint(endpoint)
      testConnection(endpoint)
    } else {
      ENV.set("QUICKNODE_ENDPOINT", "")
      ENV.set("RPC_ENDPOINT", "https://api.mainnet-beta.solana.com")
      setIsConnected(false)
      setConnectionStats(null)
    }

    toast({
      title: "Configuration Saved",
      description: useQuickNode ? "QuickNode endpoint has been configured" : "Using default public RPC endpoint",
    })
  }

  return (
    <Card className="bg-[#151514] border-[#30302e]">
      <CardHeader>
        <CardTitle className="text-xl font-syne">QuickNode Configuration</CardTitle>
        <CardDescription>Configure your QuickNode endpoint for secure testing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="useQuickNode">Use QuickNode</Label>
              <p className="text-xs text-[#707070]">Connect to your private QuickNode endpoint</p>
            </div>
            <Switch
              id="useQuickNode"
              checked={useQuickNode}
              onCheckedChange={setUseQuickNode}
              className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
            />
          </div>

          {useQuickNode && (
            <div className="space-y-2">
              <Label htmlFor="quicknodeEndpoint">QuickNode Endpoint URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="quicknodeEndpoint"
                  type="text"
                  placeholder="https://your-endpoint.quiknode.pro/your-api-key/"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="flex-1 bg-[#1d1d1c] border-[#30302e]"
                />
                <Button
                  variant="outline"
                  className="bg-[#1d1d1c] border-[#30302e]"
                  onClick={() => testConnection(endpoint)}
                  disabled={isLoading || !endpoint}
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Test"}
                </Button>
              </div>
              <p className="text-xs text-[#707070]">Your QuickNode endpoint URL with API key</p>
            </div>
          )}

          {isConnected && connectionStats && (
            <div className="p-3 rounded-lg bg-[#1d1d1c] border border-[#30302e] flex items-center space-x-2">
              <Check className="h-4 w-4 text-[#76D484]" />
              <div>
                <p className="text-sm">Connected to QuickNode</p>
                <p className="text-xs text-[#707070]">
                  Latency: {connectionStats.latency}ms | Current Slot: {connectionStats.slot}
                </p>
              </div>
            </div>
          )}

          {!isConnected && useQuickNode && (
            <div className="p-3 rounded-lg bg-[#1d1d1c] border border-[#E57676] flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-[#E57676]" />
              <div>
                <p className="text-sm">Not connected to QuickNode</p>
                <p className="text-xs text-[#707070]">
                  Please enter a valid QuickNode endpoint URL and test the connection
                </p>
              </div>
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
            onClick={saveConfig}
          >
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
