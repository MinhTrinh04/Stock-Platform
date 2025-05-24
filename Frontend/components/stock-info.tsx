import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StockInfoProps {
  stock: {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
  }
}

export function StockInfo({ stock }: StockInfoProps) {
  const isPositive = stock.change >= 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Stock Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Symbol</span>
            <span className="font-medium">{stock.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{stock.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">${stock.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Change</span>
            <span className={`font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? "+" : ""}
              {stock.change.toFixed(2)} ({isPositive ? "+" : ""}
              {stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
