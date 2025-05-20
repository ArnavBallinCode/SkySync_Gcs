"use client"

import { motion } from 'framer-motion'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center">
          Documentation
        </h1>

        <div className="grid gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Getting Started</h2>
            <div className="prose prose-invert">
              <p className="text-gray-300 mb-4">
                The NJORDE Drone Interface provides real-time visualization and control capabilities for drone operations.
                This documentation will help you understand the key features and how to use them effectively.
              </p>
              <h3 className="text-xl text-blue-300 mt-4 mb-2">Key Features:</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Real-time 3D Visualization</li>
                <li>Attitude and Position Monitoring</li>
                <li>Telemetry Data Display</li>
                <li>Interactive Controls</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Interface Guide</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl text-blue-300 mb-2">3D Visualization</h3>
                <p>The 3D view shows the drone's current position and orientation in real-time. Use mouse controls to:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Left click + drag: Rotate camera</li>
                  <li>Right click + drag: Pan view</li>
                  <li>Scroll: Zoom in/out</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl text-blue-300 mb-2">Stats Panel</h3>
                <p>Located in the bottom-right corner, displays real-time telemetry data including:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Altitude</li>
                  <li>Attitude (Roll, Pitch, Yaw)</li>
                  <li>Speed</li>
                  <li>GPS coordinates</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Technical Details</h2>
            <p className="text-gray-300">
              The interface connects to MAVProxy for real-time data transmission. All visualization is handled using
              Three.js for optimal performance and accurate representation of the drone's state.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 