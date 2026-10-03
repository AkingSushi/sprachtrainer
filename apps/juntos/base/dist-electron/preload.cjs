"use strict";

// electron/preload.ts
var import_electron = require("electron");
var bridge = {
  load: () => import_electron.ipcRenderer.invoke("local:load"),
  command: (command) => import_electron.ipcRenderer.invoke("local:command", command),
  exportData: () => import_electron.ipcRenderer.invoke("local:export"),
  importData: (text) => import_electron.ipcRenderer.invoke("local:import", text),
  info: () => import_electron.ipcRenderer.invoke("local:info"),
  speechVoices: () => import_electron.ipcRenderer.invoke("local:speech-voices"),
  speakSapi: (text, voiceName) => import_electron.ipcRenderer.invoke("local:speak-sapi", text, voiceName),
  cancelSpeech: () => import_electron.ipcRenderer.invoke("local:speech-cancel")
};
import_electron.contextBridge.exposeInMainWorld("zajedno", Object.freeze(bridge));
//# sourceMappingURL=preload.cjs.map
