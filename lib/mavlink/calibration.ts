import { MAV_CMD } from './mavlink-enums'

export class CalibrationService {
  private ws: WebSocket | null = null;
  private statusCallback: ((status: string) => void) | null = null;
  private url: string;
  private connectionAttempts = 0;
  private maxAttempts = 3;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    if (this.connectionAttempts >= this.maxAttempts) {
      if (this.statusCallback) {
        this.statusCallback('failed: Maximum connection attempts reached');
      }
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.connectionAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status && this.statusCallback) {
            this.statusCallback(data.status);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.statusCallback) {
          this.statusCallback('failed: WebSocket connection error');
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        if (this.statusCallback) {
          this.statusCallback('failed: WebSocket connection closed');
        }
        // Try to reconnect after a delay
        this.connectionAttempts++;
        setTimeout(() => this.connect(), 2000);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      if (this.statusCallback) {
        this.statusCallback('failed: Could not create WebSocket connection');
      }
    }
  }

  onCalibrationStatus(callback: (status: string) => void) {
    this.statusCallback = callback;
  }

  private ensureConnection(): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (this.statusCallback) {
        this.statusCallback('failed: WebSocket not connected');
      }
      this.connect();
      return false;
    }
    return true;
  }

  startGyroCalibration() {
    if (this.ensureConnection()) {
      this.ws!.send(JSON.stringify({ command: 'gyro_calibration' }));
    }
  }

  startBaroCalibration() {
    if (this.ensureConnection()) {
      this.ws!.send(JSON.stringify({ command: 'baro_calibration' }));
    }
  }
}