"use client";

import { useState, useEffect } from "react";
import { InteractiveChart } from "@/components/interactive-chart";
import { TechnicalIndicators } from "@/components/technical-indicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Watchlist } from "@/components/watchlist";
import { WatchlistItem } from "@/types/watchlist";

// Mock forex data
const forexData = {
  symbol: "EUR/USD",
  name: "Euro / US Dollar",
  price: 1.0842,
  change: -0.0023,
  changePercent: -0.21,
  high: 1.0876,
  low: 1.0821,
  open: 1.0865,
  previousClose: 1.0865,
  yearHigh: 1.1275,
  yearLow: 1.0448,
};

// Mock historical data for chart with Bollinger Bands
const historicalData = [
  {
    date: "Jan",
    price: 1.0921,
    open: 1.088,
    high: 1.095,
    low: 1.086,
    close: 1.0921,
    ema: 1.091,
    rsi: 54,
    bollingerUpper: 1.1025,
    bollingerMiddle: 1.0915,
    bollingerLower: 1.0805,
  },
  {
    date: "Feb",
    price: 1.0812,
    open: 1.092,
    high: 1.0935,
    low: 1.08,
    close: 1.0812,
    ema: 1.088,
    rsi: 48,
    bollingerUpper: 1.0915,
    bollingerMiddle: 1.081,
    bollingerLower: 1.0705,
  },
  {
    date: "Mar",
    price: 1.0765,
    open: 1.081,
    high: 1.083,
    low: 1.074,
    close: 1.0765,
    ema: 1.084,
    rsi: 42,
    bollingerUpper: 1.0865,
    bollingerMiddle: 1.076,
    bollingerLower: 1.0655,
  },
  {
    date: "Apr",
    price: 1.0698,
    open: 1.076,
    high: 1.078,
    low: 1.068,
    close: 1.0698,
    ema: 1.079,
    rsi: 38,
    bollingerUpper: 1.0795,
    bollingerMiddle: 1.0695,
    bollingerLower: 1.0595,
  },
  {
    date: "May",
    price: 1.0785,
    open: 1.07,
    high: 1.081,
    low: 1.069,
    close: 1.0785,
    ema: 1.077,
    rsi: 52,
    bollingerUpper: 1.0885,
    bollingerMiddle: 1.078,
    bollingerLower: 1.0675,
  },
  {
    date: "Jun",
    price: 1.0892,
    open: 1.079,
    high: 1.091,
    low: 1.078,
    close: 1.0892,
    ema: 1.08,
    rsi: 61,
    bollingerUpper: 1.0995,
    bollingerMiddle: 1.089,
    bollingerLower: 1.0785,
  },
  {
    date: "Jul",
    price: 1.0976,
    open: 1.0895,
    high: 1.099,
    low: 1.088,
    close: 1.0976,
    ema: 1.085,
    rsi: 68,
    bollingerUpper: 1.108,
    bollingerMiddle: 1.0975,
    bollingerLower: 1.087,
  },
  {
    date: "Aug",
    price: 1.0912,
    open: 1.0975,
    high: 1.098,
    low: 1.09,
    close: 1.0912,
    ema: 1.088,
    rsi: 58,
    bollingerUpper: 1.1015,
    bollingerMiddle: 1.091,
    bollingerLower: 1.0805,
  },
  {
    date: "Sep",
    price: 1.0845,
    open: 1.091,
    high: 1.092,
    low: 1.083,
    close: 1.0845,
    ema: 1.089,
    rsi: 51,
    bollingerUpper: 1.0945,
    bollingerMiddle: 1.084,
    bollingerLower: 1.0735,
  },
  {
    date: "Oct",
    price: 1.0789,
    open: 1.084,
    high: 1.086,
    low: 1.078,
    close: 1.0789,
    ema: 1.087,
    rsi: 46,
    bollingerUpper: 1.089,
    bollingerMiddle: 1.0785,
    bollingerLower: 1.068,
  },
  {
    date: "Nov",
    price: 1.0865,
    open: 1.079,
    high: 1.088,
    low: 1.078,
    close: 1.0865,
    ema: 1.085,
    rsi: 54,
    bollingerUpper: 1.0965,
    bollingerMiddle: 1.086,
    bollingerLower: 1.0755,
  },
  {
    date: "Dec",
    price: 1.0842,
    open: 1.086,
    high: 1.087,
    low: 1.082,
    close: 1.0842,
    ema: 1.084,
    rsi: 52,
    bollingerUpper: 1.0945,
    bollingerMiddle: 1.084,
    bollingerLower: 1.0735,
  },
];

const initialForexWatchlist: WatchlistItem[] = [
  {
    id: "eurusd",
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    price: 1.0842,
    change: -0.0023,
    changePercent: -0.21,
    type: "forex",
  },
  {
    id: "gbpusd",
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    price: 1.2687,
    change: 0.0034,
    changePercent: 0.27,
    type: "forex",
  },
  {
    id: "usdjpy",
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    price: 156.78,
    change: 0.45,
    changePercent: 0.29,
    type: "forex",
  },
  {
    id: "usdchf",
    symbol: "USD/CHF",
    name: "US Dollar / Swiss Franc",
    price: 0.9042,
    change: -0.0018,
    changePercent: -0.2,
    type: "forex",
  },
  {
    id: "audusd",
    symbol: "AUD/USD",
    name: "Australian Dollar / US Dollar",
    price: 0.6587,
    change: 0.0021,
    changePercent: 0.32,
    type: "forex",
  },
];

export function ForexDashboard() {
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

        // Filter watchlist items by type 'forex'
        const forexWatchlist = userData.watchlist.filter(
          (item: any) => item.type === "forex"
        );

        // Map to WatchlistItem format
        const watchlistData = forexWatchlist.map((item: any) => ({
          id: item.name.toLowerCase(),
          symbol: item.name,
          name: `${item.name} / US Dollar`,
          price: Math.random() * 1000,
          change: Math.random() * 10 - 5,
          changePercent: Math.random() * 2 - 1,
          type: "forex" as const,
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
        <h1 className="text-3xl font-bold tracking-tight">Forex Market</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{forexData.symbol}</h2>
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
          <Watchlist initialItems={items} marketType="forex" />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Forex Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol</span>
                  <span className="font-medium">{forexData.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{forexData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">
                    {forexData.price.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Change</span>
                  <span
                    className={`font-medium ${
                      forexData.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {forexData.change >= 0 ? "+" : ""}
                    {forexData.change.toFixed(4)} (
                    {forexData.change >= 0 ? "+" : ""}
                    {forexData.changePercent.toFixed(2)}%)
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
