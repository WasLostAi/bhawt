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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Home,
  Target,
  Zap,
  Activity,
  Settings,
  User,
  BarChart3,
  TrendingUp,
  Package,
  Search,
  LogOut,
  ChevronDown,
  Smartphone,
} from "lucide-react"
import WalletConnect from "./wallet-connect"
import { useMediaQuery } from "@/hooks/use-mobile"

interface AppSidebarProps {
  activeTab: string
  handleTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, handleTabChange }: AppSidebarProps) {
  const [navigationOpen, setNavigationOpen] = useState(true)
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <Sidebar variant={isMobile ? "floating" : "sidebar"} collapsible="icon" className="bg-[#0C0C0C] border-[#30302e]">
      <SidebarHeader className="px-2 py-4">
        <div className="flex items-center px-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#22CCEE] to-[#2ED3B7] flex items-center justify-center mr-2">
            <Zap className="h-5 w-5 text-[#0C0C0C]" />
          </div>
          <div className="font-bold text-xl font-syne">SOL Sniper</div>
        </div>
        <div className="mt-4">
          <div className="px-2">
            <Label htmlFor="sidebar-search" className="sr-only">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#707070]" />
              <Input id="sidebar-search" placeholder="Search..." className="pl-8 bg-[#151514] border-[#30302e]" />
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Collapsible open={navigationOpen} onOpenChange={setNavigationOpen} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                Navigation
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={activeTab === "overview"}
                            onClick={() => handleTabChange("overview")}
                            tooltip="Dashboard Overview"
                          >
                            <Home className="h-4 w-4 mr-2" />
                            <span>Overview</span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">Dashboard Overview</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={activeTab === "targets"}
                            onClick={() => handleTabChange("targets")}
                            tooltip="Target Management"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            <span>Targets</span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">Target Management</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={activeTab === "transactions"}
                            onClick={() => handleTabChange("transactions")}
                            tooltip="Transaction Monitor"
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            <span>Transactions</span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">Transaction Monitor</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={activeTab === "whales"}
                            onClick={() => handleTabChange("whales")}
                            tooltip="Whale Tracking"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            <span>Whale Tracking</span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">Whale Tracking</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                Advanced
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={activeTab === "strategies"}
                            onClick={() => handleTabChange("strategies")}
                            tooltip="Strategy Monitor"
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            <span>Strategies</span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">Strategy Monitor</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={activeTab === "bundles"}
                            onClick={() => handleTabChange("bundles")}
                            tooltip="Bundle Manager"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            <span>Bundle Manager</span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">Bundle Manager</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={activeTab === "perpetuals"}
                            onClick={() => handleTabChange("perpetuals")}
                            tooltip="Perpetual Arbitrage"
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            <span>Perpetual Arbitrage</span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">Perpetual Arbitrage</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            isActive={activeTab === "settings"}
                            onClick={() => handleTabChange("settings")}
                            tooltip="Bot Configuration"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            <span>Settings</span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">Bot Configuration</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Mobile-specific navigation */}
        {isMobile && (
          <SidebarGroup>
            <SidebarGroupLabel>Mobile Options</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => {}}>
                    <Smartphone className="h-4 w-4 mr-2" />
                    <span>Mobile View</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
  )
}
