const { app, BrowserWindow, systemPreferences, powerSaveBlocker } = require('electron');
const path = require('path')
const url = require('url')

powerSaveBlocker.start('prevent-app-suspension');


const createWindow = () => {
  const win = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: {
      backgroundThrottling: false
    }
  });
  
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
}

const start = () => {
  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

if( process.platform === 'darwin' ){
  systemPreferences.askForMediaAccess('camera').then( () => {
    start();
  })
} else {
  start();
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})