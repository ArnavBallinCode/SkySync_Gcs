"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, RotateCw, Compass, Box, Activity, Gamepad } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalibrationService } from '@/lib/mavlink/calibration'
import { CALIBRATION_STATUS } from '@/lib/mavlink/mavlink-enums'

const calibrationSteps = {
  GYROSCOPE: {
    title: "Gyroscope Calibration",
    description: "Keep the drone still on a level surface",
    icon: RotateCw,
    instructions: [
      "Place the drone on a stable, level surface",
      "Ensure the drone is completely still",
      "Wait for the calibration to complete",
      "Do not move the drone during calibration"
    ]
  },
  ACCELEROMETER: {
    title: "Accelerometer Calibration",
    description: "Position the vehicle in 6 different orientations",
    icon: Box,
    instructions: [
      "You will be asked to place the vehicle in different orientations",
      "Hold each position for 5 seconds when prompted",
      "Watch for the LED indicators",
      "Complete all 6 orientations"
    ]
  },
  COMPASS: {
    title: "Compass Calibration",
    description: "Rotate the drone around all axes",
    icon: Compass,
    instructions: [
      "Rotate the drone around its vertical axis (yaw)",
      "Rotate the drone around its lateral axis (pitch)",
      "Rotate the drone around its longitudinal axis (roll)",
      "Keep rotating until calibration is complete"
    ]
  },
  RADIO: {
    title: "Radio Calibration",
    description: "Move all sticks and switches through their full range",
    icon: Gamepad,
    instructions: [
      "Turn on your radio transmitter",
      "Move all sticks to their extreme positions",
      "Toggle all switches through all positions",
      "Center all sticks when prompted"
    ]
  },
  LEVEL: {
    title: "Level Calibration",
    description: "Place the drone on a level surface",
    icon: Activity,
    instructions: [
      "Place the drone on a perfectly level surface",
      "Ensure the surface is stable",
      "Keep the drone still during calibration",
      "Wait for the confirmation message"
    ]
  },
}

export default function CalibrationPage() {
  const [calibrationService, setCalibrationService] = useState<CalibrationService | null>(null)
  const [activeCalibration, setActiveCalibration] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'calibrating' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState("")
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Initialize calibration service
    const service = new CalibrationService('ws://localhost:8765')
    setCalibrationService(service)

    // Set up calibration progress handler
    service.onCalibrationProgress((progress) => {
      setProgress(progress)
    })

    // Set up calibration status handler
    service.onCalibrationStatus((status) => {
      switch (status) {
        case CALIBRATION_STATUS.SUCCESS:
          setStatus('success')
          setStatusMessage(`${activeCalibration} calibration completed successfully`)
          break
        case CALIBRATION_STATUS.FAILED:
          setStatus('error')
          setStatusMessage(`${activeCalibration} calibration failed`)
          break
        case CALIBRATION_STATUS.CANCELLED:
          setStatus('idle')
          setStatusMessage("")
          break
      }
    })
  }, [])

  const startCalibration = async (type: string) => {
    if (!calibrationService) return

    setActiveCalibration(type)
    setProgress(0)
    setStatus('calibrating')
    setStatusMessage(`Starting ${type.toLowerCase()} calibration...`)
    setCurrentStep(0)

    try {
      switch (type) {
        case 'GYROSCOPE':
          await calibrationService.startGyroCalibration()
          break
        case 'ACCELEROMETER':
          await calibrationService.startAccelCalibration()
          break
        case 'COMPASS':
          await calibrationService.startMagCalibration()
          break
        case 'RADIO':
          await calibrationService.startRadioCalibration()
          break
        case 'LEVEL':
          await calibrationService.startLevelCalibration()
          break
      }
    } catch (error) {
      setStatus('error')
      setStatusMessage(`Failed to start calibration: ${error}`)
    }
  }

  const cancelCalibration = async () => {
    if (!calibrationService) return
    
    try {
      await calibrationService.cancelCalibration()
      setStatus('idle')
      setActiveCalibration(null)
      setProgress(0)
      setStatusMessage("")
    } catch (error) {
      console.error('Failed to cancel calibration:', error)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Drone Calibration</h1>
      
      {status !== 'idle' && (
        <Alert className="mb-6" variant={status === 'error' ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Status</AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            {statusMessage}
            {status === 'calibrating' && (
              <div className="flex-1">
                <Progress value={progress} className="w-full" />
                {activeCalibration && calibrationSteps[activeCalibration].instructions[currentStep] && (
                  <p className="text-sm mt-2">
                    {calibrationSteps[activeCalibration].instructions[currentStep]}
                  </p>
                )}
              </div>
            )}
            {status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(calibrationSteps).map(([key, { title, description, icon: Icon, instructions }]) => (
          <Card key={key} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCalibration === key && status === 'calibrating' ? (
                  <Button 
                    className="w-full"
                    variant="destructive"
                    onClick={cancelCalibration}
                  >
                    Cancel Calibration
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    variant={activeCalibration === key ? "secondary" : "default"}
                    disabled={status === 'calibrating' && activeCalibration !== key}
                    onClick={() => startCalibration(key)}
                  >
                    {activeCalibration === key && status === 'calibrating' ? (
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Start Calibration
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 