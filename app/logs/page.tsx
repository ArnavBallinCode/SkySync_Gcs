"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface Log {
  timestamp: string
  type: string
  message: string
  level: 'info' | 'warning' | 'error' | 'success'
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/logs")
        const data = await res.json()
        setLogs(data.logs)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching logs:", error)
      }
    }, 1000) // refresh every second

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const getLogColor = (level: Log['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      case 'success':
        return 'text-green-400'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">MAVProxy Logs</h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>Auto-scroll</span>
          </label>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="bg-gray-900 text-gray-100 font-mono text-sm rounded-lg p-4 h-[75vh] overflow-auto border border-gray-700 shadow-lg"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="animate-pulse">Loading logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No logs available. Make sure MAVProxy is running with --log=mav.log
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start space-x-2 hover:bg-gray-800/50 px-2 py-1 rounded transition-colors",
                  getLogColor(log.level)
                )}
              >
                <span className="text-gray-500 min-w-[160px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="min-w-[80px] font-semibold">[{log.type}]</span>
                <span className="flex-1 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
