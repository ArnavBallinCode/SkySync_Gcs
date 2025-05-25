import asyncio
import websockets
from pymavlink import mavutil
import json
import time

SERIAL_PORT = "/dev/tty.usbmodem01"
BAUD_RATE = 57600

async def send_status(websocket, status):
    await websocket.send(json.dumps({"status": status}))

async def run_gyro_calibration(websocket):
    try:
        await send_status(websocket, "Connecting to Pixhawk...")
        master = mavutil.mavlink_connection(SERIAL_PORT, baud=BAUD_RATE)
        
        await send_status(websocket, "Waiting for heartbeat...")
        master.wait_heartbeat(timeout=10)
        
        await send_status(websocket, "Sending calibration command...")
        master.mav.command_long_send(
            master.target_system,
            master.target_component,
            mavutil.mavlink.MAV_CMD_PREFLIGHT_CALIBRATION,
            0,  # confirmation
            1,  # gyro calibration
            0,  # accel calibration
            0,  # mag calibration
            0,  # ground pressure
            0,  # radio calibration
            0,  # accelerometer temp calibration
            0   # unused
        )
        
        await send_status(websocket, "Waiting for acknowledgment...")
        start_time = time.time()
        timeout = 30
        
        while time.time() - start_time < timeout:
            msg = master.recv_match(type='COMMAND_ACK', blocking=False)
            if msg and msg.command == mavutil.mavlink.MAV_CMD_PREFLIGHT_CALIBRATION:
                if msg.result == mavutil.mavlink.MAV_RESULT_ACCEPTED:
                    await send_status(websocket, "success: Calibration completed successfully")
                else:
                    await send_status(websocket, f"failed: Calibration failed with result {msg.result}")
                break
            await asyncio.sleep(0.1)
        else:
            await send_status(websocket, "failed: Calibration timed out")
            
        master.close()
        
    except Exception as e:
        await send_status(websocket, f"failed: {str(e)}")

async def run_baro_calibration(websocket):
    try:
        await send_status(websocket, "Connecting to Pixhawk...")
        master = mavutil.mavlink_connection(SERIAL_PORT, baud=BAUD_RATE)
        
        await send_status(websocket, "Waiting for heartbeat...")
        master.wait_heartbeat(timeout=10)
        
        await send_status(websocket, "Sending calibration command...")
        master.mav.command_long_send(
            master.target_system,
            master.target_component,
            mavutil.mavlink.MAV_CMD_PREFLIGHT_CALIBRATION,
            0,  # confirmation
            0,  # gyro calibration
            0,  # accel calibration
            0,  # mag calibration
            1,  # ground pressure
            0,  # radio calibration
            0,  # accelerometer temp calibration
            0   # unused
        )
        
        await send_status(websocket, "Waiting for acknowledgment...")
        start_time = time.time()
        timeout = 30
        
        while time.time() - start_time < timeout:
            msg = master.recv_match(type='COMMAND_ACK', blocking=False)
            if msg and msg.command == mavutil.mavlink.MAV_CMD_PREFLIGHT_CALIBRATION:
                if msg.result == mavutil.mavlink.MAV_RESULT_ACCEPTED:
                    await send_status(websocket, "success: Calibration completed successfully")
                else:
                    await send_status(websocket, f"failed: Calibration failed with result {msg.result}")
                break
            await asyncio.sleep(0.1)
        else:
            await send_status(websocket, "failed: Calibration timed out")
            
        master.close()
        
    except Exception as e:
        await send_status(websocket, f"failed: {str(e)}")

async def handle_websocket(websocket):
    try:
        async for message in websocket:
            data = json.loads(message)
            command = data.get('command')
            
            if command == 'gyro_calibration':
                await run_gyro_calibration(websocket)
            elif command == 'baro_calibration':
                await run_baro_calibration(websocket)
            else:
                await send_status(websocket, f"failed: Unknown command {command}")
    except websockets.exceptions.ConnectionClosed:
        pass
    except Exception as e:
        try:
            await send_status(websocket, f"failed: {str(e)}")
        except:
            pass

async def main():
    print("Starting WebSocket server...")
    async with websockets.serve(handle_websocket, "localhost", 8765):
        print("Calibration WebSocket server started on ws://localhost:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped by user") 