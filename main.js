const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let win;
let currentProcess = null;
let queue = [];

function sendProgress(percent, message) {
  win.webContents.send('progress', { percent, message });
}

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 420,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);


function runExtract(filePath, outputPath) {
  return new Promise((resolve, reject) => {

    const p = spawn('7zz', [
      'x',
      filePath,
      `-o${outputPath}`,
      '-y'
    ]);

    currentProcess = p;

    let last = 0;
    let err = '';

    p.stdout.on('data', (d) => {
      const text = d.toString();
      const match = text.match(/(\d+)%/);

      if (match) {
        const percent = parseInt(match[1]);
        if (percent > last) {
          last = percent;
          sendProgress(percent, `Extracting... ${percent}%`);
        }
      }
    });

    p.stderr.on('data', d => err += d.toString());

    p.on('close', (code) => {
      currentProcess = null;

      if (code === 0) resolve(true);
      else reject(new Error(err));
    });

    p.on('error', reject);
  });
}


function runCreate(outputFile, inputPath) {
  return new Promise((resolve, reject) => {

    const p = spawn('7zz', [
      'a',
      outputFile,
      inputPath,
      '-bsp1'   // 🔥 IMPORTANT: enables progress info
    ]);

    currentProcess = p;

    let last = 0;
    let err = '';

    p.stdout.on('data', (d) => {
      const text = d.toString();

      // 🔥 try extract % if available
      const match = text.match(/(\d+)%/);

      if (match) {
        const percent = parseInt(match[1]);

        if (percent > last) {
          last = percent;
          sendProgress(percent, `Compressing... ${percent}%`);
        }
      } else {
        // fallback smooth animation
        if (last < 90) {
          last += 1;
          sendProgress(last, `Compressing...`);
        }
      }
    });

    p.stderr.on('data', d => err += d.toString());

    p.on('close', (code) => {
      currentProcess = null;

      if (code === 0) {
        sendProgress(100, "Archive Created Successfully ✅");
        resolve(true);
      } else {
        sendProgress(0, "Create Failed ❌");
        reject(new Error(err || "Create failed"));
      }
    });

    p.on('error', reject);
  });
}



async function processQueue() {
  if (queue.length === 0) return;

  const job = queue[0];

  try {
    sendProgress(5, "Starting...");
    await runExtract(job.filePath, job.out);
    sendProgress(100, "Done");
  } catch (e) {
    sendProgress(0, "Error");
  }

  queue.shift();
  processQueue();
}



ipcMain.handle('extract', async () => {

  const file = await dialog.showOpenDialog({ properties: ['openFile'] });
  if (file.canceled) return;

  const dest = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (dest.canceled) return;

  const filePath = file.filePaths[0];

  const out = path.join(
    dest.filePaths[0],
    path.basename(filePath, path.extname(filePath))
  );

  queue.push({ filePath, out });

  if (queue.length === 1) processQueue();

  return { success: true };
});

ipcMain.handle('create', async () => {

  const folder = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (folder.canceled) return;

  const save = await dialog.showSaveDialog({
    defaultPath: 'archive.zip'
  });

  if (save.canceled) return;

  await runCreate(save.filePath, folder.filePaths[0]);

  return { success: true };
});

ipcMain.handle('cancel', async () => {
  if (currentProcess) {
    currentProcess.kill('SIGKILL');
    currentProcess = null;
    sendProgress(0, "Cancelled");
  }
});