"use client"

import { useState } from "react"
import { Layout } from "./layout"
import StatusBar from "./status-bar"
import PoolMonitor from "./pool-monitor"
import TargetManagement from "./target-management"
import TransactionMonitor from "./transaction-monitor"
import ConfigPanel from "./config-panel"
import WhaleMonitor from "./whale-monitor"
import StrategyMonitor from "./strategy-monitor"
import BundleManager from "./bundle-manager"
import PerpetualArbitrage from "./perpetual-arbitrage"
import TokenAnalytics from "./token-analytics"
import { ErrorBoundary } from "./error-boundary"
import { useAppStore } from "@/lib/store"
import { Notifications } from "./notifications"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { activeTargets, pendingTxs, successfulSnipes, addNotification } = useAppStore()

  const handleTabChange = (tab: string) => {
    try {
      console.log(`Switching to tab: ${tab}`)
      setActiveTab(tab)

      // Add notification for tab change
      addNotification({
        title: `Switched to ${tab}`,
        description: `You are now viewing the ${tab} tab`,
        type: "info",
      })

      // Force a re-render if needed
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"))
      }, 100)
    } catch (error) {
      console.error("Error switching tabs:", error)

      // Add error notification
      addNotification({
        title: "Error switching tabs",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
      })

      // Fallback to overview tab if there's an error
      setActiveTab("overview")
    }
  }

  return (
    <Layout activeTab={activeTab} handleTabChange={handleTabChange}>
      <ErrorBoundary>
        {activeTab === "overview" && (
          <div className="space-y-6">
            <StatusBar />
            <PoolMonitor />
          </div>
        )}

        {activeTab === "targets" && <TargetManagement />}

        {activeTab === "transactions" && <TransactionMonitor />}

        {activeTab === "whales" && <WhaleMonitor />}

        {activeTab === "strategies" && <StrategyMonitor />}

        {activeTab === "bundles" && <BundleManager />}

        {activeTab === "perpetuals" && <PerpetualArbitrage />}

        {activeTab === "manifesto" && (
          <div className="mt-4">
            <iframe src="/manifesto" className="w-full h-[calc(100vh-8rem)] border-none" />
          </div>
        )}

        {activeTab === "settings" && <ConfigPanel />}

        {activeTab === "analytics" && <TokenAnalytics />}
      </ErrorBoundary>
      <Notifications />
    </Layout>
  )
}
