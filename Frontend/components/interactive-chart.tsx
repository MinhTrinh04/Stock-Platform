"use client";

import { useRef, useState, useEffect } from "react";
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ComposedChart,
  Legend,
  Area,
  Bar,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartDrawingTools } from "@/components/chart-drawing-tools";
import { ChartDrawingLayer } from "@/components/chart-drawing-layer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InteractiveChartProps {
  data: {
    date: string;
    price: number;
    open?: number;
    close?: number;
    high?: number;
    low?: number;
    ema: number;
    bollingerUpper: number;
    bollingerMiddle: number;
    bollingerLower: number;
  }[];
  timeframe: string;
  showEMA?: boolean;
  showBollingerBands?: boolean;
}

export function InteractiveChart({
  data,
  timeframe,
  showEMA = false,
  showBollingerBands = false,
}: InteractiveChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState("cursor");
  const [drawings, setDrawings] = useState<any[]>([]);
  const [currentColor, setCurrentColor] = useState("#ef4444"); // red-500
  const [currentLineWidth, setCurrentLineWidth] = useState(2);
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const [domain, setDomain] = useState<[number, number]>([0, 0]);
  const [yDomain, setYDomain] = useState<[number, number]>([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });

  // Calculate price change and percentage
  const currentPrice = data[data.length - 1].price;
  const priceChange = currentPrice - data[0].price;
  const priceChangePercent = (priceChange / data[0].price) * 100;
  const isPositive = priceChange >= 0;

  // Format price for y-axis with VND
  const formatYAxis = (value: number) => {
    return value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });
  };

  // Helper: get min/max price
  const getMinMaxPrice = () => {
    if (!data || data.length === 0) return { minPrice: 0, maxPrice: 1 };
    const prices = data.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return { minPrice, maxPrice };
  };

  // Clamp yDomain to min/max
  const clampYDomain = (domain: [number, number]) => {
    const { minPrice, maxPrice } = getMinMaxPrice();
    if (!isFinite(minPrice) || !isFinite(maxPrice))
      return [0, 1] as [number, number];
    const padding = (maxPrice - minPrice) * 0.1;
    const min = minPrice - padding;
    const max = maxPrice + padding;
    if (!isFinite(domain[0]) || !isFinite(domain[1]))
      return [min, max] as [number, number];
    return [Math.max(domain[0], min), Math.min(domain[1], max)] as [
      number,
      number
    ];
  };

  // Handle mouse events for panning (only Y)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool === "cursor") {
      setIsDragging(true);
      setStartPoint({ x: e.clientX, y: e.clientY });
      setCurrentPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedTool === "cursor") {
      setCurrentPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectedTool === "cursor") {
      const dy = currentPoint.y - startPoint.y;
      if (dy !== 0) {
        const yStep = (yDomain[1] - yDomain[0]) / chartDimensions.height;
        let newYDomain: [number, number] = [
          yDomain[0] + dy * yStep,
          yDomain[1] + dy * yStep,
        ];
        newYDomain = clampYDomain(newYDomain);
        setYDomain(newYDomain);
      }
    }
    setIsDragging(false);
  };

  // Handle wheel events for zooming (only Y)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    // Zoom Y axis only
    const yCenter = (yDomain[0] + yDomain[1]) / 2;
    const yRange = yDomain[1] - yDomain[0];
    let newYRange = yRange * zoomFactor;
    const { minPrice, maxPrice } = getMinMaxPrice();
    const padding = (maxPrice - minPrice) * 0.1;
    // Clamp zoom so it doesn't go out of bounds
    newYRange = Math.max(
      (maxPrice - minPrice) * 0.2,
      Math.min(newYRange, (maxPrice - minPrice) * 2)
    );
    let newYDomain: [number, number] = [
      yCenter - newYRange / 2,
      yCenter + newYRange / 2,
    ];
    newYDomain = clampYDomain(newYDomain);
    setYDomain(newYDomain);
  };

  // Initialize domains
  useEffect(() => {
    if (data.length > 0) {
      const { minPrice, maxPrice } = getMinMaxPrice();
      const padding = (maxPrice - minPrice) * 0.1;
      setYDomain([minPrice - padding, maxPrice + padding]);
    } else {
      setYDomain([0, 1]);
    }
  }, [data]);

  // Update chart dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const { width, height } = chartRef.current.getBoundingClientRect();
        setChartDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleClearDrawings = () => {
    setDrawings([]);
  };

  // Custom component to render candlesticks
  const renderCandlestick = (props: any) => {
    const { x, y, width, height, index } = props;
    const item = data[index];

    if (!item || !item.open || !item.close) return <g />;

    const isIncreasing = item.close >= item.open;
    const color = isIncreasing ? "rgb(22, 163, 74)" : "rgb(220, 38, 38)";

    const openY =
      y + height * (1 - (item.open - yDomain[0]) / (yDomain[1] - yDomain[0]));
    const closeY =
      y + height * (1 - (item.close - yDomain[0]) / (yDomain[1] - yDomain[0]));
    const candleHeight = Math.abs(closeY - openY);
    const bodyY = isIncreasing ? closeY : openY;

    // Sửa lỗi linter cho high/low
    const highY =
      item.high !== undefined
        ? y +
          height * (1 - (item.high - yDomain[0]) / (yDomain[1] - yDomain[0]))
        : y;
    const lowY =
      item.low !== undefined
        ? y + height * (1 - (item.low - yDomain[0]) / (yDomain[1] - yDomain[0]))
        : y + height;
    const wickX = x + width / 2;

    return (
      <g key={`candle-${index}`}>
        <line
          x1={wickX}
          y1={highY}
          x2={wickX}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        <rect
          x={x + width * 0.2}
          y={bodyY}
          width={width * 0.6}
          height={candleHeight || 1}
          fill={color}
          stroke={color}
        />
      </g>
    );
  };

  // Update the chart rendering section to include the chart type selector and candlestick rendering
  return (
    <div className="space-y-4">
      <div>
        <div className="text-3xl font-bold">
          $
          {currentPrice.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          })}
        </div>
        <div
          className={`flex items-center ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>
            {isPositive ? "+" : ""}
            {priceChange.toFixed(2)}
          </span>
          <span className="ml-2">
            ({isPositive ? "+" : ""}
            {priceChangePercent.toFixed(2)}%)
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {timeframe} Chart • {data[0].date} - {data[data.length - 1].date}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <ChartDrawingTools
          onSelectTool={setSelectedTool}
          onClearDrawings={handleClearDrawings}
          selectedTool={selectedTool}
          onColorChange={setCurrentColor}
          onLineWidthChange={setCurrentLineWidth}
          currentColor={currentColor}
          currentLineWidth={currentLineWidth}
        />

        <Tabs
          value={chartType}
          onValueChange={(value) =>
            setChartType(value as "line" | "candlestick")
          }
        >
          <TabsList>
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="candlestick">Candlestick</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div
        className="relative h-[300px]"
        ref={chartRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: isPositive
                ? "hsl(142.1, 76.2%, 36.3%)"
                : "hsl(346.8, 77.2%, 49.8%)",
            },
            ema: {
              label: "EMA",
              color: "hsl(262.1, 83.3%, 57.8%)",
            },
            bollingerUpper: {
              label: "Upper Band",
              color: "hsl(221, 83%, 53%)",
            },
            bollingerLower: {
              label: "Lower Band",
              color: "hsl(221, 83%, 53%)",
            },
          }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(date) => {
                  const d = new Date(date);
                  if (!isNaN(d.getTime()))
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  return date;
                }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                allowDataOverflow={true}
              />
              <ReferenceLine
                y={currentPrice}
                stroke="rgba(0,0,0,0.3)"
                strokeDasharray="3 3"
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value, name, props) => {
                      if (chartType === "candlestick" && name === "price") {
                        const item = data[props.payload.index];
                        return [
                          `Open: $${item.open?.toFixed(2)}`,
                          `High: $${item.high?.toFixed(2)}`,
                          `Low: $${item.low?.toFixed(2)}`,
                          `Close: $${item.close?.toFixed(2)}`,
                        ];
                      }
                      return [`$${Number(value).toFixed(2)}`];
                    }}
                  />
                }
              />

              {showBollingerBands && (
                <Area
                  type="monotone"
                  dataKey="bollingerUpper"
                  stroke={`var(--color-bollingerUpper)`}
                  fillOpacity={0.1}
                  fill="rgba(59, 130, 246, 0.1)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  activeDot={false}
                />
              )}

              {showBollingerBands && (
                <Line
                  type="monotone"
                  dataKey="bollingerMiddle"
                  stroke="rgba(59, 130, 246, 0.5)"
                  strokeWidth={1}
                  dot={false}
                  activeDot={false}
                />
              )}

              {showBollingerBands && (
                <Area
                  type="monotone"
                  dataKey="bollingerLower"
                  stroke={`var(--color-bollingerLower)`}
                  fillOpacity={0}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  activeDot={false}
                />
              )}

              {chartType === "line" ? (
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={`var(--color-price)`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ) : (
                <Bar dataKey="price" barSize={20} shape={renderCandlestick} />
              )}

              {showEMA && (
                <Line
                  type="monotone"
                  dataKey="ema"
                  stroke={`var(--color-ema)`}
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}

              <Legend />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartDrawingLayer
          width={chartDimensions.width}
          height={chartDimensions.height}
          tool={selectedTool}
          color={currentColor}
          lineWidth={currentLineWidth}
          drawings={drawings}
          setDrawings={setDrawings}
        />
      </div>
    </div>
  );
}
