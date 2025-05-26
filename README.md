# 🚀 Drone_Web_9009  
**An advanced telemetry and monitoring system for real-time MAVLink data visualization and drone calibration.**  

## 🔥 Overview  
Drone_Web_9009 is the next-generation web-based **UAV telemetry dashboard**, developed over the earlier [Drone_Web_Interface_909](https://github.com/ArnavBallinCode/Drone_Web_Interface_909). It is designed for real-time data visualization and calibration from drones using **MAVLink**. The system integrates with **Jetson and Pixhawk** and now features:  
- **3D Data Visualization** 📊  
- **Full TypeScript & React-based UI** 🎨  
- **Real-time MAVLink telemetry processing** ⏳  
- **Mission Planner-style calibration via WebSocket** 🛰️  
- **Optimized for both mobile and desktop** 💻📱  

> **Note:** This project (9009) is a direct evolution of the previous [909 version](https://github.com/ArnavBallinCode/Drone_Web_Interface_909), with enhanced calibration, improved architecture, and more robust real-time features.

---

## 🔄 **Project Evolution: From Basic Web UI to 9009**  

### 🌟 **Previous Versions**  
- **Drone_Web_Interface_909:** Modern TypeScript/React/3D telemetry dashboard ([View Here](https://github.com/ArnavBallinCode/Drone_Web_Interface_909))
- **IROC_WEB_INTERFACE:** Original UI (HTML, CSS, JS) ([View Here](https://github.com/ArnavBallinCode/IROC_WEB_INTERFACE))
- **ISRO_IROC_Web:** Backend scripts (Python + MAVLink) ([View Here](https://github.com/ArnavBallinCode/ISRO_IROC_Web))
- **ISRO_IROC_Webinterface:** Older telemetry interface (Python-based) ([View Here](https://github.com/ArnavBallinCode/ISRO_IROC_Webinterface))

---

## ⚙️ **How It Works**  

### 🎯 **System Architecture**  
1️⃣ **Telemetry Data Flow**  
   - A **Python script (`listen.py`)** reads MAVLink telemetry and writes `.json` files in `public/params/`.  
   - The React-based frontend reads these JSON files and updates the UI dynamically.  

2️⃣ **Calibration Workflow (WebSocket-based)**
   - The frontend calibration UI connects to a Python WebSocket server (`calibration_ws_server.py`) at `ws://localhost:8765`.
   - When you trigger a calibration (Gyro, Accel, Compass, Radio, Level) from the UI, a command is sent over WebSocket.
   - The backend receives the command and sends the appropriate MAVLink calibration command to the drone via `/dev/tty.usbserial-<ID>`.
   - The backend sends status/progress updates back to the frontend, which are displayed in real time (just like Mission Planner).

3️⃣ **Frontend (React + TypeScript)**  
   - Fetches and processes telemetry from `/public/params/`.  
   - Uses **Three.js** for **3D drone movement & attitude representation**.  
   - Displays real-time battery, altitude, and position data.  
   - Provides a calibration UI for all major sensors, with live feedback.

4️⃣ **Backend (Python + MAVLink + WebSocket)**  
   - Uses `pymavlink` to listen to drone telemetry and handle calibration commands.  
   - Converts MAVLink messages into structured `.json` files.  
   - Runs a WebSocket server to bridge calibration commands between the frontend and the drone.

---

## 🚀 **Installation & Setup**  

### 📌 **1. Clone the Repository**  
```sh
git clone https://github.com/ArnavBallinCode/Drone_Web_9009.git
cd Drone_Web_9009
```

---

## 🛠 **2. Setting Up the TypeScript Project**  

1️⃣ Install **Node.js** (latest LTS) from [nodejs.org](https://nodejs.org/)  
2️⃣ Install dependencies:  
```sh
npm install
```
3️⃣ Start the React development server:  
```sh
npm run dev
```
4️⃣ Open `http://localhost:3000/` (or `3001` if 3000 is in use) in your browser.  

---

## 🛰 **3. Running MAVLink Telemetry Data Collection**  
1️⃣ Connect Pixhawk/Jetson via USB (e.g., `/dev/tty.usbserial-D30JKVZM`)  
2️⃣ Run the Python script:  
```sh
python3 listen.py --connection /dev/tty.usbserial-D30JKVZM --baud 57600
```
3️⃣ Data will be written to `public/params/`.  

---

## 🛠 **4. Running the Calibration WebSocket Server**
1️⃣ Ensure you have Python 3.8+ and install dependencies:
```sh
pip install websockets pymavlink
```
2️⃣ Start the calibration server:
```sh
python calibration_ws_server.py
```
- The server will connect to your drone via `/dev/tty.usbserial-D30JKVZM` at 57600 baud.
- It will listen for calibration commands from the frontend on `ws://localhost:8765`.

---

## 📡 **5. Viewing the Telemetry Dashboard & Calibration**  
Once the frontend and both Python scripts are running:  
- Open **`http://localhost:3000/`** (or `3001`) in your browser.  
- You will see **real-time drone telemetry, battery status, GPS, IMU data, and a 3D model** representing the drone's movement.  
- Go to the **Calibration** page to perform Gyroscope, Accelerometer, Compass, Radio, and Level calibrations.  
- Calibration status and progress will be shown live in the UI.

---

## 📝 **Calibration Workflow Details**
- The frontend sends a calibration command (e.g., Gyro, Accel, Compass, Radio, Level) via WebSocket.
- The backend receives the command and sends the corresponding MAVLink command to the drone.
- The backend sends status/progress updates back to the frontend.
- The workflow is similar to Mission Planner, providing a seamless calibration experience.

---

## 🎯 **Upcoming Features**  
✅ WebSocket-based real-time updates (instead of polling JSON files)  
✅ AI-powered anomaly detection for UAV telemetry  
✅ Enhanced **3D mapping using LiDAR & SLAM data**  

---

## 👨‍💻 **Contributing**  
1️⃣ Fork the repository  
2️⃣ Create a new branch (`feature-xyz`)  
3️⃣ Commit your changes (`git commit -m "Added XYZ feature"`)  
4️⃣ Push and submit a PR 🚀  

---
## License
This project is **not open-source**. All rights are reserved by the author. No part of this repository may be used or reproduced without explicit permission from **Arnav Angarkar**.

---

## 📞 **Contact & Support**  
If you need help, open an issue in the repo or reach out via:  
📧 **Email:** 24bcs015@iiitdwd.ac.in  

# Team NJORD - Drone Web Interface

## Project Overview
A sophisticated web interface for monitoring and controlling Pixhawk-based drones using MAVLink protocol. This project provides real-time telemetry data visualization, sensor calibration capabilities, and comprehensive system monitoring.

## Team Members
- **Arnav Angarkar** 
- **Saurav Karki** 
- **Krishna Sai** 
- **Gourav Purohit** 
- **Ranjith Babu** 
- **Lohith B**


![Team NJORD with Director](Team_Dir_Image.jpeg)

## Features
- Real-time telemetry data monitoring
- Comprehensive system health tracking
- Advanced sensor calibration interface
- Robust MAVLink communication
- Web-based control interface

## System Specifications

### Connection Parameters
- **Baud Rate**: 57600 bps
- **Protocol**: MAVLink 2.0
- **Connection Type**: Serial/Telemetry

### Monitored Parameters
1. **Battery Status**
   - Voltage: 11.8V
   - Current: 4.2A
   - Capacity Used: 1240mAh
   - Time Remaining: ~22min
   - Charge Level: 78%

2. **Communication Metrics**
   - Signal Strength: 92%
   - Link Quality: 98%
   - Data Rate: 57.6 kbps
   - Packet Loss: 0.2%

3. **System Health**
   - CPU Load: 24%
   - Memory Usage: 32%
   - Temperature: 32°C
   - Storage: 45% used
   - Overall Status: Normal

## Technical Architecture

### Frontend
- React.js for dynamic UI
- WebSocket for real-time data updates
- Chart.js for telemetry visualization

### Backend
- Python-based MAVLink communication
- WebSocket server for real-time data transmission
- JSON-based data storage and retrieval

### Data Flow
1. MAVLink messages from Pixhawk
2. Python script processing (`listen.py`)
3. WebSocket transmission
4. React frontend visualization

## Installation & Setup

### Prerequisites
```bash
# Python dependencies
pip install pymavlink websockets asyncio json

# Node.js dependencies
npm install
```

### Running the System
1. Start the MAVLink listener:
```bash
python3 listen.py --connection /dev/tty.usbserial-* --baud 57600
```

2. Launch the web interface:
```bash
npm run dev
```

## Monitored Parameters

### Attitude Data
- Roll, Pitch, Yaw angles
- Angular velocities
- Orientation quaternions

### Position Data
- Local position (NED frame)
- Global position (GPS coordinates)
- Velocity vectors

### IMU Data
- Raw accelerometer readings
- Gyroscope data
- Magnetometer measurements

### System Status
- Heartbeat messages
- System mode
- Armed status
- Flight mode

## Calibration Features
- Gyroscope calibration
- Accelerometer calibration
- Magnetometer calibration
- Level horizon calibration

## Future Enhancements
1. Autonomous mission planning
2. 3D visualization of drone attitude
3. Advanced flight data logging
4. Machine learning-based anomaly detection
5. Enhanced security features

## Acknowledgments
Special thanks to our Director for their guidance and support in making this project possible.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
For any queries regarding the project, please contact Team NJORD members.

## Quick Start

1. Start MAVProxy with UDP forwarding:
```bash
mavproxy.py --master=/dev/tty.usbserial-D30JKVZM --baud=57600 --out=udp:localhost:14550 --out=udp:localhost:14551
```

2. Start the calibration server:
```bash
python3 caliberating/calibration_server.py
```

3. Start the web interface:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

## Important Notes
- Always start MAVProxy first with UDP forwarding
- The calibration server will connect to the UDP port instead of directly to the serial port
- This allows multiple applications to communicate with the drone simultaneously

# Drone Web Interface

## 🚀 Quick Start Guide

### Prerequisites
1. Install Node.js (LTS version) from [nodejs.org](https://nodejs.org/)
2. Install Python 3.8+ from [python.org](https://python.org)
3. Install MAVProxy:
```bash
# On macOS
brew install mavproxy

# On Ubuntu/Debian
sudo apt-get install python3-pip python3-dev
pip3 install MAVProxy

# On Windows
pip install MAVProxy
```

### Step 1: Install Dependencies
```bash
# 1. Clone the repository
git clone https://github.com/ArnavBallinCode/Drone_Web_9009.git
cd Drone_Web_9009

# 2. Install Python dependencies
pip install pymavlink websockets asyncio pyserial

# 3. Install Node.js dependencies
npm install
# or if using pnpm
pnpm install
```

### Step 2: Connect Your Drone
1. Connect your Pixhawk/drone via USB
2. Identify the correct port:
```bash
# On macOS/Linux
ls /dev/tty.*
# Look for something like /dev/tty.usbserial-D30JKVZM

# On Windows
# Check Device Manager under "Ports (COM & LPT)"
# Look for something like COM3
```

### Step 3: Start the System

#### 1. Start MAVProxy (REQUIRED FIRST)
```bash
# On macOS/Linux
mavproxy.py --master=/dev/tty.usbserial-D30JKVZM --baud=57600 --out=udp:localhost:14550 --out=udp:localhost:14551

# On Windows
mavproxy.py --master=COM3 --baud=57600 --out=udp:localhost:14550 --out=udp:localhost:14551

# You should see:
# "Connecting to SITL on TCP port 5760"
# "Received heartbeat from APM"
```

#### 2. Start the Telemetry Listener
Open a new terminal and run:
```bash
# On macOS/Linux
python3 listen.py --connection /dev/tty.usbserial-D30JKVZM --baud 57600

# On Windows
python listen.py --connection COM3 --baud 57600

# You should see:
# "Connected to drone"
# "Writing telemetry data..."
```

#### 3. Start the Calibration Server
Open another new terminal and run:
```bash
# On macOS/Linux
python3 caliberating/calibration_server.py

# On Windows
python caliberating/calibration_server.py

# You should see:
# "Starting WebSocket server..."
# "Calibration WebSocket server started on ws://localhost:8765"
```

#### 4. Start the Web Interface
Open another new terminal and run:
```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev

# You should see:
# "ready - started server on 0.0.0.0:3000"
```

### Step 4: Access the Interface
1. Open your browser and go to:
   - Main interface: http://localhost:3000
   - Calibration page: http://localhost:3000/calibration

### Calibration Instructions

1. **Gyroscope Calibration**
   - Keep the drone completely still on a level surface
   - Click "Start Gyro Calibration"
   - Wait for completion (about 30 seconds)

2. **Accelerometer Calibration**
   - Click "Start Accelerometer Calibration"
   - Follow the orientation instructions:
     1. Place vehicle level
     2. On right side
     3. On left side
     4. Nose down
     5. Nose up
     6. On its back
   - Hold each position until you see "Position detected"
   - Wait for "Position calibrated successfully" before moving to next position

3. **Magnetometer Calibration**
   - Click "Start Magnetometer Calibration"
   - Rotate the drone around all axes
   - Continue rotation for at least 30 seconds
   - Keep away from metal objects
   - Wait for completion message

4. **Barometer Calibration**
   - Keep the drone still
   - Click "Start Barometer Calibration"
   - Wait for completion (about 30 seconds)

### Troubleshooting

1. **No Serial Port Connection**
   ```bash
   # List all serial ports
   python3 -m serial.tools.list_ports
   ```

2. **MAVProxy Connection Issues**
   - Ensure no other program is using the serial port
   - Try different baud rates: 57600, 115200, 921600
   - Check USB connection

3. **Calibration Server Issues**
   - Ensure MAVProxy is running first
   - Check if port 8765 is free:
     ```bash
     # On macOS/Linux
     lsof -i :8765
     # On Windows
     netstat -ano | findstr :8765
     ```

4. **Web Interface Issues**
   - Clear browser cache
   - Check console for errors (F12)
   - Ensure all servers are running

### Port Reference
- MAVProxy UDP outputs: 14550, 14551
- Calibration WebSocket: 8765
- Web Interface: 3000 (or 3001)

### Command Summary
```bash
# All commands needed (in order):
mavproxy.py --master=/dev/tty.usbserial-D30JKVZM --baud=57600 --out=udp:localhost:14550 --out=udp:localhost:14551
python3 listen.py --connection /dev/tty.usbserial-D30JKVZM --baud 57600
python3 caliberating/calibration_server.py
pnpm dev  # or npm run dev
```

### System Requirements
- Python 3.8+
- Node.js 16+
- Modern web browser (Chrome, Firefox, Safari)
- USB port for drone connection
- 2GB RAM minimum
- 1GB free disk space

### File Structure
```
Drone_Web_9009/
├── caliberating/
│   └── calibration_server.py  # WebSocket calibration server
├── public/
│   └── params/               # Telemetry JSON files
├── app/
│   └── calibration/         # Calibration UI components
├── lib/
│   └── mavlink/            # MAVLink utilities
├── listen.py               # Telemetry listener
└── package.json           # Node.js dependencies
```

### PX4 vs ArduPilot Configuration

#### PX4-Specific Setup
1. **Connection Settings**
   ```bash
   # For PX4, use these MAVProxy settings:
   mavproxy.py --master=/dev/tty.usbserial-D30JKVZM --baud=921600 --out=udp:localhost:14550 --out=udp:localhost:14551
   ```
   Note: PX4 typically uses 921600 baud rate by default

2. **Calibration Commands**
   - PX4 uses slightly different calibration parameters:
     ```python
     # Gyroscope
     params = [1, 0, 0, 0, 0, 0, 0]  # Same as ArduPilot

     # Accelerometer
     params = [0, 0, 0, 0, 4, 0, 0]  # Note: Uses 4 instead of 1 for simple calibration

     # Magnetometer
     params = [0, 1, 0, 0, 0, 0, 0]  # Same as ArduPilot

     # Level Horizon
     params = [0, 0, 0, 0, 2, 0, 0]  # Note: Uses 2 for level calibration
     ```

3. **Status Messages**
   - PX4 uses different status message formats:
     - "[cal] progress <percentage>"
     - "[cal] orientation detected"
     - "[cal] calibration done: <sensor>"
     - "CAL FAILED" for failures

4. **Additional PX4 Parameters**
   ```bash
   # Set calibration auto-save (optional)
   param set CAL_AUTO_SAVE 1

   # Set QGC core as remote (recommended)
   param set MAV_COMP_ID 190
   param set MAV_SYS_ID 255
   ```

5. **Troubleshooting PX4**
   - If calibration fails immediately:
     ```bash
     # Check if the drone is armed
     # PX4 requires disarming for calibration
     commander disarm
     ```
   - If no messages appear:
     ```bash
     # Enable verbose output
     param set SYS_MC_EST_GROUP 2
     param set SENS_BOARD_ROT 0
     ```

### System Compatibility

Feature | ArduPilot | PX4
--------|-----------|-----
Default Baud Rate | 57600 | 921600
Calibration Messages | [cal] prefix | Various formats
Auto-save Calibration | Always | Configurable
Level Calibration | Part of Accel | Separate command
Simple Accel Cal | Value: 1 | Value: 4
Status Updates | Frequent | On state change
UDP Forwarding | Optional | Recommended

### Common PX4 Issues

1. **No Calibration Response**
   - Ensure drone is disarmed
   - Check parameter `CAL_AUTO_SAVE`
   - Verify `SYS_MC_EST_GROUP` setting

2. **Connection Issues**
   ```bash
   # For PX4, try these settings:
   mavproxy.py --master=/dev/tty.usbserial-D30JKVZM --baud=921600 --source-system=255 --source-component=190 --out=udp:localhost:14550 --out=udp:localhost:14551
   ```

3. **Calibration Timeouts**
   - PX4 may need longer timeouts:
     ```python
     CALIBRATION_TIMEOUT = 180  # Increase from 120 to 180 seconds
     ```


