const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { extractArchive, createArchive } = require('./services/archiver');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 350,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// ================= EXTRACT =================
ipcMain.handle('extract-archive', async () => {
  const file = await dialog.showOpenDialog({
    properties: ['openFile']
  });

  if (file.canceled) return;

  const folder = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (folder.canceled) return;

  const res = await extractArchive(
    file.filePaths[0],
    folder.filePaths[0]
  );

  return { success: true, res };
});

// ================= CREATE =================
ipcMain.handle('create-archive', async () => {
  const folder = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (folder.canceled) return;

  const save = await dialog.showSaveDialog({
    defaultPath: 'archive.zip'
  });

  if (save.canceled) return;

  const res = await createArchive(
    save.filePath,
    folder.filePaths[0]
  );

  return { success: true, res };
});