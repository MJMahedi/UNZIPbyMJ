const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const AdmZip = require('adm-zip');
const { ipcMain } = require('electron');

ipcMain.handle('unzip', async () => {
  const zipFile = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Zip Files', extensions: ['zip'] }]
  });

  if (zipFile.canceled) return;

  const folder = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (folder.canceled) return;

  const zip = new AdmZip(zipFile.filePaths[0]);
  zip.extractAllTo(folder.filePaths[0], true);

  return true;
});
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 260,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

async function unzipFile() {
  const zipFile = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Zip Files', extensions: ['zip'] }]
  });

  if (zipFile.canceled) return;

  const folder = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (folder.canceled) return;

  const zip = new AdmZip(zipFile.filePaths[0]);
  zip.extractAllTo(folder.filePaths[0], true);

  return 'Done';
}

app.whenReady().then(createWindow);

module.exports = { unzipFile };