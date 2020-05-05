const { app, BrowserWindow } = require('electron');
const proc = require('child_process');
const path = require('path');

let expressProcess = undefined;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools();
  mainWindow.on('close', () => {
    if (expressProcess != undefined) {
      expressProcess.kill('SIGINT');
    }
  });
}

const ipcMain = require('electron').ipcMain;
ipcMain.on('start-server', (event, arg) => {
  if (expressProcess == undefined) {
    expressProcess = proc.spawn('node', [
      './resources/app/server/index.js',
      arg.port,
      arg.address,
    ]);
  }
  event.sender.send('notify', '服务器已启动');
});

app.whenReady().then(createWindow);

// for macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
