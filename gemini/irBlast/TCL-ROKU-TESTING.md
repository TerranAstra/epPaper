# TCL Roku TV IR Blaster Testing Guide

## What's Been Implemented

✅ **TCL Roku TV IR Codes Library** (`src/utils/tcl-roku-codes.ts`)
- Complete set of IR codes for TCL Roku TV in Pronto Hex format
- NEC protocol with device address 0x57E3
- All standard buttons: Power, Volume, Channels, Navigation, Digits (0-9), Menu, Back, Input

✅ **Enhanced Key Layouts** (`src/utils/defaults.ir.ts`)
- Standard layout: Basic TV controls
- Full layout: Complete remote with number pad

✅ **Improved Transport Service** (`src/utils/transport.service.ts`)
- Shows actual IR signal data in console
- Visual feedback with pulse animation
- Ready for hardware integration

✅ **Better UI/UX**
- Visual button labels with icons
- Hover and click animations
- Dark theme optimized
- Responsive button grid

## Testing Instructions

### 1. Server is Running
The development server is now running at `http://localhost:3021`

### 2. Open in Browser
Navigate to `http://localhost:3021` in your browser

### 3. Test Features

#### Visual Testing
- **TCL Roku TV** should be pre-selected in the sidebar
- **Full TV Key Set** should be active
- You should see a grid of buttons including:
  - Power, Input, Menu, Mute (top row)
  - Volume and Channel controls
  - Navigation arrows and OK button
  - Back button
  - Number pad (0-9)

#### Interaction Testing
1. **Click any button** - You should see:
   - Blue pulse animation on the button
   - Console output with IR signal details

2. **Open Browser Console** (F12) to see:
   ```
   [IR Blast] 2025-11-03T...
   Remote: tcl::roku-tv::default
   Key: powerToggle (Power Toggle)
   Encoding: prontoHex
   Signal Preview: 0000 006D 0022 0002 0157 00AB 0015 0040...
   ```

3. **Try Different Key Sets**:
   - Click "standardTvKeySet.v1" for basic layout
   - Click "fullTvKeySet.v1" for complete remote

### 4. Console Commands for Testing

Open browser console and test directly:
```javascript
// Get current state
useIrUiStateStore.getState().libraryDataModel

// Trigger a button programmatically
sendIrSignalForLogicalKeyRole('powerToggle')
```

## Hardware Integration Next Steps

When you get the actual IR blaster hardware:

1. **Determine Hardware API**:
   - USB serial communication
   - HTTP API
   - WebSerial API

2. **Update Transport Provider**:
   - Switch from `MockIrTransportProvider` to `HardwareIrTransportProvider`
   - Implement actual transmission logic

3. **Test with Real TV**:
   - Ensure IR blaster is positioned correctly
   - Test range and angle requirements
   - Verify all buttons work

## IR Code Reference

The TCL Roku TV uses these NEC codes:
- Power: 0x57E3 0x17
- Volume Up: 0x57E3 0x0F
- Volume Down: 0x57E3 0x10
- Mute: 0x57E3 0x09
- Channel Up: 0x57E3 0x20
- Channel Down: 0x57E3 0x21
- OK: 0x57E3 0x18
- Back: 0x57E3 0x66
- Menu: 0x57E3 0x37

## Troubleshooting

- **Server not responding**: Check if port 3021 is free
- **Buttons not working**: Check browser console for errors
- **No visual feedback**: Ensure CSS is loaded correctly
- **IR codes not showing**: Open browser developer console

## Files Modified/Created

- `src/utils/tcl-roku-codes.ts` - TCL IR codes library
- `src/utils/defaults.ir.ts` - Enhanced with TCL remote and full key set
- `src/utils/transport.service.ts` - Better logging and visual feedback
- `src/ui/components/RemoteBoard.tsx` - Improved button labels
- `src/ui/styles.css` - Added animations and better styling
- `user-files/ir-library-sample.json` - Sample configuration
- `README.md` - Updated documentation
