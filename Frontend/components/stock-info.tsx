import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StockInfoProps {
  stock: {
    symbol: string;
    name: string;
  };
}

export function StockInfo({ stock }: StockInfoProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Thông tin cổ phiếu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-bold">{stock.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">{stock.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
