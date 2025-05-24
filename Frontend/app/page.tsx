"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { StockDashboard } from "@/components/stock-dashboard"
import { ForexDashboard } from "@/components/forex-dashboard"
import { CryptoDashboard } from "@/components/crypto-dashboard"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  const [category, setCategory] = useState("stocks")

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background w-full">
        <Navbar onCategoryChange={setCategory} currentCategory={category} />
        <main className="container mx-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {category === "stocks" && <StockDashboard />}
            {category === "forex" && <ForexDashboard />}
            {category === "crypto" && <CryptoDashboard />}
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
