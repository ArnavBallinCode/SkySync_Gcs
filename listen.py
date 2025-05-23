import json
import os
from pymavlink import mavutil
import time
import argparse
import serial

# Parse command line arguments
parser = argparse.ArgumentParser(description='MAVLink listener with USB and telemetry support')
parser.add_argument('--connection', type=str, default='/dev/tty.usbmodem01',
                    help='Connection string (e.g., /dev/tty.usbmodem01 or /dev/tty.usbserial-*)')
parser.add_argument('--baud', type=int, default=115200,
                    help='Baud rate for serial connection')

args = parser.parse_args()

# Ensure the public/params directory exists
PARAMS_DIR = os.path.join('public', 'params')
os.makedirs(PARAMS_DIR, exist_ok=True)

def create_mavlink_connection(connection_str, baud_rate):
    """Create MAVLink connection"""
    try:
        master = mavutil.mavlink_connection(connection_str, baud=baud_rate)
        print(f"Established serial connection on {connection_str} at {baud_rate} baud")
        return master
    except Exception as e:
        print(f"Failed to establish connection: {e}")
        return None

def check_heartbeat(master, timeout=5):
    """Wait for a heartbeat message"""
    print("Waiting for heartbeat...")
    try:
        msg = master.wait_heartbeat(timeout=timeout)
        if msg:
            print("Heartbeat received!")
            return True
    except Exception as e:
        print(f"Error waiting for heartbeat: {e}")
    return False

def write_to_json(data, filename):
    """Write data to JSON file"""
    try:
        filepath = os.path.join(PARAMS_DIR, filename)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully wrote {filename}")
    except Exception as e:
        print(f"Error writing {filename}: {e}")

def request_data_streams(master):
    """Request data streams from the drone"""
    print("Requesting data streams...")
    try:
        # Request RAW_SENSORS at 50Hz
        master.mav.request_data_stream_send(
            master.target_system, master.target_component,
            mavutil.mavlink.MAV_DATA_STREAM_RAW_SENSORS,
            50,  # 50Hz
            1    # Start
        )
        # Request EXTENDED_STATUS at 2Hz
        master.mav.request_data_stream_send(
            master.target_system, master.target_component,
            mavutil.mavlink.MAV_DATA_STREAM_EXTENDED_STATUS,
            2,   # 2Hz
            1    # Start
        )
        print("Waiting for command acknowledgments...")
        # Wait for command acknowledgments
        for _ in range(2):
            ack = master.recv_match(type='COMMAND_ACK', blocking=True, timeout=2)
            if ack:
                print(f"Command {ack.command} acknowledged with result: {ack.result}")
    except Exception as e:
        print(f"Error requesting data streams: {e}")

def monitor_messages(master, timeout=1):
    """Monitor various message types"""
    message_types = [
        ('ATTITUDE', 'ATTITUDE.json'),
        ('HEARTBEAT', 'HEARTBEAT.json'),
        ('RAW_IMU', 'RAW_IMU.json'),
        ('SCALED_IMU2', 'SCALED_IMU2.json'),
        ('LOCAL_POSITION_NED', 'LOCAL_POSITION_NED.json'),
        ('GLOBAL_POSITION_INT', 'GLOBAL_POSITION_INT.json'),
        ('BATTERY_STATUS', 'BATTERY_STATUS.json'),
        ('SYS_STATUS', 'SYS_STATUS.json')
    ]

    for msg_type, filename in message_types:
        print(f"Waiting for {msg_type}...")
        msg = master.recv_match(type=msg_type, blocking=True, timeout=timeout)
        if msg:
            data = msg.to_dict()
            
            # Special handling for battery status
            if msg_type == 'BATTERY_STATUS':
                # Calculate remaining flight time (in minutes)
                if data['current_battery'] > 0:
                    time_remaining = (data['battery_remaining'] / 100.0) * (data['current_consumed'] / data['current_battery'])
                    data['time_remaining'] = int(time_remaining)
                else:
                    data['time_remaining'] = 0

            write_to_json(data, filename)
        else:
            print(f"No {msg_type} message received within timeout")

def main():
    # Create connection
    master = create_mavlink_connection(args.connection, args.baud)
    if not master:
        print("Failed to establish MAVLink connection. Exiting.")
        return

    # Wait for heartbeat
    if not check_heartbeat(master):
        print("No heartbeat received. Exiting.")
        return

    # Request data streams
    request_data_streams(master)

    print("Starting parameter monitoring...")
    try:
        while True:
            monitor_messages(master)
            print("Completed cycle, waiting before next cycle...")
            time.sleep(0.1)  # Small delay between cycles
    except KeyboardInterrupt:
        print("\nExiting gracefully...")
    except Exception as e:
        print(f"Error in main loop: {e}")

if __name__ == "__main__":
    # Ensure params directory exists
    os.makedirs(PARAMS_DIR, exist_ok=True)
    main()