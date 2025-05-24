"use client"

import { useState } from "react"
import {
  Pencil,
  LineChart,
  ArrowDownToLine,
  Square,
  Type,
  Ruler,
  Trash2,
  ChevronDown,
  Circle,
  ArrowUpDown,
  Eraser,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"

interface ChartDrawingToolsProps {
  onSelectTool: (tool: string) => void
  onClearDrawings: () => void
  selectedTool: string
  onColorChange: (color: string) => void
  onLineWidthChange: (width: number) => void
  currentColor: string
  currentLineWidth: number
}

export function ChartDrawingTools({
  onSelectTool,
  onClearDrawings,
  selectedTool,
  onColorChange,
  onLineWidthChange,
  currentColor,
  currentLineWidth,
}: ChartDrawingToolsProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

  const tools = [
    { id: "cursor", icon: <Pencil size={16} />, label: "Cursor" },
    { id: "trendline", icon: <LineChart size={16} />, label: "Trend Line" },
    { id: "horizontalline", icon: <ArrowUpDown size={16} />, label: "Horizontal Line" },
    { id: "fibonacciretracement", icon: <Ruler size={16} />, label: "Fibonacci Retracement" },
    { id: "rectangle", icon: <Square size={16} />, label: "Rectangle" },
    { id: "circle", icon: <Circle size={16} />, label: "Circle" },
    { id: "text", icon: <Type size={16} />, label: "Text" },
    { id: "arrow", icon: <ArrowDownToLine size={16} />, label: "Arrow" },
  ]

  const colors = [
    "#1e293b", // slate-800
    "#ef4444", // red-500
    "#22c55e", // green-500
    "#3b82f6", // blue-500
    "#a855f7", // purple-500
    "#eab308", // yellow-500
    "#ec4899", // pink-500
    "#f97316", // orange-500
  ]

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <TooltipProvider>
        <div className="flex items-center rounded-md border bg-background p-1">
          {tools.slice(0, 4).map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedTool === tool.id ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onSelectTool(tool.id)}
                >
                  {tool.icon}
                  <span className="sr-only">{tool.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{tool.label}</TooltipContent>
            </Tooltip>
          ))}

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown size={16} />
                    <span className="sr-only">More tools</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">More Tools</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              {tools.slice(4).map((tool) => (
                <DropdownMenuItem key={tool.id} onClick={() => onSelectTool(tool.id)}>
                  <span className="mr-2">{tool.icon}</span>
                  {tool.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClearDrawings}>
                <Eraser className="mr-2" size={16} />
                Clear All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 p-0">
                    <div
                      className="h-6 w-6 rounded-sm"
                      style={{ backgroundColor: currentColor }}
                      aria-label="Select color"
                    />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Color</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="h-8 w-8 rounded-md border p-0"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onColorChange(color)
                      setIsColorPickerOpen(false)
                    }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-8 w-8 p-0">
                    <div
                      className="mx-auto rounded-sm bg-foreground"
                      style={{ height: `${Math.min(currentLineWidth, 4)}px`, width: "16px" }}
                      aria-label="Line width"
                    />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Line Width</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-2">
                <p className="text-sm font-medium">Line Width</p>
                <Slider
                  defaultValue={[currentLineWidth]}
                  max={5}
                  min={1}
                  step={1}
                  onValueChange={(value) => onLineWidthChange(value[0])}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={onClearDrawings}
                aria-label="Clear all drawings"
              >
                <Trash2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Clear All</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
