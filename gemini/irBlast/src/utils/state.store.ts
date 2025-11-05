import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IrLibraryDataModel, IrRemoteDefinition } from './types.ir';
import { createInitialLibrary } from './defaults.ir';

type IrUiState = {
  libraryDataModel: IrLibraryDataModel;
  setLibraryDataModel: (next: IrLibraryDataModel) => void;
  setActiveRemoteUniqueKeyTextValue: (key: string | null) => void;
  setActiveKeySetUniqueKeyTextValue: (key: string | null) => void;
  upsertRemoteDefinition: (remote: IrRemoteDefinition) => void;
  deleteRemoteDefinition: (remoteKey: string) => void;
};

export const useIrUiStateStore = create<IrUiState>()(
  persist(
    (set, get) => ({
      libraryDataModel: createInitialLibrary(),
      setLibraryDataModel: (next) => set({ libraryDataModel: next }),
      setActiveRemoteUniqueKeyTextValue: (key) => set({
        libraryDataModel: { ...get().libraryDataModel, activeRemoteUniqueKeyTextValue: key }
      }),
      setActiveKeySetUniqueKeyTextValue: (key) => set({
        libraryDataModel: { ...get().libraryDataModel, activeKeySetUniqueKeyTextValue: key }
      }),
      upsertRemoteDefinition: (remote) => set(({ libraryDataModel }) => {
        const existingIndex = libraryDataModel.remotes.findIndex(r => r.remoteUniqueKeyTextValue === remote.remoteUniqueKeyTextValue);
        const nextRemotes = [...libraryDataModel.remotes];
        if (existingIndex >= 0) nextRemotes[existingIndex] = remote; else nextRemotes.push(remote);
        return { libraryDataModel: { ...libraryDataModel, remotes: nextRemotes } };
      }),
      deleteRemoteDefinition: (remoteKey) => set(({ libraryDataModel }) => {
        const nextRemotes = libraryDataModel.remotes.filter(r => r.remoteUniqueKeyTextValue !== remoteKey);
        // If we're deleting the active remote, clear the selection
        const nextActiveRemote = libraryDataModel.activeRemoteUniqueKeyTextValue === remoteKey 
          ? null 
          : libraryDataModel.activeRemoteUniqueKeyTextValue;
        return { 
          libraryDataModel: { 
            ...libraryDataModel, 
            remotes: nextRemotes,
            activeRemoteUniqueKeyTextValue: nextActiveRemote
          } 
        };
      }),
    }),
    {
      name: 'ir-ui-state',
      partialize: (state) => ({ libraryDataModel: state.libraryDataModel }),
    }
  )
);


