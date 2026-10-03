import { contextBridge, ipcRenderer } from 'electron';
import type { LocalBridge } from '../src/domain/state';

const bridge: LocalBridge = {
  load: () => ipcRenderer.invoke('local:load'),
  command: (command) => ipcRenderer.invoke('local:command', command),
  exportData: () => ipcRenderer.invoke('local:export'),
  importData: (text) => ipcRenderer.invoke('local:import', text),
  info: () => ipcRenderer.invoke('local:info'),
  speechVoices: () => ipcRenderer.invoke('local:speech-voices'),
  speakSapi: (text, voiceName) => ipcRenderer.invoke('local:speak-sapi', text, voiceName),
  cancelSpeech: () => ipcRenderer.invoke('local:speech-cancel'),
};
contextBridge.exposeInMainWorld('zajedno', Object.freeze(bridge));