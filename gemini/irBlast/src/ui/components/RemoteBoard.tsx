import React, { useMemo } from 'react';
import { useIrUiStateStore } from '../../utils/state.store';
import { IrLogicalKeyRoleCode } from '../../utils/types.ir';
import { sendIrSignalForLogicalKeyRole } from '../../utils/transport.service';

export function RemoteBoard() {
  const { libraryDataModel } = useIrUiStateStore();

  const activeRemote = useMemo(() => {
    const key = libraryDataModel.activeRemoteUniqueKeyTextValue;
    if (!key) return null;
    return libraryDataModel.remotes.find(r => r.remoteUniqueKeyTextValue === key) || null;
  }, [libraryDataModel]);

  const activeKeySet = useMemo(() => {
    const key = libraryDataModel.activeKeySetUniqueKeyTextValue;
    if (!key) return null;
    return libraryDataModel.keySets.find(k => k.keySetUniqueKeyTextValue === key) || null;
  }, [libraryDataModel]);

  // Create a map of button labels for better display
  const buttonLabels: Record<string, string> = {
    powerToggle: '⏻ Power',
    inputSelect: '⎙ Input',
    muteToggle: '🔇 Mute',
    volumeIncrease: '🔊 Vol+',
    volumeDecrease: '🔉 Vol−',
    channelIncrease: '📺 CH+',
    channelDecrease: '📺 CH−',
    navigateUp: '↑',
    navigateDown: '↓',
    navigateLeft: '←',
    navigateRight: '→',
    navigateOk: 'OK',
    back: '⏎ Back',
    menu: '☰ Menu',
    digit0: '0',
    digit1: '1',
    digit2: '2',
    digit3: '3',
    digit4: '4',
    digit5: '5',
    digit6: '6',
    digit7: '7',
    digit8: '8',
    digit9: '9'
  };

  if (!activeKeySet) {
    return (
      <section className="ir-board">
        <div className="ir-board-empty">Select or create a Key Set</div>
      </section>
    );
  }

  if (!activeRemote) {
    return (
      <section className="ir-board">
        <div className="ir-board-empty">Select or create a Remote to start using the IR Blaster</div>
      </section>
    );
  }

  const rows = Math.max(1, ...activeKeySet.keyPlacements.map(p => p.positionRowIndex + 1));
  const cols = Math.max(1, ...activeKeySet.keyPlacements.map(p => p.positionColumnIndex + 1));

  const cellMap = new Map<string, IrLogicalKeyRoleCode>();
  activeKeySet.keyPlacements.forEach(p => {
    cellMap.set(`${p.positionRowIndex}:${p.positionColumnIndex}`, p.logicalKeyRoleCode);
  });

  const onClickKey = async (role: IrLogicalKeyRoleCode) => {
    await sendIrSignalForLogicalKeyRole(role);
  };

  const getButtonLabel = (role: IrLogicalKeyRoleCode): string => {
    return buttonLabels[role] || role.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <section className="ir-board" style={{ gridTemplateRows: `repeat(${rows}, 1fr)`, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: rows }).map((_, rIndex) => (
        Array.from({ length: cols }).map((_, cIndex) => {
          const key = `${rIndex}:${cIndex}`;
          const role = cellMap.get(key) || null;
          return (
            <button
              key={key}
              className={"ir-board-cell" + (role ? '' : ' empty')}
              onClick={() => role && onClickKey(role)}
              disabled={!role || !activeRemote}
              title={role || ''}
            >
              <span className="ir-cell-label">{role ? getButtonLabel(role) : ''}</span>
            </button>
          );
        })
      ))}
    </section>
  );
}


