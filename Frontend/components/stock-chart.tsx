"use client"

import { Line, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ComposedChart, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface StockChartProps {
  data: {
    date: string
    price: number
    volume: number
    ema: number
  }[]
  timeframe: string
  showEMA?: boolean
  showVolume?: boolean
}

export function StockChart({ data, timeframe, showEMA = false, showVolume = false }: StockChartProps) {
  // Format price for y-axis
  const formatYAxis = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  // Format volume for y-axis
  const formatVolumeAxis = (value: number) => {
    return `${value}M`
  }

  // Calculate price change
  const priceChange = data[data.length - 1].price - data[0].price
  const priceChangePercent = (priceChange / data[0].price) * 100
  const isPositive = priceChange >= 0

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

      <div className="h-[300px]">
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
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis
                yAxisId="left"
                tickFormatter={formatYAxis}
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              {showVolume && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={formatVolumeAxis}
                  domain={[0, "dataMax"]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
              )}
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke={`var(--color-price)`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              {showEMA && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ema"
                  stroke={`var(--color-ema)`}
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
              {showVolume && <Bar yAxisId="right" dataKey="volume" fill="rgba(100, 116, 139, 0.5)" barSize={20} />}
              <Legend />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
