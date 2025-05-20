"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Grid,
  Environment,
  Trail,
  Text,
  Stats,
  PerspectiveCamera,
} from "@react-three/drei"
import { Suspense, useRef, useEffect, useState } from "react"
import { Vector3, Color, Group, Mesh, Object3D, PerspectiveCamera as ThreePerspectiveCamera, Euler } from "three"

interface Position {
  x: number
  y: number
  z: number
}

interface Attitude {
  roll: number
  pitch: number
  yaw: number
}

interface DroneProps {
  position: [number, number, number]
  rotation: [number, number, number]
  showTrail?: boolean
}

// Drone model with effects
function Drone({ position, rotation, showTrail = true }: DroneProps) {
  const droneRef = useRef<Group>(null)
  const trailRef = useRef<any>(null)
  const [engineGlow] = useState(() => new Color("#00ffff"))

  useFrame((state, delta) => {
    if (droneRef.current) {
      // Add subtle hover animation
      const currentPos = droneRef.current.position.y
      droneRef.current.position.y = currentPos + Math.sin(state.clock.elapsedTime * 2) * 0.002
      
      // Update rotation with proper order (YXZ for aircraft-like rotation)
      droneRef.current.rotation.order = 'YXZ'
      droneRef.current.rotation.set(
        -rotation[0], // pitch (around X)
        -rotation[1], // yaw (around Y)
        -rotation[2], // roll (around Z)
      )
      
      // Add propeller rotation effect
      droneRef.current.children.forEach((child: Object3D) => {
        if (child instanceof Mesh && child.name.includes("propeller")) {
          child.rotation.y += delta * (child.name.includes("-0") ? 15 : -15)
        }
      })
    }
  })

  return (
    <group position={position}>
      {showTrail && (
        <Trail
          ref={trailRef}
          width={0.5}
          length={8}
          color={new Color(0x88ccff)}
          attenuation={(t) => t * t}
        >
          <mesh visible={false}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
          </mesh>
        </Trail>
      )}
      
      <group ref={droneRef}>
        {/* Main body - center hub */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.1, 0.4]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Top cover with slight bevel */}
        <mesh castShadow position={[0, 0.06, 0]}>
          <boxGeometry args={[0.35, 0.04, 0.35]} />
          <meshStandardMaterial color="#34495e" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* LED status light */}
        <pointLight position={[0, 0.1, 0]} color="#00ff00" intensity={0.5} distance={0.3} />
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
        </mesh>

        {/* Arms and propellers */}
        {[
          { pos: [-0.28, 0, 0.28] as [number, number, number], color: "#e74c3c", rotation: Math.PI / 4 },
          { pos: [0.28, 0, 0.28] as [number, number, number], color: "#e74c3c", rotation: -Math.PI / 4 },
          { pos: [-0.28, 0, -0.28] as [number, number, number], color: "#2ecc71", rotation: -Math.PI / 4 },
          { pos: [0.28, 0, -0.28] as [number, number, number], color: "#2ecc71", rotation: Math.PI / 4 }
        ].map((arm, i) => (
          <group key={i} position={arm.pos} rotation={[0, arm.rotation, 0]}>
            {/* Arm */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.22, 0.04, 0.04]} />
              <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Motor housing */}
            <mesh position={[0, 0.04, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
              <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Propeller */}
            <mesh name={`propeller-${i}`} position={[0, 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.01, 16]} />
              <meshStandardMaterial 
                color={arm.color} 
                transparent={true} 
                opacity={0.8} 
                metalness={0.4} 
                roughness={0.6} 
              />
            </mesh>

            {/* Engine glow */}
            <pointLight
              position={[0, 0.05, 0]}
              color={arm.color}
              intensity={1.5}
              distance={0.3}
              decay={2}
            />
          </group>
        ))}
      </group>
    </group>
  )
}

// Environment effects
function Environment3D() {
  return (
    <>
      {/* Main lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />

      {/* Ground plane for better visibility */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a237e" opacity={0.5} transparent />
      </mesh>

      {/* Environment effects */}
      <Environment preset="sunset" />
    </>
  )
}

// Debug overlay
function DebugOverlay({ position, attitude }: { position: Position; attitude: Attitude }) {
  return (
    <group position={[-2, 2, 0]}>
      <Text
        color="white"
        fontSize={0.15}
        maxWidth={2}
        lineHeight={1.5}
        letterSpacing={0.02}
        textAlign="left"
        anchorX="left"
        anchorY="top"
      >
        {`Position (m):
X: ${position.x.toFixed(2)}
Y: ${position.y.toFixed(2)}
Z: ${position.z.toFixed(2)}

Attitude (deg):
Roll: ${(attitude.roll * 180 / Math.PI).toFixed(1)}°
Pitch: ${(attitude.pitch * 180 / Math.PI).toFixed(1)}°
Yaw: ${(attitude.yaw * 180 / Math.PI).toFixed(1)}°`}
      </Text>
    </group>
  )
}

// Enhanced grid with better visibility
function EnhancedGrid() {
  return (
    <>
      <Grid
        args={[30, 30]}
        cellSize={1}
        cellThickness={1}
        cellColor="#4fc3f7"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#b3e5fc"
        fadeDistance={30}
        fadeStrength={1}
      />
      {[-10, -5, 0, 5, 10].map((x) => (
        <Text
          key={x}
          position={[x, 0.1, -10]}
          rotation={[-Math.PI / 2, 0, 0]}
          color="#b3e5fc"
          fontSize={0.5}
        >
          {x}m
        </Text>
      ))}
    </>
  )
}

interface EnhancedVisualizerProps {
  className?: string
}

export function Enhanced3DView({ className }: EnhancedVisualizerProps) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, z: -1.5 })
  const [attitude, setAttitude] = useState<Attitude>({ roll: 0, pitch: 0, yaw: 0 })
  const cameraRef = useRef<ThreePerspectiveCamera>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch position data
        const posRes = await fetch(`/params/LOCAL_POSITION_NED.json?t=${Date.now()}`)
        if (posRes.ok) {
          const posData = await posRes.json()
          console.log('Position data:', posData)
          setPosition(posData)
        }

        // Fetch attitude data
        const attRes = await fetch(`/params/ATTITUDE.json?t=${Date.now()}`)
        if (attRes.ok) {
          const attData = await attRes.json()
          console.log('Attitude data:', attData)
          setAttitude(attData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 100) // Update at 10Hz
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }} className={`rounded-2xl overflow-hidden border bg-black ${className}`}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera
            makeDefault
            position={[5, 5, 5]}
            fov={60}
            near={0.1}
            far={1000}
            ref={cameraRef}
          />
          <Environment3D />
          <EnhancedGrid />
          <Drone
            position={[position.x, position.z, position.y]}
            rotation={[-attitude.pitch, -attitude.yaw, -attitude.roll]}
          />
          <DebugOverlay position={position} attitude={attitude} />
          <OrbitControls
            minDistance={1}
            maxDistance={50}
            enableDamping
            dampingFactor={0.05}
            target={[position.x, position.z, position.y]}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={0}
          />
        </Suspense>
      </Canvas>
      <div style={{ 
        position: 'absolute', 
        bottom: '8px', 
        right: '8px',
        zIndex: 1000
      }}>
        <Stats 
          showPanel={0}
          className="stats-panel" 
        />
      </div>
    </div>
  )
} 