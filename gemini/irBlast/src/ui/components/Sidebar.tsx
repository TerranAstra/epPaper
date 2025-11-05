import React, { useMemo, useState } from 'react';
import { useIrUiStateStore } from '../../utils/state.store';
import { saveLibraryToStorage } from '../../utils/storage.service';
import { IrRemoteDefinition, IrKeySetLayoutDefinition } from '../../utils/types.ir';
import { createTclRokuRemote } from '../../utils/tcl-roku-codes';

export function Sidebar() {
  const {
    libraryDataModel,
    setActiveRemoteUniqueKeyTextValue,
    setActiveKeySetUniqueKeyTextValue,
    upsertRemoteDefinition,
    deleteRemoteDefinition
  } = useIrUiStateStore();

  const [newRemoteManufacturerTextValue, setNewRemoteManufacturerTextValue] = useState('');
  const [newRemoteModelTextValue, setNewRemoteModelTextValue] = useState('');

  const allRemotes = libraryDataModel.remotes;
  const allKeySets = libraryDataModel.keySets;

  const selectedRemoteKey = libraryDataModel.activeRemoteUniqueKeyTextValue || '';
  const selectedKeySetKey = libraryDataModel.activeKeySetUniqueKeyTextValue || '';

  const canCreateRemote = useMemo(() => {
    return newRemoteManufacturerTextValue.trim().length > 0 && newRemoteModelTextValue.trim().length > 0;
  }, [newRemoteManufacturerTextValue, newRemoteModelTextValue]);

  const handleCreateRemote = async () => {
    if (!canCreateRemote) return;
    const remoteUniqueKeyTextValue = `${newRemoteManufacturerTextValue.trim()}::${newRemoteModelTextValue.trim()}::${Date.now()}`;
    const remote: IrRemoteDefinition = {
      remoteUniqueKeyTextValue,
      manufacturerTextValue: newRemoteManufacturerTextValue.trim(),
      modelTextValue: newRemoteModelTextValue.trim(),
      preferredKeySetKeyTextValue: libraryDataModel.activeKeySetUniqueKeyTextValue || null,
      keyDefinitions: []
    };
    upsertRemoteDefinition(remote);
    setActiveRemoteUniqueKeyTextValue(remoteUniqueKeyTextValue);
    await saveLibraryToStorage();
    setNewRemoteManufacturerTextValue('');
    setNewRemoteModelTextValue('');
  };

  const handleSelectRemote = async (remoteKey: string) => {
    setActiveRemoteUniqueKeyTextValue(remoteKey);
    await saveLibraryToStorage();
  };

  const handleSelectKeySet = async (keySetKey: string) => {
    setActiveKeySetUniqueKeyTextValue(keySetKey);
    await saveLibraryToStorage();
  };

  const handleDeleteRemote = async (remoteKey: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the remote
    if (confirm('Delete this remote?')) {
      deleteRemoteDefinition(remoteKey);
      await saveLibraryToStorage();
    }
  };

  const handleAddTclRoku = async () => {
    const tclRemote = createTclRokuRemote();
    upsertRemoteDefinition(tclRemote);
    setActiveRemoteUniqueKeyTextValue(tclRemote.remoteUniqueKeyTextValue);
    await saveLibraryToStorage();
  };

  return (
    <aside className="ir-sidebar">
      <div className="ir-sidebar-section">
        <h3>Remotes</h3>
        <div className="ir-list">
          {allRemotes.map(r => (
            <div
              key={r.remoteUniqueKeyTextValue}
              className={"ir-list-item-wrapper" + (selectedRemoteKey === r.remoteUniqueKeyTextValue ? ' selected' : '')}
            >
              <button
                className="ir-list-item"
                onClick={() => handleSelectRemote(r.remoteUniqueKeyTextValue)}
              >
                <span>{r.manufacturerTextValue}</span>
                <span className="muted">{r.modelTextValue}</span>
              </button>
              <button
                className="ir-delete-btn"
                onClick={(e) => handleDeleteRemote(r.remoteUniqueKeyTextValue, e)}
                title="Delete remote"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="ir-form-row">
          <button className="ir-button ir-button-secondary" onClick={handleAddTclRoku}>
            + Add TCL Roku TV
          </button>
        </div>
        <div className="ir-form-row">
          <input
            className="ir-input"
            placeholder="Manufacturer"
            value={newRemoteManufacturerTextValue}
            onChange={(e) => setNewRemoteManufacturerTextValue(e.target.value)}
          />
          <input
            className="ir-input"
            placeholder="Model"
            value={newRemoteModelTextValue}
            onChange={(e) => setNewRemoteModelTextValue(e.target.value)}
          />
          <button className="ir-button" disabled={!canCreateRemote} onClick={handleCreateRemote}>Add Remote</button>
        </div>
      </div>

      <div className="ir-sidebar-section">
        <h3>Key Sets</h3>
        <div className="ir-list">
          {allKeySets.map(k => (
            <button
              key={k.keySetUniqueKeyTextValue}
              className={"ir-list-item" + (selectedKeySetKey === k.keySetUniqueKeyTextValue ? ' selected' : '')}
              onClick={() => handleSelectKeySet(k.keySetUniqueKeyTextValue)}
            >
              <span>{k.keySetUniqueKeyTextValue}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}


