from pymavlink import mavutil
import time
import sys

def main():
    # Create connection to serial port
    try:
        master = mavutil.mavlink_connection('com:COM18:57600')
        print("Connected to serial port")
    except Exception as e:
        print(f"Failed to connect to serial port: {e}")
        return

    # Create UDP server
    try:
        udp = mavutil.mavlink_connection('udpout:127.0.0.1:14551', input=False)
        print("Created UDP server")
    except Exception as e:
        print(f"Failed to create UDP server: {e}")
        master.close()
        return

    print("Starting MAVLink forwarding...")
    print("Press Ctrl+C to exit")

    try:
        while True:
            # Forward data from serial to UDP
            msg = master.recv_match(blocking=True, timeout=1.0)
            if msg is not None:
                udp.write(msg.get_msgbuf())
                print(".", end="", flush=True)
            time.sleep(0.01)
    except KeyboardInterrupt:
        print("\nExiting...")
    except Exception as e:
        print(f"\nError: {e}")
    finally:
        master.close()
        udp.close()

if __name__ == "__main__":
    main() 