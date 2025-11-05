# IR Blaster Hardware Setup Guide

## Quick Start - Identify Your Hardware

### 1. Open Hardware Detection Page
Open `hardware-test.html` in your browser (Chrome/Edge required for serial):
```bash
# From the aRef/irBlast directory
open hardware-test.html
```

### 2. Test Your Hardware Type
Click the appropriate button based on your IR blaster type to see detailed instructions.

## Hardware Connection Methods

### Method 1: USB/Serial (Arduino-based)

**Supported Devices:**
- Arduino Uno/Nano/Mega with IR LED
- USB-UIRT
- USB IR Toy
- Any serial-based IR transmitter

**Setup Steps:**

1. **Hardware Setup:**
   - Connect IR LED to Arduino pin 3 (through 100-220Ω resistor)
   - Connect Arduino to computer via USB

2. **Upload Arduino Sketch:**
```cpp
#include <IRremote.h>

IRsend irsend;  // Pin 3 on Arduino Uno

void setup() {
  Serial.begin(9600);
  Serial.println("Ready");
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    if (cmd.startsWith("NEC:")) {
      cmd.remove(0, 4);
      int comma = cmd.indexOf(',');
      unsigned long addr = strtoul(cmd.substring(0, comma).c_str(), NULL, 0);
      unsigned long command = strtoul(cmd.substring(comma + 1).c_str(), NULL, 0);
      irsend.sendNEC((addr << 16) | command, 32);
      Serial.println("Sent");
    }
  }
}
```

3. **Connect in App:**
   - Select "USB/Serial (Arduino)" in Hardware Connection
   - Choose baud rate (9600 default)
   - Click Connect and select your COM port

### Method 2: Network Devices (Broadlink, Tasmota)

#### Broadlink RM Series

**Setup:**
1. Set up Broadlink device on your network using their app
2. Find device IP address
3. Use Python backend with python-broadlink library:

```python
import broadlink
import json
from flask import Flask, request

app = Flask(__name__)

# Discover and connect to device
device = broadlink.discover()[0]
device.auth()

@app.route('/api/ir/transmit', methods=['POST'])
def transmit():
    data = request.json
    # Convert pronto hex to broadlink format
    # ... conversion logic ...
    device.send_data(ir_packet)
    return {'success': True}
```

#### Tasmota IR

**Setup:**
1. Flash Tasmota-IR firmware to ESP8266/ESP32
2. Configure IR transmit GPIO pin in Tasmota console
3. Note device IP address
4. In app, select "Tasmota IR" and enter IP

**Tasmota Commands:**
```
# Send NEC code
http://192.168.1.100/cm?cmnd=IRsend {"Protocol":"NEC","Bits":32,"Data":"0x57E30017"}

# Send raw timings
http://192.168.1.100/cm?cmnd=IRsend {"Protocol":"RAW","Data":"9000,4500,563,1687..."}
```

### Method 3: HTTP API Backend

**For any hardware that needs a backend:**

1. **Install Backend:**
```bash
cd aRef/irBlast
npm install express cors
# Optional for serial devices:
npm install serialport
```

2. **Run Backend:**
```bash
# Console output only (testing)
node backend-example.js

# For LIRC (Linux)
IR_METHOD=lirc node backend-example.js

# For ir-ctl (Linux)
IR_METHOD=ir-ctl node backend-example.js

# For serial devices
IR_METHOD=serial node backend-example.js
```

3. **Connect in App:**
   - Select "HTTP API"
   - Enter `http://localhost:3022`
   - Click Connect

### Method 4: Command Line Tools (Linux)

#### LIRC Setup

1. **Install LIRC:**
```bash
sudo apt-get install lirc
```

2. **Configure hardware in `/etc/lirc/hardware.conf`**

3. **Add TCL Roku config:**
```bash
# Get config from backend
curl http://localhost:3022/api/lirc-config > tcl-roku.conf
sudo cp tcl-roku.conf /etc/lirc/lircd.conf.d/
sudo systemctl restart lircd
```

4. **Test:**
```bash
irsend SEND_ONCE TCL_ROKU KEY_POWER
```

#### ir-ctl Setup (Modern Linux)

```bash
# Install ir-ctl
sudo apt-get install v4l-utils

# Test NEC transmission
ir-ctl -d /dev/lirc0 -S nec:0x57e3,0x17

# Use with backend
IR_METHOD=ir-ctl node backend-example.js
```

## Testing Your Setup

### 1. Hardware Test Page
Use `hardware-test.html` to:
- Detect available ports
- Test connection
- Send test commands

### 2. Main App Testing
1. Start the app: `npm run dev`
2. Go to Hardware Connection section
3. Select your connection type
4. Click Connect
5. Press any button on the remote
6. Check console for transmission logs

### 3. Verify with TV
- Point IR LED at TV
- Press Power button
- TV should respond

## Troubleshooting

### Serial Connection Issues
- **Windows:** Check Device Manager for COM port
- **Mac/Linux:** Look for `/dev/ttyUSB*` or `/dev/ttyACM*`
- **Permission denied:** Add user to dialout group: `sudo usermod -a -G dialout $USER`

### No IR Transmission
1. **Check IR LED:** Use phone camera to see if IR LED lights up (appears purple)
2. **Check wiring:** Ensure proper resistor (100-220Ω)
3. **Check distance:** IR typically works within 5-10 meters
4. **Check angle:** Point directly at TV IR receiver

### Network Device Issues
- **Can't find device:** Ensure on same network subnet
- **CORS errors:** Use backend proxy instead of direct connection
- **Timeout:** Check firewall settings

### Backend Connection Failed
- **Port in use:** Change port in backend-example.js
- **CORS blocked:** Ensure cors middleware is active
- **Command not found:** Install required tools (lirc, ir-ctl)

## Hardware Recommendations

### DIY Arduino Setup (Cheapest)
- Arduino Nano: $5
- IR LED: $0.50
- Resistor: $0.10
- Total: ~$6

### USB-UIRT (Reliable)
- USB-UIRT device: $50
- Works with serial protocol
- Good range and compatibility

### Broadlink RM Mini 3 (Network-based)
- Price: $20-30
- WiFi connectivity
- Works with many devices
- Mobile app included

### Tasmota IR (DIY Network)
- ESP8266 + IR: $8
- WiFi controlled
- Very flexible
- Requires flashing firmware

## Example Hardware Setups

### Setup A: Arduino Nano + IR LED
```
Arduino Pin 3 ----[220Ω]---- IR LED Anode
Arduino GND ----------------- IR LED Cathode
```

### Setup B: ESP8266 with Tasmota
```
ESP8266 GPIO14 ----[100Ω]---- IR LED Anode
ESP8266 GND ------------------ IR LED Cathode
Flash Tasmota-IR firmware
Configure GPIO14 as IRsend
```

### Setup C: Raspberry Pi with LIRC
```
RPi GPIO 17 ----[100Ω]---- IR LED Anode
RPi GND ------------------- IR LED Cathode
Install LIRC, configure pins
```

## Next Steps

1. **Choose your hardware** based on budget and requirements
2. **Follow setup instructions** for your chosen method
3. **Test with hardware-test.html** first
4. **Connect in main app** and start controlling your TV!

## Support

If your specific hardware isn't listed:
1. Check if it supports NEC protocol
2. Find command format (serial, HTTP, etc.)
3. Adapt one of the existing providers
4. Test with TCL power command: NEC 0x57E3,0x17
