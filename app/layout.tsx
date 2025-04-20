import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { JupiterProvider } from "@/contexts/jupiter-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SOL Sniper Bot",
  description: "Advanced Solana token sniping and trading bot",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <JupiterProvider>
            {children}
            <Toaster />
          </JupiterProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
