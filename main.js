const { app, BrowserWindow } = require('electron');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools();
  mainWindow.on('close', () => {
    mainWindow.webContents.send("stop-server");
  });
}

app.whenReady().then(createWindow);

// for macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
