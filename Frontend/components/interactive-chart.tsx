"use client"

import { useRef, useState, useEffect } from "react"
import { Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ComposedChart, Legend, Area, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartDrawingTools } from "@/components/chart-drawing-tools"
import { ChartDrawingLayer } from "@/components/chart-drawing-layer"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface InteractiveChartProps {
  data: {
    date: string
    price: number
    open?: number
    close?: number
    high?: number
    low?: number
    ema: number
    bollingerUpper: number
    bollingerMiddle: number
    bollingerLower: number
  }[]
  timeframe: string
  showEMA?: boolean
  showBollingerBands?: boolean
}

export function InteractiveChart({
  data,
  timeframe,
  showEMA = false,
  showBollingerBands = false,
}: InteractiveChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [selectedTool, setSelectedTool] = useState("cursor")
  const [drawings, setDrawings] = useState<any[]>([])
  const [currentColor, setCurrentColor] = useState("#ef4444") // red-500
  const [currentLineWidth, setCurrentLineWidth] = useState(2)
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 })
  const [chartType, setChartType] = useState<"line" | "candlestick">("line")

  // Format price for y-axis
  const formatYAxis = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  // Calculate price change
  const priceChange = data[data.length - 1].price - data[0].price
  const priceChangePercent = (priceChange / data[0].price) * 100
  const isPositive = priceChange >= 0

  // Update chart dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const { width, height } = chartRef.current.getBoundingClientRect()
        setChartDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const handleClearDrawings = () => {
    setDrawings([])
  }

  // Custom component to render candlesticks
  const renderCandlestick = (props: any) => {
    const { x, y, width, height, index } = props
    const item = data[index]

    if (!item || !item.open || !item.close) return null

    const isIncreasing = item.close >= item.open
    const color = isIncreasing ? "rgb(22, 163, 74)" : "rgb(220, 38, 38)" // green-600 or red-600

    // Calculate candle body
    const openY = item.open
      ? y + height * (1 - (item.open - data[index].low) / (data[index].high - data[index].low))
      : y
    const closeY = item.close
      ? y + height * (1 - (item.close - data[index].low) / (data[index].high - data[index].low))
      : y + height
    const candleHeight = Math.abs(closeY - openY)
    const bodyY = isIncreasing ? closeY : openY

    // Calculate wick positions
    const highY = y
    const lowY = y + height
    const wickX = x + width / 2

    return (
      <g key={`candle-${index}`}>
        {/* Wick line */}
        <line x1={wickX} y1={highY} x2={wickX} y2={lowY} stroke={color} strokeWidth={1} />
        {/* Candle body */}
        <rect
          x={x + width * 0.2}
          y={bodyY}
          width={width * 0.6}
          height={candleHeight || 1} // Ensure at least 1px height
          fill={color}
          stroke={color}
        />
      </g>
    )
  }

  // Update the chart rendering section to include the chart type selector and candlestick rendering
  return (
    <div className="space-y-4">
      <div>
        <div className="text-3xl font-bold">${data[data.length - 1].price.toFixed(2)}</div>
        <div className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
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

        <Tabs value={chartType} onValueChange={(value) => setChartType(value as "line" | "candlestick")}>
          <TabsList>
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="candlestick">Candlestick</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative h-[300px]" ref={chartRef}>
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: isPositive ? "hsl(142.1, 76.2%, 36.3%)" : "hsl(346.8, 77.2%, 49.8%)",
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
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis
                tickFormatter={formatYAxis}
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value, name, props) => {
                      if (chartType === "candlestick" && name === "price") {
                        const item = data[props.payload.index]
                        return [
                          `Open: $${item.open?.toFixed(2)}`,
                          `High: $${item.high?.toFixed(2)}`,
                          `Low: $${item.low?.toFixed(2)}`,
                          `Close: $${item.close?.toFixed(2)}`,
                        ]
                      }
                      return [`$${Number(value).toFixed(2)}`]
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
  )
}
