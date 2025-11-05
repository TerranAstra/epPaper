/**
 * Hardware Detection and Integration Guide
 * 
 * Common IR Blaster Types and Their APIs:
 * 
 * 1. USB Serial Devices (Arduino-based, USB-UIRT, etc.)
 *    - Uses Web Serial API or node-serialport
 *    - Usually appears as COM port on Windows
 * 
 * 2. Broadlink RM Series (RM Mini 3, RM4 Pro, etc.)
 *    - Uses HTTP/TCP protocol
 *    - Python-broadlink library or direct protocol
 * 
 * 3. Tasmota IR devices (ESP8266/ESP32 based)
 *    - HTTP/MQTT API
 *    - RESTful endpoints
 * 
 * 4. LIRC-compatible devices (Linux IR Control)
 *    - Command-line interface
 *    - irsend commands
 */

export async function detectIrBlasterHardware() {
  const detectionResults = {
    serialPorts: [] as any[],
    networkDevices: [] as any[],
    webUsbDevices: [] as any[]
  };

  // Check for Web Serial API support (Chrome/Edge)
  if ('serial' in navigator) {
    try {
      // This requires user permission
      const ports = await (navigator as any).serial.getPorts();
      detectionResults.serialPorts = ports;
      console.log('Serial ports found:', ports.length);
    } catch (e) {
      console.log('Serial API available but no ports accessible:', e);
    }
  }

  // Check for WebUSB devices
  if ('usb' in navigator) {
    try {
      const devices = await (navigator as any).usb.getDevices();
      detectionResults.webUsbDevices = devices;
      console.log('USB devices found:', devices.length);
    } catch (e) {
      console.log('WebUSB API available but no devices accessible:', e);
    }
  }

  return detectionResults;
}

// Common IR blaster hardware identifiers
export const KNOWN_DEVICES = {
  // USB Serial devices
  USB_UIRT: { vendorId: 0x0403, productId: 0x6001, name: 'USB-UIRT' },
  ARDUINO_UNO: { vendorId: 0x2341, productId: 0x0043, name: 'Arduino Uno' },
  ARDUINO_NANO: { vendorId: 0x0403, productId: 0x6001, name: 'Arduino Nano' },
  CH340: { vendorId: 0x1A86, productId: 0x7523, name: 'CH340 Serial' },
  
  // Network devices (would need separate discovery)
  BROADLINK_RM: { port: 80, name: 'Broadlink RM' },
  TASMOTA_IR: { port: 80, name: 'Tasmota IR' }
};

// Helper to identify device type from USB descriptors
export function identifyUsbDevice(device: any) {
  for (const [key, info] of Object.entries(KNOWN_DEVICES)) {
    if (device.vendorId === info.vendorId && device.productId === info.productId) {
      return info.name;
    }
  }
  return `Unknown (VID: 0x${device.vendorId?.toString(16)}, PID: 0x${device.productId?.toString(16)})`;
}
