"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Enhanced3DView } from "@/components/enhanced-3d-view"
import { AttitudeIndicator } from "@/components/attitude-indicator"
import { RangefinderGraph } from "@/components/rangefinder-graph"
import { SafeSpotsVisualizer } from "@/components/safe-spots-visualizer-simple"

interface TelemetryData {
  heartbeat?: { mavlink_version: number; autopilot: number; base_mode: number; custom_mode: number; system_status: number }
  battery?: { voltage: number; current: number; remaining: number; temperature: number }
  attitude?: { roll: number; pitch: number; yaw: number; rollspeed: number; pitchspeed: number; yawspeed: number }
  position?: {
    local: { x: number; y: number; z: number; vx: number; vy: number; vz: number }
    global: { lat: number; lon: number; alt: number; relative_alt: number }
  }
  rangefinder?: { distance: number; voltage: number }
  distanceSensor?: { time_boot_ms: number; min_distance: number; max_distance: number; current_distance: number; type: number; id: number; orientation: number; covariance: number }
  imu?: { xacc: number; yacc: number; zacc: number; xgyro: number; ygyro: number; zgyro: number }
  scaledImu?: { time_boot_ms: number; xacc: number; yacc: number; zacc: number; xgyro: number; ygyro: number; zgyro: number; xmag: number; ymag: number; zmag: number }
  ahrs?: { omegaIx: number; omegaIy: number; omegaIz: number; accel_weight: number; renorm_val: number; error_rp: number; error_yaw: number }
  ahrs2?: { roll: number; pitch: number; yaw: number; altitude: number; lat: number; lng: number }
  sysStatus?: { onboard_control_sensors_present: number; onboard_control_sensors_enabled: number; onboard_control_sensors_health: number; load: number; voltage_battery: number; current_battery: number; battery_remaining: number; drop_rate_comm: number; errors_comm: number }
  safeSpots?: Array<{ lat: number; lon: number; name: string }>
}

export default function Dashboard2Page() {
  const [data, setData] = useState<TelemetryData>({})
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown')

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [heartbeat, battery, attitude, localPos, globalPos, rangefinder, distanceSensor, rawImu, scaledImu, ahrs, ahrs2, sysStatus, safeSpots] = await Promise.all([
          fetch('/params/HEARTBEAT.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/BATTERY_STATUS.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/ATTITUDE.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/LOCAL_POSITION_NED.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/GLOBAL_POSITION_INT.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/RANGEFINDER.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/DISTANCE_SENSOR.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/RAW_IMU.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/SCALED_IMU2.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/AHRS.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/AHRS2.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/params/SYS_STATUS.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/safe-spots-data.json?t=' + Date.now()).then(r => r.ok ? r.json() : []).catch(() => [])
        ])

        setData({
          heartbeat,
          battery: battery ? {
            voltage: battery.voltages?.[0] ? battery.voltages[0] / 1000 : 0,
            current: battery.current_battery || 0,
            remaining: battery.battery_remaining >= 0 ? battery.battery_remaining : 0,
            temperature: battery.temperature || 0
          } : undefined,
          attitude,
          position: {
            local: localPos || { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
            global: globalPos ? {
              lat: globalPos.lat / 1e7,
              lon: globalPos.lon / 1e7,
              alt: globalPos.alt / 1000,
              relative_alt: globalPos.relative_alt / 1000
            } : { lat: 0, lon: 0, alt: 0, relative_alt: 0 }
          },
          rangefinder,
          distanceSensor,
          imu: rawImu,
          scaledImu,
          ahrs,
          ahrs2,
          sysStatus,
          safeSpots
        })

        setConnectionStatus(heartbeat ? 'connected' : 'disconnected')
      } catch (error) {
        setConnectionStatus('disconnected')
      }
    }

    fetchAllData()
    const interval = setInterval(fetchAllData, 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-red-500'
      default: return 'bg-yellow-500'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {/* Top Status Bar */}
      <div className="mb-4 flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold text-cyan-400">FLIGHT CONTROL SYSTEM</div>
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'} className="bg-green-600">
            {connectionStatus === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-400">Real-time Telemetry</div>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            REFRESH
          </Button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">

        {/* Left Column - Flight Instruments */}
        <div className="col-span-3 space-y-4">

          {/* Attitude Indicator */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-cyan-400">ATTITUDE INDICATOR</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <AttitudeIndicator
                roll={data.attitude?.roll || 0}
                pitch={data.attitude?.pitch || 0}
                size={180}
              />
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs w-full">
                <div className="text-center">
                  <div className="text-slate-400">ROLL</div>
                  <div className="font-mono text-green-400">
                    {data.attitude?.roll ? `${(data.attitude.roll * 180 / Math.PI).toFixed(1)}°` : "N/A"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">PITCH</div>
                  <div className="font-mono text-green-400">
                    {data.attitude?.pitch ? `${(data.attitude.pitch * 180 / Math.PI).toFixed(1)}°` : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Battery Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-cyan-400">POWER SYSTEM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">VOLTAGE</span>
                <span className="text-sm font-mono text-green-400">
                  {data.battery?.voltage ? `${data.battery.voltage.toFixed(1)}V` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">CURRENT</span>
                <span className="text-sm font-mono text-green-400">
                  {data.battery?.current ? `${data.battery.current.toFixed(1)}A` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">REMAINING</span>
                <span className="text-sm font-mono text-green-400">
                  {data.battery?.remaining ? `${data.battery.remaining}%` : "N/A"}
                </span>
              </div>
              <Progress
                value={data.battery?.remaining || 0}
                className="h-2 bg-slate-700"
              />
            </CardContent>
          </Card>

          {/* Rangefinder */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-cyan-400">ALTITUDE SENSOR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-2">
                <div className="text-2xl font-mono text-green-400">
                  {data.rangefinder?.distance ? `${data.rangefinder.distance.toFixed(2)}m` : "N/A"}
                </div>
                <div className="text-xs text-slate-400">GROUND DISTANCE</div>
              </div>
              <div className="h-20 bg-slate-900 rounded border border-slate-700 flex items-center justify-center">
                <div className="text-slate-400 text-xs">Rangefinder Graph Loading...</div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Center Column - Position & Velocity */}
        <div className="col-span-3 space-y-4">

          {/* Position Data */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-cyan-400">POSITION (NED)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">X (NORTH)</span>
                  <span className="font-mono text-green-400">
                    {data.position?.local.x ? `${data.position.local.x.toFixed(2)}m` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">Y (EAST)</span>
                  <span className="font-mono text-green-400">
                    {data.position?.local.y ? `${data.position.local.y.toFixed(2)}m` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">Z (DOWN)</span>
                  <span className="font-mono text-green-400">
                    {data.position?.local.z ? `${data.position.local.z.toFixed(2)}m` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">GPS LAT</span>
                  <span className="font-mono text-green-400">
                    {data.position?.global.lat ? data.position.global.lat.toFixed(6) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">GPS LON</span>
                  <span className="font-mono text-green-400">
                    {data.position?.global.lon ? data.position.global.lon.toFixed(6) : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Velocity Data */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-cyan-400">VELOCITY (NED)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">VX (NORTH)</span>
                  <span className="font-mono text-green-400">
                    {data.position?.local.vx ? `${data.position.local.vx.toFixed(2)}m/s` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">VY (EAST)</span>
                  <span className="font-mono text-green-400">
                    {data.position?.local.vy ? `${data.position.local.vy.toFixed(2)}m/s` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">VZ (DOWN)</span>
                  <span className="font-mono text-green-400">
                    {data.position?.local.vz ? `${(-data.position.local.vz).toFixed(2)}m/s` : "N/A"}
                  </span>
                </div>
              </div>

              {/* Speed indicator */}
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="text-center">
                  <div className="text-slate-400 text-xs">GROUND SPEED</div>
                  <div className="text-lg font-mono text-green-400">
                    {data.position?.local.vx && data.position?.local.vy ?
                      `${Math.sqrt(data.position.local.vx ** 2 + data.position.local.vy ** 2).toFixed(2)}m/s` : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-cyan-400">SYSTEM STATUS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">FLIGHT MODE</span>
                  <span className="font-mono text-green-400">
                    {data.heartbeat?.custom_mode ? `${data.heartbeat.custom_mode}` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                  <span className="text-slate-400">GPS STATUS</span>
                  <span className="font-mono text-green-400">
                    {data.position?.global.lat !== 0 ? 'ACTIVE' : 'NO FIX'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">ALTITUDE</span>
                  <span className="font-mono text-green-400">
                    {data.position?.global.relative_alt ? `${data.position.global.relative_alt.toFixed(1)}m` : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Visualizations */}
        <div className="col-span-6 space-y-4">

          {/* Safe Spots Arena */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-cyan-400">COMPETITION ARENA & SAFE SPOTS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-slate-900 rounded border border-slate-700 flex items-center justify-center">
                <div className="text-slate-400">Safe Spots Visualizer Loading...</div>
              </div>
            </CardContent>
          </Card>

          {/* 3D Visualization */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-cyan-400">3D FLIGHT VISUALIZATION</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-slate-900 rounded border border-slate-700 flex items-center justify-center">
                <div className="text-slate-400">3D View Loading...</div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}
