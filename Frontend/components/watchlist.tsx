"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  GripVertical,
  Search,
  ChevronUp,
  ChevronDown,
  Star,
  StarOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isFavorite?: boolean;
}

interface WatchlistProps {
  initialItems?: WatchlistItem[];
  onSelectStock?: (symbol: string) => void;
}

export function Watchlist({
  initialItems = [],
  onSelectStock,
}: WatchlistProps) {
  const [items, setItems] = useState<WatchlistItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [draggedItem, setDraggedItem] = useState<WatchlistItem | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"symbol" | "price" | "change" | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchResults, setSearchResults] = useState<WatchlistItem[]>([]);

  // Fetch danh sách cổ phiếu từ backend khi component mount
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const res = await fetch("http://localhost:3003/api/stock/symbols");
        const data = await res.json();
        // Map sang WatchlistItem (mock price, change, changePercent nếu chưa có)
        const mapped = data.map((item: any) => ({
          id: item.symbol.toLowerCase(),
          symbol: item.symbol,
          name: item.name,
          price: Math.random() * 1000, // TODO: fetch giá thực tế nếu có
          change: Math.random() * 10 - 5,
          changePercent: Math.random() * 2 - 1,
        }));
        setSearchResults(mapped);
      } catch (err) {
        setSearchResults([]);
      }
    };
    fetchSymbols();
  }, []);

  // Filter items based on search query
  const filteredItems = items.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort items if sort is active
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortBy) return 0;

    let comparison = 0;
    if (sortBy === "symbol") {
      comparison = a.symbol.localeCompare(b.symbol);
    } else if (sortBy === "price") {
      comparison = a.price - b.price;
    } else if (sortBy === "change") {
      comparison = a.changePercent - b.changePercent;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Handle drag start
  const handleDragStart = (item: WatchlistItem) => {
    setDraggedItem(item);
  };

  // Handle drag over
  const handleDragOver = (index: number) => {
    if (draggedItem && draggedOverIndex !== index) {
      setDraggedOverIndex(index);
    }
  };

  // Handle drop to reorder items
  const handleDrop = () => {
    if (!draggedItem || draggedOverIndex === null) return;

    const newItems = [...items];
    const draggedItemIndex = items.findIndex(
      (item) => item.id === draggedItem.id
    );

    // Remove the dragged item
    newItems.splice(draggedItemIndex, 1);

    // Insert at the new position
    newItems.splice(draggedOverIndex, 0, draggedItem);

    setItems(newItems);
    setDraggedItem(null);
    setDraggedOverIndex(null);
  };

  // Handle adding a new stock to watchlist
  const handleAddStock = async (stock: WatchlistItem) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(
        "http://localhost:3001/api/users/watchlist",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symbol: stock.symbol }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add stock to watchlist");
      }

      if (!items.some((item) => item.id === stock.id)) {
        setItems([...items, stock]);
      }
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding stock to watchlist:", error);
    }
  };

  // Handle removing a stock from watchlist
  const handleRemoveStock = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const stockToRemove = items.find((item) => item.id === id);
      if (!stockToRemove) return;

      const response = await fetch(
        "http://localhost:3001/api/users/watchlist",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symbol: stockToRemove.symbol }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove stock from watchlist");
      }

      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing stock from watchlist:", error);
    }
  };

  // Handle toggling favorite status
  const handleToggleFavorite = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              isFavorite:
                item.isFavorite === undefined ? true : !item.isFavorite,
            }
          : item
      )
    );
  };

  // Handle sort
  const handleSort = (column: "symbol" | "price" | "change") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Danh sách theo dõi</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add stock</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm cổ phiếu vào danh sách</DialogTitle>
                <DialogDescription>
                  Tìm kiếm và thêm cổ phiếu vào danh sách theo dõi của bạn.
                </DialogDescription>
              </DialogHeader>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm cổ phiếu..."
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Không có cổ phiếu nào trong hệ thống.
                  </div>
                ) : (
                  (() => {
                    const filteredResults = searchResults.filter(
                      (result) =>
                        result.symbol
                          .toLowerCase()
                          .includes(newSymbol.toLowerCase()) ||
                        result.name
                          .toLowerCase()
                          .includes(newSymbol.toLowerCase())
                    );
                    if (filteredResults.length === 0) {
                      return (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          Không tìm thấy cổ phiếu phù hợp.
                        </div>
                      );
                    }
                    return filteredResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-muted"
                        onClick={() => handleAddStock(result)}
                      >
                        <div>
                          <div className="font-medium">{result.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${result.price.toFixed(2)}
                          </div>
                          <div
                            className={`text-sm ${
                              result.changePercent >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {result.changePercent >= 0 ? "+" : ""}
                            {result.change.toFixed(2)} (
                            {result.changePercent >= 0 ? "+" : ""}
                            {result.changePercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Hủy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-1"></div>
          <div
            className="col-span-3 flex cursor-pointer items-center"
            onClick={() => handleSort("symbol")}
          >
            Mã CP
            {sortBy === "symbol" &&
              (sortDirection === "asc" ? (
                <ChevronUp className="ml-1 h-3 w-3" />
              ) : (
                <ChevronDown className="ml-1 h-3 w-3" />
              ))}
          </div>
          <div
            className="col-span-4 flex cursor-pointer items-center justify-end"
            onClick={() => handleSort("price")}
          >
            Giá
            {sortBy === "price" &&
              (sortDirection === "asc" ? (
                <ChevronUp className="ml-1 h-3 w-3" />
              ) : (
                <ChevronDown className="ml-1 h-3 w-3" />
              ))}
          </div>
          <div
            className="col-span-3 flex cursor-pointer items-center justify-end"
            onClick={() => handleSort("change")}
          >
            Thay đổi
            {sortBy === "change" &&
              (sortDirection === "asc" ? (
                <ChevronUp className="ml-1 h-3 w-3" />
              ) : (
                <ChevronDown className="ml-1 h-3 w-3" />
              ))}
          </div>
          <div className="col-span-1"></div>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {sortedItems.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Không có cổ phiếu nào trong danh sách theo dõi. Nhấn + để thêm.
            </div>
          ) : (
            sortedItems.map((item, index) => (
              <div
                key={item.id}
                className={`grid grid-cols-12 gap-2 rounded-md p-2 ${
                  draggedOverIndex === index
                    ? "bg-muted/50"
                    : "hover:bg-muted/30"
                } ${draggedItem?.id === item.id ? "opacity-50" : ""}`}
                draggable
                onDragStart={() => handleDragStart(item)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(index);
                }}
                onDragEnd={handleDrop}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop();
                }}
                onClick={() => onSelectStock && onSelectStock(item.symbol)}
              >
                <div className="col-span-1 flex items-center">
                  <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                </div>
                <div className="col-span-3 flex items-center">
                  <button
                    className="mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item.id);
                    }}
                  >
                    {item.isFavorite ? (
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                  <div>
                    <div className="font-medium">{item.symbol}</div>
                  </div>
                </div>
                <div className="col-span-4 flex items-center justify-end font-medium">
                  ${item.price.toFixed(2)}
                </div>
                <div
                  className={`col-span-3 flex items-center justify-end ${
                    item.changePercent >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.changePercent >= 0 ? "+" : ""}
                  {item.changePercent.toFixed(2)}%
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStock(item.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
