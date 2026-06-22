const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  extract: () => ipcRenderer.invoke('extract'),
  create: () => ipcRenderer.invoke('create'),
  cancel: () => ipcRenderer.invoke('cancel'),
  onProgress: (cb) => ipcRenderer.on('progress', (_, d) => cb(d))
});