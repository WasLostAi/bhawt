"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Target,
  ListChecks,
  FishIcon as Whale,
  Zap,
  Package,
  BarChart3,
  Settings,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import WalletConnect from "./wallet-connect"

interface SidebarProps {
  activeTab: string
  handleTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, handleTabChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "targets",
      label: "Targets",
      icon: Target,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: ListChecks,
    },
    {
      id: "whales",
      label: "Whale Monitor",
      icon: Whale,
    },
    {
      id: "strategies",
      label: "Strategies",
      icon: Zap,
    },
    {
      id: "bundles",
      label: "Bundle Manager",
      icon: Package,
    },
    {
      id: "perpetuals",
      label: "Perpetuals",
      icon: BarChart3,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-[#151514] border border-[#30302e] rounded-md p-2"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar for desktop and mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#151514] border-r border-[#30302e] transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#30302e]">
            <h1 className="text-2xl font-bold font-syne bg-gradient-to-r from-[#22CCEE] to-[#A4D756] text-transparent bg-clip-text">
              BHAWT
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={cn(
                      "flex items-center w-full px-4 py-2 rounded-md text-sm transition-colors",
                      activeTab === item.id
                        ? "bg-[#1d1d1c] text-white"
                        : "text-[#707070] hover:bg-[#1d1d1c] hover:text-white",
                    )}
                    onClick={() => {
                      handleTabChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                    <ChevronRight
                      className={cn("ml-auto h-4 w-4 transition-transform", activeTab === item.id ? "rotate-90" : "")}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Wallet connect */}
          <div className="p-4 border-t border-[#30302e]">
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
