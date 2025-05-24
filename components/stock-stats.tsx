import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StockStatsProps {
  stock: {
    marketCap: string
    peRatio: number
    dividend: number
    volume: string
    avgVolume: string
    high: number
    low: number
    open: number
    previousClose: number
    yearHigh: number
    yearLow: number
  }
}

export function StockStats({ stock }: StockStatsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Key Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Market Cap</div>
            <div className="font-medium">${stock.marketCap}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">P/E Ratio</div>
            <div className="font-medium">{stock.peRatio}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Dividend</div>
            <div className="font-medium">{stock.dividend}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Volume</div>
            <div className="font-medium">{stock.volume}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Avg. Volume</div>
            <div className="font-medium">{stock.avgVolume}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Day Range</div>
            <div className="font-medium">
              ${stock.low.toFixed(2)} - ${stock.high.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Open</div>
            <div className="font-medium">${stock.open.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Previous Close</div>
            <div className="font-medium">${stock.previousClose.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">52 Week Range</div>
            <div className="font-medium">
              ${stock.yearLow.toFixed(2)} - ${stock.yearHigh.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">RSI (14)</div>
            <div className="font-medium">58</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">EMA (20)</div>
            <div className="font-medium">$182.80</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Bollinger Bands</div>
            <div className="font-medium">20, 2</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
