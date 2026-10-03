import { applyCommand, initialState, makeBackup, parseBackup, stateSchema, type AppState, type LocalBridge, type Result } from '../domain/state';

declare global { interface Window { zajedno?: LocalBridge } }

async function safe<T>(action: () => Promise<T>): Promise<Result<T>> {
  try { return { ok: true, value: await action() }; }
  catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'STORAGE_ERROR' }; }
}

let databasePromise: Promise<IDBDatabase> | undefined;
function database() {
  databasePromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('zajedno-browser-v1', 1);
    request.onupgradeneeded = () => { request.result.createObjectStore('state'); request.result.createObjectStore('backups'); };
    request.onsuccess = () => { request.result.onversionchange = () => { request.result.close(); databasePromise = undefined; }; resolve(request.result); };
    request.onerror = () => { databasePromise = undefined; reject(new Error('STORAGE_ERROR')); };
    request.onblocked = () => { databasePromise = undefined; reject(new Error('STORAGE_ERROR')); };
  });
  return databasePromise;
}

async function transaction(change?: (state: AppState) => AppState, backup = false, restore?: AppState): Promise<AppState> {
  const databaseHandle = await database();
  return new Promise((resolve, reject) => {
    const transactionHandle = databaseHandle.transaction(['state', 'backups'], 'readwrite');
    const store = transactionHandle.objectStore('state');
    const request = store.get('current');
    let result: AppState;
    let failure: unknown;
    request.onsuccess = () => {
      try {
        const parsed = stateSchema.safeParse(request.result ?? initialState());
        if (!parsed.success && !restore) throw new Error('STORAGE_CORRUPT');
        const current = parsed.success ? parsed.data : initialState();
        const migrating = parsed.success && request.result?.version === 1;
        if ((backup || migrating) && request.result !== undefined) transactionHandle.objectStore('backups').put(request.result, `${Date.now()}-${crypto.randomUUID()}`);
        result = restore ? { ...restore, revision: Math.max(current.revision, restore.revision) + 1 } : change ? change(current) : current;
        if (change || restore || migrating) store.put(stateSchema.parse(result), 'current');
      } catch (error) { failure = error; transactionHandle.abort(); }
    };
    transactionHandle.oncomplete = () => resolve(result);
    transactionHandle.onerror = () => reject(failure ?? new Error('STORAGE_ERROR'));
    transactionHandle.onabort = () => reject(failure ?? new Error('STORAGE_ERROR'));
  });
}

const browserBridge: LocalBridge = {
  load: () => safe(() => transaction()),
  command: (command) => safe(() => transaction((current) => applyCommand(current, command), ['removeProfile', 'editEntry', 'removeEntry'].includes(command.type))),
  exportData: () => safe(async () => {
    const data = makeBackup(await transaction());
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `Zajedno-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }),
  importData: (text) => safe(() => transaction(undefined, true, parseBackup(text))),
  info: async () => ({ ok: true, value: { desktop: false, path: 'IndexedDB · zajedno-browser-v1' } }),
};

export const api: LocalBridge = window.zajedno ?? browserBridge;