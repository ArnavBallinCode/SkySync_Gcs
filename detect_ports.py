import serial.tools.list_ports

ports = serial.tools.list_ports.comports()

print("\nAvailable Serial Ports:")
print("----------------------")
for port in ports:
    print(f"Port: {port.device}")
    print(f"Description: {port.description}")
    print(f"Hardware ID: {port.hwid}")
    print("----------------------") 