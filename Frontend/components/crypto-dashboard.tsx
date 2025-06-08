"use client";

import { useState, useEffect } from "react";
import { InteractiveChart } from "@/components/interactive-chart";
import { TechnicalIndicators } from "@/components/technical-indicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Watchlist } from "@/components/watchlist";
import { WatchlistItem } from "@/types/watchlist";

// Mock crypto data
const cryptoData = {
  symbol: "BTC/USD",
  name: "Bitcoin / US Dollar",
  price: 67842.15,
  change: 1245.32,
  changePercent: 1.87,
  marketCap: "1.32T",
  volume24h: "42.8B",
  circulatingSupply: "19.4M",
  high: 68921.45,
  low: 66587.21,
  open: 66596.83,
  previousClose: 66596.83,
  allTimeHigh: 73750.0,
};

// Mock historical data for chart with Bollinger Bands
const historicalData = [
  {
    date: "Jan",
    price: 42521.41,
    open: 41200.0,
    high: 43100.0,
    low: 40800.0,
    close: 42521.41,
    ema: 41510,
    rsi: 62,
    bollingerUpper: 45200,
    bollingerMiddle: 42300,
    bollingerLower: 39400,
  },
  {
    date: "Feb",
    price: 48112.12,
    open: 42600.0,
    high: 48500.0,
    low: 42300.0,
    close: 48112.12,
    ema: 43880,
    rsi: 71,
    bollingerUpper: 51500,
    bollingerMiddle: 47800,
    bollingerLower: 44100,
  },
  {
    date: "Mar",
    price: 45765.85,
    open: 48000.0,
    high: 48200.0,
    low: 45200.0,
    close: 45765.85,
    ema: 44840,
    rsi: 58,
    bollingerUpper: 49200,
    bollingerMiddle: 45600,
    bollingerLower: 42000,
  },
  {
    date: "Apr",
    price: 53698.57,
    open: 45800.0,
    high: 54000.0,
    low: 45500.0,
    close: 53698.57,
    ema: 47790,
    rsi: 74,
    bollingerUpper: 57800,
    bollingerMiddle: 53500,
    bollingerLower: 49200,
  },
  {
    date: "May",
    price: 49785.95,
    open: 53700.0,
    high: 54100.0,
    low: 49200.0,
    close: 49785.95,
    ema: 48770,
    rsi: 62,
    bollingerUpper: 53900,
    bollingerMiddle: 49600,
    bollingerLower: 45300,
  },
  {
    date: "Jun",
    price: 58397.97,
    open: 49800.0,
    high: 58500.0,
    low: 49500.0,
    close: 58397.97,
    ema: 51800,
    rsi: 78,
    bollingerUpper: 63200,
    bollingerMiddle: 58100,
    bollingerLower: 53000,
  },
  {
    date: "Jul",
    price: 61445.45,
    open: 58400.0,
    high: 61800.0,
    low: 58000.0,
    close: 61445.45,
    ema: 54220,
    rsi: 81,
    bollingerUpper: 66500,
    bollingerMiddle: 60900,
    bollingerLower: 55300,
  },
  {
    date: "Aug",
    price: 59234.12,
    open: 61500.0,
    high: 62000.0,
    low: 59000.0,
    close: 59234.12,
    ema: 55660,
    rsi: 68,
    bollingerUpper: 64800,
    bollingerMiddle: 59700,
    bollingerLower: 54600,
  },
  {
    date: "Sep",
    price: 54876.54,
    open: 59300.0,
    high: 59500.0,
    low: 54500.0,
    close: 54876.54,
    ema: 55440,
    rsi: 45,
    bollingerUpper: 60100,
    bollingerMiddle: 54900,
    bollingerLower: 49700,
  },
  {
    date: "Oct",
    price: 60123.78,
    open: 54900.0,
    high: 60500.0,
    low: 54600.0,
    close: 60123.78,
    ema: 57880,
    rsi: 72,
    bollingerUpper: 65400,
    bollingerMiddle: 59900,
    bollingerLower: 54400,
  },
  {
    date: "Nov",
    price: 65432.9,
    open: 60200.0,
    high: 65800.0,
    low: 60000.0,
    close: 65432.9,
    ema: 60550,
    rsi: 79,
    bollingerUpper: 70700,
    bollingerMiddle: 64800,
    bollingerLower: 58900,
  },
  {
    date: "Dec",
    price: 67842.15,
    open: 65500.0,
    high: 68200.0,
    low: 65000.0,
    close: 67842.15,
    ema: 63220,
    rsi: 82,
    bollingerUpper: 73900,
    bollingerMiddle: 67500,
    bollingerLower: 61100,
  },
];

// Popular cryptocurrencies for watchlist
const popularCrypto = [
  {
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    price: 67842.15,
    change: 1245.32,
    changePercent: 1.87,
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    price: 3456.78,
    change: 89.45,
    changePercent: 2.65,
  },
  {
    symbol: "LTC/USD",
    name: "Litecoin / US Dollar",
    price: 98.76,
    change: 2.34,
    changePercent: 2.43,
  },
  {
    symbol: "BNB/USD",
    name: "Binance Coin / US Dollar",
    price: 567.89,
    change: 12.56,
    changePercent: 2.27,
  },
  {
    symbol: "XRP/USD",
    name: "Ripple / US Dollar",
    price: 0.56,
    change: 0.01,
    changePercent: 1.82,
  },
];

const initialCryptoWatchlist: WatchlistItem[] = [
  {
    id: "btcusd",
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    price: 67842.15,
    change: 1245.32,
    changePercent: 1.87,
    type: "crypto",
  },
  {
    id: "ethusd",
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    price: 3456.78,
    change: 89.45,
    changePercent: 2.65,
    type: "crypto",
  },
  {
    id: "ltcusd",
    symbol: "LTC/USD",
    name: "Litecoin / US Dollar",
    price: 98.76,
    change: 2.34,
    changePercent: 2.43,
    type: "crypto",
  },
  {
    id: "bnbusd",
    symbol: "BNB/USD",
    name: "Binance Coin / US Dollar",
    price: 567.89,
    change: 12.56,
    changePercent: 2.27,
    type: "crypto",
  },
  {
    id: "xrpusd",
    symbol: "XRP/USD",
    name: "Ripple / US Dollar",
    price: 0.56,
    change: 0.01,
    changePercent: 1.82,
    type: "crypto",
  },
];

export function CryptoDashboard() {
  const [timeframe, setTimeframe] = useState("1Y");
  const [showEMA, setShowEMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showBollingerBands, setShowBollingerBands] = useState(true);
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch(
          "http://localhost:3001/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch watchlist");
        }

        const userData = await response.json();

        // Filter watchlist items by type 'crypto'
        const cryptoWatchlist = userData.watchlist.filter(
          (item: any) => item.type === "crypto"
        );

        // Map to WatchlistItem format
        const watchlistData = cryptoWatchlist.map((item: any) => ({
          id: item.name.toLowerCase(),
          symbol: item.name,
          name: `${item.name} / US Dollar`,
          price: Math.random() * 1000,
          change: Math.random() * 10 - 5,
          changePercent: Math.random() * 2 - 1,
          type: "crypto" as const,
        }));

        setItems(watchlistData);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    };

    fetchWatchlist();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Crypto Market</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{cryptoData.symbol}</h2>
                <Tabs
                  defaultValue="1Y"
                  className="w-[300px]"
                  onValueChange={setTimeframe}
                >
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
                <h3 className="mb-2 font-semibold">
                  RSI (Relative Strength Index)
                </h3>
                <TechnicalIndicators data={historicalData} type="rsi" />
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-6">
          <Watchlist initialItems={items} marketType="crypto" />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Crypto Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol</span>
                  <span className="font-medium">{cryptoData.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{cryptoData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">
                    ${cryptoData.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Change</span>
                  <span
                    className={`font-medium ${
                      cryptoData.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {cryptoData.change >= 0 ? "+" : ""}
                    {cryptoData.change.toFixed(2)} (
                    {cryptoData.change >= 0 ? "+" : ""}
                    {cryptoData.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 font-semibold">Technical Indicators</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>EMA (Exponential Moving Average)</span>
                  <Button
                    variant={showEMA ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowEMA(!showEMA)}
                  >
                    {showEMA ? "Hide" : "Show"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>RSI (Relative Strength Index)</span>
                  <Button
                    variant={showRSI ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowRSI(!showRSI)}
                  >
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
  );
}
