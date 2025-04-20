"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Home,
  Target,
  Zap,
  Activity,
  Settings,
  Wallet,
  BarChart3,
  TrendingUp,
  Package,
  Search,
  User,
  LogOut,
  AlertTriangle,
} from "lucide-react"
import StatusBar from "./status-bar"
import PoolMonitor from "./pool-monitor"
import TargetManagement from "./target-management"
import TransactionMonitor from "./transaction-monitor"
import ConfigPanel from "./config-panel"
import WalletConnect from "./wallet-connect"
import WhaleMonitor from "./whale-monitor"
import StrategyMonitor from "./strategy-monitor"
import BundleManager from "./bundle-manager"
import PerpetualArbitrage from "./perpetual-arbitrage"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [activeTargets, setActiveTargets] = useState(3)
  const [pendingTxs, setPendingTxs] = useState(1)
  const [successfulSnipes, setSuccessfulSnipes] = useState(2)

  const handleTabChange = (tab: string) => {
    try {
      console.log(`Switching to tab: ${tab}`)
      setActiveTab(tab)
      // Force a re-render if needed
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"))
      }, 100)
    } catch (error) {
      console.error("Error switching tabs:", error)
      // Fallback to overview tab if there's an error
      setActiveTab("overview")
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#0C0C0C] text-white">
        <Sidebar className="border-r border-[#30302e]">
          <SidebarHeader className="px-2 py-4">
            <div className="flex items-center px-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#22CCEE] to-[#2ED3B7] flex items-center justify-center mr-2">
                <Zap className="h-5 w-5 text-[#0C0C0C]" />
              </div>
              <div className="font-bold text-xl font-syne">SOL Sniper</div>
            </div>
            <div className="mt-4">
              <div className="px-2">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#707070]" />
                  <Input id="search" placeholder="Search..." className="pl-8 bg-[#151514] border-[#30302e]" />
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeTab === "overview"} onClick={() => handleTabChange("overview")}>
                      <Home className="h-4 w-4 mr-2" />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeTab === "targets"} onClick={() => handleTabChange("targets")}>
                      <Target className="h-4 w-4 mr-2" />
                      <span>Targets</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "transactions"}
                      onClick={() => handleTabChange("transactions")}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      <span>Transactions</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeTab === "whales"} onClick={() => handleTabChange("whales")}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      <span>Whale Tracking</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Advanced</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "strategies"}
                      onClick={() => handleTabChange("strategies")}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      <span>Strategies</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeTab === "bundles"} onClick={() => handleTabChange("bundles")}>
                      <Package className="h-4 w-4 mr-2" />
                      <span>Bundle Manager</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "perpetuals"}
                      onClick={() => handleTabChange("perpetuals")}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      <span>Perpetual Arbitrage</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeTab === "settings"} onClick={() => handleTabChange("settings")}>
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-[#30302e] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-[#30302e] flex items-center justify-center mr-2">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Trader</div>
                  <div className="text-xs text-[#707070]">Pro Account</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#707070]">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <WalletConnect />
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-[#30302e] flex items-center px-4 justify-between">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-xl font-syne">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "targets" && "Target Management"}
                {activeTab === "transactions" && "Transaction Monitor"}
                {activeTab === "whales" && "Whale Tracking"}
                {activeTab === "strategies" && "Strategy Monitor"}
                {activeTab === "bundles" && "Bundle Manager"}
                {activeTab === "perpetuals" && "Perpetual Arbitrage"}
                {activeTab === "settings" && "Bot Configuration"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="bg-[#151514] border-[#30302e]">
                <Wallet className="mr-2 h-4 w-4" />
                12.45 SOL
              </Button>
              <Button className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium">
                <Zap className="mr-2 h-4 w-4" />
                Start Bot
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <StatusBar activeTargets={activeTargets} pendingTxs={pendingTxs} successfulSnipes={successfulSnipes} />
                <PoolMonitor />
              </div>
            )}

            {activeTab === "targets" && (
              <div className="error-boundary">
                {(() => {
                  try {
                    return <TargetManagement setActiveTargets={setActiveTargets} />
                  } catch (error) {
                    console.error("Error rendering TargetManagement:", error)
                    return (
                      <div className="p-8 text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-[#E57676]" />
                        <h3 className="text-xl font-medium mb-2">Error Loading Targets</h3>
                        <p className="text-[#707070]">There was an error loading the target management component.</p>
                        <Button className="mt-4 bg-[#22CCEE]" onClick={() => handleTabChange("overview")}>
                          Return to Overview
                        </Button>
                      </div>
                    )
                  }
                })()}
              </div>
            )}

            {activeTab === "transactions" && (
              <TransactionMonitor setPendingTxs={setPendingTxs} setSuccessfulSnipes={setSuccessfulSnipes} />
            )}

            {activeTab === "whales" && <WhaleMonitor />}

            {activeTab === "strategies" && <StrategyMonitor />}

            {activeTab === "bundles" && <BundleManager />}

            {activeTab === "perpetuals" && <PerpetualArbitrage />}

            {activeTab === "settings" && <ConfigPanel />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
