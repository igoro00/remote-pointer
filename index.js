const { app, BrowserWindow } = require('electron');
const WebSocket = require('ws');

let overlayWindow;

app.on('ready', () => {
  // Create the overlay window
  overlayWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    fullscreen: true,
    skipTaskbar: true,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      contextIsolation: false, // Required for ipcRenderer
    },
  });
  overlayWindow.maximize()

  overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.loadFile('index.html');

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  // Start WebSocket server
  const wss = new WebSocket.Server({ port: 3000 });

  wss.on('connection', (ws) => {
    console.log('WebSocket connection established.');

    ws.on('message', (buf) => {
      try {
        const message = buf.toString();
        const data = JSON.parse(message);
        let { x, y } = data;        

        // Validate coordinates
        if (typeof x === 'number' && typeof y === 'number') {
          if (overlayWindow) {
            x = Math.round((x / 100) * overlayWindow.getSize()[0]);
            y = Math.round((y / 100) * overlayWindow.getSize()[1]);
            overlayWindow.webContents.send('update-pointer', { x:x-20, y });
          }
        }
      } catch (error) {
        console.error('Invalid message received:', message);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed.');
    });
  });

  console.log('WebSocket server running on ws://localhost:3000');
});