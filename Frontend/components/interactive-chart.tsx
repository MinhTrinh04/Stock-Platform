"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChartDrawingTools } from "@/components/chart-drawing-tools";
import { ChartDrawingLayer } from "@/components/chart-drawing-layer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApexOptions } from "apexcharts";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(
  () => import("react-apexcharts").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center">
        Loading chart...
      </div>
    ),
  }
);

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
  const [currentColor, setCurrentColor] = useState("#ef4444");
  const [currentLineWidth, setCurrentLineWidth] = useState(2);
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");

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

  // Prepare series data for ApexCharts
  const candlestickData = data
    .filter(
      (item) =>
        typeof item.open === "number" &&
        typeof item.high === "number" &&
        typeof item.low === "number" &&
        typeof item.close === "number"
    )
    .map((item) => ({
      x: new Date(item.date).getTime(),
      y: [item.open, item.high, item.low, item.close],
    }));

  const lineData = data.map((item) => ({
    x: new Date(item.date).getTime(),
    y: item.price,
  }));

  const series = [
    {
      name: "Price",
      type: chartType === "line" ? "line" : "candlestick",
      data: chartType === "candlestick" ? candlestickData : lineData,
    },
    ...(showEMA
      ? [
          {
            name: "EMA",
            type: "line",
            data: data.map((item) => ({
              x: new Date(item.date).getTime(),
              y: item.ema,
            })),
          },
        ]
      : []),
    ...(showBollingerBands
      ? [
          {
            name: "Upper Band",
            type: "line",
            data: data.map((item) => ({
              x: new Date(item.date).getTime(),
              y: item.bollingerUpper,
            })),
          },
          {
            name: "Middle Band",
            type: "line",
            data: data.map((item) => ({
              x: new Date(item.date).getTime(),
              y: item.bollingerMiddle,
            })),
          },
          {
            name: "Lower Band",
            type: "line",
            data: data.map((item) => ({
              x: new Date(item.date).getTime(),
              y: item.bollingerLower,
            })),
          },
        ]
      : []),
  ];

  // ApexCharts options
  const options: ApexOptions = {
    chart: {
      type: chartType === "line" ? "line" : "candlestick",
      height: 300,
      toolbar: { show: false },
      animations: {
        enabled: false,
      },
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
    },
    stroke: {
      width: [2, 2, 2, 2, 2],
      curve: "smooth",
      dashArray: [0, 5, 0, 5, 0],
    },
    colors: [
      isPositive ? "rgb(22, 163, 74)" : "rgb(220, 38, 38)",
      "rgb(124, 58, 237)",
      "rgb(59, 130, 246)",
      "rgb(59, 130, 246)",
      "rgb(59, 130, 246)",
    ],
    xaxis: {
      type: "datetime",
      labels: {
        datetimeFormatter: {
          year: "yyyy",
          month: "MM/dd",
          day: "dd",
          hour: "HH:mm",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => formatYAxis(value),
      },
    },
    tooltip: {
      x: {
        format: "dd/MM/yyyy HH:mm",
      },
      y: {
        formatter: (value: number) => formatYAxis(value),
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-3xl font-bold">{formatYAxis(currentPrice)}</div>
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

      <div className="relative h-[300px]" ref={chartRef}>
        <div className="w-full h-full">
          <Chart
            options={options}
            series={series}
            type={chartType === "line" ? "line" : "candlestick"}
            height={300}
            width="100%"
          />
        </div>

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
