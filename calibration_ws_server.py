import asyncio
import websockets
import json
from pymavlink import mavutil

# Connect to your drone (update connection string as needed)
master = mavutil.mavlink_connection('/dev/tty.usbserial-D30JKVZM', baud=57600)

async def handle_calibration(websocket):
    print("WebSocket client connected")
    async for message in websocket:
        data = json.loads(message)
        command = data.get("command")
        print(f"Received calibration command: {command}")

        # Map frontend commands to MAVLink commands
        if command == 241:  # Gyro calibration
            master.mav.command_long_send(
                master.target_system, master.target_component,
                241, 0, 0, 0, 0, 0, 0, 0, 0
            )
            await websocket.send(json.dumps({"type": "calibration_status", "status": "Gyro calibration started"}))
        elif command == 242:  # Accel calibration
            master.mav.command_long_send(
                master.target_system, master.target_component,
                242, 0, 0, 0, 0, 0, 0, 0, 0
            )
            await websocket.send(json.dumps({"type": "calibration_status", "status": "Accel calibration started"}))
        elif command == 42424:  # Compass calibration (example, check your MAV_CMD)
            master.mav.command_long_send(
                master.target_system, master.target_component,
                42424, 0, 0, 0, 0, 0, 0, 0, 0
            )
            await websocket.send(json.dumps({"type": "calibration_status", "status": "Compass calibration started"}))
        # Add more as needed...

        # You can also listen for MAVLink feedback and send progress updates here

async def main():
    async with websockets.serve(handle_calibration, "localhost", 8765):
        print("WebSocket calibration server running on ws://localhost:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main()) 