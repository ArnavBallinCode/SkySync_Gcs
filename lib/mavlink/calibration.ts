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

  private async sendCalibrationCommand(command: number, param1: number = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.websocket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'))
        return
      }

      const message = {
        command,
        param1,
        param2: 0,
        param3: 0,
        param4: 0,
        param5: 0,
        param6: 0,
        param7: 0,
      }

      this.websocket.send(JSON.stringify(message))
      resolve()
    })
  }

  async startGyroCalibration(): Promise<void> {
    return this.sendCalibrationCommand(MAV_CMD.MAV_CMD_PREFLIGHT_CALIBRATION, 1)
  }

  async startAccelCalibration(): Promise<void> {
    return this.sendCalibrationCommand(MAV_CMD.MAV_CMD_PREFLIGHT_CALIBRATION, 2)
  }

  async startMagCalibration(): Promise<void> {
    return this.sendCalibrationCommand(MAV_CMD.MAV_CMD_PREFLIGHT_CALIBRATION, 4)
  }

  async startRadioCalibration(): Promise<void> {
    return this.sendCalibrationCommand(MAV_CMD.MAV_CMD_START_RX_PAIR)
  }

  async startLevelCalibration(): Promise<void> {
    return this.sendCalibrationCommand(MAV_CMD.MAV_CMD_PREFLIGHT_CALIBRATION, 8)
  }

  async cancelCalibration(): Promise<void> {
    return this.sendCalibrationCommand(MAV_CMD.MAV_CMD_PREFLIGHT_CALIBRATION, 0)
  }

  // Method to handle calibration progress updates
  onCalibrationProgress(callback: (progress: number) => void) {
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'calibration_progress') {
        callback(data.progress)
      }
    }
  }

  // Method to handle calibration status updates
  onCalibrationStatus(callback: (status: string) => void) {
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'calibration_status') {
        callback(data.status)
      }
    }
  }
} 