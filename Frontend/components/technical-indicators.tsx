"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TechnicalIndicatorsProps {
  data: {
    date: string;
    rsi?: number;
    ema?: number;
    volume?: number;
  }[];
  type: "rsi" | "ema" | "volume";
}

// Hàm mới để định dạng ngày tháng
const formatDateTick = (tickItem: string) => {
  if (!tickItem || typeof tickItem !== "string") return "";
  const date = new Date(tickItem);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

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
            {/* Thay đổi margin ở đây */}
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              {/* Thêm tickFormatter vào XAxis */}
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={formatDateTick}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                ticks={[0, 30, 50, 70, 100]}
              />
              <ReferenceLine
                y={30}
                stroke="rgba(74, 222, 128, 0.5)"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={70}
                stroke="rgba(248, 113, 113, 0.5)"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={50}
                stroke="rgba(148, 163, 184, 0.5)"
                strokeDasharray="3 3"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke={`var(--color-rsi)`}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  }

  return null;
}
