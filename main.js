const { app, BrowserWindow, globalShortcut } = require('electron');

let win;
let secondWin;
let isIgnoringMouseEvents = true;

// TODO: Modify with screen to allow usage of other monitors.

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 500, 
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      additionalArguments: ['--enable-transparent-visuals', '--disable-gpu']
    }
  });

  // load the Cactbot ACT WS Url in first window
  win.loadURL('file:///home/cora/.xlcore/wineprefix/drive_c/users/cora/AppData/Roaming/Advanced%20Combat%20Tracker/Plugins/cactbot/cactbot/ui/raidboss/raidboss.html?OVERLAY_WS=ws://127.0.0.1:10501/ws');
  win.setIgnoreMouseEvents(isIgnoringMouseEvents, { forward: true });

  // Create the second window
  secondWin = new BrowserWindow({
    width: 400,
    height: 300, 
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      additionalArguments: ['--enable-transparent-visuals', '--disable-gpu']
    },
    // Window position
      x: 2000, 
      y: 1050, 
  });

  // load the Kagerou ACT WS Url in second window
  secondWin.loadURL('https://hibiyasleep.github.io/kagerou/overlay/?HOST_PORT=ws://127.0.0.1:10501/');
  secondWin.setIgnoreMouseEvents(isIgnoringMouseEvents, { forward: true }); // Can toggle with Ctrl + Shift + D to interact with overlay
}

app.whenReady().then(() => {
  createWindow();

  // Sets Ctrl + Shift + D as a toggle to allow Kagerou overlay to be interactable
  const ret = globalShortcut.register('CommandOrControl+Shift+D', () => {
      isIgnoringMouseEvents = !isIgnoringMouseEvents;
      secondWin.setIgnoreMouseEvents(isIgnoringMouseEvents, { forward: true });
  });

  if (!ret) {
      console.log('Registration failed');
  }
  console.log(globalShortcut.isRegistered('CommandOrControl+Shift+D'));
});

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});
