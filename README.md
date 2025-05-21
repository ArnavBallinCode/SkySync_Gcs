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


