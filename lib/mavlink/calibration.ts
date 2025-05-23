import { MAV_CMD } from './mavlink-enums'

export class CalibrationService {
  private websocket: WebSocket

  constructor(websocketUrl: string) {
    this.websocket = new WebSocket(websocketUrl)
    this.setupWebSocket()
  }

  private setupWebSocket() {
    this.websocket.onopen = () => {
      console.log('WebSocket connection established')
    }

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.websocket.onclose = () => {
      console.log('WebSocket connection closed')
    }
  }

  private async sendCalibrationCommand(command: number, param1?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.websocket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'))
        return
      }

      // Build message object with optional param1
      const message: { command: number; param1?: number } = { command }
      if (typeof param1 !== 'undefined') message.param1 = param1
      this.websocket.send(JSON.stringify(message))
      resolve()
    })
  }

  async startGyroCalibration(): Promise<void> {
    if (this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected')
    }
    // 241 (MAV_CMD_PREFLIGHT_CALIBRATION), param1=1
    return this.sendCalibrationCommand(241, 1)
  }

  async startBaroCalibration(): Promise<void> {
    // 222 (MAV_CMD_PREFLIGHT_PRESSURE_CAL)
    return this.sendCalibrationCommand(222)
  }

  // Method to handle calibration status updates
  onCalibrationStatus(callback: (status: string) => void) {
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'calibration_status') {
        callback(data.status)
      } else if (data.type === 'status') {
        // Optionally, handle STATUSTEXT messages for UI feedback
        callback(data.text)
      } else if (data.type === 'calibration_ack') {
        callback(`${data.sensor} calibration ${data.status}`)
      }
    }
  }
}