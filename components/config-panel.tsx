"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, RefreshCw, Zap, AlertTriangle } from "lucide-react"
import { ENV } from "@/lib/env"
import { Badge } from "@/components/ui/badge"
import QuickNodeConfig from "./quicknode-config"

export default function ConfigPanel() {
  const [priorityFee, setPriorityFee] = useState(Number(ENV.get("DEFAULT_PRIORITY_FEE", "250000")) / 1_000_000_000)
  const [maxAccounts, setMaxAccounts] = useState(Number(ENV.get("MAX_ACCOUNTS", "64")))
  const [useJito, setUseJito] = useState(ENV.isEnabled("ENABLE_JITO_BUNDLES"))
  const [useBundling, setUseBundling] = useState(true)
  const [simulateLocally, setSimulateLocally] = useState(true)
  const [rpcEndpoint, setRpcEndpoint] = useState(
    ENV.get("QUICKNODE_ENDPOINT", "https://rpc.quicknode.com/solana/mainnet"),
  )
  const [jupiterEndpoint, setJupiterEndpoint] = useState("https://quote-api.jup.ag/v6")
  const [telegramEnabled, setTelegramEnabled] = useState(!!ENV.get("TELEGRAM_BOT_TOKEN", ""))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-[#151514] border-[#30302e]">
        <CardHeader>
          <CardTitle className="text-xl font-syne">Bot Configuration</CardTitle>
          <CardDescription>Configure performance settings for the sniper bot</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance">
            <TabsList className="bg-[#1d1d1c] border border-[#30302e]">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="quicknode">QuickNode</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="priorityFee">Priority Fee (SOL)</Label>
                  <span className="text-sm text-[#707070]">{priorityFee.toFixed(5)} SOL</span>
                </div>
                <Slider
                  id="priorityFee"
                  min={0.00001}
                  max={0.001}
                  step={0.00001}
                  value={[priorityFee]}
                  onValueChange={(value) => setPriorityFee(value[0])}
                  className="[&>span]:bg-gradient-to-r [&>span]:from-[#00B6E7] [&>span]:to-[#A4D756]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="maxAccounts">Max Accounts</Label>
                  <span className="text-sm text-[#707070]">{maxAccounts}</span>
                </div>
                <Slider
                  id="maxAccounts"
                  min={16}
                  max={128}
                  step={8}
                  value={[maxAccounts]}
                  onValueChange={(value) => setMaxAccounts(value[0])}
                  className="[&>span]:bg-gradient-to-r [&>span]:from-[#22CCEE] [&>span]:to-[#2ED3B7]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="useJito">Use Jito MEV Protection</Label>
                  <p className="text-sm text-[#707070]">Protect transactions from frontrunning</p>
                </div>
                <Switch
                  id="useJito"
                  checked={useJito}
                  onCheckedChange={setUseJito}
                  className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="useBundling">Transaction Bundling</Label>
                  <p className="text-sm text-[#707070]">Bundle transactions for higher success rate</p>
                </div>
                <Switch
                  id="useBundling"
                  checked={useBundling}
                  onCheckedChange={setUseBundling}
                  className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="simulateLocally">Local Simulation</Label>
                  <p className="text-sm text-[#707070]">Simulate transactions locally before sending</p>
                </div>
                <Switch
                  id="simulateLocally"
                  checked={simulateLocally}
                  onCheckedChange={setSimulateLocally}
                  className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                />
              </div>
            </TabsContent>

            <TabsContent value="endpoints" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rpcEndpoint">QuickNode RPC Endpoint</Label>
                <Input
                  id="rpcEndpoint"
                  value={rpcEndpoint}
                  onChange={(e) => setRpcEndpoint(e.target.value)}
                  className="bg-[#1d1d1c] border-[#30302e]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jupiterEndpoint">Jupiter API Endpoint</Label>
                <Input
                  id="jupiterEndpoint"
                  value={jupiterEndpoint}
                  onChange={(e) => setJupiterEndpoint(e.target.value)}
                  className="bg-[#1d1d1c] border-[#30302e]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quicknodeAddons">QuickNode Add-Ons</Label>
                <Select defaultValue="metis">
                  <SelectTrigger className="bg-[#1d1d1c] border-[#30302e]">
                    <SelectValue placeholder="Select add-ons" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1d1d1c] border-[#30302e]">
                    <SelectItem value="metis">Metis (Jupiter API)</SelectItem>
                    <SelectItem value="jito">Jito Bundle Service</SelectItem>
                    <SelectItem value="enhanced">Enhanced Transaction History</SelectItem>
                    <SelectItem value="all">All Add-Ons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="quicknode" className="mt-4">
              <QuickNodeConfig />
            </TabsContent>

            <TabsContent value="notifications" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="telegramEnabled">Telegram Notifications</Label>
                  <p className="text-sm text-[#707070]">Receive alerts via Telegram</p>
                </div>
                <Switch
                  id="telegramEnabled"
                  checked={telegramEnabled}
                  onCheckedChange={setTelegramEnabled}
                  className="data-[state=checked]:bg-gradient-to-r from-[#00B6E7] to-[#A4D756]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegramToken">Telegram Bot Token</Label>
                <Input
                  id="telegramToken"
                  type="password"
                  placeholder="Enter your Telegram bot token"
                  className="bg-[#1d1d1c] border-[#30302e]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
                <Input
                  id="telegramChatId"
                  placeholder="Enter your Telegram chat ID"
                  className="bg-[#1d1d1c] border-[#30302e]"
                />
              </div>
            </TabsContent>

            <TabsContent value="environment" className="mt-4 space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Environment Variables</h3>
                <div className="p-4 rounded-lg bg-[#1d1d1c] border border-[#30302e] space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-[#707070]">RPC Endpoint:</div>
                    <div className="text-sm truncate">{ENV.get("RPC_ENDPOINT")}</div>

                    <div className="text-sm text-[#707070]">QuickNode Endpoint:</div>
                    <div className="text-sm truncate">{ENV.get("QUICKNODE_ENDPOINT")}</div>

                    <div className="text-sm text-[#707070]">Jito API Key:</div>
                    <div className="text-sm truncate">
                      {ENV.get("JITO_API_KEY").substring(0, 4)}...
                      {ENV.get("JITO_API_KEY").substring(ENV.get("JITO_API_KEY").length - 4)}
                    </div>

                    <div className="text-sm text-[#707070]">Jupiter API Key:</div>
                    <div className="text-sm truncate">{ENV.get("JUPITER_API_KEY") ? "••••••••" : "Not configured"}</div>

                    <div className="text-sm text-[#707070]">Default Priority Fee:</div>
                    <div className="text-sm">{Number(ENV.get("DEFAULT_PRIORITY_FEE")) / 1_000_000_000} SOL</div>

                    <div className="text-sm text-[#707070]">Max Compute Units:</div>
                    <div className="text-sm">{ENV.get("MAX_COMPUTE_UNITS")}</div>

                    <div className="text-sm text-[#707070]">Max Accounts:</div>
                    <div className="text-sm">{ENV.get("MAX_ACCOUNTS")}</div>

                    <div className="text-sm text-[#707070]">Min Liquidity USD:</div>
                    <div className="text-sm">${ENV.get("MIN_LIQUIDITY_USD")}</div>

                    <div className="text-sm text-[#707070]">Max Price Impact:</div>
                    <div className="text-sm">{ENV.get("MAX_PRICE_IMPACT")}%</div>
                  </div>
                </div>

                <h3 className="text-lg font-medium">Feature Flags</h3>
                <div className="p-4 rounded-lg bg-[#1d1d1c] border border-[#30302e] space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-[#707070]">Jito Bundles:</div>
                    <div className="text-sm">
                      <Badge className={ENV.isEnabled("ENABLE_JITO_BUNDLES") ? "bg-[#76D484]" : "bg-[#E57676]"}>
                        {ENV.isEnabled("ENABLE_JITO_BUNDLES") ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="text-sm text-[#707070]">Priority Fees:</div>
                    <div className="text-sm">
                      <Badge className={ENV.isEnabled("ENABLE_PRIORITY_FEES") ? "bg-[#76D484]" : "bg-[#E57676]"}>
                        {ENV.isEnabled("ENABLE_PRIORITY_FEES") ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="text-sm text-[#707070]">Whale Tracking:</div>
                    <div className="text-sm">
                      <Badge className={ENV.isEnabled("ENABLE_WHALE_TRACKING") ? "bg-[#76D484]" : "bg-[#E57676]"}>
                        {ENV.isEnabled("ENABLE_WHALE_TRACKING") ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="text-sm text-[#707070]">Strategy Monitor:</div>
                    <div className="text-sm">
                      <Badge className={ENV.isEnabled("ENABLE_STRATEGY_MONITOR") ? "bg-[#76D484]" : "bg-[#E57676]"}>
                        {ENV.isEnabled("ENABLE_STRATEGY_MONITOR") ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#1d1d1c] border border-[#E57676] flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-[#E57676] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#707070]">
                    These are mock environment variables for development. In production, you should set these values in
                    your Vercel project settings or .env file.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" className="bg-[#1d1d1c] border-[#30302e]">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium">
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#151514] border-[#30302e]">
        <CardHeader>
          <CardTitle className="text-xl font-syne">Code Snippets</CardTitle>
          <CardDescription>Key code examples from the sniper implementation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">WebSocket Listener for New Pools</h3>
            <pre className="p-3 rounded-lg bg-[#0C0C0C] text-xs overflow-x-auto">
              <code className="text-[#e8f9ff]">{`const ws = solanaConnection.onProgramAccountChange(
  new PublicKey('RAYDIUM_LIQUIDITY_POOL_PROGRAM_ID'),
  async (info) => {
    // Handle new pool creation event
    const poolData = parsePoolData(info.accountInfo.data);
    if (isTargetToken(poolData.tokenMint)) {
      await snipeNewToken(poolData);
    }
  }
);`}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Priority Fees Configuration</h3>
            <pre className="p-3 rounded-lg bg-[#0C0C0C] text-xs overflow-x-auto">
              <code className="text-[#e8f9ff]">{`swapRequest: {
  prioritizationFeeLamports: 'auto', // Automatically calculate optimal fee
  maxAccounts: 64, // Increased account limits for complex swaps
  slippageBps: target.maxSlippage * 100,
  onlyDirectRoutes: true // Faster execution with direct routes
}`}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Main Sniper Logic</h3>
            <pre className="p-3 rounded-lg bg-[#0C0C0C] text-xs overflow-x-auto">
              <code className="text-[#e8f9ff]">{`async snipe(poolInfo: PoolInfo) {
  // Get quote from Jupiter API
  const quote = await jupiterApi.quoteGet({
    inputMint: SOL_MINT,
    outputMint: poolInfo.mint,
    amount: LAMPORTS_PER_SOL * 1 // 1 SOL base
  });

  // Check if price meets our criteria
  if (quote.priceImpact < target.maxSlippage && 
      poolInfo.liquidity > target.minLiquidity) {
    
    // Prepare transaction
    const { swapTransaction } = await jupiterApi.swapPost({
      swapRequest: {
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toString(),
        prioritizationFeeLamports: calculateOptimalFee(),
        maxAccounts: 64
      }
    });
    
    // Sign and send transaction
    const tx = Transaction.from(Buffer.from(swapTransaction, 'base64'));
    const signature = await sendAndConfirmTransaction(
      connection,
      tx,
      [wallet],
      { skipPreflight: true } // Skip preflight for faster execution
    );
    
    return { success: true, signature };
  }
}`}</code>
            </pre>
          </div>

          <Button className="w-full bg-gradient-to-r from-[#2ED3B7] to-[#C8F284] hover:opacity-90 text-[#0C0C0C] font-medium">
            <Zap className="mr-2 h-4 w-4" />
            Start Sniper Bot
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
