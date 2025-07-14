"use client"

import { useEffect, useState } from "react"

interface AttitudeData {
  roll: number
  pitch: number
  yaw: number
  rollspeed: number
  pitchspeed: number
  yawspeed: number
}

interface AttitudeIndicatorProps {
  data?: {
    roll: number
    pitch: number
    yaw: number
    rollspeed: number
    pitchspeed: number
    yawspeed: number
  }
  roll?: number
  pitch?: number
  yaw?: number
  size?: number
  width?: number
  height?: number
}

export function AttitudeIndicator({ 
  data, 
  roll, 
  pitch, 
  yaw, 
  size = 200, 
  width = 200, 
  height = 200 
}: AttitudeIndicatorProps) {
  const [attitude, setAttitude] = useState({
    roll: 0,
    pitch: 0,
    yaw: 0,
    rollspeed: 0,
    pitchspeed: 0,
    yawspeed: 0
  })

  useEffect(() => {
    if (data) {
      setAttitude(data)
    } else {
      // Use individual props if data object not provided
      setAttitude({
        roll: roll || 0,
        pitch: pitch || 0,
        yaw: yaw || 0,
        rollspeed: 0,
        pitchspeed: 0,
        yawspeed: 0
      })
    }
  }, [data, roll, pitch, yaw])

  // Convert radians to degrees
  const toDegrees = (radians: number) => (radians * 180) / Math.PI

  const rollDeg = toDegrees(attitude.roll)
  const pitchDeg = toDegrees(attitude.pitch)
  const yawDeg = toDegrees(attitude.yaw)

  const displaySize = size || width

  return (
    <div className="w-full">
      {/* Attitude Indicator */}
      <div className="relative bg-slate-900 rounded border border-slate-700 overflow-hidden mb-3">
        <svg width={displaySize} height={displaySize} viewBox="0 0 200 200" className="w-full h-full">
          {/* Background */}
          <rect width="200" height="200" fill="#0f172a" />
          
          {/* Artificial Horizon */}
          <g transform={`translate(100, 100)`}>
            {/* Sky/Ground background */}
            <g transform={`rotate(${rollDeg})`}>
              {/* Sky */}
              <rect 
                x="-150" 
                y={-150 + pitchDeg * 2} 
                width="300" 
                height="300" 
                fill="#1e40af" 
              />
              {/* Ground */}
              <rect 
                x="-150" 
                y={pitchDeg * 2} 
                width="300" 
                height="300" 
                fill="#92400e" 
              />
              {/* Horizon line */}
              <line 
                x1="-150" 
                y1={pitchDeg * 2} 
                x2="150" 
                y2={pitchDeg * 2} 
                stroke="#ffffff" 
                strokeWidth="2" 
              />
              
              {/* Pitch lines */}
              {[-30, -20, -10, 10, 20, 30].map(pitch => (
                <g key={pitch}>
                  <line 
                    x1="-20" 
                    y1={pitchDeg * 2 + pitch * 2} 
                    x2="20" 
                    y2={pitchDeg * 2 + pitch * 2} 
                    stroke="#ffffff" 
                    strokeWidth="1" 
                  />
                  <text 
                    x="25" 
                    y={pitchDeg * 2 + pitch * 2 + 5} 
                    fill="#ffffff" 
                    fontSize="10" 
                    textAnchor="start"
                  >
                    {pitch}°
                  </text>
                </g>
              ))}
            </g>
            
            {/* Fixed aircraft symbol */}
            <g>
              <circle cx="0" cy="0" r="3" fill="#00ff00" />
              <line x1="-30" y1="0" x2="-10" y2="0" stroke="#00ff00" strokeWidth="3" />
              <line x1="30" y1="0" x2="10" y2="0" stroke="#00ff00" strokeWidth="3" />
              <line x1="0" y1="10" x2="0" y2="30" stroke="#00ff00" strokeWidth="3" />
            </g>
            
            {/* Roll scale */}
            <g>
              <circle cx="0" cy="0" r="85" fill="none" stroke="#64748b" strokeWidth="1" />
              {[-60, -45, -30, -15, 0, 15, 30, 45, 60].map(angle => (
                <g key={angle} transform={`rotate(${angle})`}>
                  <line 
                    x1="0" 
                    y1="-85" 
                    x2="0" 
                    y2={angle % 30 === 0 ? -75 : -80} 
                    stroke="#64748b" 
                    strokeWidth="1" 
                  />
                  {angle % 30 === 0 && (
                    <text 
                      x="0" 
                      y="-65" 
                      fill="#64748b" 
                      fontSize="10" 
                      textAnchor="middle"
                    >
                      {Math.abs(angle)}
                    </text>
                  )}
                </g>
              ))}
              
              {/* Roll indicator */}
              <g transform={`rotate(${rollDeg})`}>
                <polygon 
                  points="0,-85 -5,-95 5,-95" 
                  fill="#00ff00" 
                  stroke="#000" 
                  strokeWidth="1" 
                />
              </g>
            </g>
          </g>
          
          {/* Frame */}
          <rect x="0" y="0" width="200" height="200" fill="none" stroke="#475569" strokeWidth="2" />
        </svg>
      </div>

      {/* Digital Readouts */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-800 rounded p-2 text-center">
          <div className="text-cyan-400 font-mono">ROLL</div>
          <div className="text-green-400 font-mono font-bold">
            {rollDeg.toFixed(1)}°
          </div>
        </div>
        <div className="bg-slate-800 rounded p-2 text-center">
          <div className="text-cyan-400 font-mono">PITCH</div>
          <div className="text-green-400 font-mono font-bold">
            {pitchDeg.toFixed(1)}°
          </div>
        </div>
        <div className="bg-slate-800 rounded p-2 text-center">
          <div className="text-cyan-400 font-mono">YAW</div>
          <div className="text-green-400 font-mono font-bold">
            {yawDeg.toFixed(1)}°
          </div>
        </div>
      </div>
    </div>
  )
}
