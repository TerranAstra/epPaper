import { IrKeySetLayoutDefinition, IrLibraryDataModel, IrLogicalKeyRoleCode } from './types.ir';
import { createTclRokuRemote } from './tcl-roku-codes';

const STANDARD_TV_KEYS: Array<{ role: IrLogicalKeyRoleCode; r: number; c: number }> = [
  { role: 'powerToggle', r: 0, c: 0 },
  { role: 'inputSelect', r: 0, c: 1 },
  { role: 'muteToggle', r: 0, c: 2 },

  { role: 'volumeIncrease', r: 1, c: 0 },
  { role: 'navigateUp', r: 1, c: 1 },
  { role: 'channelIncrease', r: 1, c: 2 },

  { role: 'volumeDecrease', r: 2, c: 0 },
  { role: 'navigateOk', r: 2, c: 1 },
  { role: 'channelDecrease', r: 2, c: 2 },

  { role: 'navigateLeft', r: 3, c: 0 },
  { role: 'navigateDown', r: 3, c: 1 },
  { role: 'navigateRight', r: 3, c: 2 },
];

const FULL_TV_KEYS: Array<{ role: IrLogicalKeyRoleCode; r: number; c: number }> = [
  // Row 0 - Power, Input, Menu
  { role: 'powerToggle', r: 0, c: 0 },
  { role: 'inputSelect', r: 0, c: 1 },
  { role: 'menu', r: 0, c: 2 },
  { role: 'muteToggle', r: 0, c: 3 },

  // Row 1 - Volume and Channel
  { role: 'volumeIncrease', r: 1, c: 0 },
  { role: 'channelIncrease', r: 1, c: 3 },

  // Row 2 - Navigation
  { role: 'navigateUp', r: 2, c: 1 },
  { role: 'navigateUp', r: 2, c: 2 },

  { role: 'volumeDecrease', r: 3, c: 0 },
  { role: 'navigateLeft', r: 3, c: 1 },
  { role: 'navigateOk', r: 3, c: 2 },
  { role: 'navigateRight', r: 3, c: 3 },
  { role: 'channelDecrease', r: 3, c: 4 },

  { role: 'back', r: 4, c: 1 },
  { role: 'navigateDown', r: 4, c: 2 },

  // Rows 5-7 - Number pad
  { role: 'digit1', r: 5, c: 0 },
  { role: 'digit2', r: 5, c: 1 },
  { role: 'digit3', r: 5, c: 2 },

  { role: 'digit4', r: 6, c: 0 },
  { role: 'digit5', r: 6, c: 1 },
  { role: 'digit6', r: 6, c: 2 },

  { role: 'digit7', r: 7, c: 0 },
  { role: 'digit8', r: 7, c: 1 },
  { role: 'digit9', r: 7, c: 2 },

  { role: 'digit0', r: 8, c: 1 },
];

export function createDefaultKeySet(): IrKeySetLayoutDefinition {
  return {
    keySetUniqueKeyTextValue: 'standardTvKeySet.v1',
    keyPlacements: STANDARD_TV_KEYS.map(x => ({
      logicalKeyRoleCode: x.role,
      positionRowIndex: x.r,
      positionColumnIndex: x.c,
    })),
  };
}

export function createFullKeySet(): IrKeySetLayoutDefinition {
  return {
    keySetUniqueKeyTextValue: 'fullTvKeySet.v1',
    keyPlacements: FULL_TV_KEYS.map(x => ({
      logicalKeyRoleCode: x.role,
      positionRowIndex: x.r,
      positionColumnIndex: x.c,
    })),
  };
}

export function createInitialLibrary(): IrLibraryDataModel {
  const tclRemote = createTclRokuRemote();
  return {
    remotes: [tclRemote],
    keySets: [createDefaultKeySet(), createFullKeySet()],
    activeRemoteUniqueKeyTextValue: tclRemote.remoteUniqueKeyTextValue,
    activeKeySetUniqueKeyTextValue: 'fullTvKeySet.v1',
  };
}


