"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TechnicalIndicatorsProps {
  data: {
    date: string
    rsi?: number
    ema?: number
    volume?: number
  }[]
  type: "rsi" | "ema" | "volume"
}

export function TechnicalIndicators({ data, type }: TechnicalIndicatorsProps) {
  if (type === "rsi") {
    return (
      <div className="h-[150px]">
        <ChartContainer
          config={{
            rsi: {
              label: "RSI",
              color: "hsl(43.2, 96.4%, 59.4%)",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={10} ticks={[0, 30, 50, 70, 100]} />
              <ReferenceLine y={30} stroke="rgba(74, 222, 128, 0.5)" strokeDasharray="3 3" />
              <ReferenceLine y={70} stroke="rgba(248, 113, 113, 0.5)" strokeDasharray="3 3" />
              <ReferenceLine y={50} stroke="rgba(148, 163, 184, 0.5)" strokeDasharray="3 3" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="rsi" stroke={`var(--color-rsi)`} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Oversold (&lt;30)</span>
          <span>Neutral</span>
          <span>Overbought (&gt;70)</span>
        </div>
      </div>
    )
  }

  return null
}
