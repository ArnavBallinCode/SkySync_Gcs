"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AttitudeIndicator } from "@/components/attitude-indicator"

export default function Dashboard2Page() {
  const [data, setData] = useState<any>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attitude = await fetch('/params/attitude.json?t=' + Date.now())
          .then(r => r.ok ? r.json() : null).catch(() => null)
        
        setData({ attitude })
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard2 Test</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-cyan-400">Attitude Indicator Test</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <AttitudeIndicator
                roll={data.attitude?.roll || 0}
                pitch={data.attitude?.pitch || 0}
                size={180}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
