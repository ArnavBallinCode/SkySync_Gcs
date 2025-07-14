"use client"

import { useEffect, useRef } from "react"

interface RangefinderGraphProps {
  distance: number // in meters
  maxRange?: number // maximum range in meters
  width?: number
  height?: number
}

export function RangefinderGraph({ distance, maxRange = 10, width = 300, height = 150 }: RangefinderGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = '#e9ecef'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw range zones
    const safeZone = Math.min(maxRange * 0.3, 3) // Safe zone: 0-30% of max range or 3m
    const warningZone = Math.min(maxRange * 0.6, 6) // Warning zone: 30-60% of max range or 6m

    // Safe zone (green)
    const safeWidth = (safeZone / maxRange) * width
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'
    ctx.fillRect(0, 0, safeWidth, height)

    // Warning zone (yellow)
    const warningWidth = (warningZone / maxRange) * width
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'
    ctx.fillRect(safeWidth, 0, warningWidth - safeWidth, height)

    // Danger zone (red)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
    ctx.fillRect(warningWidth, 0, width - warningWidth, height)

    // Draw distance bar
    const distanceWidth = Math.min((distance / maxRange) * width, width)
    let barColor = '#ef4444' // red by default
    if (distance <= safeZone) {
      barColor = '#22c55e' // green
    } else if (distance <= warningZone) {
      barColor = '#f59e0b' // yellow
    }

    ctx.fillStyle = barColor
    ctx.fillRect(0, height - 40, distanceWidth, 40)

    // Draw scale labels
    ctx.fillStyle = '#374151'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 5; i++) {
      const x = (i / 5) * width
      const value = (i / 5) * maxRange
      ctx.fillText(value.toFixed(1) + 'm', x, height - 5)
    }

    // Draw current distance value
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Distance: ${distance.toFixed(2)}m`, 10, 25)

    // Draw current distance indicator line
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(distanceWidth, 0)
    ctx.lineTo(distanceWidth, height - 45)
    ctx.stroke()

  }, [distance, maxRange, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border rounded-lg bg-white"
    />
  )
}
