import json
import os
from pymavlink import mavutil
import time
import argparse

parser = argparse.ArgumentParser(description='MAVLink listener with USB and telemetry support')
parser.add_argument('--connection', type=str, default='COM18',
                    help='Connection string (e.g., COM18)')
parser.add_argument('--baud', type=int, default=57600,
                    help='Baud rate for serial connection')

args = parser.parse_args()

PARAMS_DIR = os.path.join('public', 'params')
os.makedirs(PARAMS_DIR, exist_ok=True)

def create_mavlink_connection(connection_str, baud_rate):
    try:
        # Format the connection string for serial ports
        if connection_str.startswith('COM'):
            print(f"Attempting to connect to {connection_str} at {baud_rate} baud")
            return mavutil.mavlink_connection(connection_str, baud=baud_rate)
        return mavutil.mavlink_connection(connection_str, baud=baud_rate)
    except Exception as e:
        print(f"Failed to establish connection: {e}")
        return None

def check_heartbeat(master):
    try:
        msg = master.wait_heartbeat(timeout=5)
        return bool(msg)
    except Exception:
        return False

def write_to_json(data, filename):
    try:
        filepath = os.path.join(PARAMS_DIR, filename)
        with open(filepath, 'w') as f:
            json.dump(data, f)
    except Exception:
        pass

def request_data_streams(master):
    """Request data streams from the drone"""
    print("Requesting data streams...")
    
    # Request all data streams
    master.mav.request_data_stream_send(
        master.target_system,
        master.target_component,
        mavutil.mavlink.MAV_DATA_STREAM_ALL,
        50,  # Rate in Hz
        1    # Start
    )
    
    # Request specific streams
    streams = [
        mavutil.mavlink.MAV_DATA_STREAM_RAW_SENSORS,
        mavutil.mavlink.MAV_DATA_STREAM_EXTENDED_STATUS,
        mavutil.mavlink.MAV_DATA_STREAM_RC_CHANNELS,
        mavutil.mavlink.MAV_DATA_STREAM_POSITION,
        mavutil.mavlink.MAV_DATA_STREAM_EXTRA1,
        mavutil.mavlink.MAV_DATA_STREAM_EXTRA2,
        mavutil.mavlink.MAV_DATA_STREAM_EXTRA3
    ]
    
    for stream in streams:
        master.mav.request_data_stream_send(
            master.target_system,
            master.target_component,
            stream,
            50,  # Rate in Hz
            1    # Start
        )
    print("Data streams requested")

def monitor_messages(master):
    message_types = {
        'ATTITUDE': 'ATTITUDE.json',
        'HEARTBEAT': 'HEARTBEAT.json',
        'RAW_IMU': 'RAW_IMU.json',
        'SCALED_IMU2': 'SCALED_IMU2.json',
        'LOCAL_POSITION_NED': 'LOCAL_POSITION_NED.json',
        'GLOBAL_POSITION_INT': 'GLOBAL_POSITION_INT.json',
        'BATTERY_STATUS': 'BATTERY_STATUS.json',
        'SYS_STATUS': 'SYS_STATUS.json'
    }

    msg = master.recv_match(blocking=False)
    if msg:
        msg_type = msg.get_type()
        print(f"Received message: {msg_type}")
        
        if msg_type in message_types:
            data = msg.to_dict()
            if msg_type == 'BATTERY_STATUS' and data['current_battery'] > 0:
                data['time_remaining'] = int((data['battery_remaining'] / 100.0) * 
                                           (data['current_consumed'] / data['current_battery']))
            write_to_json(data, message_types[msg_type])
            print(f"Saved {msg_type} data")

def main():
    master = create_mavlink_connection(args.connection, args.baud)
    if not master:
        print("Could not create connection")
        return

    print("Waiting for heartbeat...")
    try:
        master.wait_heartbeat(timeout=10)
        print("Heartbeat received!")
    except Exception as e:
        print(f"No heartbeat received: {e}")
        return

    request_data_streams(master)

    try:
        while True:
            monitor_messages(master)
            time.sleep(0.1)  # Add a small delay to prevent CPU overuse
    except KeyboardInterrupt:
        print("\nExiting...")
    except Exception as e:
        print(f"Error in main loop: {e}")

if __name__ == "__main__":
    main()