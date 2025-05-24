"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface Point {
  x: number
  y: number
}

interface Drawing {
  id: string
  type: string
  points: Point[]
  color: string
  lineWidth: number
  text?: string
}

interface ChartDrawingLayerProps {
  width: number
  height: number
  tool: string
  color: string
  lineWidth: number
  drawings: Drawing[]
  setDrawings: (drawings: Drawing[]) => void
}

export function ChartDrawingLayer({
  width,
  height,
  tool,
  color,
  lineWidth,
  drawings,
  setDrawings,
}: ChartDrawingLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null)
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [textInput, setTextInput] = useState("")
  const [textPosition, setTextPosition] = useState<Point | null>(null)

  // Initialize canvas and draw existing drawings
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height

    // Draw all saved drawings
    drawings.forEach((drawing) => {
      drawShape(ctx, drawing)
    })

    // Draw current drawing if exists
    if (currentDrawing) {
      drawShape(ctx, currentDrawing)
    }

    // Draw text input if active
    if (textPosition && tool === "text") {
      ctx.font = `${lineWidth * 6}px sans-serif`
      ctx.fillStyle = color
      ctx.fillText(textInput || "Text", textPosition.x, textPosition.y)
    }
  }, [width, height, drawings, currentDrawing, textPosition, textInput, tool, color, lineWidth])

  // Draw a shape based on its type
  const drawShape = (ctx: CanvasRenderingContext2D, drawing: Drawing) => {
    const { type, points, color, lineWidth, text } = drawing
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = lineWidth

    switch (type) {
      case "trendline":
        if (points.length >= 2) {
          ctx.beginPath()
          ctx.moveTo(points[0].x, points[0].y)
          ctx.lineTo(points[1].x, points[1].y)
          ctx.stroke()
        }
        break

      case "horizontalline":
        if (points.length >= 1) {
          ctx.beginPath()
          ctx.moveTo(0, points[0].y)
          ctx.lineTo(width, points[0].y)
          ctx.stroke()
        }
        break

      case "rectangle":
        if (points.length >= 2) {
          const [start, end] = points
          const rectWidth = end.x - start.x
          const rectHeight = end.y - start.y
          ctx.beginPath()
          ctx.rect(start.x, start.y, rectWidth, rectHeight)
          ctx.stroke()
        }
        break

      case "circle":
        if (points.length >= 2) {
          const [center, edge] = points
          const radius = Math.sqrt(Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2))
          ctx.beginPath()
          ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
          ctx.stroke()
        }
        break

      case "text":
        if (points.length >= 1 && text) {
          ctx.font = `${lineWidth * 6}px sans-serif`
          ctx.fillText(text, points[0].x, points[0].y)
        }
        break

      case "arrow":
        if (points.length >= 2) {
          const [start, end] = points
          const headLength = 10
          const angle = Math.atan2(end.y - start.y, end.x - start.x)

          // Draw the line
          ctx.beginPath()
          ctx.moveTo(start.x, start.y)
          ctx.lineTo(end.x, end.y)
          ctx.stroke()

          // Draw the arrow head
          ctx.beginPath()
          ctx.moveTo(end.x, end.y)
          ctx.lineTo(
            end.x - headLength * Math.cos(angle - Math.PI / 6),
            end.y - headLength * Math.sin(angle - Math.PI / 6),
          )
          ctx.lineTo(
            end.x - headLength * Math.cos(angle + Math.PI / 6),
            end.y - headLength * Math.sin(angle + Math.PI / 6),
          )
          ctx.closePath()
          ctx.fill()
        }
        break

      case "fibonacciretracement":
        if (points.length >= 2) {
          const [start, end] = points
          const height = end.y - start.y
          const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

          // Draw the main line
          ctx.beginPath()
          ctx.moveTo(start.x, start.y)
          ctx.lineTo(end.x, end.y)
          ctx.stroke()

          // Draw horizontal lines at Fibonacci levels
          levels.forEach((level) => {
            const y = start.y + height * level
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.setLineDash([2, 2])
            ctx.stroke()
            ctx.setLineDash([])

            // Add level text
            ctx.font = "10px sans-serif"
            ctx.fillStyle = color
            ctx.fillText(`${(level * 100).toFixed(1)}%`, 5, y - 5)
          })
        }
        break

      default:
        break
    }
  }

  // Handle mouse down event
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on an existing drawing
    const clickedDrawing = drawings.find((drawing) => isPointInDrawing(drawing, { x, y }))

    if (tool === "cursor" && clickedDrawing) {
      setSelectedDrawing(clickedDrawing.id)
      setDragStart({ x, y })
      return
    }

    // Start a new drawing
    setIsDrawing(true)
    const newDrawing: Drawing = {
      id: Date.now().toString(),
      type: tool,
      points: [{ x, y }],
      color,
      lineWidth,
    }

    if (tool === "text") {
      setTextPosition({ x, y })
      setTextInput("")
      return
    }

    setCurrentDrawing(newDrawing)
  }

  // Check if a point is inside a drawing
  const isPointInDrawing = (drawing: Drawing, point: Point): boolean => {
    const { type, points } = drawing

    switch (type) {
      case "trendline":
        if (points.length < 2) return false
        return isPointNearLine(points[0], points[1], point, 5)

      case "horizontalline":
        if (points.length < 1) return false
        return Math.abs(point.y - points[0].y) < 5

      case "rectangle":
        if (points.length < 2) return false
        const [start, end] = points
        return (
          point.x >= Math.min(start.x, end.x) &&
          point.x <= Math.max(start.x, end.x) &&
          point.y >= Math.min(start.y, end.y) &&
          point.y <= Math.max(start.y, end.y)
        )

      case "circle":
        if (points.length < 2) return false
        const [center, edge] = points
        const radius = Math.sqrt(Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2))
        const distance = Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2))
        return Math.abs(distance - radius) < 5

      case "text":
        if (points.length < 1) return false
        return (
          point.x >= points[0].x &&
          point.x <= points[0].x + 100 && // Approximate text width
          point.y >= points[0].y - 20 && // Approximate text height
          point.y <= points[0].y
        )

      default:
        return false
    }
  }

  // Check if a point is near a line
  const isPointNearLine = (lineStart: Point, lineEnd: Point, point: Point, threshold: number): boolean => {
    const A = point.x - lineStart.x
    const B = point.y - lineStart.y
    const C = lineEnd.x - lineStart.x
    const D = lineEnd.y - lineStart.y

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) param = dot / lenSq

    let xx, yy

    if (param < 0) {
      xx = lineStart.x
      yy = lineStart.y
    } else if (param > 1) {
      xx = lineEnd.x
      yy = lineEnd.y
    } else {
      xx = lineStart.x + param * C
      yy = lineStart.y + param * D
    }

    const dx = point.x - xx
    const dy = point.y - yy
    const distance = Math.sqrt(dx * dx + dy * dy)

    return distance < threshold
  }

  // Handle mouse move event
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Update current drawing
    if (isDrawing && currentDrawing) {
      const updatedDrawing = { ...currentDrawing }

      switch (currentDrawing.type) {
        case "trendline":
        case "rectangle":
        case "circle":
        case "arrow":
        case "fibonacciretracement":
          if (updatedDrawing.points.length === 1) {
            updatedDrawing.points.push({ x, y })
          } else {
            updatedDrawing.points[1] = { x, y }
          }
          break

        case "horizontalline":
          updatedDrawing.points[0] = { x: updatedDrawing.points[0].x, y }
          break

        default:
          break
      }

      setCurrentDrawing(updatedDrawing)
    }

    // Move selected drawing
    if (selectedDrawing && dragStart) {
      const dx = x - dragStart.x
      const dy = y - dragStart.y

      setDrawings(
        drawings.map((drawing) => {
          if (drawing.id === selectedDrawing) {
            return {
              ...drawing,
              points: drawing.points.map((point) => ({
                x: point.x + dx,
                y: point.y + dy,
              })),
            }
          }
          return drawing
        }),
      )

      setDragStart({ x, y })
    }
  }

  // Handle mouse up event
  const handleMouseUp = () => {
    if (isDrawing && currentDrawing) {
      if (tool === "text") {
        // Don't save text drawing yet, wait for text input
        return
      }

      // Save the current drawing
      setDrawings([...drawings, currentDrawing])
      setCurrentDrawing(null)
    }

    setIsDrawing(false)
    setSelectedDrawing(null)
    setDragStart(null)
  }

  // Handle key press for text input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (tool === "text" && textPosition) {
      if (e.key === "Enter") {
        // Save text drawing
        const newDrawing: Drawing = {
          id: Date.now().toString(),
          type: "text",
          points: [textPosition],
          color,
          lineWidth,
          text: textInput || "Text",
        }
        setDrawings([...drawings, newDrawing])
        setTextPosition(null)
        setTextInput("")
      } else if (e.key === "Escape") {
        setTextPosition(null)
        setTextInput("")
      }
    }
  }

  // Handle text input change
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value)
  }

  return (
    <div className="absolute inset-0" onKeyDown={handleKeyPress} tabIndex={0}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-crosshair"
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {textPosition && tool === "text" && (
        <input
          type="text"
          className="absolute z-20 bg-transparent text-transparent"
          style={{
            left: textPosition.x,
            top: textPosition.y - 20,
            width: "200px",
            caretColor: color,
          }}
          value={textInput}
          onChange={handleTextInputChange}
          autoFocus
          placeholder="Enter text..."
        />
      )}
    </div>
  )
}
