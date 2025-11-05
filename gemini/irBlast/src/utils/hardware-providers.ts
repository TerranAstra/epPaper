import { IrTransportProvider } from './transport.service';
import { IrLogicalKeyRoleCode, IrKeyDefinition } from './types.ir';

/**
 * Web Serial API Provider for Arduino/USB-based IR blasters
 * Works with Arduino sketch that accepts NEC commands
 */
export class SerialIrTransportProvider implements IrTransportProvider {
  private port: any = null;
  private writer: any = null;
  private reader: any = null;

  async connect(baudRate: number = 9600): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported. Use Chrome or Edge.');
      }

      // Request port from user
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate });

      // Setup writer
      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
      this.writer = textEncoder.writable.getWriter();

      console.log('Serial IR blaster connected at', baudRate, 'baud');
      return true;
    } catch (error) {
      console.error('Failed to connect serial port:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.writer) {
      await this.writer.close();
    }
    if (this.port) {
      await this.port.close();
    }
  }

  async transmitLogicalKeyRole(
    remoteUniqueKeyTextValue: string, 
    role: IrLogicalKeyRoleCode, 
    keyDefinition: IrKeyDefinition | null
  ): Promise<void> {
    if (!keyDefinition || !keyDefinition.irSignalEncodedDataTextValue) {
      throw new Error(`No IR signal data for ${role}`);
    }

    if (!this.writer) {
      throw new Error('Serial port not connected');
    }

    // Convert based on encoding format
    let command = '';
    
    if (keyDefinition.irSignalEncodingFormatCode === 'prontoHex') {
      // Convert Pronto Hex to NEC (simplified - assumes TCL format)
      // In production, use proper Pronto Hex parser
      command = this.prontoToNec(keyDefinition.irSignalEncodedDataTextValue);
    } else if (keyDefinition.irSignalEncodingFormatCode === 'nec') {
      command = `NEC:${keyDefinition.irSignalEncodedDataTextValue}\n`;
    }

    // Send to Arduino
    await this.writer.write(command);
    console.log(`[Serial IR] Transmitted: ${command}`);
  }

  private prontoToNec(prontoHex: string): string {
    // This is a simplified converter for TCL Roku codes
    // Full implementation would parse all Pronto Hex formats
    
    // TCL Roku TV NEC codes mapping (from our known codes)
    const prontoToNecMap: Record<string, string> = {
      // Power
      '0000 006D 0022 0002 0157 00AB 0015 0040 0015 0015 0015 0015 0015 0040 0015 0040 0015 0040 0015 0015 0015 0015 0015 0040 0015 0040 0015 0015 0015 0040 0015 0015 0015 0015 0015 0015 0015 0040 0015 0015 0015 0015 0015 0040 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0040 0015 0040 0015 0015 0015 0040 0015 0040 0015 0040 0015 0040 0015 0040 0015 05F7': 'NEC:0x57E3,0x17\n',
      // Add more mappings as needed
    };

    return prontoToNecMap[prontoHex] || 'NEC:0x57E3,0x17\n'; // Default to power
  }
}

/**
 * HTTP API Provider for network-based IR blasters (Tasmota, custom HTTP endpoints)
 */
export class HttpIrTransportProvider implements IrTransportProvider {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3022') {
    this.baseUrl = baseUrl;
  }

  async transmitLogicalKeyRole(
    remoteUniqueKeyTextValue: string, 
    role: IrLogicalKeyRoleCode, 
    keyDefinition: IrKeyDefinition | null
  ): Promise<void> {
    if (!keyDefinition || !keyDefinition.irSignalEncodedDataTextValue) {
      throw new Error(`No IR signal data for ${role}`);
    }

    const response = await fetch(`${this.baseUrl}/api/ir/transmit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        remote: remoteUniqueKeyTextValue,
        key: role,
        encoding: keyDefinition.irSignalEncodingFormatCode,
        data: keyDefinition.irSignalEncodedDataTextValue
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP IR transmission failed: ${response.statusText}`);
    }

    console.log(`[HTTP IR] Transmitted: ${role}`);
  }
}

/**
 * Tasmota-specific provider for ESP8266/ESP32 devices running Tasmota IR
 */
export class TasmotaIrTransportProvider implements IrTransportProvider {
  private deviceIp: string;

  constructor(deviceIp: string) {
    this.deviceIp = deviceIp;
  }

  async transmitLogicalKeyRole(
    remoteUniqueKeyTextValue: string, 
    role: IrLogicalKeyRoleCode, 
    keyDefinition: IrKeyDefinition | null
  ): Promise<void> {
    if (!keyDefinition || !keyDefinition.irSignalEncodedDataTextValue) {
      throw new Error(`No IR signal data for ${role}`);
    }

    // Tasmota expects specific format
    let irData = '';
    
    if (keyDefinition.irSignalEncodingFormatCode === 'prontoHex') {
      // Convert Pronto to raw format for Tasmota
      irData = this.prontoToRaw(keyDefinition.irSignalEncodedDataTextValue);
    } else if (keyDefinition.irSignalEncodingFormatCode === 'nec') {
      // Tasmota can handle NEC directly
      irData = `{"Protocol":"NEC","Bits":32,"Data":"${keyDefinition.irSignalEncodedDataTextValue}"}`;
    }

    // Send to Tasmota device
    const url = `http://${this.deviceIp}/cm?cmnd=IRsend%20${encodeURIComponent(irData)}`;
    
    const response = await fetch(url, { mode: 'no-cors' }); // no-cors for local devices
    console.log(`[Tasmota IR] Transmitted to ${this.deviceIp}: ${role}`);
  }

  private prontoToRaw(prontoHex: string): string {
    // Convert Pronto Hex to Tasmota raw format
    // This is a simplified version - full implementation would parse properly
    const parts = prontoHex.split(' ');
    
    // Skip header (first 4 values)
    const timings = parts.slice(4).map(hex => parseInt(hex, 16) * 25); // Convert to microseconds
    
    return JSON.stringify({
      Protocol: 'RAW',
      Data: timings.join(',')
    });
  }
}

/**
 * Arduino Sketch for Serial IR Blaster
 * Upload this to your Arduino with an IR LED on pin 3
 */
export const ARDUINO_SKETCH = `
#include <IRremote.h>

IRsend irsend;  // Uses pin 3 on Arduino Uno

void setup() {
  Serial.begin(9600);
  Serial.println("Arduino IR Blaster Ready");
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\\n');
    
    if (command.startsWith("NEC:")) {
      // Parse NEC command: "NEC:0x57E3,0x17"
      command.remove(0, 4); // Remove "NEC:"
      int commaIndex = command.indexOf(',');
      
      if (commaIndex > 0) {
        String addrStr = command.substring(0, commaIndex);
        String cmdStr = command.substring(commaIndex + 1);
        
        unsigned long address = strtoul(addrStr.c_str(), NULL, 0);
        unsigned long cmd = strtoul(cmdStr.c_str(), NULL, 0);
        
        // Send NEC command
        unsigned long data = (address << 16) | cmd;
        irsend.sendNEC(data, 32);
        
        Serial.print("Sent NEC: 0x");
        Serial.println(data, HEX);
      }
    } else if (command.startsWith("RAW:")) {
      // Handle raw timings
      // ... implementation for raw IR signals ...
    }
  }
}
`;
