"use client"

import { useState } from "react"
import { Plus, X, GripVertical, Search, ChevronUp, ChevronDown, Star, StarOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface WatchlistItem {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  isFavorite?: boolean
}

interface WatchlistProps {
  initialItems?: WatchlistItem[]
  onSelectStock?: (symbol: string) => void
}

export function Watchlist({ initialItems = [], onSelectStock }: WatchlistProps) {
  const [items, setItems] = useState<WatchlistItem[]>(initialItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [newSymbol, setNewSymbol] = useState("")
  const [draggedItem, setDraggedItem] = useState<WatchlistItem | null>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"symbol" | "price" | "change" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Mock stock search results
  const searchResults: WatchlistItem[] = [
    { id: "tsla", symbol: "TSLA", name: "Tesla, Inc.", price: 245.68, change: -3.42, changePercent: -1.37 },
    { id: "meta", symbol: "META", name: "Meta Platforms, Inc.", price: 478.22, change: 2.34, changePercent: 0.49 },
    { id: "nflx", symbol: "NFLX", name: "Netflix, Inc.", price: 632.77, change: 4.56, changePercent: 0.73 },
    { id: "dis", symbol: "DIS", name: "The Walt Disney Company", price: 112.34, change: -0.87, changePercent: -0.77 },
    { id: "ko", symbol: "KO", name: "The Coca-Cola Company", price: 62.45, change: 0.32, changePercent: 0.52 },
  ]

  // Filter items based on search query
  const filteredItems = items.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort items if sort is active
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortBy) return 0

    let comparison = 0
    if (sortBy === "symbol") {
      comparison = a.symbol.localeCompare(b.symbol)
    } else if (sortBy === "price") {
      comparison = a.price - b.price
    } else if (sortBy === "change") {
      comparison = a.changePercent - b.changePercent
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  // Handle drag start
  const handleDragStart = (item: WatchlistItem) => {
    setDraggedItem(item)
  }

  // Handle drag over
  const handleDragOver = (index: number) => {
    if (draggedItem && draggedOverIndex !== index) {
      setDraggedOverIndex(index)
    }
  }

  // Handle drop to reorder items
  const handleDrop = () => {
    if (!draggedItem || draggedOverIndex === null) return

    const newItems = [...items]
    const draggedItemIndex = items.findIndex((item) => item.id === draggedItem.id)

    // Remove the dragged item
    newItems.splice(draggedItemIndex, 1)

    // Insert at the new position
    newItems.splice(draggedOverIndex, 0, draggedItem)

    setItems(newItems)
    setDraggedItem(null)
    setDraggedOverIndex(null)
  }

  // Handle adding a new stock to watchlist
  const handleAddStock = (stock: WatchlistItem) => {
    if (!items.some((item) => item.id === stock.id)) {
      setItems([...items, stock])
    }
    setIsAddDialogOpen(false)
  }

  // Handle removing a stock from watchlist
  const handleRemoveStock = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  // Handle toggling favorite status
  const handleToggleFavorite = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isFavorite: item.isFavorite === undefined ? true : !item.isFavorite } : item,
      ),
    )
  }

  // Handle sort
  const handleSort = (column: "symbol" | "price" | "change") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

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
                <DialogDescription>Tìm kiếm và thêm cổ phiếu vào danh sách theo dõi của bạn.</DialogDescription>
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
                {searchResults
                  .filter(
                    (result) =>
                      result.symbol.toLowerCase().includes(newSymbol.toLowerCase()) ||
                      result.name.toLowerCase().includes(newSymbol.toLowerCase()),
                  )
                  .map((result) => (
                    <div
                      key={result.id}
                      className="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-muted"
                      onClick={() => handleAddStock(result)}
                    >
                      <div>
                        <div className="font-medium">{result.symbol}</div>
                        <div className="text-sm text-muted-foreground">{result.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${result.price.toFixed(2)}</div>
                        <div className={`text-sm ${result.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {result.changePercent >= 0 ? "+" : ""}
                          {result.change.toFixed(2)} ({result.changePercent >= 0 ? "+" : ""}
                          {result.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm trong danh sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="mb-2 grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-1"></div>
          <div className="col-span-3 flex cursor-pointer items-center" onClick={() => handleSort("symbol")}>
            Mã CP
            {sortBy === "symbol" &&
              (sortDirection === "asc" ? (
                <ChevronUp className="ml-1 h-3 w-3" />
              ) : (
                <ChevronDown className="ml-1 h-3 w-3" />
              ))}
          </div>
          <div className="col-span-4 flex cursor-pointer items-center justify-end" onClick={() => handleSort("price")}>
            Giá
            {sortBy === "price" &&
              (sortDirection === "asc" ? (
                <ChevronUp className="ml-1 h-3 w-3" />
              ) : (
                <ChevronDown className="ml-1 h-3 w-3" />
              ))}
          </div>
          <div className="col-span-3 flex cursor-pointer items-center justify-end" onClick={() => handleSort("change")}>
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
                  draggedOverIndex === index ? "bg-muted/50" : "hover:bg-muted/30"
                } ${draggedItem?.id === item.id ? "opacity-50" : ""}`}
                draggable
                onDragStart={() => handleDragStart(item)}
                onDragOver={(e) => {
                  e.preventDefault()
                  handleDragOver(index)
                }}
                onDragEnd={handleDrop}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDrop()
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
                      e.stopPropagation()
                      handleToggleFavorite(item.id)
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
                <div className="col-span-4 flex items-center justify-end font-medium">${item.price.toFixed(2)}</div>
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
                      e.stopPropagation()
                      handleRemoveStock(item.id)
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
  )
}
