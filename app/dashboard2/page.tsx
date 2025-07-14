"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Activity, Compass, BarChart3, Clock, Settings } from 'lucide-react';

// Professional Flight Data Interface
interface FlightData {
  position: { x: number; y: number; z: number };
  velocity: { vx: number; vy: number; vz: number };
  attitude: { roll: number; pitch: number; yaw: number };
  battery: { voltage: number; current: number; percentage: number };
  rangefinder: { distance: number };
  gps: { lat: number; lon: number; alt: number; fix: number };
  system: { mode: string; armed: boolean; status: string };
}

// Arena visualization types
interface ArenaCorner {
  lat: number;
  lng: number;
}

interface SafeSpot {
  id: string;
  lat: number;
  lng: number;
}

interface JetsonData {
  arena: ArenaCorner[];
  safeSpots: SafeSpot[];
  timestamp: number;
}

interface Position {
  x: number;
  y: number;
}

// Constants for arena detection
const DETECTION_THRESHOLD = 1.0; // meters
const MAX_POSITION_HISTORY = 20;

// Professional Attitude Indicator Component
const AttitudeIndicator = ({ roll = 0, pitch = 0, yaw = 0 }: { roll?: number; pitch?: number; yaw?: number }) => {
  const rollDeg = roll * (180 / Math.PI);
  const pitchDeg = pitch * (180 / Math.PI);
  const yawDeg = yaw * (180 / Math.PI);

  return (
    <div className="bg-white p-2 rounded-lg border border-slate-200">
      <h3 className="text-black font-semibold mb-2 text-center text-base">ATTITUDE INDICATOR</h3>
      <div className="flex justify-center">
        <div className="relative w-36 h-36">
          <svg width="144" height="144" viewBox="0 0 192 192" className="absolute inset-0">
            {/* Outer ring */}
            <circle cx="96" cy="96" r="90" fill="none" stroke="#2c3650" strokeWidth="2" />

            {/* Sky/Ground background */}
            <defs>
              <clipPath id="attitudeClip">
                <circle cx="96" cy="96" r="85" />
              </clipPath>
            </defs>

            <g clipPath="url(#attitudeClip)">
              {/* Sky */}
              <rect x="0" y="0" width="192" height="96" fill="#2196f3"
                transform={`rotate(${rollDeg} 96 96)`} />
              {/* Ground */}
              <rect x="0" y="96" width="192" height="96" fill="#6d4c1b"
                transform={`rotate(${rollDeg} 96 96)`} />

              {/* Horizon line */}
              <line x1="20" y1={96 + pitchDeg * 1.5} x2="172" y2={96 + pitchDeg * 1.5}
                stroke="#FFF" strokeWidth="3" transform={`rotate(${rollDeg} 96 96)`} />

              {/* Pitch markers */}
              {[-30, -20, -10, 10, 20, 30].map(angle => (
                <g key={angle}>
                  <line x1="76" y1={96 + (angle - pitchDeg) * 1.5}
                    x2="116" y2={96 + (angle - pitchDeg) * 1.5}
                    stroke="#FFF" strokeWidth="1"
                    transform={`rotate(${rollDeg} 96 96)`} />
                  <text x="65" y={96 + (angle - pitchDeg) * 1.5 + 3}
                    fill="#FFF" fontSize="8" textAnchor="middle"
                    transform={`rotate(${rollDeg} 96 96)`}>
                    {angle}°
                  </text>
                </g>
              ))}
            </g>

            {/* Aircraft symbol */}
            <line x1="66" y1="96" x2="86" y2="96" stroke="#FBBF24" strokeWidth="4" />
            <line x1="106" y1="96" x2="126" y2="96" stroke="#FBBF24" strokeWidth="4" />
            <circle cx="96" cy="96" r="3" fill="#FBBF24" />

            {/* Roll scale */}
            <g>
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => {
                const radian = (angle * Math.PI) / 180;
                const x1 = 96 + 75 * Math.cos(radian - Math.PI / 2);
                const y1 = 96 + 75 * Math.sin(radian - Math.PI / 2);
                const x2 = 96 + 85 * Math.cos(radian - Math.PI / 2);
                const y2 = 96 + 85 * Math.sin(radian - Math.PI / 2);

                return (
                  <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#9CA3AF" strokeWidth={angle % 90 === 0 ? "2" : "1"} />
                );
              })}
            </g>

            {/* Roll pointer */}
            <polygon points="96,10 88,20 104,20" fill="#FBBF24" stroke="#000" strokeWidth="1"
              transform={`rotate(${rollDeg} 96 96)`} />
          </svg>
        </div>
      </div>

      {/* Digital readouts */}
      <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
        <div>
          <div className="text-black">ROLL</div>
          <div className="text-black font-mono font-bold">{rollDeg.toFixed(1)}°</div>
        </div>
        <div>
          <div className="text-black">PITCH</div>
          <div className="text-black font-mono font-bold">{pitchDeg.toFixed(1)}°</div>
        </div>
        <div>
          <div className="text-black">YAW</div>
          <div className="text-black font-mono font-bold">{yawDeg.toFixed(1)}°</div>
        </div>
      </div>
    </div>
  );
};

// 3D Visualization Component
const Visualization3D = ({ attitude }: { attitude: any }) => {
  // Heading in degrees
  const heading = ((attitude?.yaw || 0) * 180 / Math.PI) % 360;
  const normalizedHeading = heading < 0 ? heading + 360 : heading;
  const cardinal = ['N', 'E', 'S', 'W'];

  // For tick rendering, skip ticks behind letters
  const cardinalAngles = [0, 90, 180, 270];

  return (
    <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col items-center w-36 mx-auto">
      <h3 className="text-black font-semibold mb-2 text-center text-base">HEADING</h3>
      <div className="flex justify-center">
        <div className="relative w-36 h-36">
          <svg width="144" height="144" viewBox="0 0 144 144" className="absolute inset-0">
            {/* Compass background */}
            <circle cx="72" cy="72" r="68" fill="#18191b" stroke="#222" strokeWidth="2" />
            {/* Compass ticks and labels */}
            <g>
              {[...Array(36)].map((_, i) => {
                const angle = i * 10;
                if (cardinalAngles.includes(angle)) return null; // Don't draw tick behind letter
                const rad = (angle - 90) * Math.PI / 180;
                const x1 = 72 + 60 * Math.cos(rad);
                const y1 = 72 + 60 * Math.sin(rad);
                const x2 = 72 + (angle % 90 === 0 ? 48 : 56) * Math.cos(rad);
                const y2 = 72 + (angle % 90 === 0 ? 48 : 56) * Math.sin(rad);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={angle % 90 === 0 ? 3 : 2} />;
              })}
              {/* Cardinal direction labels - match attitude indicator size and style */}
              {cardinal.map((dir, i) => {
                const angle = i * 90;
                const rad = (angle - 90) * Math.PI / 180;
                const x = 72 + 54 * Math.cos(rad);
                const y = 72 + 54 * Math.sin(rad) + (dir === 'N' ? 10 : dir === 'S' ? 16 : 13);
                return (
                  <text
                    key={dir}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize="16"
                    fill="#fff"
                    fontWeight="bold"
                    style={{
                      letterSpacing: '1.5px',
                      textShadow: '0 1px 4px #000, 0 0px 2px #000',
                    }}
                  >
                    {dir}
                  </text>
                );
              })}
            </g>
            {/* Rotating heading arrow - small, bold red, white outline, split */}
            <g transform={`rotate(${normalizedHeading} 72 72)`}>
              {/* Main arrow: two triangles with white split, smaller and more compact */}
              <polygon points="72,44 80,110 72,90" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
              <polygon points="72,44 64,110 72,90" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
              {/* White split line */}
              <line x1="72" y1="44" x2="72" y2="110" stroke="#fff" strokeWidth="1.2" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard2Page() {
  // Helper for battery voltage color
  const getVoltageColor = (v: number) => {
    if (v <= 13.3) return 'text-red-500';
    if (v <= 13.7) return 'text-yellow-500';
    return 'text-black';
  };
  const [flightData, setFlightData] = useState<FlightData>({
    position: { x: 0, y: 0, z: 0 },
    velocity: { vx: 0, vy: 0, vz: 0 },
    attitude: { roll: 0, pitch: 0, yaw: 0 },
    battery: { voltage: 12.6, current: 2.5, percentage: 85 },
    rangefinder: { distance: 2.5 },
    gps: { lat: 0, lon: 0, alt: 0, fix: 0 },
    system: { mode: 'STABILIZE', armed: false, status: 'STANDBY' }
  });

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [lastTelemetryTime, setLastTelemetryTime] = useState(Date.now());
  const [now, setNow] = useState(Date.now());

  // Timer to update the clock every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Track last telemetry update time
  useEffect(() => {
    // If flightData is updating, update lastTelemetryTime
    setLastTelemetryTime(Date.now());
  }, [flightData]);

  // Compute connection status
  useEffect(() => {
    if (Date.now() - lastTelemetryTime < 2000) {
      if (connectionStatus !== 'connected') setConnectionStatus('connected');
    } else if (Date.now() - lastTelemetryTime < 4000) {
      if (connectionStatus !== 'connecting') setConnectionStatus('connecting');
    } else {
      if (connectionStatus !== 'disconnected') setConnectionStatus('disconnected');
    }
  }, [now, lastTelemetryTime]);

  // Arena visualization state
  const [jetsonData, setJetsonData] = useState<JetsonData | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 4.5, y: 6 });
  const [positionHistory, setPositionHistory] = useState<Position[]>([]);
  const [detectedSpots, setDetectedSpots] = useState<string[]>([]);

  // Utility functions for arena visualization
  const gpsToFieldCoords = (gpsPoint: ArenaCorner | SafeSpot, arena: ArenaCorner[]): Position => {
    if (!arena || arena.length < 4) return { x: 0, y: 0 };

    const [topLeft, topRight, bottomRight, bottomLeft] = arena;

    const latRange = topRight.lat - bottomLeft.lat;
    const lngRange = topRight.lng - bottomLeft.lng;

    const x = ((gpsPoint.lng - bottomLeft.lng) / lngRange) * 9;
    const y = ((gpsPoint.lat - bottomLeft.lat) / latRange) * 12;

    return { x, y };
  };

  const calculateDistance = (pos1: Position, pos2: Position): number => {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
  };

  // Fetch Jetson data
  useEffect(() => {
    const fetchJetsonData = async () => {
      try {
        const response = await fetch('/api/jetson-data');
        if (response.ok) {
          const data = await response.json();
          setJetsonData(data);
        }
      } catch (error) {
        console.error('Error fetching Jetson data:', error);
      }
    };

    fetchJetsonData();
    const interval = setInterval(fetchJetsonData, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update current position from telemetry
  useEffect(() => {
    if (flightData.position.x !== 0 || flightData.position.y !== 0) {
      const newPosition = { x: flightData.position.x, y: flightData.position.y };
      setCurrentPosition(newPosition);

      // Update position history
      setPositionHistory(prev => {
        const newHistory = [...prev, newPosition];
        if (newHistory.length > MAX_POSITION_HISTORY) {
          newHistory.shift();
        }
        return newHistory;
      });
    }
  }, [flightData.position.x, flightData.position.y]);

  // Detect safe spots
  useEffect(() => {
    if (!jetsonData?.safeSpots) return;

    const newDetectedSpots: string[] = [];

    jetsonData.safeSpots.forEach(spot => {
      const spotCoords = gpsToFieldCoords(spot, jetsonData.arena);
      const distance = calculateDistance(currentPosition, spotCoords);

      if (distance <= DETECTION_THRESHOLD) {
        newDetectedSpots.push(spot.id);
      }
    });

    setDetectedSpots(prev => {
      const combined = [...new Set([...prev, ...newDetectedSpots])];
      return combined;
    });
  }, [currentPosition, jetsonData]);

  // Fetch telemetry data
  useEffect(() => {
    const fetchTelemetryData = async () => {
      try {
        // Fetch multiple telemetry endpoints from public/params
        const [attitudeRes, positionRes, batteryRes, rangefinderRes, systemRes] = await Promise.all([
          fetch('/public/params/ATTITUDE.json').catch(() => null),
          fetch('/public/params/LOCAL_POSITION_NED.json').catch(() => null),
          fetch('/public/params/BATTERY_STATUS.json').catch(() => null),
          fetch('/public/params/DISTANCE_SENSOR.json').catch(() => null),
          fetch('/public/params/HEARTBEAT.json').catch(() => null)
        ]);

        let newData = { ...flightData };
        let hasData = false;

        if (attitudeRes?.ok) {
          const attitude = await attitudeRes.json();
          newData.attitude = attitude;
          hasData = true;
        }

        if (positionRes?.ok) {
          const position = await positionRes.json();
          newData.position = position;
          hasData = true;
        }

        if (batteryRes?.ok) {
          const battery = await batteryRes.json();
          newData.battery = {
            voltage: battery.voltages?.[0] / 1000 || battery.voltage || 12.6,
            current: battery.current_battery / 100 || 2.5,
            percentage: battery.battery_remaining || 85
          };
          hasData = true;
        }

        if (rangefinderRes?.ok) {
          const rangefinder = await rangefinderRes.json();
          newData.rangefinder = { distance: rangefinder.current_distance / 100 || 2.5 };
          hasData = true;
        }

        if (systemRes?.ok) {
          const system = await systemRes.json();
          newData.system = {
            mode: system.custom_mode || 'STABILIZE',
            armed: system.base_mode & 128 ? true : false,
            status: system.system_status === 4 ? 'ACTIVE' : 'STANDBY'
          };
          hasData = true;
        }

        if (hasData) {
          setFlightData(newData);
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }

      } catch (error) {
        console.error('Error fetching telemetry:', error);
        setConnectionStatus('disconnected');
      }
    };

    fetchTelemetryData();
    const interval = setInterval(fetchTelemetryData, 100); // 10Hz updates
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 text-black p-4">
      <div className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Battery, Connection, Attitude, Compass */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* Position Data */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-black text-base font-bold">POSITION (NED)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-black text-sm">X (North)</div>
                    <div className="text-black font-mono text-2xl font-extrabold">
                      {flightData.position.x.toFixed(2)}m
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-black text-sm">Y (East)</div>
                    <div className="text-black font-mono text-2xl font-extrabold">
                      {flightData.position.y.toFixed(2)}m
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-black text-sm">Z (Down)</div>
                    <div className="text-black font-mono text-2xl font-extrabold">
                      {flightData.position.z.toFixed(2)}m
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Velocity Data */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-black text-base font-bold">VELOCITY (m/s)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-black text-sm">VX</div>
                    <div className="text-black font-mono text-2xl font-extrabold">
                      {flightData.velocity.vx.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-black text-sm">VY</div>
                    <div className="text-black font-mono text-2xl font-extrabold">
                      {flightData.velocity.vy.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-black text-sm">VZ</div>
                    <div className="text-black font-mono text-2xl font-extrabold">
                      {flightData.velocity.vz.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Battery & Connection Status */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="font-bold text-sm mb-1">BATTERY</div>
                  <div className="flex items-center justify-between">
                    <span className="text-black text-xs">Voltage</span>
                    <span className={`font-mono font-bold ${getVoltageColor(flightData.battery.voltage)}`}>{flightData.battery.voltage.toFixed(1)}V</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black text-xs">Current</span>
                    <span className="text-black font-mono">{flightData.battery.current.toFixed(1)}A</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-center text-2xl font-mono font-bold text-black">
                      {flightData.battery.percentage}%
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full transition-all ${flightData.battery.percentage > 30 ? 'bg-green-500' : flightData.battery.percentage > 15 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${flightData.battery.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-sm mb-1">CONNECTION</div>
                  <div className={`px-3 py-1 rounded text-sm font-mono shadow border border-slate-200 ${connectionStatus === 'connected' ? 'bg-green-100 text-green-700' : connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {connectionStatus.toUpperCase()}
                  </div>
                  <div className="text-slate-600 font-mono text-xs mt-1">
                    {new Date(now).toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Center Column: Arena Visualization */}
          <div className="col-span-6 flex flex-col gap-4">
            <Card className="flex-1 h-full">
              <CardHeader>
                <CardTitle>Live Arena & Safe Spots</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Arena: {jetsonData?.arena?.length || 0} corners • Safe Spots: {jetsonData?.safeSpots?.length || 0} detected
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100vh-8rem)]">
                <div className="w-full h-full min-h-[600px] min-w-[400px] relative bg-green-50 dark:bg-green-950 border rounded-lg overflow-hidden">
                  <svg width="100%" height="100%" viewBox="-1 -1 11 14" className="absolute inset-0" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <clipPath id="fieldClip">
                        <rect x="-1" y="-1" width="11" height="14" />
                      </clipPath>
                    </defs>
                    <rect x="-1" y="-1" width="11" height="14" className="fill-green-50 dark:fill-green-950" stroke="#000" strokeWidth="0.1" />
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                      <line key={`v${i}`} x1={i} y1="-1" x2={i} y2="13" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="0.02" />
                    ))}
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => (
                      <line key={`h${i}`} x1="-1" y1={i} x2="10" y2={i} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="0.02" />
                    ))}
                    <g clipPath="url(#fieldClip)">
                      <rect x="0" y="0" width="9" height="12" fill="rgba(255,215,0,0.1)" stroke="#FFD700" strokeWidth="0.15" strokeDasharray="0.3,0.1" />
                      {[[0, 0], [9, 0], [9, 12], [0, 12]].map(([x, y], index) => (
                        <circle key={index} cx={x} cy={y} r="0.15" fill="#FFD700" stroke="#000" strokeWidth="0.03" />
                      ))}
                      {/* Dynamic Arena from Jetson */}
                      {/* (optional: add dynamic arena polygon if you want) */}
                      {jetsonData?.arena && jetsonData.arena.length >= 4 && (() => {
                        const minLat = Math.min(...jetsonData.arena.map(c => c.lat));
                        const maxLat = Math.max(...jetsonData.arena.map(c => c.lat));
                        const minLng = Math.min(...jetsonData.arena.map(c => c.lng));
                        const maxLng = Math.max(...jetsonData.arena.map(c => c.lng));
                        const arenaFieldCoords = jetsonData.arena.map(corner => ({
                          x: ((corner.lng - minLng) / (maxLng - minLng)) * 9,
                          y: ((corner.lat - minLat) / (maxLat - minLat)) * 12
                        }));
                        return (
                          <g opacity="0.5">
                            <polygon
                              points={arenaFieldCoords.map(p => `${p.x},${12 - p.y}`).join(' ')}
                              fill="rgba(100,200,255,0.1)"
                              stroke="#64C8FF"
                              strokeWidth="0.08"
                              strokeDasharray="0.15,0.05"
                            />
                            {arenaFieldCoords.map((corner, index) => (
                              <circle
                                key={index}
                                cx={corner.x}
                                cy={12 - corner.y}
                                r="0.1"
                                fill="#64C8FF"
                                stroke="#000"
                                strokeWidth="0.02"
                              />
                            ))}
                          </g>
                        );
                      })()}
                      {/* Safe spots with detection radius and marker */}
                      {jetsonData?.safeSpots?.map(spot => {
                        const spotCoords = gpsToFieldCoords(spot, jetsonData.arena)
                        const isDetected = detectedSpots.includes(spot.id)
                        const isOutsideArena = spotCoords.x < 0 || spotCoords.x > 9 || spotCoords.y < 0 || spotCoords.y > 12
                        return (
                          <g key={spot.id}>
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
                            <rect
                              x={spotCoords.x - 0.2}
                              y={12 - spotCoords.y - 0.2}
                              width="0.4"
                              height="0.4"
                              fill={isDetected ? "#00ff00" : "#0066cc"}
                              stroke="#000"
                              strokeWidth="0.02"
                              opacity={isOutsideArena ? 0.5 : 1}
                            />
                            <text
                              x={spotCoords.x}
                              y={12 - spotCoords.y + 0.6}
                              textAnchor="middle"
                              fontSize="0.25"
                              className="fill-black dark:fill-white"
                              fontWeight="bold"
                              opacity={isOutsideArena ? 0.5 : 1}
                            >
                              {spot.id}
                            </text>
                            <text
                              x={spotCoords.x}
                              y={12 - spotCoords.y + 0.9}
                              textAnchor="middle"
                              fontSize="0.15"
                              className="fill-gray-600 dark:fill-gray-400"
                              opacity={isOutsideArena ? 0.5 : 1}
                            >
                              ({spotCoords.x.toFixed(1)}m, {spotCoords.y.toFixed(1)}m)
                            </text>
                            {isOutsideArena && (
                              <text
                                x={spotCoords.x}
                                y={12 - spotCoords.y - 0.3}
                                textAnchor="middle"
                                fontSize="0.15"
                                fill="#ff0000"
                                fontWeight="bold"
                              >
                                OUT
                              </text>
                            )}
                          </g>
                        )
                      })}
                      {/* Position trail */}
                      {positionHistory.length > 1 && (
                        <g>
                          <polyline
                            points={positionHistory.map(pos => `${pos.x},${12 - pos.y}`).join(' ')}
                            fill="none"
                            stroke="#ff6666"
                            strokeWidth="0.05"
                            opacity="0.7"
                            strokeDasharray="0.1,0.05"
                          />
                          {positionHistory.slice(0, -1).map((pos, index) => (
                            <circle
                              key={index}
                              cx={pos.x}
                              cy={12 - pos.y}
                              r="0.08"
                              fill="#ff9999"
                              opacity={0.3 + (index / positionHistory.length) * 0.4}
                            />
                          ))}
                        </g>
                      )}
                      {/* Current drone position */}
                      <g>
                        {(() => {
                          const isOutsideArena = currentPosition.x < 0 || currentPosition.x > 9 || currentPosition.y < 0 || currentPosition.y > 12
                          return (
                            <>
                              <circle
                                cx={currentPosition.x}
                                cy={12 - currentPosition.y}
                                r="0.4"
                                fill="rgba(255,0,0,0.3)"
                                stroke="none"
                              />
                              <circle
                                cx={currentPosition.x}
                                cy={12 - currentPosition.y}
                                r="0.25"
                                fill={isOutsideArena ? "#ff8800" : "#ff0000"}
                                stroke="#000000"
                                strokeWidth="0.05"
                              />
                              <circle
                                cx={currentPosition.x}
                                cy={12 - currentPosition.y}
                                r="0.12"
                                fill="#ffff00"
                                stroke="#000000"
                                strokeWidth="0.02"
                              />
                              <circle
                                cx={currentPosition.x}
                                cy={12 - currentPosition.y}
                                r="0.3"
                                fill="none"
                                stroke={isOutsideArena ? "#ff8800" : "#ff0000"}
                                strokeWidth="0.03"
                                opacity="0.6"
                              >
                                <animate attributeName="r" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                              </circle>
                              {isOutsideArena && (
                                <text
                                  x={currentPosition.x}
                                  y={12 - currentPosition.y - 0.6}
                                  textAnchor="middle"
                                  fontSize="0.2"
                                  fill="#ff0000"
                                  fontWeight="bold"
                                >
                                  OUT OF ARENA
                                </text>
                              )}
                            </>
                          )
                        })()}
                      </g>
                    </g>
                    <text x="4.5" y="0.5" textAnchor="middle" fontSize="0.3" className="fill-gray-600 dark:fill-gray-400">
                      Arena: 9×12m Competition Zone
                    </text>
                    {detectedSpots.length === 3 && (
                      <>
                        <rect x="1" y="5" width="7" height="2" fill="rgba(0,255,0,0.8)" stroke="#00ff00" strokeWidth="0.1" rx="0.2" />
                        <text x="4.5" y="6.2" textAnchor="middle" fontSize="0.4" fill="#000" fontWeight="bold">
                          MISSION COMPLETE!
                        </text>
                        <text x="4.5" y="6.6" textAnchor="middle" fontSize="0.2" fill="#000">
                          All 3 Safe Spots Detected!
                        </text>
                      </>
                    )}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column: Detection Status & Details */}
          <div className="col-span-3 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center gap-2">
                  Detection Status
                  {detectedSpots.length === 3 && (
                    <Badge className="bg-green-500">MISSION COMPLETE</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className={detectedSpots.length === 3 ? 'border-green-500 bg-green-50' : ''}>
                  <AlertTitle className="flex items-center gap-2 text-blue-600">
                    Detection Status
                    {detectedSpots.length === 3 && (
                      <Badge className="bg-green-500">MISSION COMPLETE</Badge>
                    )}
                  </AlertTitle>
                  <AlertDescription>
                    Detected: {detectedSpots.length}/3 safe spots
                    <br />
                    Detection Threshold: {DETECTION_THRESHOLD}m radius
                    <br />
                    Current Position: ({currentPosition.x.toFixed(1)}m, {currentPosition.y.toFixed(1)}m)
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            {/* Attitude Indicator */}
            <AttitudeIndicator
              roll={flightData.attitude.roll}
              pitch={flightData.attitude.pitch}
              yaw={flightData.attitude.yaw}
            />
            {/* Heading Compass */}
            <Visualization3D
              attitude={flightData.attitude}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
