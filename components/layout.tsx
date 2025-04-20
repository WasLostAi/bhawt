"use client"

import type { ReactNode } from "react"
import { AppSidebar } from "./app-sidebar"

interface LayoutProps {
  children: ReactNode
  activeTab: string
  handleTabChange: (tab: string) => void
}

export function Layout({ children, activeTab, handleTabChange }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#0C0C0C]">
      <AppSidebar activeTab={activeTab} handleTabChange={handleTabChange} />
      <main className="flex-1 p-6 overflow-auto ml-0 md:ml-64">
        <div className="container mx-auto">{children}</div>
      </main>
    </div>
  )
}
