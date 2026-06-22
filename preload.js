const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  extractArchive: () => ipcRenderer.invoke('extract-archive')
});