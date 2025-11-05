export type IrLogicalKeyRoleCode =
  | 'powerToggle'
  | 'volumeIncrease'
  | 'volumeDecrease'
  | 'muteToggle'
  | 'channelIncrease'
  | 'channelDecrease'
  | 'navigateUp'
  | 'navigateDown'
  | 'navigateLeft'
  | 'navigateRight'
  | 'navigateOk'
  | 'back'
  | 'menu'
  | 'digit0'
  | 'digit1'
  | 'digit2'
  | 'digit3'
  | 'digit4'
  | 'digit5'
  | 'digit6'
  | 'digit7'
  | 'digit8'
  | 'digit9'
  | 'inputSelect';

export type IrSignalEncodingFormatCode =
  | 'prontoHex'
  | 'nec'
  | 'rc5'
  | 'rc6'
  | 'rawTimings';

export interface IrKeyDefinition {
  logicalKeyRoleCode: IrLogicalKeyRoleCode;
  displayLabelTextValue: string;
  irSignalEncodingFormatCode: IrSignalEncodingFormatCode;
  irSignalEncodedDataTextValue: string | null;
}

export interface IrRemoteDefinition {
  remoteUniqueKeyTextValue: string;
  manufacturerTextValue: string;
  modelTextValue: string;
  preferredKeySetKeyTextValue: string | null;
  keyDefinitions: IrKeyDefinition[];
}

export interface IrKeyPlacementDefinition {
  logicalKeyRoleCode: IrLogicalKeyRoleCode;
  positionRowIndex: number;
  positionColumnIndex: number;
}

export interface IrKeySetLayoutDefinition {
  keySetUniqueKeyTextValue: string;
  keyPlacements: IrKeyPlacementDefinition[];
}

export interface IrLibraryDataModel {
  remotes: IrRemoteDefinition[];
  keySets: IrKeySetLayoutDefinition[];
  activeRemoteUniqueKeyTextValue: string | null;
  activeKeySetUniqueKeyTextValue: string | null;
}


