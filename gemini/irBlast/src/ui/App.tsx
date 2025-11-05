import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RemoteBoard } from './components/RemoteBoard';
import { HardwareConnect } from './components/HardwareConnect';
import { useIrUiStateStore } from '../utils/state.store';
import { loadLibraryFromStorage } from '../utils/storage.service';

export default function App() {
  const { setLibraryDataModel, libraryDataModel } = useIrUiStateStore();

  useEffect(() => {
    (async () => {
      const loaded = await loadLibraryFromStorage();
      setLibraryDataModel(loaded);
    })();
  }, [setLibraryDataModel]);

  return (
    <div className="ir-app-frame">
      <Sidebar />
      <main className="ir-app-main">
        <header className="ir-app-header">
          <h1>IR Blaster</h1>
          <p className="ir-subtitle">Design, select, and send remote keys</p>
        </header>
        <HardwareConnect />
        <RemoteBoard />
      </main>
    </div>
  );
}


