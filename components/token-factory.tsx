"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Rocket, ExternalLink, Copy, Check, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useJupiterContext } from "@/contexts/jupiter-context"
import { Progress } from "@/components/ui/progress"

export default function TokenFactory() {
  const [activeTab, setActiveTab] = useState("create")
  const [isLoading, setIsLoading] = useState(false)
  const [deploymentStep, setDeploymentStep] = useState(0)
  const [deploymentProgress, setDeploymentProgress] = useState(0)
  const [deployedTokens, setDeployedTokens] = useState<any[]>([])
  const { walletPublicKey } = useJupiterContext()
  const { toast } = useToast()

  // Token creation form state
  const [tokenConfig, setTokenConfig] = useState({
    name: "",
    symbol: "",
    decimals: 9,
    totalSupply: "1000000000",
    mintable: false,
    burnable: false,
    pausable: false,
    taxable: false,
    taxPercentage: 5,
    antiBot: true,
    maxWallet: "2",
    maxTransaction: "1",
    liquidityPercentage: 80,
    liquidityLockTime: 180, // days
    teamAllocation: 10,
    marketingAllocation: 5,
    developmentAllocation: 5,
  })

  // Token deployment simulation
  const simulateDeployment = async () => {
    if (!walletPublicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to deploy a token",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setDeploymentStep(1)
    setDeploymentProgress(10)

    try {
      // Step 1: Validate configuration
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setDeploymentProgress(20)

      // Step 2: Compile contract
      setDeploymentStep(2)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setDeploymentProgress(40)

      // Step 3: Deploy contract
      setDeploymentStep(3)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setDeploymentProgress(70)

      // Step 4: Verify contract
      setDeploymentStep(4)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setDeploymentProgress(90)

      // Step 5: Finalize
      setDeploymentStep(5)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setDeploymentProgress(100)

      // Add to deployed tokens
      const newToken = {
        address: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        name: tokenConfig.name,
        symbol: tokenConfig.symbol,
        decimals: tokenConfig.decimals,
        totalSupply: tokenConfig.totalSupply,
        deployedAt: new Date().toISOString(),
      }

      setDeployedTokens([newToken, ...deployedTokens])

      toast({
        title: "Token deployed successfully",
        description: `${tokenConfig.name} (${tokenConfig.symbol}) has been deployed to the Solana blockchain`,
      })
    } catch (error) {
      console.error("Error deploying token:", error)
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      // Reset after a delay
      setTimeout(() => {
        setDeploymentStep(0)
        setDeploymentProgress(0)
      }, 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Token Factory</h2>
          <p className="text-[#707070]">Create, deploy, and launch tokens on Solana</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="create">Create Token</TabsTrigger>
          <TabsTrigger value="manage">Manage Tokens</TabsTrigger>
        </TabsList>

        {/* Create Token Tab */}
        <TabsContent value="create">
          <Card className="bg-[#151514] border-[#30302e]">
            <CardHeader>
              <CardTitle>Create New Token</CardTitle>
              <CardDescription>Configure and deploy your custom Solana token</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Token Name</Label>
                    <Input
                      id="name"
                      placeholder="My Awesome Token"
                      value={tokenConfig.name}
                      onChange={(e) => setTokenConfig({ ...tokenConfig, name: e.target.value })}
                      className="bg-[#1d1d1c] border-[#30302e]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symbol">Token Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="TOKEN"
                      value={tokenConfig.symbol}
                      onChange={(e) => setTokenConfig({ ...tokenConfig, symbol: e.target.value })}
                      className="bg-[#1d1d1c] border-[#30302e]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="decimals">Decimals</Label>
                    <Select
                      value={tokenConfig.decimals.toString()}
                      onValueChange={(value) => setTokenConfig({ ...tokenConfig, decimals: Number.parseInt(value) })}
                    >
                      <SelectTrigger id="decimals" className="bg-[#1d1d1c] border-[#30302e]">
                        <SelectValue placeholder="Select decimals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 (like USDC)</SelectItem>
                        <SelectItem value="9">9 (like SOL)</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="18">18</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalSupply">Total Supply</Label>
                    <Input
                      id="totalSupply"
                      placeholder="1000000000"
                      value={tokenConfig.totalSupply}
                      onChange={(e) => setTokenConfig({ ...tokenConfig, totalSupply: e.target.value })}
                      className="bg-[#1d1d1c] border-[#30302e]"
                    />
                  </div>
                </div>

                {/* Token Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Token Features</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mintable" className="block mb-1">
                        Mintable
                      </Label>
                      <p className="text-xs text-[#707070]">Allow creating new tokens after deployment</p>
                    </div>
                    <Switch
                      id="mintable"
                      checked={tokenConfig.mintable}
                      onCheckedChange={(checked) => setTokenConfig({ ...tokenConfig, mintable: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="burnable" className="block mb-1">
                        Burnable
                      </Label>
                      <p className="text-xs text-[#707070]">Allow burning tokens to reduce supply</p>
                    </div>
                    <Switch
                      id="burnable"
                      checked={tokenConfig.burnable}
                      onCheckedChange={(checked) => setTokenConfig({ ...tokenConfig, burnable: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pausable" className="block mb-1">
                        Pausable
                      </Label>
                      <p className="text-xs text-[#707070]">Allow pausing all token transfers</p>
                    </div>
                    <Switch
                      id="pausable"
                      checked={tokenConfig.pausable}
                      onCheckedChange={(checked) => setTokenConfig({ ...tokenConfig, pausable: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="taxable" className="block mb-1">
                        Taxable
                      </Label>
                      <p className="text-xs text-[#707070]">Apply tax on token transfers</p>
                    </div>
                    <Switch
                      id="taxable"
                      checked={tokenConfig.taxable}
                      onCheckedChange={(checked) => setTokenConfig({ ...tokenConfig, taxable: checked })}
                    />
                  </div>

                  {tokenConfig.taxable && (
                    <div className="space-y-2 pl-4 border-l-2 border-[#30302e]">
                      <Label htmlFor="taxPercentage">Tax Percentage</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="taxPercentage"
                          min={1}
                          max={20}
                          step={0.5}
                          value={[tokenConfig.taxPercentage]}
                          onValueChange={(value) => setTokenConfig({ ...tokenConfig, taxPercentage: value[0] })}
                        />
                        <span className="w-12 text-right">{tokenConfig.taxPercentage}%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="antiBot" className="block mb-1">
                        Anti-Bot Protection
                      </Label>
                      <p className="text-xs text-[#707070]">Prevent bot trading at launch</p>
                    </div>
                    <Switch
                      id="antiBot"
                      checked={tokenConfig.antiBot}
                      onCheckedChange={(checked) => setTokenConfig({ ...tokenConfig, antiBot: checked })}
                    />
                  </div>
                </div>

                {/* Deployment Section */}
                <div className="md:col-span-2 pt-4 border-t border-[#30302e]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Deploy Token</h3>
                      <p className="text-sm text-[#707070]">Deploy your token to the Solana blockchain</p>
                    </div>
                    <Button
                      onClick={simulateDeployment}
                      disabled={isLoading || !tokenConfig.name || !tokenConfig.symbol || !tokenConfig.totalSupply}
                      className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Deploy Token
                        </>
                      )}
                    </Button>
                  </div>

                  {deploymentStep > 0 && (
                    <div className="mt-4 bg-[#1d1d1c] p-4 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Deployment Progress</span>
                        <span>{deploymentProgress}%</span>
                      </div>
                      <Progress value={deploymentProgress} className="h-2" />

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${deploymentStep >= 1 ? "bg-[#A4D756] text-[#0C0C0C]" : "bg-[#1d1d1c] text-[#707070] border border-[#707070]"}`}
                          >
                            {deploymentStep > 1 ? <Check className="h-3 w-3" /> : "1"}
                          </div>
                          <span className={deploymentStep >= 1 ? "text-white" : "text-[#707070]"}>
                            Validating configuration
                          </span>
                        </div>

                        <div className="flex items-center">
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${deploymentStep >= 2 ? "bg-[#A4D756] text-[#0C0C0C]" : "bg-[#1d1d1c] text-[#707070] border border-[#707070]"}`}
                          >
                            {deploymentStep > 2 ? <Check className="h-3 w-3" /> : "2"}
                          </div>
                          <span className={deploymentStep >= 2 ? "text-white" : "text-[#707070]"}>
                            Compiling contract
                          </span>
                        </div>

                        <div className="flex items-center">
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${deploymentStep >= 3 ? "bg-[#A4D756] text-[#0C0C0C]" : "bg-[#1d1d1c] text-[#707070] border border-[#707070]"}`}
                          >
                            {deploymentStep > 3 ? <Check className="h-3 w-3" /> : "3"}
                          </div>
                          <span className={deploymentStep >= 3 ? "text-white" : "text-[#707070]"}>
                            Deploying contract
                          </span>
                        </div>

                        <div className="flex items-center">
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${deploymentStep >= 4 ? "bg-[#A4D756] text-[#0C0C0C]" : "bg-[#1d1d1c] text-[#707070] border border-[#707070]"}`}
                          >
                            {deploymentStep > 4 ? <Check className="h-3 w-3" /> : "4"}
                          </div>
                          <span className={deploymentStep >= 4 ? "text-white" : "text-[#707070]"}>
                            Verifying contract
                          </span>
                        </div>

                        <div className="flex items-center">
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${deploymentStep >= 5 ? "bg-[#A4D756] text-[#0C0C0C]" : "bg-[#1d1d1c] text-[#707070] border border-[#707070]"}`}
                          >
                            {deploymentStep > 5 ? <Check className="h-3 w-3" /> : "5"}
                          </div>
                          <span className={deploymentStep >= 5 ? "text-white" : "text-[#707070]"}>
                            Finalizing deployment
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Tokens Tab */}
        <TabsContent value="manage">
          <Card className="bg-[#151514] border-[#30302e]">
            <CardHeader>
              <CardTitle>Manage Tokens</CardTitle>
              <CardDescription>View and manage your deployed tokens</CardDescription>
            </CardHeader>
            <CardContent>
              {deployedTokens.length > 0 ? (
                <div className="space-y-4">
                  {deployedTokens.map((token) => (
                    <Card key={token.address} className="bg-[#1d1d1c] border-[#30302e]">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {token.name} ({token.symbol})
                            </h3>
                            <p className="text-xs text-[#707070] mt-1">
                              {token.address.substring(0, 8)}...{token.address.substring(token.address.length - 8)}
                            </p>
                            <div className="flex items-center mt-2 text-sm">
                              <span className="text-[#707070] mr-2">Supply:</span>
                              <span>{Number(token.totalSupply).toLocaleString()}</span>
                              <span className="mx-2">•</span>
                              <span className="text-[#707070] mr-2">Decimals:</span>
                              <span>{token.decimals}</span>
                              <span className="mx-2">•</span>
                              <span className="text-[#707070] mr-2">Deployed:</span>
                              <span>{new Date(token.deployedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-[#151514] border-[#30302e] hover:bg-[#30302e]"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Address
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-[#151514] border-[#30302e] hover:bg-[#30302e]"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on Explorer
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-[#707070] mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tokens deployed yet</h3>
                  <p className="text-[#707070] mb-4">Deploy your first token to get started</p>
                  <Button onClick={() => setActiveTab("create")}>Create Token</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
