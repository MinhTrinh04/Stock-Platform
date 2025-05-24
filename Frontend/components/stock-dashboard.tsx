"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { InteractiveChart } from "@/components/interactive-chart"
import { StockInfo } from "@/components/stock-info"
import { StockStats } from "@/components/stock-stats"
import { TechnicalIndicators } from "@/components/technical-indicators"
import { Watchlist } from "@/components/watchlist"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock stock data
const stockData = {
  symbol: "AAPL",
  name: "Apple Inc.",
  price: 187.68,
  change: 1.23,
  changePercent: 0.66,
  marketCap: "2.94T",
  peRatio: 31.2,
  dividend: 0.92,
  volume: "48.2M",
  avgVolume: "52.8M",
  high: 188.45,
  low: 186.21,
  open: 186.73,
  previousClose: 186.45,
  yearHigh: 199.62,
  yearLow: 143.9,
}

// Mock historical data for chart with Bollinger Bands
const historicalData = [
  {
    date: "Jan",
    price: 173.41,
    open: 169.2,
    high: 175.5,
    low: 168.3,
    close: 173.41,
    ema: 171.5,
    rsi: 58,
    bollingerUpper: 178.5,
    bollingerMiddle: 172.3,
    bollingerLower: 166.1,
  },
  {
    date: "Feb",
    price: 165.12,
    open: 172.8,
    high: 173.2,
    low: 164.5,
    close: 165.12,
    ema: 169.8,
    rsi: 42,
    bollingerUpper: 172.4,
    bollingerMiddle: 166.5,
    bollingerLower: 160.6,
  },
  {
    date: "Mar",
    price: 169.85,
    open: 165.3,
    high: 171.4,
    low: 164.9,
    close: 169.85,
    ema: 169.2,
    rsi: 51,
    bollingerUpper: 175.2,
    bollingerMiddle: 168.7,
    bollingerLower: 162.2,
  },
  {
    date: "Apr",
    price: 173.57,
    open: 170.1,
    high: 174.8,
    low: 169.5,
    close: 173.57,
    ema: 170.1,
    rsi: 62,
    bollingerUpper: 179.8,
    bollingerMiddle: 172.5,
    bollingerLower: 165.2,
  },
  {
    date: "May",
    price: 180.95,
    open: 174.2,
    high: 182.3,
    low: 173.8,
    close: 180.95,
    ema: 172.8,
    rsi: 71,
    bollingerUpper: 187.3,
    bollingerMiddle: 179.8,
    bollingerLower: 172.3,
  },
  {
    date: "Jun",
    price: 193.97,
    open: 181.5,
    high: 194.5,
    low: 180.9,
    close: 193.97,
    ema: 177.5,
    rsi: 82,
    bollingerUpper: 201.5,
    bollingerMiddle: 192.4,
    bollingerLower: 183.3,
  },
  {
    date: "Jul",
    price: 196.45,
    open: 194.2,
    high: 198.7,
    low: 192.8,
    close: 196.45,
    ema: 182.4,
    rsi: 76,
    bollingerUpper: 204.2,
    bollingerMiddle: 195.8,
    bollingerLower: 187.4,
  },
  {
    date: "Aug",
    price: 187.87,
    open: 195.8,
    high: 196.3,
    low: 186.5,
    close: 187.87,
    ema: 183.9,
    rsi: 61,
    bollingerUpper: 196.5,
    bollingerMiddle: 188.2,
    bollingerLower: 179.9,
  },
  {
    date: "Sep",
    price: 174.79,
    open: 187.2,
    high: 188.1,
    low: 173.5,
    close: 174.79,
    ema: 181.5,
    rsi: 38,
    bollingerUpper: 184.3,
    bollingerMiddle: 175.6,
    bollingerLower: 166.9,
  },
  {
    date: "Oct",
    price: 170.77,
    open: 174.3,
    high: 175.8,
    low: 169.2,
    close: 170.77,
    ema: 178.9,
    rsi: 32,
    bollingerUpper: 179.5,
    bollingerMiddle: 171.2,
    bollingerLower: 162.9,
  },
  {
    date: "Nov",
    price: 189.37,
    open: 171.5,
    high: 190.2,
    low: 170.9,
    close: 189.37,
    ema: 181.2,
    rsi: 65,
    bollingerUpper: 198.4,
    bollingerMiddle: 188.5,
    bollingerLower: 178.6,
  },
  {
    date: "Dec",
    price: 187.68,
    open: 189.5,
    high: 191.2,
    low: 186.3,
    close: 187.68,
    ema: 182.8,
    rsi: 58,
    bollingerUpper: 196.9,
    bollingerMiddle: 187.2,
    bollingerLower: 177.5,
  },
]

// Initial watchlist items
const initialWatchlistItems = [
  {
    id: "aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 187.68,
    change: 1.23,
    changePercent: 0.66,
    isFavorite: true,
  },
  { id: "msft", symbol: "MSFT", name: "Microsoft Corp.", price: 415.32, change: 2.45, changePercent: 0.59 },
  { id: "googl", symbol: "GOOGL", name: "Alphabet Inc.", price: 176.52, change: -0.87, changePercent: -0.49 },
  { id: "amzn", symbol: "AMZN", name: "Amazon.com Inc.", price: 178.23, change: 1.56, changePercent: 0.88 },
  {
    id: "nvda",
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 950.02,
    change: 15.23,
    changePercent: 1.63,
    isFavorite: true,
  },
]

export function StockDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timeframe, setTimeframe] = useState("1Y")
  const [showEMA, setShowEMA] = useState(true)
  const [showRSI, setShowRSI] = useState(true)
  const [showBollingerBands, setShowBollingerBands] = useState(true)
  const [selectedStock, setSelectedStock] = useState("AAPL")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would fetch data for the searched stock
    console.log(`Searching for: ${searchQuery}`)
  }

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol)
    // In a real app, this would fetch data for the selected stock
    console.log(`Selected stock: ${symbol}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Stock Market</h1>
        <form onSubmit={handleSearch} className="hidden md:flex md:w-80">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a stock symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8"
            />
          </div>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{stockData.symbol}</h2>
                <Tabs defaultValue="1Y" className="w-[300px]" onValueChange={setTimeframe}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="1D">1D</TabsTrigger>
                    <TabsTrigger value="1W">1W</TabsTrigger>
                    <TabsTrigger value="1M">1M</TabsTrigger>
                    <TabsTrigger value="6M">6M</TabsTrigger>
                    <TabsTrigger value="1Y">1Y</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <InteractiveChart
                data={historicalData}
                timeframe={timeframe}
                showEMA={showEMA}
                showBollingerBands={showBollingerBands}
              />
            </CardContent>
          </Card>

          {showRSI && (
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold">RSI (Relative Strength Index)</h3>
                <TechnicalIndicators data={historicalData} type="rsi" />
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-6">
          <Watchlist initialItems={initialWatchlistItems} onSelectStock={handleSelectStock} />

          <StockInfo stock={stockData} />
          <StockStats stock={stockData} />
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 font-semibold">Technical Indicators</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>EMA (Exponential Moving Average)</span>
                  <Button variant={showEMA ? "default" : "outline"} size="sm" onClick={() => setShowEMA(!showEMA)}>
                    {showEMA ? "Hide" : "Show"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>RSI (Relative Strength Index)</span>
                  <Button variant={showRSI ? "default" : "outline"} size="sm" onClick={() => setShowRSI(!showRSI)}>
                    {showRSI ? "Hide" : "Show"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bollinger Bands</span>
                  <Button
                    variant={showBollingerBands ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowBollingerBands(!showBollingerBands)}
                  >
                    {showBollingerBands ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
