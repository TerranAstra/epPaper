/**
 * Example Node.js Backend for IR Blaster
 * 
 * This backend can interface with various IR hardware:
 * - Command-line tools (LIRC, ir-ctl)
 * - Serial devices via serialport library
 * - Network devices via HTTP/TCP
 * 
 * Run: node backend-example.js
 */

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();

app.use(cors());
app.use(express.json());

// Configuration
const PORT = 3022;
const IR_METHOD = process.env.IR_METHOD || 'console'; // console, lirc, ir-ctl, serial

// TCL Roku TV NEC codes
const TCL_NEC_CODES = {
  powerToggle: '0x57E3,0x17',
  volumeIncrease: '0x57E3,0x0F',
  volumeDecrease: '0x57E3,0x10',
  muteToggle: '0x57E3,0x09',
  channelIncrease: '0x57E3,0x20',
  channelDecrease: '0x57E3,0x21',
  navigateUp: '0x57E3,0x19',
  navigateDown: '0x57E3,0x33',
  navigateLeft: '0x57E3,0x1E',
  navigateRight: '0x57E3,0x1F',
  navigateOk: '0x57E3,0x18',
  back: '0x57E3,0x66',
  menu: '0x57E3,0x37',
  inputSelect: '0x57E3,0x2F'
};

// Convert Pronto Hex to NEC (simplified for TCL codes)
function prontoToNec(prontoHex) {
  // This is a lookup table approach for known codes
  // In production, you'd parse the Pronto Hex properly
  const knownCodes = {
    '0000 006D 0022 0002 0157 00AB 0015 0040 0015 0015': '0x57E3,0x17', // Power
    // Add more mappings as needed
  };
  
  const prefix = prontoHex.substring(0, 50);
  return knownCodes[prefix] || '0x57E3,0x17'; // Default to power
}

// Transmit IR signal based on configured method
async function transmitIR(encoding, data, key) {
  console.log(`[IR Backend] Transmitting ${key}: ${encoding} - ${data?.substring(0, 50)}...`);
  
  let necCode = '';
  if (encoding === 'prontoHex') {
    necCode = prontoToNec(data);
  } else if (encoding === 'nec') {
    necCode = data;
  } else {
    necCode = TCL_NEC_CODES[key] || '0x57E3,0x17';
  }

  switch (IR_METHOD) {
    case 'lirc':
      // Use LIRC irsend command
      return new Promise((resolve, reject) => {
        exec(`irsend SEND_ONCE TCL_ROKU ${key.toUpperCase()}`, (error, stdout, stderr) => {
          if (error) {
            console.error('LIRC error:', error);
            reject(error);
          } else {
            console.log('LIRC output:', stdout);
            resolve(stdout);
          }
        });
      });

    case 'ir-ctl':
      // Use ir-ctl for direct NEC transmission
      return new Promise((resolve, reject) => {
        const [addr, cmd] = necCode.split(',');
        exec(`ir-ctl -S nec:${addr},${cmd}`, (error, stdout, stderr) => {
          if (error) {
            console.error('ir-ctl error:', error);
            reject(error);
          } else {
            console.log('ir-ctl output:', stdout);
            resolve(stdout);
          }
        });
      });

    case 'serial':
      // For serial devices, you'd use the serialport library
      // npm install serialport
      /*
      const { SerialPort } = require('serialport');
      const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
      port.write(`NEC:${necCode}\n`);
      */
      console.log(`Would send to serial: NEC:${necCode}`);
      return Promise.resolve();

    case 'console':
    default:
      // Just log to console for testing
      console.log(`[IR Transmit] NEC: ${necCode}`);
      return Promise.resolve();
  }
}

// Main endpoint for IR transmission
app.post('/api/ir/transmit', async (req, res) => {
  try {
    const { remote, key, encoding, data } = req.body;
    
    console.log(`[API] Received request for ${remote} - ${key}`);
    
    await transmitIR(encoding, data, key);
    
    res.json({ 
      success: true, 
      message: `Transmitted ${key}`,
      method: IR_METHOD 
    });
  } catch (error) {
    console.error('Transmission error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    method: IR_METHOD,
    port: PORT 
  });
});

// LIRC configuration generator
app.get('/api/lirc-config', (req, res) => {
  const lircConf = `
# TCL Roku TV LIRC Configuration
# Place in /etc/lirc/lircd.conf.d/tcl-roku.conf

begin remote
  name  TCL_ROKU
  bits           32
  flags SPACE_ENC
  eps            30
  aeps          100

  header       9000  4500
  one           563  1687
  zero          563   562
  ptrail        563
  repeat       9000  2250
  gap          108000
  frequency    38000

  begin codes
    KEY_POWER       0x57E30017
    KEY_VOLUMEUP    0x57E3000F
    KEY_VOLUMEDOWN  0x57E30010
    KEY_MUTE        0x57E30009
    KEY_CHANNELUP   0x57E30020
    KEY_CHANNELDOWN 0x57E30021
    KEY_UP          0x57E30019
    KEY_DOWN        0x57E30033
    KEY_LEFT        0x57E3001E
    KEY_RIGHT       0x57E3001F
    KEY_OK          0x57E30018
    KEY_BACK        0x57E30066
    KEY_MENU        0x57E30037
    KEY_INPUT       0x57E3002F
    KEY_0           0x57E30000
    KEY_1           0x57E30001
    KEY_2           0x57E30002
    KEY_3           0x57E30003
    KEY_4           0x57E30004
    KEY_5           0x57E30005
    KEY_6           0x57E30006
    KEY_7           0x57E30007
    KEY_8           0x57E30008
    KEY_9           0x57E30009
  end codes
end remote
`;
  res.type('text/plain').send(lircConf);
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     IR Blaster Backend Running         ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                            ║
║  Method: ${IR_METHOD}                         ║
║  Endpoint: /api/ir/transmit            ║
╚════════════════════════════════════════╝

Configure your frontend to use: http://localhost:${PORT}

To use different methods, set IR_METHOD:
  - console (default, logs only)
  - lirc (Linux LIRC irsend)
  - ir-ctl (Linux ir-ctl command)
  - serial (Arduino/USB serial)

Example: IR_METHOD=ir-ctl node backend-example.js
  `);
});
