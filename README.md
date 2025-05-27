
# <img src="Logo.png" alt="SkySync GCS Logo" width="50" height="50"/> SkySync GCS (Windows Edition)

**Cutting-Edge Ground Control Station for Real-Time UAV Telemetry, Visualization, and Calibration**

---

<p align="center">
  <img src="Logo.png" alt="SkySync GCS Logo" width="180" height="180"/>
</p>

---

## 🚀 Executive Summary

SkySync GCS Windows Edition embodies next-generation drone ground control solutions engineered for high-fidelity, real-time telemetry and sensor calibration. Designed to empower enterprise UAV operations with scalable, resilient architecture, SkySync leverages the MAVLink protocol to integrate seamlessly with Pixhawk flight controllers and Jetson AI compute platforms.

With a state-of-the-art TypeScript/React frontend, powered by Three.js immersive 3D rendering and a robust Python-based backend telemetry processor, this solution sets a new standard in UAV telemetry management and calibration precision.

---

## 🌟 Core Value Propositions

- **Enterprise-Grade Telemetry Dashboard:** Instantaneous visualization of flight parameters with sub-100ms latency for mission-critical insights.
- **Comprehensive Calibration Suite:** Systematic, guided sensor calibration with advanced diagnostics to enhance UAV flight stability.
- **Interactive 3D Attitude & Position Visualization:** Utilizing Three.js for an unparalleled immersive experience.
- **Modular & Scalable Architecture:** Built on microservices with extensible component design for seamless future integrations.
- **Cross-Device Responsive UI:** Optimized for Windows desktop, with adaptive layouts for tablets and laptops.
- **Robust Connectivity:** Supports USB serial, telemetry radios, Wi-Fi telemetry bridges, and experimental Bluetooth connections.

---

## 📈 Product Differentiators

- **Next-Gen Frontend Stack:** Next.js + React + Tailwind CSS + TypeScript delivering superior performance and developer productivity.
- **High-Fidelity MAVLink Parsing:** Python microservices implementing advanced parsing and real-time telemetry aggregation.
- **Extensible Calibration Protocol:** Supports all critical sensor calibrations with real-time feedback loops and visual progress.
- **Optimized for Windows Ecosystem:** Streamlined for Windows 10/11 environments with robust serial port handling and native performance.
- **Future-Ready Roadmap:** AI-powered anomaly detection, mission planning, and multi-vehicle coordination slated for upcoming releases.

---

## 🛠️ Windows Version — Installation & Configuration Guide

### 🔍 System Requirements

| Component            | Minimum Requirement                              |
|----------------------|-------------------------------------------------|
| Operating System     | Windows 10 / Windows 11 (64-bit)                  |
| CPU                  | Intel i5 7th Gen or AMD Ryzen 5 equivalent       |
| RAM                  | 8 GB (16 GB recommended for high throughput)     |
| Storage              | 1 GB free disk space                              |
| Connectivity         | USB 2.0/3.0 port or telemetry radio interface   |
| Software Dependencies | Node.js v16+, Python 3.8+, Git                   |

---

### ⚡ Step 1: Clone Repository & Setup Environment

Open **PowerShell** or **Windows Terminal** as Administrator and execute:

```powershell
git clone https://github.com/your-username/skysync-gcs.git
cd skysync-gcs
````

---

### ⚙️ Step 2: Install Frontend Dependencies

Using your preferred Node.js package manager (npm or pnpm):

```powershell
# Using npm
npm install

# Or using pnpm (recommended for faster installs)
pnpm install
```

---

### 🐍 Step 3: Setup Python Backend Environment

* Install Python 3.8+ for Windows (from [python.org](https://www.python.org/downloads/windows/))
* Open a new PowerShell window and install required packages:

```powershell
pip install pymavlink websockets asyncio pyserial
```

---

### 🔌 Step 4: Configure Environment Variables

Create a file `.env.local` in the root folder with the following content (modify `COM` port to match your device):

```
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8765
NEXT_PUBLIC_MAVLINK_CONNECTION=COM3
NEXT_PUBLIC_BAUD_RATE=57600
```

> **Note:** Use Windows Device Manager to confirm your Pixhawk or telemetry radio COM port.

---

### 🚁 Step 5: Establish MAVLink Connection

We recommend using **MAVProxy** on Windows as a UDP bridge:

```powershell
mavproxy.py --master=COM3 --baud=57600 --out=udp:localhost:14550 --out=udp:localhost:14551
```

This creates robust multiplexed MAVLink data streams for concurrent applications.

---

### ▶️ Step 6: Launch Services

Open **three separate PowerShell terminals**:

1. **Telemetry Listener**

```powershell
python listen.py --connection COM3 --baud 57600
```

2. **Calibration Server**

```powershell
python calibrating/calibration_server.py
```

3. **Frontend Development Server**

```powershell
npm run dev
# or
pnpm dev
```

---

### 🌐 Step 7: Access SkySync GCS

Open your preferred browser (Edge/Chrome recommended) and navigate to:

```
http://localhost:3000
```

Experience the full telemetry dashboard, 3D visualization, and calibration workflows.

---

## 🔍 Detailed Feature Breakdown

| Feature                     | Description                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Real-Time Telemetry**     | Instant telemetry updates with roll, pitch, yaw, GPS coordinates, battery status, and sensor health metrics |
| **3D Visualization**        | Fully interactive drone model visualization with attitude and position data using Three.js                  |
| **Calibration Suite**       | Stepwise calibration of gyroscope, accelerometer, magnetometer, and radio inputs with live feedback         |
| **Telemetry Logging**       | Persistent logging for post-flight data analysis and diagnostics                                            |
| **WebSocket Communication** | Low-latency bi-directional communication with backend calibration services                                  |
| **Modular Frontend**        | Componentized React UI enabling rapid customization and feature expansion                                   |
| **Cross-Platform UI**       | Responsive layouts optimized for Windows laptops, desktops, and tablets                                     |

---

## 🛡️ Security & Compliance

* Secure WebSocket communication with TLS planned for upcoming releases
* Configurable access controls and user authentication under development
* Data encryption at rest and in transit to comply with UAV data handling policies

---

## 🎯 Vision & Future-Forward Roadmap

| Timeline | Planned Innovations                                               |
| -------- | ----------------------------------------------------------------- |
| Q3 2025  | Full mission planning UI with waypoint and no-fly zone management |
| Q4 2025  | AI-powered predictive maintenance and flight anomaly detection    |
| Q1 2026  | SLAM and LiDAR integration for real-time 3D environment mapping   |
| Q2 2026  | Multi-drone swarm control and collaborative mission capabilities  |

---

## 🤝 Contributing & Collaboration

SkySync GCS thrives on community innovation and collaboration. We invite experts and enthusiasts to:

* Submit feature requests and bug reports via GitHub Issues
* Contribute code via Pull Requests following our standardized branching model
* Engage in discussions to define the next-gen UAV telemetry standards

---

## 📞 Support & Contact

For enterprise support, consulting, or technical inquiries:

* **Email:** [arnav.angarkar20@gmail.com](mailto:arnav.angarkar20@gmail.com)
* **GitHub Issues:** Use the repository Issues tab for bug reports and enhancements
* **Twitter:** Coming Soon
* **Official Website:** Coming Soon

---

## 📝 License

This product is released under a proprietary license. Redistribution and commercial use require explicit permission.

---

## Appendix: Troubleshooting Tips for Windows Users

* Ensure correct COM port assignment and exclusive access to the serial device
* Run terminals with Administrator privileges for hardware access
* Verify Python environment paths are correctly set
* Disable conflicting applications that may occupy serial ports (e.g., other GCS software)
* Use Windows Device Manager to troubleshoot driver issues

---

Thank you for choosing SkySync GCS — powering the future of UAV telemetry and control with innovation and precision.

---

*© 2025 SkySync Technologies. All Rights Reserved.*

```

---

If you want, I can also help you generate an official PDF manual or include screenshots tailored for Windows UI next. Would that be valuable?
```
