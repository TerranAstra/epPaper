import { useIrUiStateStore } from './state.store';
import { IrLogicalKeyRoleCode, IrKeyDefinition } from './types.ir';

export interface IrTransportProvider {
  transmitLogicalKeyRole: (remoteUniqueKeyTextValue: string, role: IrLogicalKeyRoleCode, keyDefinition: IrKeyDefinition | null) => Promise<void>;
}

class MockIrTransportProvider implements IrTransportProvider {
  async transmitLogicalKeyRole(
    remoteUniqueKeyTextValue: string, 
    role: IrLogicalKeyRoleCode, 
    keyDefinition: IrKeyDefinition | null
  ): Promise<void> {
    // Enhanced mock that shows actual IR data that would be sent
    const timestamp = new Date().toISOString();
    
    if (keyDefinition && keyDefinition.irSignalEncodedDataTextValue) {
      // Log detailed IR signal information
      console.group(`[IR Blast] ${timestamp}`);
      console.log(`Remote: ${remoteUniqueKeyTextValue}`);
      console.log(`Key: ${role} (${keyDefinition.displayLabelTextValue})`);
      console.log(`Encoding: ${keyDefinition.irSignalEncodingFormatCode}`);
      
      if (keyDefinition.irSignalEncodingFormatCode === 'prontoHex') {
        // Parse Pronto Hex for display (first few values for brevity)
        const hexValues = keyDefinition.irSignalEncodedDataTextValue.split(' ').slice(0, 8);
        console.log(`Signal Preview: ${hexValues.join(' ')}...`);
      } else {
        console.log(`Signal Data: ${keyDefinition.irSignalEncodedDataTextValue}`);
      }
      
      // Show visual feedback in the UI
      const button = document.querySelector(`[title="${role}"]`);
      if (button) {
        button.classList.add('ir-transmitting');
        setTimeout(() => button.classList.remove('ir-transmitting'), 200);
      }
      
      console.groupEnd();
    } else {
      console.warn(`[IR] No signal data for ${role} on remote ${remoteUniqueKeyTextValue}`);
    }
    
    // Simulate transmission delay
    await new Promise(r => setTimeout(r, 100));
  }
}

// This would be replaced with actual hardware interface
class HardwareIrTransportProvider implements IrTransportProvider {
  async transmitLogicalKeyRole(
    remoteUniqueKeyTextValue: string, 
    role: IrLogicalKeyRoleCode, 
    keyDefinition: IrKeyDefinition | null
  ): Promise<void> {
    if (!keyDefinition || !keyDefinition.irSignalEncodedDataTextValue) {
      throw new Error(`No IR signal data for ${role}`);
    }
    
    // Example of what actual hardware integration might look like:
    // await fetch('/api/ir/transmit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     encoding: keyDefinition.irSignalEncodingFormatCode,
    //     data: keyDefinition.irSignalEncodedDataTextValue
    //   })
    // });
    
    console.log(`[Hardware IR] Would transmit: ${role}`);
  }
}

// Transport provider management
let activeTransportProvider: IrTransportProvider = new MockIrTransportProvider();

export function setActiveTransportProvider(provider: IrTransportProvider) {
  activeTransportProvider = provider;
  console.log('[IR Transport] Provider changed to:', provider.constructor.name);
}

export function getActiveTransportProvider(): IrTransportProvider {
  return activeTransportProvider;
}

export async function sendIrSignalForLogicalKeyRole(role: IrLogicalKeyRoleCode): Promise<void> {
  const { libraryDataModel } = useIrUiStateStore.getState();
  const remoteKey = libraryDataModel.activeRemoteUniqueKeyTextValue;
  if (!remoteKey) {
    console.warn('[IR] No remote selected');
    return;
  }
  
  // Find the remote and key definition
  const remote = libraryDataModel.remotes.find(r => r.remoteUniqueKeyTextValue === remoteKey);
  if (!remote) {
    console.warn(`[IR] Remote not found: ${remoteKey}`);
    return;
  }
  
  const keyDefinition = remote.keyDefinitions.find(k => k.logicalKeyRoleCode === role) || null;
  
  await activeTransportProvider.transmitLogicalKeyRole(remoteKey, role, keyDefinition);
}


