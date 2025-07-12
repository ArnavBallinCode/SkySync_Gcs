"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RangefinderData {
  mavpackettype: string
  distance: number
  voltage: number
}

export function RangefinderData() {
  const [data, setData] = useState<RangefinderData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/params/RANGEFINDER.json?t=" + Date.now())
        if (!res.ok) throw new Error("Failed to fetch rangefinder data")
        const json = await res.json()
        setData(json)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {error && <div className="text-red-500">{error}</div>}
      {data ? (
        <>
          <div className="text-2xl font-bold">{data.distance.toFixed(2)} m</div>
          <div className="text-sm text-muted-foreground">Distance</div>
          <div className="mt-2 text-lg">Voltage: <span className="font-mono">{data.voltage.toFixed(2)} V</span></div>
        </>
      ) : (
        <div className="text-muted-foreground">Loading...</div>
      )}
    </div>
  )
}
