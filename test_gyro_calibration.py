import time
import logging
import serial
from pymavlink import mavutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def connect_to_pixhawk(port, baud=57600, retries=3, retry_delay=5):
    """Establish connection to Pixhawk with retry mechanism"""
    for attempt in range(retries):
        try:
            logger.info(f"Connecting to {port} at {baud} baud (attempt {attempt + 1}/{retries})")
            master = mavutil.mavlink_connection(port, baud=baud)
            return master
        except Exception as e:
            logger.error(f"Connection attempt {attempt + 1} failed: {e}")
            if attempt < retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                raise ConnectionError(f"Failed to connect after {retries} attempts")

def wait_for_heartbeat(master, timeout=30):
    """Wait for system heartbeat"""
    logger.info("Waiting for heartbeat...")
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            if master.recv_match(type='HEARTBEAT', blocking=True, timeout=1):
                logger.info("Heartbeat received!")
                return True
        except serial.SerialException as e:
            logger.error(f"Serial error while waiting for heartbeat: {e}")
            return False
    logger.error("No heartbeat received")
    return False

def check_gyro_status(master, timeout=5):
    """Check if gyro is already calibrated by looking at raw gyro data stability"""
    logger.info("Checking gyro status...")
    samples = []
    start_time = time.time()
    
    # Collect some gyro samples
    while time.time() - start_time < timeout:
        try:
            msg = master.recv_match(type='RAW_IMU', blocking=True, timeout=1)
            if msg:
                # Get gyro values
                gx, gy, gz = msg.xgyro, msg.ygyro, msg.zgyro
                samples.append((gx, gy, gz))
                if len(samples) >= 10:  # We have enough samples
                    break
        except serial.SerialException as e:
            logger.error(f"Serial error while checking gyro: {e}")
            return False
    
    if len(samples) < 10:
        logger.warning("Could not get enough gyro samples")
        return False
    
    # Check if gyro readings are stable (indicating it might be calibrated)
    def calc_variance(values):
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        return variance
    
    # Calculate variance for each axis
    variances = [
        calc_variance([s[i] for s in samples])
        for i in range(3)
    ]
    
    # If all variances are small, gyro is likely calibrated
    threshold = 1000  # Adjust this threshold based on your gyro's characteristics
    is_stable = all(v < threshold for v in variances)
    
    if is_stable:
        logger.info("Gyro readings are stable (likely calibrated)")
    else:
        logger.info("Gyro readings show variation (might need calibration)")
    
    return is_stable

def calibrate_gyro(master):
    """Perform gyroscope calibration"""
    try:
        logger.info("Initiating gyro calibration...")
        
        # First check if already calibrated
        if check_gyro_status(master):
            user_input = input("Gyro appears to be already calibrated. Do you want to recalibrate? (y/n): ")
            if user_input.lower() != 'y':
                logger.info("Skipping calibration as gyro is already calibrated")
                return True
        
        # Send calibration command
        master.mav.command_long_send(
            master.target_system,
            master.target_component,
            mavutil.mavlink.MAV_CMD_PREFLIGHT_CALIBRATION,
            0,  # Confirmation
            1,  # Gyro calibration (param1)
            0, 0, 0, 0, 0, 0
        )

        # Wait for acknowledgment
        logger.info("Waiting for calibration acknowledgment...")
        start_time = time.time()
        while time.time() - start_time < 30:
            try:
                msg = master.recv_match(type='COMMAND_ACK', blocking=True, timeout=1)
                if msg and msg.command == mavutil.mavlink.MAV_CMD_PREFLIGHT_CALIBRATION:
                    if msg.result == mavutil.mavlink.MAV_RESULT_ACCEPTED:
                        logger.info("Calibration accepted by flight controller")
                        return True
                    else:
                        logger.error(f"Calibration failed with result code: {msg.result}")
                        return False
            except serial.SerialException as e:
                logger.error(f"Serial error during calibration: {e}")
                return False
                
        logger.error("Calibration acknowledgment timeout")
        return False

    except Exception as e:
        logger.error(f"Calibration error: {e}")
        return False

def monitor_calibration_progress(master, timeout=180):
    """Monitor calibration status messages with enhanced handling"""
    logger.info(f"Monitoring calibration progress for up to {timeout} seconds...")
    calibration_states = {
        'started': False,
        'progress': 0,
        'success': False,
        'failure_detected': False
    }
    
    # Keywords for success and failure
    success_keywords = ["success", "complete", "finished", "done", "pass", "completed"]
    failure_keywords = ["fail", "failed", "error", "aborted", "timeout"]

    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            msg = master.recv_match(blocking=True, timeout=1)
            if not msg:
                continue

            msg_type = msg.get_type()
            logger.debug(f"Received MAVLink message: type='{msg_type}'")

            # Handle STATUSTEXT messages
            if msg_type == 'STATUSTEXT':
                # Robustly decode text, handling potential null bytes
                try:
                    if isinstance(msg.text, str):
                        text = msg.text.strip()
                    else:
                        text = msg.text.decode('utf-8', errors='ignore').strip()
                except Exception as e:
                    logger.warning(f"Error decoding STATUSTEXT: {e} - raw: {msg.text}")
                    continue
                
                logger.info(f"FC Message: {text}")
                text_lower = text.lower()
                
                if "calibration" in text_lower or "calibrating" in text_lower:
                    calibration_states['started'] = True
                    if "gyro" in text_lower:
                        logger.info("Gyro-specific calibration message detected.")
                
                # Simple progress parsing
                if "progress" in text_lower:
                    try:
                        progress_val = int(''.join(filter(str.isdigit, text)) or 0)
                        calibration_states['progress'] = max(calibration_states['progress'], progress_val)
                        logger.info(f"Calibration progress: {calibration_states['progress']}%")
                    except ValueError:
                        logger.warning(f"Could not parse progress from: {text}")
                
                # Check for success keywords
                if any(s in text_lower for s in success_keywords):
                    if calibration_states['started'] or "calibration" in text_lower or "calibrating" in text_lower:
                        logger.info(f"Calibration success detected: '{text}'")
                        calibration_states['success'] = True
                        return True 
                
                # Check for failure keywords
                if any(s in text_lower for s in failure_keywords):
                    if calibration_states['started'] or "calibration" in text_lower or "calibrating" in text_lower:
                        logger.error(f"Calibration failure detected: '{text}'")
                        calibration_states['failure_detected'] = True
                        return False

            # Also check RAW_IMU data to verify calibration success
            elif msg_type == 'RAW_IMU':
                if calibration_states['started'] and not calibration_states['success']:
                    if check_gyro_status(master, timeout=2):  # Quick check
                        logger.info("Gyro data indicates successful calibration")
                        calibration_states['success'] = True
                        return True

        except serial.SerialException as e:
            logger.error(f"Serial error while monitoring: {e}")
            return False
        except KeyboardInterrupt:
            logger.info("Monitoring interrupted by user.")
            return False
        except Exception as e:
            logger.warning(f"Error reading or processing message: {str(e)}")
    
    # Loop finished (timeout)
    if calibration_states['success']:
        logger.info("Calibration success was true at timeout (unexpected).")
        return True
    if calibration_states['failure_detected']:
        logger.error("Calibration failure was detected at timeout (unexpected).")
        return False

    if calibration_states['started']:
        logger.error(f"Gyro calibration monitoring timed out after {timeout}s. Calibration started but no explicit success/failure signal was confirmed.")
    else:
        logger.error(f"Gyro calibration monitoring timed out after {timeout}s. No 'calibration' keyword detected in STATUSTEXT to indicate start.")
    return False

def request_data_streams(master):
    """Request necessary data streams from the drone"""
    logger.info("Requesting data streams...")
    
    # Request RAW_IMU data at 10Hz
    master.mav.request_data_stream_send(
        master.target_system,
        master.target_component,
        mavutil.mavlink.MAV_DATA_STREAM_RAW_SENSORS,
        10,  # 10Hz
        1    # Start
    )
    
    # Request extended status at 2Hz
    master.mav.request_data_stream_send(
        master.target_system,
        master.target_component,
        mavutil.mavlink.MAV_DATA_STREAM_EXTENDED_STATUS,
        2,   # 2Hz
        1    # Start
    )
    
    # Small delay to let streams start
    time.sleep(0.5)

def main():
    # Configuration
    serial_port = '/dev/tty.usbserial-D30JKVZM'
    baud_rate = 57600

    try:
        # Establish connection with retry mechanism
        master = connect_to_pixhawk(serial_port, baud_rate, retries=3)
        
        # Wait for heartbeat
        if not wait_for_heartbeat(master):
            raise ConnectionError("No heartbeat received")
            
        # Request necessary data streams
        request_data_streams(master)

        # Start calibration
        if not calibrate_gyro(master):
            raise RuntimeError("Calibration command failed")

        # Monitor calibration progress
        if not monitor_calibration_progress(master, timeout=30):  # Reduced timeout to 30 seconds
            raise RuntimeError("Calibration process failed")

        logger.info("GYRO CALIBRATION SUCCESSFULLY COMPLETED!")

    except Exception as e:
        logger.error(f"Calibration process aborted: {e}")
    finally:
        if 'master' in locals():
            # Stop the data streams
            try:
                master.mav.request_data_stream_send(
                    master.target_system,
                    master.target_component,
                    mavutil.mavlink.MAV_DATA_STREAM_ALL,
                    0,  # 0Hz = stop
                    0   # Stop
                )
            except:
                pass
            master.close()
            logger.info("Connection closed")

if __name__ == "__main__":
    main()