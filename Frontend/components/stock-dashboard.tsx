"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { InteractiveChart } from "@/components/interactive-chart";
import { StockInfo } from "@/components/stock-info";

import { TechnicalIndicators } from "@/components/technical-indicators";
import { Watchlist } from "@/components/watchlist";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isFavorite?: boolean;
}

export function StockDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("1D");
  const [showEMA, setShowEMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showBollingerBands, setShowBollingerBands] = useState(true);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ohlcvData, setOhlcvData] = useState<any[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [technicalData, setTechnicalData] = useState<{
    rsi: (number | undefined)[];
    ema: (number | undefined)[];
    bollingerBands: {
      upper: (number | undefined)[];
      middle: (number | undefined)[];
      lower: (number | undefined)[];
    };
  }>({
    rsi: [],
    ema: [],
    bollingerBands: {
      upper: [],
      middle: [],
      lower: [],
    },
  });

  // Khi watchlistItems thay đổi, nếu chưa có selectedStock thì chọn mã đầu tiên
  useEffect(() => {
    if (!selectedStock && watchlistItems.length > 0) {
      setSelectedStock(watchlistItems[0].symbol);
    }
  }, [watchlistItems, selectedStock]);

  // Thêm lại helper function này vào đầu file hoặc trước fetchTechnicalIndicators
  const padArray = (arr: any[], targetLength: number) => {
    const padLength = targetLength - arr.length;
    if (padLength <= 0) return arr;
    return Array(padLength).fill(null).concat(arr);
  };

  // Function to fetch technical indicators
  const fetchTechnicalIndicators = async (
    prices: number[],
    interval: string
  ) => {
    if (!prices || prices.length === 0) {
      console.log("No prices data available for technical indicators");
      return;
    }

    try {
      // Calculate period based on interval and data length
      let period = 14; // Default period
      const dataLength = prices.length;

      switch (interval) {
        case "1H":
          // For hourly data, use 48 periods (2 days) or 20% of data length
          period = Math.min(48, Math.floor(dataLength * 0.2));
          break;
        case "1D":
          // For daily data, use 30 periods (1 month) or 20% of data length
          period = Math.min(30, Math.floor(dataLength * 0.2));
          break;
        case "1W":
          // For weekly data, use 90 periods (3 months) or 20% of data length
          period = Math.min(90, Math.floor(dataLength * 0.2));
          break;
        case "1M":
          // For monthly data, use 12 periods (1 year) or 20% of data length
          period = Math.min(12, Math.floor(dataLength * 0.2));
          break;
      }
      console.log("Period:", period);

      // Ensure period is at least 2 for valid calculations
      period = Math.max(2, period);

      console.log(
        `Calculating indicators with period: ${period} for ${interval} timeframe (data length: ${dataLength})`
      );

      // Fetch RSI
      const rsiResponse = await fetch("http://localhost:3002/api/rsi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          prices: prices,
          period: period,
        }),
      });

      if (!rsiResponse.ok) {
        throw new Error(`RSI API error: ${rsiResponse.statusText}`);
      }
      const rsiData = await rsiResponse.json();

      // Fetch EMA
      const emaResponse = await fetch("http://localhost:3002/api/ema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          prices: prices,
          period: period,
        }),
      });

      if (!emaResponse.ok) {
        throw new Error(`EMA API error: ${emaResponse.statusText}`);
      }
      const emaData = await emaResponse.json();

      // Fetch Bollinger Bands
      const bbResponse = await fetch(
        "http://localhost:3002/api/bollinger-bands",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            prices: prices,
            period: period,
            stdDev: 2,
          }),
        }
      );

      if (!bbResponse.ok) {
        throw new Error(`Bollinger Bands API error: ${bbResponse.statusText}`);
      }
      const bbData = await bbResponse.json();

      setTechnicalData({
        rsi: padArray(rsiData, prices.length),
        ema: padArray(emaData, prices.length),
        bollingerBands: {
          upper: padArray(
            bbData.map((item: any) => item.upper),
            prices.length
          ),
          middle: padArray(
            bbData.map((item: any) => item.middle),
            prices.length
          ),
          lower: padArray(
            bbData.map((item: any) => item.lower),
            prices.length
          ),
        },
      });
    } catch (error) {
      console.error("Error fetching technical indicators:", error);
      setTechnicalData({
        rsi: [],
        ema: [],
        bollingerBands: {
          upper: [],
          middle: [],
          lower: [],
        },
      });
    }
  };

  // Update fetchOhlcvData to also fetch technical indicators
  const fetchOhlcvData = async (symbol: string, interval: string) => {
    try {
      setIsLoadingChart(true);
      setOhlcvData([]); // Reset OHLCV data
      setTechnicalData({
        // Reset technical data
        rsi: [],
        ema: [],
        bollingerBands: {
          upper: [],
          middle: [],
          lower: [],
        },
      });

      const endDate = new Date().toISOString().split("T")[0];
      let startDate = new Date();

      // Calculate start date based on interval
      switch (interval) {
        case "1H":
          startDate.setHours(startDate.getHours() - 48);
          break;
        case "1D":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "1W":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "1M":
          startDate.setMonth(startDate.getMonth() - 12);
          break;
      }

      const formattedStartDate = startDate.toISOString().split("T")[0];

      // Fetch OHLCV data from port 3003
      const response = await fetch(
        `http://localhost:3003/api/stock/ohlcv/${symbol}?start_date=${formattedStartDate}&end_date=${endDate}&interval=${interval}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`OHLCV API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error("No OHLCV data received");
      }
      console.log("Data:", data);
      setOhlcvData(data);

      // Extract closing prices for technical indicators
      const closingPrices = data
        .map((item: any) => Number(item.close))
        .filter((price: number) => !isNaN(price));

      console.log("Closing Prices:", closingPrices);
      // console.log("Number of closing prices:", closingPrices.length);
      // console.log("First 5 prices:", closingPrices.slice(0, 5));
      // console.log("Last 5 prices:", closingPrices.slice(-5));

      // Only fetch technical indicators if we have valid closing prices
      if (closingPrices && closingPrices.length > 0) {
        await fetchTechnicalIndicators(closingPrices, interval);
      } else {
        console.log(
          "No valid closing prices available for technical indicators"
        );
      }
    } catch (error) {
      console.error("Error fetching OHLCV data:", error);
      setOhlcvData([]);
      setTechnicalData({
        rsi: [],
        ema: [],
        bollingerBands: {
          upper: [],
          middle: [],
          lower: [],
        },
      });
    } finally {
      setIsLoadingChart(false);
    }
  };

  // Fetch data when selected stock or timeframe changes
  useEffect(() => {
    if (selectedStock) {
      fetchOhlcvData(selectedStock, timeframe);
    } else {
      setOhlcvData([]);
    }
  }, [selectedStock, timeframe]);

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

        // Fetch stock data for each symbol in watchlist
        const watchlistData = await Promise.all(
          userData.watchlist.map(async (symbol: string) => {
            // In a real app, you would fetch this from a stock API
            // For now, we'll use mock data
            return {
              id: symbol.toLowerCase(),
              symbol: symbol,
              name: `${symbol} Company`, // This would come from the API
              price: Math.random() * 1000,
              change: Math.random() * 10 - 5,
              changePercent: Math.random() * 2 - 1,
              isFavorite: true,
            };
          })
        );

        setWatchlistItems(watchlistData);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  // Fetch company info when selectedStock changes
  useEffect(() => {
    if (!selectedStock) {
      setCompanyInfo(null);
      return;
    }
    setIsLoadingCompany(true);
    fetch(`http://localhost:3003/api/stock/company/${selectedStock}`)
      .then((res) => res.json())
      .then((data) => setCompanyInfo(data))
      .catch(() => setCompanyInfo(null))
      .finally(() => setIsLoadingCompany(false));
  }, [selectedStock]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would fetch data for the searched stock
    console.log(`Searching for: ${searchQuery}`);
  };

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol);
    setTimeframe("1D");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Stock Market</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {selectedStock || "Chọn mã cổ phiếu trước"}
                </h2>
                <Tabs
                  defaultValue="1D"
                  className="w-[300px]"
                  onValueChange={setTimeframe}
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="1H">1H</TabsTrigger>
                    <TabsTrigger value="1D">1D</TabsTrigger>
                    <TabsTrigger value="1W">1W</TabsTrigger>
                    <TabsTrigger value="1M">1M</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {selectedStock === "" ? (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="text-muted-foreground">
                    Chọn mã cổ phiếu trước
                  </div>
                </div>
              ) : isLoadingChart ? (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="text-muted-foreground">
                    Loading chart data...
                  </div>
                </div>
              ) : ohlcvData.length > 0 ? (
                <InteractiveChart
                  data={ohlcvData.map((item, index) => ({
                    date: item.timestamp,
                    price: item.close,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    volume: item.volume,
                    ema: technicalData.ema[index],
                    bollingerUpper: technicalData.bollingerBands.upper[index],
                    bollingerMiddle: technicalData.bollingerBands.middle[index],
                    bollingerLower: technicalData.bollingerBands.lower[index],
                  }))}
                  timeframe={timeframe}
                  showEMA={showEMA}
                  showBollingerBands={showBollingerBands}
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="text-muted-foreground">No data available</div>
                </div>
              )}
            </CardContent>
          </Card>

          {showRSI && (
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold">
                  RSI (Relative Strength Index)
                </h3>
                <TechnicalIndicators
                  data={ohlcvData.map((item, index) => ({
                    date: item.timestamp,
                    rsi: technicalData.rsi[index],
                    ema: technicalData.ema[index],
                  }))}
                  type="rsi"
                />
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-6">
          <Watchlist
            initialItems={watchlistItems}
            onSelectStock={handleSelectStock}
          />

          {isLoadingCompany ? (
            <div className="p-4">Đang tải thông tin công ty...</div>
          ) : companyInfo ? (
            <StockInfo stock={companyInfo} />
          ) : (
            <div className="p-4 text-muted-foreground">
              Chọn mã để xem thông tin công ty
            </div>
          )}

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
