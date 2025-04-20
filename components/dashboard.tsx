"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger, SidebarRail, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Wallet, Zap, Menu } from "lucide-react"
import { AppSidebar } from "./app-sidebar"
import StatusBar from "./status-bar"
import PoolMonitor from "./pool-monitor"
import TargetManagement from "./target-management"
import TransactionMonitor from "./transaction-monitor"
import ConfigPanel from "./config-panel"
import WhaleMonitor from "./whale-monitor"
import StrategyMonitor from "./strategy-monitor"
import BundleManager from "./bundle-manager"
import PerpetualArbitrage from "./perpetual-arbitrage"
import { useMediaQuery } from "@/hooks/use-mobile"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [activeTargets, setActiveTargets] = useState(3)
  const [pendingTxs, setPendingTxs] = useState(1)
  const [successfulSnipes, setSuccessfulSnipes] = useState(2)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  const handleTabChange = (tab: string) => {
    try {
      console.log(`Switching to tab: ${tab}`)
      setActiveTab(tab)

      // Close sidebar on mobile after navigation
      if (isMobile) {
        setSidebarOpen(false)
      }

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
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex min-h-screen bg-[#0C0C0C] text-white">
        <AppSidebar activeTab={activeTab} handleTabChange={handleTabChange} />

        <SidebarInset className="bg-[#0C0C0C] text-white">
          <header className="h-16 border-b border-[#30302e] flex items-center px-4 justify-between">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
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
                <span className="hidden sm:inline">12.45 SOL</span>
                <span className="sm:hidden">12.45</span>
              </Button>
              <Button className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium">
                <Zap className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Start Bot</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <StatusBar activeTargets={activeTargets} pendingTxs={pendingTxs} successfulSnipes={successfulSnipes} />
                <PoolMonitor />
              </div>
            )}

            {activeTab === "targets" && <TargetManagement setActiveTargets={setActiveTargets} />}

            {activeTab === "transactions" && (
              <TransactionMonitor setPendingTxs={setPendingTxs} setSuccessfulSnipes={setSuccessfulSnipes} />
            )}

            {activeTab === "whales" && <WhaleMonitor />}

            {activeTab === "strategies" && <StrategyMonitor />}

            {activeTab === "bundles" && <BundleManager />}

            {activeTab === "perpetuals" && <PerpetualArbitrage />}

            {activeTab === "settings" && <ConfigPanel />}
          </main>
        </SidebarInset>

        {/* Add the SidebarRail for resize functionality */}
        <SidebarRail />
      </div>
    </SidebarProvider>
  )
}
