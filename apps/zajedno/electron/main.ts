import { app, BrowserWindow, dialog, ipcMain, screen, session, type IpcMainInvokeEvent } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { LocalStore } from './store';
import { cancelSapiSpeech, getSapiVoices, speakSapi } from './speech';
import { commandSchema, MAX_IMPORT_BYTES, parseBackup, type Result } from '../src/domain/state';

const localRoot = process.env.LOCALAPPDATA ?? app.getPath('appData');
app.setPath('userData', path.join(localRoot, 'Zajedno'));
app.setAppUserModelId('org.zajedno.desktop');
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
let mainWindow: BrowserWindow | null = null;
const store = new LocalStore(app.getPath('userData'));
const devUrl = !app.isPackaged ? process.env.ZAJEDNO_DEV_URL : undefined;
if (devUrl && !/^http:\/\/(localhost|127\.0\.0\.1):\d+\/?$/u.test(devUrl)) throw new Error('Invalid development URL');
const productionUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href;
const rendererUrl = devUrl ? new URL(devUrl).href : productionUrl;
let flushed = false;
let closing = false;

function finishAndQuit() {
  if (closing) return;
  closing = true;
  cancelSapiSpeech();
  void store.flush().finally(() => {
    flushed = true;
    setImmediate(() => app.quit());
  });
}

function checkSender(event: IpcMainInvokeEvent) {
  if (!mainWindow || event.sender !== mainWindow.webContents || event.senderFrame !== mainWindow.webContents.mainFrame || event.senderFrame.url !== rendererUrl)
    throw new Error('UNTRUSTED_SENDER');
}

const knownErrors = new Set(['NAME_EXISTS', 'PROFILE_LIMIT', 'PROFILE_MISSING', 'STALE_REVIEW', 'IMPORT_INVALID', 'STORAGE_CORRUPT', 'ENTRY_EXISTS', 'ENTRY_LIMIT', 'ENTRY_MISSING', 'STALE_ENTRY', 'STORAGE_LIMIT']);
function expose<T>(channel: string, action: (...args: unknown[]) => Promise<T>) {
  ipcMain.handle(channel, async (event, ...args): Promise<Result<T>> => {
    try { checkSender(event); return { ok: true, value: await action(...args) }; }
    catch (error) { return { ok: false, error: error instanceof Error && knownErrors.has(error.message) ? error.message : 'STORAGE_ERROR' }; }
  });
}

async function openWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: Math.min(1240, width), height: Math.min(900, height), minWidth: Math.min(400, width), minHeight: Math.min(600, height),
    show: false, backgroundColor: '#f5f8f5', title: 'Zajedno',
    icon: path.join(__dirname, '../dist/zajedno.png'), autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, spellcheck: false },
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow?.maximize();
    mainWindow?.show();
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.webContents.on('will-attach-webview', (event) => event.preventDefault());
  mainWindow.webContents.on('render-process-gone', () => {
    void dialog.showMessageBox({ type: 'error', title: 'Zajedno', message: 'Bitte Zajedno neu starten. Gespeicherte Daten bleiben erhalten.\nPonovo pokrenite Zajedno. Sačuvani podaci ostaju sačuvani.' });
  });
  mainWindow.webContents.on('did-fail-load', (_event, code) => {
    if (code !== -3) void dialog.showMessageBox({ type: 'error', title: 'Zajedno', message: 'Die Oberfläche konnte nicht geladen werden. Bitte neu starten oder neu installieren.\nPrikaz nije učitan. Ponovo pokrenite ili instalirajte aplikaciju.' });
  });
  mainWindow.on('close', (event) => {
    if (flushed) return;
    event.preventDefault();
    finishAndQuit();
  });
  mainWindow.on('closed', () => { mainWindow = null; });
  await mainWindow.loadURL(rendererUrl);
}

if (gotLock) {
  app.on('second-instance', () => { if (mainWindow?.isMinimized()) mainWindow.restore(); mainWindow?.focus(); });
  void app.whenReady().then(async () => {
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      const url = new URL(details.url);
      const allowed = url.protocol === 'file:' || url.protocol === 'data:' || url.protocol === 'blob:' ||
        (!!devUrl && ((url.protocol === 'http:' || url.protocol === 'ws:') && url.host === new URL(devUrl).host));
      callback({ cancel: !allowed });
    });
    expose('local:load', () => store.load());
    expose('local:command', (input) => store.command(commandSchema.parse(input)));
    expose('local:info', async () => ({ desktop: true, path: store.file }));
    expose('local:speech-voices', () => getSapiVoices());
    expose('local:speak-sapi', (text, voiceName) => {
      if (typeof text !== 'string' || typeof voiceName !== 'string') throw new Error('SPEECH_INVALID');
      return speakSapi(text, voiceName);
    });
    expose('local:speech-cancel', async () => { cancelSapiSpeech(); return true; });
    expose('local:export', async () => {
      const text = await store.exportData();
      const language = (await store.load()).uiLanguage;
      const result = await dialog.showSaveDialog(mainWindow!, { title: language === 'de' ? 'Sicherung speichern' : 'Sačuvaj rezervnu kopiju', defaultPath: `Zajedno-${new Date().toISOString().slice(0, 10)}.json`, filters: [{ name: 'JSON', extensions: ['json'] }] });
      if (result.canceled || !result.filePath) return false;
      await writeFile(result.filePath, text, 'utf8');
      return true;
    });
    expose('local:import', async (text) => {
      if (typeof text !== 'string' || Buffer.byteLength(text, 'utf8') > MAX_IMPORT_BYTES) throw new Error('IMPORT_INVALID');
      parseBackup(text);
      return store.restore(text);
    });
    await openWindow();
  }).catch(() => {
    dialog.showErrorBox('Zajedno', 'Start fehlgeschlagen. Bitte neu starten.\nPokretanje nije uspelo. Pokušajte ponovo.');
    app.quit();
  });
  app.on('before-quit', (event) => {
    if (flushed) return;
    event.preventDefault();
    finishAndQuit();
  });
  app.on('window-all-closed', () => app.quit());
}