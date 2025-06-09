"use client";

import { useState, useEffect } from "react";
import { InteractiveChart } from "@/components/interactive-chart";
import { TechnicalIndicators } from "@/components/technical-indicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Watchlist } from "@/components/watchlist";
import { WatchlistItem } from "@/types/watchlist";

export function CryptoDashboard() {
  const [timeframe, setTimeframe] = useState("1D");
  const [showEMA, setShowEMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showBollingerBands, setShowBollingerBands] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ohlcvData, setOhlcvData] = useState<any[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [cryptoInfo, setCryptoInfo] = useState<any>(null);
  const [isLoadingCrypto, setIsLoadingCrypto] = useState(false);
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

  // Fetch watchlist
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
          id: item.symbol.toLowerCase(),
          symbol: item.symbol,
          name: `${item.symbol} / US Dollar`,
          price: Math.random() * 1000,
          change: Math.random() * 10 - 5,
          changePercent: Math.random() * 2 - 1,
          type: "crypto" as const,
        }));

        setItems(watchlistData);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  // Khi items thay đổi, nếu chưa có selectedCrypto thì chọn mã đầu tiên
  useEffect(() => {
    if (!selectedCrypto && items.length > 0) {
      setSelectedCrypto(items[0].symbol);
    }
  }, [items, selectedCrypto]);

  // Helper function to pad arrays
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
      let period = 2;
      const dataLength = prices.length;

      switch (interval) {
        case "1D":
          period = Math.min(30, Math.floor(dataLength * 0.1));
          break;
        case "1W":
          period = Math.min(90, Math.floor(dataLength * 0.2));
          break;
        case "1M":
          period = Math.min(12, Math.floor(dataLength * 0.2));
          break;
      }

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

  // Fetch OHLCV data
  const fetchOhlcvData = async (symbol: string, interval: string) => {
    try {
      setIsLoadingChart(true);
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

      const endDate = new Date().toISOString().split("T")[0];
      let startDate = new Date();

      switch (interval) {
        case "1D":
          startDate.setDate(startDate.getDate() - 60);
          break;
        case "1W":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "1M":
          startDate.setMonth(startDate.getMonth() - 12);
          break;
      }

      const formattedStartDate = startDate.toISOString().split("T")[0];

      const response = await fetch(
        `http://localhost:3003/api/crypto/ohlcv/${symbol}?start_date=${formattedStartDate}&end_date=${endDate}&interval=${interval}`,
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
      setOhlcvData(data);

      const closingPrices = data
        .map((item: any) => Number(item.close))
        .filter((price: number) => !isNaN(price));

      if (closingPrices && closingPrices.length > 0) {
        await fetchTechnicalIndicators(closingPrices, interval);
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

  // Fetch data when selected crypto or timeframe changes
  useEffect(() => {
    if (selectedCrypto) {
      fetchOhlcvData(selectedCrypto, timeframe);
    } else {
      setOhlcvData([]);
    }
  }, [selectedCrypto, timeframe]);

  // Fetch crypto info when selectedCrypto changes
  useEffect(() => {
    if (!selectedCrypto) {
      setCryptoInfo(null);
      return;
    }
    setIsLoadingCrypto(true);
    fetch(`http://localhost:3003/api/crypto/info/${selectedCrypto}`)
      .then((res) => res.json())
      .then((data) => setCryptoInfo(data))
      .catch(() => setCryptoInfo(null))
      .finally(() => setIsLoadingCrypto(false));
  }, [selectedCrypto]);

  const handleSelectCrypto = (symbol: string) => {
    setSelectedCrypto(symbol);
    setTimeframe("1D");
  };

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
                <h2 className="text-2xl font-bold">
                  {selectedCrypto || "Select a cryptocurrency"}
                </h2>
                <Tabs
                  defaultValue="1D"
                  className="w-[300px]"
                  onValueChange={setTimeframe}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="1D">1D</TabsTrigger>
                    <TabsTrigger value="1W">1W</TabsTrigger>
                    <TabsTrigger value="1M">1M</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {selectedCrypto === "" ? (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="text-muted-foreground">
                    Select a cryptocurrency first
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
              <CardContent className="p-4 pb-80">
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
            initialItems={items}
            onSelectStock={handleSelectCrypto}
            marketType="crypto"
          />

          {isLoadingCrypto ? (
            <div className="p-4">Loading cryptocurrency information...</div>
          ) : cryptoInfo ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Crypto Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Symbol</span>
                    <span className="font-medium">{cryptoInfo.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{cryptoInfo.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-4 text-muted-foreground">
              Select a cryptocurrency to view information
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
