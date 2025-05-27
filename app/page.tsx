"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PositionData } from "@/components/position-data"
import { AttitudeVisualizer } from "@/components/attitude-visualizer"
import { TelemetryStatus } from "@/components/telemetry-status"
import { TelemetryOverview } from "@/components/telemetry-overview"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Telemetry Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <TelemetryOverview showAllParameters />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Position</CardTitle>
          </CardHeader>
          <CardContent>
            <PositionData />
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Attitude</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AttitudeVisualizer />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <TelemetryStatus />
        </CardContent>
      </Card>
    </div>
  )
}

