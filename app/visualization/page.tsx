"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Enhanced3DView } from "@/components/enhanced-3d-view"
import { AttitudeVisualizer } from "@/components/attitude-visualizer"
import ColoredGridWithSprites from "@/components/ColoredGridWithSprites"

export default function VisualizationPage() {
  // Sample positions for grid visualization
  const samplePositions = [
    { x: 0, y: 0, z: 0, time: Date.now() },
    { x: 1, y: 0, z: 1, time: Date.now() + 1000 },
    { x: 2, y: 0, z: 2, time: Date.now() + 2000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Enhanced 3D Visualization</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Enhanced3DView />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Attitude Visualizer</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AttitudeVisualizer />
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Grid Visualization</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ColoredGridWithSprites positions={samplePositions} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
