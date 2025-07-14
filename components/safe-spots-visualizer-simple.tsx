"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SafeSpotsVisualizerProps {
  currentPosition?: { x: number; y: number }
  width?: number
  height?: number
}

export function SafeSpotsVisualizer({ currentPosition, width = 480, height = 280 }: SafeSpotsVisualizerProps) {
  const [detectedSpots, setDetectedSpots] = useState(0)
  const [arenaCorners, setArenaCorners] = useState(4)

  return (
    <div className="w-full">
      {/* Status Bar */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="text-slate-400">
            Arena: <span className="text-green-400 font-mono">{arenaCorners} corners</span>
          </div>
          <div className="text-slate-400">
            Safe Spots: <span className="text-green-400 font-mono">{detectedSpots} detected</span>
          </div>
        </div>
        <div className="text-xs text-slate-400">9m × 12m Competition Arena</div>
      </div>

      {/* Arena Visualization */}
      <div className="relative bg-slate-900 rounded border border-slate-700" style={{ width, height }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="absolute inset-0">
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Arena Boundary */}
          <rect
            x={width * 0.15}
            y={height * 0.15}
            width={width * 0.7}
            height={height * 0.7}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2"
            strokeDasharray="8,4"
            className="animate-pulse"
          />

          {/* Arena Corner Markers */}
          {[
            { x: width * 0.15, y: height * 0.15 },
            { x: width * 0.85, y: height * 0.15 },
            { x: width * 0.85, y: height * 0.85 },
            { x: width * 0.15, y: height * 0.85 }
          ].map((corner, i) => (
            <g key={i}>
              <circle cx={corner.x} cy={corner.y} r="4" fill="#0ea5e9" />
              <text
                x={corner.x + 8}
                y={corner.y - 8}
                fill="#0ea5e9"
                fontSize="10"
                className="font-mono"
              >
                C{i + 1}
              </text>
            </g>
          ))}

          {/* Center Lines */}
          <line
            x1={width * 0.15}
            y1={height * 0.5}
            x2={width * 0.85}
            y2={height * 0.5}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <line
            x1={width * 0.5}
            y1={height * 0.15}
            x2={width * 0.5}
            y2={height * 0.85}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          {/* Current Position */}
          {currentPosition && (
            <g>
              <circle
                cx={Math.max(20, Math.min(width - 20, currentPosition.x))}
                cy={Math.max(20, Math.min(height - 20, currentPosition.y))}
                r="6"
                fill="#10b981"
                stroke="#065f46"
                strokeWidth="2"
                className="animate-pulse"
              />
              <text
                x={Math.max(20, Math.min(width - 20, currentPosition.x)) + 10}
                y={Math.max(20, Math.min(height - 20, currentPosition.y)) - 10}
                fill="#10b981"
                fontSize="10"
                className="font-mono"
              >
                DRONE
              </text>
            </g>
          )}

          {/* Safe Spots (placeholder) */}
          <circle cx={width * 0.3} cy={height * 0.3} r="8" fill="#f59e0b" opacity="0.7" />
          <circle cx={width * 0.7} cy={height * 0.7} r="8" fill="#f59e0b" opacity="0.7" />

          {/* Coordinate Labels */}
          <text x={width * 0.1} y={height * 0.5} fill="#64748b" fontSize="10" className="font-mono">Y</text>
          <text x={width * 0.5} y={height * 0.95} fill="#64748b" fontSize="10" className="font-mono">X</text>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
            <span className="text-slate-400">Arena Corners</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-400">Current Position</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-slate-400">Safe Landing Spots</span>
          </div>
        </div>
      </div>
    </div>
  )
}
