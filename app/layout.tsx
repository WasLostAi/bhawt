import type React from "react"
import type { Metadata } from "next"
import { Inter, Syne } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { JupiterProvider } from "@/contexts/jupiter-context"
import { QueryProvider } from "@/providers/query-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
})

export const metadata: Metadata = {
  title: "BHAWT",
  description: "Advanced Solana token sniping and trading bot",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${syne.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryProvider>
            <JupiterProvider>
              {children}
              <Toaster />
            </JupiterProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
