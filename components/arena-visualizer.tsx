"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SafeSpotsVisualizerProps {
    currentPosition?: { x: number; y: number }
    width?: number
    height?: number
}

export function SafeSpotsVisualizerWorking({ currentPosition, width = 400, height = 300 }: SafeSpotsVisualizerProps) {
    const [dronePosition, setDronePosition] = useState({ x: 4.5, y: 6 });
    const [safeSpots, setSafeSpots] = useState([
        { id: 'A', x: 2, y: 3 },
        { id: 'B', x: 6, y: 8 },
        { id: 'C', x: 1, y: 10 }
    ]);
    const [detectedSpots, setDetectedSpots] = useState<string[]>([]);

    // Fetch drone position
    useEffect(() => {
        const fetchDronePosition = async () => {
            try {
                const response = await fetch('/params/local_position_ned.json');
                if (response.ok) {
                    const data = await response.json();
                    if (data && typeof data.x === 'number' && typeof data.y === 'number') {
                        const fieldX = Math.max(0, Math.min(9, data.x * 0.5 + 4.5));
                        const fieldY = Math.max(0, Math.min(12, data.y * 0.5 + 6));
                        setDronePosition({ x: fieldX, y: fieldY });
                    }
                }
            } catch (error) {
                console.error('Error fetching drone position:', error);
            }
        };

        fetchDronePosition();
        const interval = setInterval(fetchDronePosition, 1000);
        return () => clearInterval(interval);
    }, []);

    // Check for safe spot detection
    useEffect(() => {
        safeSpots.forEach(spot => {
            const distance = Math.sqrt(
                Math.pow(dronePosition.x - spot.x, 2) +
                Math.pow(dronePosition.y - spot.y, 2)
            );

            if (distance <= 0.5 && !detectedSpots.includes(spot.id)) {
                setDetectedSpots(prev => [...prev, spot.id]);
            }
        });
    }, [dronePosition, safeSpots, detectedSpots]);

    return (
        <Card className="bg-slate-800 border-slate-600">
            <CardHeader>
                <CardTitle className="text-cyan-300">LIVE ARENA & SAFE SPOTS</CardTitle>
                <div className="text-sm text-slate-400">
                    Arena: 9×12m • Safe Spots: {safeSpots.length} • Detected: {detectedSpots.length}/3
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative bg-green-900 rounded-lg p-4" style={{ aspectRatio: '3/4' }}>
                    {/* Arena boundary */}
                    <div className="absolute inset-4 border-2 border-yellow-500 border-dashed rounded">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 text-yellow-500 text-sm font-mono">
                            9×12m Arena
                        </div>
                    </div>

                    {/* Safe spots */}
                    {safeSpots.map(spot => {
                        const isDetected = detectedSpots.includes(spot.id);
                        const x = (spot.x / 9) * 100;
                        const y = (spot.y / 12) * 100;

                        return (
                            <div
                                key={spot.id}
                                className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isDetected
                                        ? 'bg-green-500 border-green-300 text-white'
                                        : 'bg-blue-500 border-blue-300 text-white'
                                    }`}
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                {spot.id}
                            </div>
                        );
                    })}

                    {/* Drone position */}
                    <div
                        className="absolute w-6 h-6 rounded-full bg-red-500 border-2 border-red-300 flex items-center justify-center"
                        style={{
                            left: `${(dronePosition.x / 9) * 100}%`,
                            top: `${(dronePosition.y / 12) * 100}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    </div>
                </div>

                {/* Status */}
                <div className="mt-4 flex justify-between items-center text-sm">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-slate-400">Safe Spots</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-slate-400">Drone</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-slate-400">Detected</span>
                        </div>
                    </div>
                    <div className="text-slate-400 font-mono">
                        {dronePosition.x.toFixed(1)}m, {dronePosition.y.toFixed(1)}m
                    </div>
                </div>

                {/* Mission complete */}
                {detectedSpots.length === 3 && (
                    <div className="mt-4 p-3 bg-green-600 rounded-lg text-center text-white font-bold">
                        🎉 MISSION COMPLETE! All Safe Spots Found
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
