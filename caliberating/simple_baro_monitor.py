from pymavlink import mavutil
import time

# Connection settings
SERIAL_PORT = "/dev/tty.usbserial-D30JKVZM"
BAUD_RATE = 57600

def monitor_altitude():
    try:
        # Connect to the drone
        print("Connecting to Pixhawk...")
        master = mavutil.mavlink_connection(SERIAL_PORT, baud=BAUD_RATE)
        
        # Wait for heartbeat
        print("Waiting for heartbeat...")
        master.wait_heartbeat(timeout=10)
        print("Connected!")
        
        while True:
            # Get barometer data
            baro_msg = master.recv_match(type='SCALED_PRESSURE', blocking=True, timeout=1)
            
            # Get altitude data from different messages
            global_pos = master.recv_match(type='GLOBAL_POSITION_INT', blocking=True, timeout=1)
            vfr_hud = master.recv_match(type='VFR_HUD', blocking=True, timeout=1)
            
            print("\n=== Altitude Information ===")
            
            if baro_msg:
                pressure = baro_msg.press_abs  # Absolute pressure in hectopascal
                print(f"Barometric Pressure: {pressure:.2f} hPa")
            
            if global_pos:
                # relative_alt is in millimeters, convert to meters
                relative_alt = global_pos.relative_alt / 1000.0
                # alt is absolute altitude in millimeters, convert to meters
                absolute_alt = global_pos.alt / 1000.0
                print(f"Relative Altitude (from home): {relative_alt:.2f} meters")
                print(f"Absolute Altitude (MSL): {absolute_alt:.2f} meters")
            
            if vfr_hud:
                # VFR_HUD altitude in meters
                vfr_alt = vfr_hud.alt
                print(f"VFR Altitude: {vfr_alt:.2f} meters")
            
            print("=========================")
            
            time.sleep(10)  # Wait for 30 seconds before next reading
            
    except KeyboardInterrupt:
        print("\nProgram stopped by user")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        try:
            master.close()
        except:
            pass

if __name__ == "__main__":
    monitor_altitude() 