"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalibrationService } from '@/lib/mavlink/calibration'
import { CALIBRATION_STATUS } from '@/lib/mavlink/mavlink-enums'

export default function CalibrationPage() {
  const [calibrationService, setCalibrationService] = useState<CalibrationService | null>(null)
  const [activeCalibration, setActiveCalibration] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'calibrating' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    const service = new CalibrationService('ws://localhost:8765')
    setCalibrationService(service)
    service.onCalibrationStatus((status) => {
      if (status.includes('success')) {
        setStatus('success')
        setStatusMessage(`${activeCalibration} calibration completed successfully`)
      } else if (status.includes('failed')) {
        setStatus('error')
        setStatusMessage(`${activeCalibration} calibration failed`)
      } else {
        setStatus('calibrating')
        setStatusMessage(status)
      }
    })
  }, [activeCalibration])

  const handleGyroCalibration = () => {
    setActiveCalibration('Gyro')
    setStatus('calibrating')
    setStatusMessage('Starting Gyro calibration...')
    calibrationService?.startGyroCalibration()
  }

  const handleBaroCalibration = () => {
    setActiveCalibration('Barometer')
    setStatus('calibrating')
    setStatusMessage('Starting Barometer calibration...')
    calibrationService?.startBaroCalibration()
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Sensor Calibration</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gyroscope Calibration</CardTitle>
            <CardDescription>Keep the drone still on a level surface and press the button below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGyroCalibration} disabled={status === 'calibrating'}>
              Start Gyro Calibration
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Barometer Calibration</CardTitle>
            <CardDescription>Ensure the drone is at rest and press the button below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBaroCalibration} disabled={status === 'calibrating'}>
              Start Barometer Calibration
            </Button>
          </CardContent>
        </Card>
        {status !== 'idle' && (
          <Alert className="mt-6" variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'default'}>
            <AlertTitle>{status === 'success' ? 'Success' : status === 'error' ? 'Error' : 'Calibrating...'}</AlertTitle>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}