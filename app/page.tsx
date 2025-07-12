"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PositionData } from "@/components/position-data"
import { RangefinderData } from "@/components/rangefinder-data"
import { Enhanced3DView } from "@/components/enhanced-3d-view"
import { TelemetryStatus } from "@/components/telemetry-status"
import { TelemetryOverview } from "@/components/telemetry-overview"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Telemetry Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <TelemetryOverview />
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
            <CardTitle>Rangefinder</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <RangefinderData />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <TelemetryStatus />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mission Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Access specialized mission tools and safety features
              </p>
              <Link href="/safe-spots">
                <Button className="w-full" size="lg">
                  🎯 Safe Spot Detection System
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>3D Visualization</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Enhanced3DView />
        </CardContent>
      </Card>
    </div>
  )
}

