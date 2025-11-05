# UFO-R1 WiFi IR Blaster Setup Guide

## ✅ What's Ready Now

1. **Delete Functionality** - You can now delete failed remotes using the × button
2. **TCL Roku Remote** - Click "+ Add TCL Roku TV" button to add the pre-configured remote
3. **UFO-R1 Support** - Device connection interface is ready

## 🎯 Quick Setup Steps

### Step 1: Find Your UFO-R1's IP Address

Run the PowerShell script to scan your network:
```powershell
.\find-ufo-r1.ps1
```

Or manually:
1. Open your router's admin page (usually http://192.168.1.1)
2. Look for "Connected Devices" or "DHCP Clients"
3. Find device named "UFO-R1", "Smart IR", or similar
4. Note the IP address (e.g., 192.168.1.123)

### Step 2: Clean Up & Add TCL Remote

1. **Delete existing remotes** (if they don't work):
   - Click the red × button next to each remote

2. **Add TCL Roku TV remote**:
   - Click the blue "+ Add TCL Roku TV" button
   - The remote will be automatically selected

### Step 3: Connect Your UFO-R1

1. In **Hardware Connection** section:
   - "UFO-R1 WiFi IR Blaster" should be selected
   - Enter your device's IP address
   - Click "Connect"

2. You should see: "✅ Connected to UFO-R1 at [IP]"

### Step 4: Test It!

1. Point the UFO-R1 at your TV
2. Click the Power button
3. TV should turn on/off

## ⚠️ Troubleshooting

### If Direct Connection Doesn't Work

The UFO-R1 uses the Tuya/Smart Life protocol which may be blocked by browser CORS policy. Try:

#### Option A: Use Backend Proxy
```bash
# In a new terminal
cd aRef\irBlast
node backend-example.js

# Then in the app:
# 1. Select "HTTP API" instead of "UFO-R1"
# 2. Enter: http://localhost:3022
# 3. Click Connect
```

#### Option B: Use Smart Life App API
The UFO-R1 is typically controlled via the Smart Life app. For full integration:

1. **Get Device Info from Smart Life App**:
   - Enable developer mode in the app
   - Get Device ID and Local Key
   - These are needed for encrypted communication

2. **Alternative: Use Tuya Developer Platform**:
   - Register at https://iot.tuya.com
   - Link your Smart Life account
   - Get cloud API credentials

## 📡 How UFO-R1 Works

The UFO-R1 is a Tuya-based smart device that:
- Connects via WiFi (2.4GHz only)
- Uses encrypted local protocol (port 6668)
- Can be controlled via cloud API
- Learns IR codes from existing remotes
- Stores codes in the Smart Life app

## 🔧 Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Delete Remotes | ✅ Working | Click × button |
| Add TCL Roku | ✅ Working | Pre-configured with all codes |
| UFO-R1 Direct | ⚠️ Partial | May need backend due to CORS |
| Backend Proxy | ✅ Working | Use with HTTP API option |
| IR Transmission | 🔄 Testing | Depends on connection method |

## 💡 Tips

1. **Position UFO-R1 Correctly**:
   - Place with clear line of sight to TV
   - IR range is typically 8-10 meters
   - 360° transmission angle

2. **Test with Phone Camera**:
   - Point phone camera at UFO-R1
   - Press a button in the app
   - Should see purple/white flash if transmitting

3. **Use Learning Mode** (in Smart Life app):
   - Can learn codes from your original remote
   - Useful if pre-configured codes don't work

## 📝 Next Steps

If the UFO-R1 doesn't respond:

1. **Verify it's online**:
   - Check Smart Life app - device should show "Online"
   - Try controlling it from the Smart Life app first

2. **Try the backend approach**:
   - This bypasses browser restrictions
   - More reliable for Tuya devices

3. **Consider alternatives**:
   - Use an Arduino with IR LED (cheapest, most reliable)
   - Use Broadlink RM Mini (better documented API)
   - Use ESP8266 with Tasmota-IR (open source)

## 🆘 Need More Help?

The UFO-R1 uses the Tuya protocol which can be complex. If you're still having issues:

1. Try using the device through Smart Life app first to confirm it works
2. Use the backend proxy method (most reliable)
3. Consider getting a simpler IR blaster like Arduino + IR LED

The app is fully ready with TCL Roku codes - we just need to establish communication with your UFO-R1!
