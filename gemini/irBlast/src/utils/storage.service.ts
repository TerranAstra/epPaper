import { useIrUiStateStore } from './state.store';
import { IrLibraryDataModel } from './types.ir';
import { createInitialLibrary } from './defaults.ir';

const LIBRARY_PATH = 'ir-library.json';

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function readFromFileApi(): Promise<IrLibraryDataModel | null> {
  try {
    const data = await postJson('/api/fs/read', { path: LIBRARY_PATH });
    const parsed = JSON.parse(data.content);
    return parsed as IrLibraryDataModel;
  } catch {
    return null;
  }
}

async function writeToFileApi(model: IrLibraryDataModel): Promise<boolean> {
  try {
    await postJson('/api/fs/write', { path: LIBRARY_PATH, content: JSON.stringify(model, null, 2) });
    return true;
  } catch {
    return false;
  }
}

export async function loadLibraryFromStorage(): Promise<IrLibraryDataModel> {
  const fromFile = await readFromFileApi();
  if (fromFile) return fromFile;
  const fromLocal = localStorage.getItem('ir-library.json');
  if (fromLocal) return JSON.parse(fromLocal) as IrLibraryDataModel;
  return createInitialLibrary();
}

export async function saveLibraryToStorage(): Promise<void> {
  const model = useIrUiStateStore.getState().libraryDataModel;
  const ok = await writeToFileApi(model);
  if (!ok) {
    localStorage.setItem('ir-library.json', JSON.stringify(model));
  }
}


