"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SafeSpot {
  id: string
  lat: number
  lng: number
}

interface JetsonData {
  arena: { lat: number; lng: number }[]
  safeSpots: SafeSpot[]
  timestamp: string
  status: 'success' | 'error'
}

interface SafeSpotsVisualizerProps {
  currentPosition?: { x: number; y: number }
  width?: number
  height?: number
}

export function SafeSpotsVisualizer({ currentPosition, width = 400, height = 300 }: SafeSpotsVisualizerProps) {
  const [jetsonData, setJetsonData] = useState<JetsonData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dronePosition, setDronePosition] = useState({ x: 4.5, y: 6 })
  const [detectedSpots, setDetectedSpots] = useState<string[]>([])

  const DETECTION_THRESHOLD = 0.5

  // Calculate distance between two points
  const calculateDistance = (pos1: { x: number, y: number }, pos2: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
  }

  // Convert GPS coordinates to field coordinates
  const gpsToFieldCoords = (gpsCoords: { lat: number, lng: number }, arena: { lat: number; lng: number }[]): { x: number, y: number } => {
    if (arena.length < 4) {
      return {
        x: Math.max(0, Math.min(9, (gpsCoords.lat - 12.03) * 1000)),
        y: Math.max(0, Math.min(12, (gpsCoords.lng - 77.12) * 1000))
      }
    }

    const minLat = Math.min(...arena.map(c => c.lat))
    const maxLat = Math.max(...arena.map(c => c.lat))
    const minLng = Math.min(...arena.map(c => c.lng))
    const maxLng = Math.max(...arena.map(c => c.lng))

    const normalizedX = (gpsCoords.lng - minLng) / (maxLng - minLng)
    const normalizedY = (gpsCoords.lat - minLat) / (maxLat - minLat)

    return {
      x: Math.max(0, Math.min(9, normalizedX * 9)),
      y: Math.max(0, Math.min(12, normalizedY * 12))
    }
  }

  // Fetch real telemetry data for drone position
  useEffect(() => {
    const fetchDronePosition = async () => {
      try {
        const localResponse = await fetch(`/params/local_position_ned.json?t=${Date.now()}`)
        if (localResponse.ok) {
          const localData = await localResponse.json()
          if (localData && typeof localData.x === 'number' && typeof localData.y === 'number') {
            const fieldX = Math.max(0, Math.min(9, localData.x * 0.5 + 4.5))
            const fieldY = Math.max(0, Math.min(12, localData.y * 0.5 + 6))
            setDronePosition({ x: fieldX, y: fieldY })
            return
          }
        }

        const globalResponse = await fetch(`/params/global_position_int.json?t=${Date.now()}`)
        if (globalResponse.ok) {
          const globalData = await globalResponse.json()
          if (globalData && (globalData.lat !== 0 || globalData.lon !== 0)) {
            if (jetsonData?.arena && jetsonData.arena.length >= 4) {
              const gpsPos = { lat: globalData.lat / 1e7, lng: globalData.lon / 1e7 }
              const fieldPos = gpsToFieldCoords(gpsPos, jetsonData.arena)
              setDronePosition(fieldPos)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching drone position:', error)
      }
    }

    fetchDronePosition()
    const interval = setInterval(fetchDronePosition, 1000)
    return () => clearInterval(interval)
  }, [jetsonData])

  // Fetch Jetson data
  useEffect(() => {
    const fetchJetsonData = async () => {
      try {
        const response = await fetch('/api/jetson-data', {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })

        if (response.ok) {
          const data: JetsonData = await response.json()
          setJetsonData(data)
        }
      } catch (error) {
        console.error('Error fetching Jetson data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJetsonData()
    const interval = setInterval(fetchJetsonData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Check for safe spot detection
  useEffect(() => {
    if (!jetsonData?.safeSpots) return

    jetsonData.safeSpots.forEach(spot => {
      const spotFieldCoords = gpsToFieldCoords(spot, jetsonData.arena)
      const distance = calculateDistance(dronePosition, spotFieldCoords)

      if (distance <= DETECTION_THRESHOLD && !detectedSpots.includes(spot.id)) {
        setDetectedSpots(prev => [...prev, spot.id])
      }
    })
  }, [dronePosition, jetsonData, detectedSpots])

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-blue-600">LIVE ARENA & SAFE SPOTS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading safe spots...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="text-blue-600">LIVE ARENA & SAFE SPOTS</CardTitle>
        <div className="text-sm text-slate-500">
          Arena: 9×12m • Safe Spots: {jetsonData?.safeSpots?.length || 0} detected • Found: {detectedSpots.length}/3
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-[3/4] relative bg-blue-50 border border-slate-200 rounded-lg overflow-hidden">
          <svg width="100%" height="100%" viewBox="-1 -1 11 14" className="absolute inset-0" preserveAspectRatio="xMidYMid meet">
            {/* Clipping definition */}
            <defs>
              <clipPath id="miniFieldClip">
                <rect x="-1" y="-1" width="11" height="14" />
              </clipPath>
            </defs>

            {/* Expanded field boundary */}
            <rect x="-1" y="-1" width="11" height="14" className="fill-blue-50" stroke="#cbd5e1" strokeWidth="0.1" />

            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <line key={`v${i}`} x1={i} y1="-1" x2={i} y2="13" className="stroke-slate-300" strokeWidth="0.02" />
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => (
              <line key={`h${i}`} x1="-1" y1={i} x2="10" y2={i} className="stroke-slate-300" strokeWidth="0.02" />
            ))}

            <g clipPath="url(#miniFieldClip)">
              {/* Competition Arena Boundary */}
              <rect
                x="0"
                y="0"
                width="9"
                height="12"
                fill="rgba(56,189,248,0.08)"
                stroke="#0ea5e9"
                strokeWidth="0.15"
                strokeDasharray="0.3,0.1"
              />

              {/* Arena corners */}
              {[[0, 0], [9, 0], [9, 12], [0, 12]].map(([x, y], index) => (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="0.15"
                fill="#0ea5e9"
                stroke="#fff"
                strokeWidth="0.03"
                />
              ))}

              {/* Safe spots from Jetson */}
              {jetsonData?.safeSpots?.map(spot => {
                const spotCoords = gpsToFieldCoords(spot, jetsonData.arena)
                const isDetected = detectedSpots.includes(spot.id)
                const isOutsideArena = spotCoords.x < 0 || spotCoords.x > 9 || spotCoords.y < 0 || spotCoords.y > 12

                return (
                  <g key={spot.id}>
                    {/* Detection radius circle */}
                    <circle
                      cx={spotCoords.x}
                      cy={12 - spotCoords.y}
                      r={DETECTION_THRESHOLD}
                      fill={isDetected ? "rgba(0,255,0,0.2)" : "rgba(0,102,204,0.1)"}
                      stroke={isDetected ? "#00ff00" : "#0066cc"}
                      strokeWidth="0.03"
                      strokeDasharray="0.1,0.1"
                      opacity={isOutsideArena ? 0.5 : 1}
                    >
                      {isDetected && (
                        <animate attributeName="r" values={`${DETECTION_THRESHOLD};${DETECTION_THRESHOLD * 1.5};${DETECTION_THRESHOLD}`} dur="2s" repeatCount="indefinite" />
                      )}
                    </circle>

                    {/* Safe spot marker */}
                    <rect
                      x={spotCoords.x - 0.15}
                      y={12 - spotCoords.y - 0.15}
                      width="0.3"
                      height="0.3"
                      fill={isDetected ? "#22c55e" : "#2563eb"}
                      stroke="#fff"
                      strokeWidth="0.02"
                      opacity={isOutsideArena ? 0.5 : 1}
                    />

                    {/* Spot label */}
                    <text
                      x={spotCoords.x}
                      y={12 - spotCoords.y + 0.5}
                      textAnchor="middle"
                      fontSize="0.2"
                      className="fill-slate-800"
                      fontWeight="bold"
                      opacity={isOutsideArena ? 0.5 : 1}
                    >
                      {spot.id}
                    </text>
                  </g>
                )
              })}

              {/* Current drone position */}
              <g>
                <circle
                  cx={dronePosition.x}
                  cy={12 - dronePosition.y}
                  r="0.25"
                  fill="rgba(59,130,246,0.25)"
                  stroke="none"
                />
                <circle
                  cx={dronePosition.x}
                  cy={12 - dronePosition.y}
                  r="0.15"
                  fill="#2563eb"
                  stroke="#fff"
                  strokeWidth="0.03"
                />
                <circle
                  cx={dronePosition.x}
                  cy={12 - dronePosition.y}
                  r="0.06"
                  fill="#facc15"
                  stroke="#fff"
                  strokeWidth="0.015"
                />

                {/* Pulse animation */}
                <circle
                  cx={dronePosition.x}
                  cy={12 - dronePosition.y}
                  r="0.2"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="0.02"
                  opacity="0.6"
                >
                  <animate attributeName="r" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            </g>

            {/* Title */}
            <text x="4.5" y="0.4" textAnchor="middle" fontSize="0.2" className="fill-blue-500">
              Competition Arena: 9×12m
            </text>

            {/* Mission Complete Banner */}
            {detectedSpots.length === 3 && (
              <>
                <rect x="1.5" y="5.5" width="6" height="1.5" fill="#bbf7d0" stroke="#22c55e" strokeWidth="0.05" rx="0.1" />
                <text x="4.5" y="6.2" textAnchor="middle" fontSize="0.25" fill="#166534" fontWeight="bold">
                  MISSION COMPLETE!
                </text>
                <text x="4.5" y="6.5" textAnchor="middle" fontSize="0.15" fill="#166534">
                  All Safe Spots Found
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Mini status */}
        <div className="mt-2 flex justify-between items-center text-xs">
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-sm opacity-70"></div>
              <span className="text-slate-600">Safe Spots</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-slate-600">Drone</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-sm opacity-70"></div>
              <span className="text-slate-600">Detected</span>
            </div>
          </div>
          <div className="font-mono text-slate-600">
            {dronePosition.x.toFixed(1)}m, {dronePosition.y.toFixed(1)}m
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
