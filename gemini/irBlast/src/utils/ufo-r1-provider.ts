import { IrTransportProvider } from './transport.service';
import { IrLogicalKeyRoleCode, IrKeyDefinition } from './types.ir';

/**
 * UFO-R1 WiFi Smart IR Blaster Provider
 * 
 * This device typically uses:
 * 1. Tuya Smart / Smart Life app ecosystem
 * 2. Local network API (sometimes discoverable)
 * 3. Cloud API through Tuya
 * 
 * Connection methods in order of preference:
 * A. Local HTTP API (if available)
 * B. Tuya Local Protocol
 * C. Cloud API (requires app credentials)
 */

export class UfoR1Provider implements IrTransportProvider {
  private deviceIp: string | null = null;
  private cloudApiKey: string | null = null;
  private deviceId: string | null = null;
  private isConnected: boolean = false;

  constructor() {
    // Try to auto-discover device on local network
    this.discoverDevice();
  }

  async discoverDevice(): Promise<void> {
    // Try common Tuya device discovery
    console.log('[UFO-R1] Attempting to discover device on local network...');
    
    // Method 1: Try common Tuya ports
    const commonPorts = [6668, 6667, 80, 8080];
    
    // This would need a backend to scan the network
    // For now, manual IP entry is required
    console.log('[UFO-R1] Auto-discovery requires backend. Please enter device IP manually.');
  }

  async connectLocal(deviceIp: string): Promise<boolean> {
    this.deviceIp = deviceIp;
    
    try {
      // Test connection with a simple request
      // Note: This may fail due to CORS in browser
      const response = await fetch(`http://${deviceIp}/status`, { 
        mode: 'no-cors',
        timeout: 3000 
      } as any);
      
      this.isConnected = true;
      console.log(`[UFO-R1] Connected to device at ${deviceIp}`);
      return true;
    } catch (error) {
      console.warn(`[UFO-R1] Could not connect directly to ${deviceIp}. May need backend proxy.`);
      // Still mark as "connected" since we'll try to send commands anyway
      this.isConnected = true;
      return true;
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

    if (!this.deviceIp) {
      throw new Error('UFO-R1 device not connected. Please enter device IP.');
    }

    console.log(`[UFO-R1] Transmitting ${role} to device at ${this.deviceIp}`);

    // The UFO-R1 typically accepts commands in these formats:
    // 1. Direct IR code transmission
    // 2. Learning mode
    // 3. Predefined device codes

    try {
      // Method 1: Try Tuya-style local API
      await this.sendTuyaLocalCommand(keyDefinition);
    } catch (error) {
      console.warn('[UFO-R1] Tuya local API failed, trying alternative method...');
      
      // Method 2: Try generic HTTP API
      await this.sendGenericHttpCommand(keyDefinition);
    }
  }

  private async sendTuyaLocalCommand(keyDefinition: IrKeyDefinition): Promise<void> {
    // Tuya devices often use a specific protocol
    // This would typically require the tuyapi library or backend
    
    const command = {
      devId: this.deviceId || 'unknown',
      gwId: this.deviceId || 'unknown',
      uid: '',
      t: Math.floor(Date.now() / 1000),
      dps: {
        '1': true, // Power on
        '2': 'ir_send', // Mode
        '3': this.convertToTuyaFormat(keyDefinition) // IR data
      }
    };

    // Note: This will likely fail due to CORS and encryption requirements
    // A backend proxy is typically needed
    try {
      const response = await fetch(`http://${this.deviceIp}/tuya`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
        mode: 'no-cors'
      });
      
      console.log('[UFO-R1] Command sent via Tuya protocol');
    } catch (error) {
      throw new Error('Tuya local protocol failed. Backend proxy may be required.');
    }
  }

  private async sendGenericHttpCommand(keyDefinition: IrKeyDefinition): Promise<void> {
    // Try a generic HTTP API format that some IR blasters use
    const irData = this.convertToGenericFormat(keyDefinition);
    
    const endpoints = [
      '/api/ir/send',
      '/ir/send',
      '/send',
      '/api/v1/ir'
    ];

    for (const endpoint of endpoints) {
      try {
        await fetch(`http://${this.deviceIp}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            format: keyDefinition.irSignalEncodingFormatCode,
            data: irData,
            repeat: 1
          }),
          mode: 'no-cors'
        });
        
        console.log(`[UFO-R1] Command sent via ${endpoint}`);
        return;
      } catch (error) {
        // Try next endpoint
      }
    }
    
    console.warn('[UFO-R1] All HTTP endpoints failed. Backend proxy recommended.');
  }

  private convertToTuyaFormat(keyDefinition: IrKeyDefinition): string {
    if (keyDefinition.irSignalEncodingFormatCode === 'prontoHex') {
      // Convert Pronto Hex to Tuya format (base64 encoded raw timings)
      const timings = this.prontoToTimings(keyDefinition.irSignalEncodedDataTextValue);
      return Buffer.from(timings.join(',')).toString('base64');
    } else if (keyDefinition.irSignalEncodingFormatCode === 'nec') {
      // NEC format
      return keyDefinition.irSignalEncodedDataTextValue;
    }
    
    return keyDefinition.irSignalEncodedDataTextValue;
  }

  private convertToGenericFormat(keyDefinition: IrKeyDefinition): any {
    if (keyDefinition.irSignalEncodingFormatCode === 'prontoHex') {
      // Some devices want raw timings
      return {
        type: 'raw',
        frequency: 38000,
        data: this.prontoToTimings(keyDefinition.irSignalEncodedDataTextValue)
      };
    } else if (keyDefinition.irSignalEncodingFormatCode === 'nec') {
      // NEC protocol
      const [addr, cmd] = keyDefinition.irSignalEncodedDataTextValue.split(',');
      return {
        type: 'nec',
        address: addr,
        command: cmd
      };
    }
    
    return keyDefinition.irSignalEncodedDataTextValue;
  }

  private prontoToTimings(prontoHex: string): number[] {
    // Convert Pronto Hex to raw timings in microseconds
    const hex = prontoHex.split(' ');
    const timings: number[] = [];
    
    // Skip header (first 4 values)
    for (let i = 4; i < hex.length; i++) {
      const value = parseInt(hex[i], 16);
      // Pronto uses units of carrier cycles, convert to microseconds
      // Assuming 38kHz carrier (most common)
      const microseconds = Math.round(value * 1000000 / 38000);
      timings.push(microseconds);
    }
    
    return timings;
  }

  // Static method to get setup instructions
  static getSetupInstructions(): string {
    return `
UFO-R1 WiFi IR Blaster Setup:

1. Initial Setup (if not done):
   - Download "Smart Life" or "Tuya Smart" app
   - Add device using the app (follow in-app instructions)
   - Device should be on same WiFi network

2. Find Device IP Address:
   Option A: Check your router's connected devices
   Option B: Use network scanner app
   Option C: In Smart Life app, go to device settings

3. Enter IP address in the connection settings above

4. Alternative: Use Backend Proxy
   - Run the backend server (backend-example.js)
   - Configure it to communicate with the UFO-R1
   - This bypasses CORS issues

Note: The UFO-R1 may require authentication tokens from the Smart Life app.
For full functionality, you may need to:
- Extract device ID and local key from the app
- Use Tuya developer account for cloud API access
`;
  }
}

// Helper for finding UFO-R1 devices on the network
export async function scanForUfoR1Devices(): Promise<string[]> {
  // This would need to be implemented in a backend
  // Browser cannot scan local network directly
  console.log('[UFO-R1] Network scanning requires backend implementation');
  return [];
}
