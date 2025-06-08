export type MarketType = "stock" | "crypto" | "forex";

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isFavorite?: boolean;
  type: MarketType;
}

export interface WatchlistProps {
  initialItems?: WatchlistItem[];
  onSelectStock?: (symbol: string) => void;
  marketType: MarketType;
}
