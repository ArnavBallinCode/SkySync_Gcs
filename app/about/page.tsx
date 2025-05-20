"use client"

import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center">
          About Team <span className="text-blue-400">NJORDE</span>
        </h1>
        
        <div className="grid gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Our Mission</h2>
            <p className="text-gray-300">
              Team NJORDE is dedicated to pushing the boundaries of drone technology and autonomous systems.
              Our mission is to develop cutting-edge solutions that revolutionize aerial robotics and their applications.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Technology Stack</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Advanced Flight Control Systems</li>
              <li>Real-time Telemetry Processing</li>
              <li>3D Visualization and Monitoring</li>
              <li>Autonomous Navigation Systems</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Our Vision</h2>
            <p className="text-gray-300">
              We envision a future where autonomous drones seamlessly integrate into various industries,
              from agriculture to urban planning, making operations more efficient and sustainable.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 