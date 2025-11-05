# IR Blast UI (aRef/irBlast)

Minimal Vite + React TypeScript UI to design and use IR remotes with normalized key layouts. Now includes TCL Roku TV support!

- Dark theme by default
- Sidebar to add/select remotes and choose key sets
- Remote board grid shows normalized keys with visual feedback
- JSON storage via Vite dev server file API (`/api/fs/*`), falls back to `localStorage`
- **TCL Roku TV remote pre-configured** with actual IR codes (Pronto Hex format)
- Enhanced mock IR transport provider that shows actual IR signal data

## Features

- **Pre-configured TCL Roku TV Remote** with full IR codes for all common functions
- **Two Key Set Layouts:**
  - Standard TV: Basic controls (power, volume, navigation, channels)
  - Full TV: Complete remote with digits and additional controls
- **Visual Feedback:** Buttons show pulse animation when transmitting
- **Developer Console Logging:** Shows detailed IR signal information when buttons are pressed
- **Extensible Design:** Easy to add new remotes and key layouts

## Run

```bash
cd aRef/irBlast
npm install
npm run dev
```

The app serves on `http://localhost:3021/`.

## Testing TCL Roku TV

1. Open the app at `http://localhost:3021/`
2. TCL Roku TV remote should be pre-selected
3. Choose between "standardTvKeySet.v1" or "fullTvKeySet.v1" layouts
4. Click any button to see IR signal data in browser console
5. Watch for visual feedback (blue pulse) on button press

## IR Signal Format

The TCL Roku TV uses NEC protocol with device address `0x57E3`. IR codes are stored in Pronto Hex format for universal compatibility.

Example Power button signal:
```
0000 006D 0022 0002 0157 00AB 0015 0040... (Pronto Hex)
NEC: 0x57E3 0x17
```

## Hardware Integration

To connect actual IR blaster hardware:

1. Replace `MockIrTransportProvider` with `HardwareIrTransportProvider` in `src/utils/transport.service.ts`
2. Implement the `/api/ir/transmit` endpoint for your specific hardware
3. Hardware should support Pronto Hex format or convert from it

## Supported Devices

- **TCL Roku TV** (Model: Multiple TCL Roku TV models)
  - Reference: https://www.amazon.com/dp/B0CDTPXFP5
  - Protocol: NEC
  - Full button support including digits and navigation

## Notes

- Library is stored in `user-files/ir-library.json` during dev; if file API is unavailable, it uses `localStorage`
- Sample configuration available at `user-files/ir-library-sample.json`
- To integrate a hardware IR blaster, implement `IrTransportProvider` in `src/utils/transport.service.ts`
- For hardware like Broadlink RM4 or similar USB IR blasters, add appropriate driver integration

