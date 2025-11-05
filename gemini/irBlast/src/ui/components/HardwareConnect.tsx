import React, { useState } from 'react';
import { setActiveTransportProvider } from '../../utils/transport.service';
import { SerialIrTransportProvider, HttpIrTransportProvider, TasmotaIrTransportProvider } from '../../utils/hardware-providers';
import { UfoR1Provider } from '../../utils/ufo-r1-provider';
import { UfoR1Provider } from '../../utils/ufo-r1-provider';
type ConnectionType = 'mock' | 'serial' | 'http' | 'tasmota' | 'ufo-r1';
type ConnectionType = 'mock' | 'serial' | 'http' | 'tasmota' | 'ufo-r1';
type ConnectionType = 'mock' | 'serial' | 'http' | 'tasmota' | 'ufo-r1';
  const [connectionType, setConnectionType] = useState<ConnectionType>('ufo-r1');
  const [connectionType, setConnectionType] = useState<ConnectionType>('ufo-r1');
  const [status, setStatus] = useState('UFO-R1 device detected - enter IP address to connect');1');
  const [status, setStatus] = useState('UFO-R1 device detected - enter IP address to connect');1');
  const [status, setStatus] = useState('UFO-R1 device detected - enter IP address to connect');1');
  const [status, setStatus] = useState('UFO-R1 device detected - enter IP address to connect'););
  const [ufoR1Ip, setUfoR1Ip] = useState('192.168.1.100');
  const [status, setStatus] = useState('UFO-R1 device detected - enter IP address to connect');
  const [ufoR1Ip, setUfoR1Ip] = useState('192.168.1.100');
  const [status, setStatus] = useState('Using mock provider (console only)');
  const [ufoR1Ip, setUfoR1Ip] = useState('192.168.1.100');
  const [serialBaudRate, setSerialBaudRate] = useState('9600');
  const [ufoR1Ip, setUfoR1Ip] = useState('192.168.1.100');
  const [httpUrl, setHttpUrl] = useState('http://localhost:3022');
  const [ufoR1Ip, setUfoR1Ip] = useState('192.168.1.100');
  const [tasmotaIp, setTasmotaIp] = useState('192.168.1.100');

  const handleConnect = async () => {
    try {
      switch (connectionType) {
        case 'serial':
          const serialProvider = new SerialIrTransportProvider();
          const connected = await serialProvider.connect(parseInt(serialBaudRate));
          if (connected) {
            setActiveTransportProvider(serialProvider);
            setIsConnected(true);
            setStatus(`✅ Connected to serial port at ${serialBaudRate} baud`);
          } else {
            setStatus('❌ Failed to connect to serial port');
          }
          break;

        case 'http':
          const httpProvider = new HttpIrTransportProvider(httpUrl);
          setActiveTransportProvider(httpProvider);
          setIsConnected(true);
          setStatus(`✅ Using HTTP endpoint: ${httpUrl}`);
        case 'ufo-r1':
          const ufoProvider = new UfoR1Provider();
          const ufoConnected = await ufoProvider.connectLocal(ufoR1Ip);
          if (ufoConnected) {
            setActiveTransportProvider(ufoProvider);
            setIsConnected(true);
            setStatus(`✅ Connected to UFO-R1 at ${ufoR1Ip}`);
          } else {
            setStatus(`⚠️ UFO-R1 at ${ufoR1Ip} may require backend proxy`);
            setIsConnected(true); // Still mark as connected to try
            setActiveTransportProvider(ufoProvider);
          }
          break;

          break;

        case 'ufo-r1':
          const ufoProvider = new UfoR1Provider();
          const ufoConnected = await ufoProvider.connectLocal(ufoR1Ip);
          if (ufoConnected) {
            setActiveTransportProvider(ufoProvider);
            setIsConnected(true);
            setStatus(`✅ Connected to UFO-R1 at ${ufoR1Ip}`);
          } else {
            setStatus(`⚠️ UFO-R1 at ${ufoR1Ip} may require backend proxy`);
            setIsConnected(true); // Still mark as connected to try
            setActiveTransportProvider(ufoProvider);
          }
          break;

        case 'tasmota':
          const tasmotaProvider = new TasmotaIrTransportProvider(tasmotaIp);
        case 'ufo-r1':
          const ufoProvider = new UfoR1Provider();
          const ufoConnected = await ufoProvider.connectLocal(ufoR1Ip);
          if (ufoConnected) {
            setActiveTransportProvider(ufoProvider);
            setIsConnected(true);
            setStatus(`✅ Connected to UFO-R1 at ${ufoR1Ip}`);
          } else {
            setStatus(`⚠️ UFO-R1 at ${ufoR1Ip} may require backend proxy`);
            setIsConnected(true); // Still mark as connected to try
            setActiveTransportProvider(ufoProvider);
            <option value="ufo-r1">UFO-R1 WiFi IR Blaster</option>
          }
          break;

          setActiveTransportProvider(tasmotaProvider);
          setIsConnected(true);
        case 'ufo-r1':
          const ufoProvider = new UfoR1Provider();
          const ufoConnected = await ufoProvider.connectLocal(ufoR1Ip);
          if (ufoConnected) {
            setActiveTransportProvider(ufoProvider);
            setIsConnected(true);
            setStatus(`✅ Connected to UFO-R1 at ${ufoR1Ip}`);
          } else {
            setStatus(`⚠️ UFO-R1 at ${ufoR1Ip} may require backend proxy`);
            setIsConnected(true); // Still mark as connected to try
            setActiveTransportProvider(ufoProvider);
            <option value="ufo-r1">UFO-R1 WiFi IR Blaster</option>
          }
          break;

          setStatus(`✅ Connected to Tasmota device at ${tasmotaIp}`);
          break;

        case 'mock':
        default:
          // Already using mock provider
          setIsConnected(false);
          setStatus('Using mock provider (console only)');
          break;
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      setIsConnected(false);
            <option value="ufo-r1">UFO-R1 WiFi IR Blaster</option>
    }
  };

  return (
    <div className="ir-hardware-section">
      <h3>Hardware Connection</h3>
      
      <div className="ir-hardware-status">
        Status: <span className={isConnected ? 'success' : 'info'}>{status}</span>
      </div>

      <div className="ir-hardware-controls">
        <label>
          Connection Type:
          <select 
            value={connectionType} 
        {connectionType === 'ufo-r1' && (
          <label>
            UFO-R1 IP Address:
            <input
              type="text"
              value={ufoR1Ip}
              onChange={(e) => setUfoR1Ip(e.target.value)}
              className="ir-input"
              placeholder="192.168.1.100"
            />
          </label>
        )}

            onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
            className="ir-select"
          >
            <option value="mock">Mock (Console Only)</option>
            <option value="serial">USB/Serial (Arduino)</option>
            <option value="http">HTTP API</option>
            <option value="tasmota">Tasmota IR</option>
          </select>
        </label>

        {connectionType === 'serial' && (
          <label>
            Baud Rate:
            <select 
              value={serialBaudRate} 
              onChange={(e) => setSerialBaudRate(e.target.value)}
              className="ir-select"
        {connectionType === 'ufo-r1' && (
          <label>
            UFO-R1 IP Address:
            <input
              type="text"
              value={ufoR1Ip}
              onChange={(e) => setUfoR1Ip(e.target.value)}
              className="ir-input"
              placeholder="192.168.1.100"
            />
          </label>
        )}

            >
              <option value="9600">9600</option>
              <option value="19200">19200</option>
              <option value="38400">38400</option>
              <option value="57600">57600</option>
              <option value="115200">115200</option>
            </select>
          </label>
        )}

        {connectionType === 'http' && (

      {connectionType === 'ufo-r1' && (
        <details className="ir-hardware-help" open>
          <summary>UFO-R1 Setup Instructions</summary>
          <div className="ir-code-block">
            <p><strong>Quick Setup:</strong></p>
            <p>1. Ensure UFO-R1 is connected to your WiFi (via Smart Life app)</p>
            <p>2. Find device IP address:</p>
            <p>   - Check your router's connected devices list</p>
            <p>   - Look for device named "UFO-R1" or similar</p>
            <p>   - Common IPs: 192.168.1.x or 192.168.0.x</p>
            <p>3. Enter the IP address above and click Connect</p>
            <p></p>
            <p><strong>If it doesn't work directly:</strong></p>
            <p>• The UFO-R1 may require a backend proxy due to CORS</p>
            <p>• Try using "HTTP API" mode with the backend server</p>
            <p>• Or check if the device has a web interface at http://[IP]</p>
          </div>
        </details>
      )}
          <label>
            API URL:
            <input
              type="text"
              value={httpUrl}
              onChange={(e) => setHttpUrl(e.target.value)}
              className="ir-input"
              placeholder="http://localhost:3022"
            />
          </label>
        )}

        {connectionType === 'tasmota' && (
          <label>
            Device IP:
            <input
              type="text"
              value={tasmotaIp}
              onChange={(e) => setTasmotaIp(e.target.value)}
              className="ir-input"
              placeholder="192.168.1.100"
            />
          </label>
        )}

        <button 
          onClick={handleConnect}
          className="ir-button"
          disabled={connectionType === 'mock'}
        >
          {isConnected ? 'Reconnect' : 'Connect'}
        </button>
      </div>

      {connectionType === 'serial' && (
        <details className="ir-hardware-help">
          <summary>Arduino Setup Instructions</summary>
          <div className="ir-code-block">
            <p>1. Connect IR LED to pin 3 (with resistor)</p>
            <p>2. Upload the Arduino sketch (see hardware-providers.ts)</p>
            <p>3. Note the COM port in Device Manager</p>
            <p>4. Click Connect and select the port</p>
          </div>
        </details>
      )}

      {connectionType === 'http' && (
        <details className="ir-hardware-help">
          <summary>HTTP Backend Setup</summary>
          <div className="ir-code-block">
            <p>Run the Node.js backend server that accepts POST to /api/ir/transmit</p>
            <p>See hardware-providers.ts for example implementation</p>
          </div>
        </details>
      )}

      {connectionType === 'tasmota' && (
        <details className="ir-hardware-help">
          <summary>Tasmota Setup</summary>
          <div className="ir-code-block">
            <p>1. Flash Tasmota-IR to your ESP8266/ESP32</p>
            <p>2. Configure IR transmit pin in Tasmota settings</p>
            <p>3. Enter the device IP address above</p>
          </div>
        </details>
      )}
    </div>
  );
}
