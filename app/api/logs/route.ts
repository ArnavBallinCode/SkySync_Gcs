import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const LOG_PATH = path.join(process.cwd(), 'mav.log')

interface ParsedLog {
  timestamp: string
  type: string
  message: string
  level: 'info' | 'warning' | 'error' | 'success'
}

function parseLogLine(line: string): ParsedLog | null {
  // Skip empty lines
  if (!line.trim()) return null

  // Try to extract timestamp if it exists (assumes format like "2023-05-26 10:30:45")
  const timestampMatch = line.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)
  const timestamp = timestampMatch ? timestampMatch[0] : new Date().toISOString()

  // Determine message type and level
  let type = 'INFO'
  let level: 'info' | 'warning' | 'error' | 'success' = 'info'

  if (line.includes('ERROR')) {
    type = 'ERROR'
    level = 'error'
  } else if (line.includes('WARNING')) {
    type = 'WARNING'
    level = 'warning'
  } else if (line.includes('HEARTBEAT')) {
    type = 'HEARTBEAT'
    level = 'success'
  } else if (line.includes('COMMAND')) {
    type = 'COMMAND'
    level = 'info'
  } else if (line.includes('STATUSTEXT')) {
    type = 'STATUS'
    level = 'info'
  }

  // Clean up the message
  let message = line
    .replace(timestampMatch?.[0] || '', '')
    .trim()
    .replace(/^\[(.*?)\]/, '') // Remove bracketed prefixes
    .trim()

  return {
    timestamp,
    type,
    message,
    level
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(LOG_PATH)) {
      return NextResponse.json({
        logs: []
      })
    }

    const data = fs.readFileSync(LOG_PATH, 'utf8')
    const lines = data.split('\n')
    const lastLines = lines.slice(-1000) // Get last 1000 lines

    const parsedLogs = lastLines
      .map(parseLogLine)
      .filter((log): log is ParsedLog => log !== null)
      // Filter out noise and duplicates
      .filter((log, index, self) => 
        // Keep only interesting messages
        (log.message.includes('HEARTBEAT') ||
         log.message.includes('STATUSTEXT') ||
         log.message.includes('COMMAND') ||
         log.message.includes('ERROR') ||
         log.message.includes('WARNING')) &&
        // Remove duplicates within a short time window
        index === self.findIndex(t => 
          t.message === log.message && 
          Math.abs(new Date(t.timestamp).getTime() - new Date(log.timestamp).getTime()) < 1000
        )
      )

    return NextResponse.json({
      logs: parsedLogs
    })
  } catch (e: any) {
    console.error("Error reading log file:", e)
    return NextResponse.json({ logs: [] })
  }
}
