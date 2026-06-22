const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { extractArchive } = require('./services/archiver');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 350,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('extract-archive', async () => {
  const file = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Archives', extensions: ['zip', 'rar', 'docx'] }
    ]
  });

  if (file.canceled) return;

  const dest = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (dest.canceled) return;

  const archivePath = file.filePaths[0];
  const baseName = path.basename(archivePath, path.extname(archivePath));
  const finalPath = path.join(dest.filePaths[0], baseName);

  if (!fs.existsSync(finalPath)) {
    fs.mkdirSync(finalPath);
  }

  const result = await extractArchive(archivePath, finalPath);

  return {
    success: true,
    folder: finalPath,
    type: result.type || 'unknown',
    message: result.message || 'Extracted successfully'
  };
});