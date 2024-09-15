const { app, BrowserWindow, Menu, Notification, Tray, nativeImage, ipcMain } = require('electron');
const path = require('path');
let win;
let tray;

let icon = nativeImage.createFromPath(path.join(__dirname, 'build/icons/icon.png'));

// Impede múltiplas instâncias
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.commandLine.appendSwitch('disable-gpu');
  app.setName('DTHelper');

  

  if (require('electron-reloader')) {
    require('electron-reloader')(module);
  }

  function createWindow() {
    if (win) {
      return; // Garante que não crie uma nova janela se já existir uma
    }

    win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false,
        icon: path.join(__dirname, 'build/icons/icon.ico'),
      },
    });

    win.loadFile('index.html');

    // Abre as Developer Tools
    win.webContents.openDevTools();
  }

  app.whenReady().then(() => {
    createWindow();

    Menu.setApplicationMenu(null);

    // Cria a bandeja no Windows
    tray = new Tray(icon); // Ícone da bandeja
    const trayMenu = Menu.buildFromTemplate([
      {
        label: 'Mostrar Aplicativo',
        click: () => {
          win.show();
        }
      },
      {
        label: 'Fechar Aplicativo',
        click: () => {
          tray.destroy();  // Remove o ícone da bandeja
          app.quit();      // Fecha a aplicação completamente
        }
      }
    ]);

    tray.setContextMenu(trayMenu);
    tray.setToolTip('DTHelper'); // Texto ao passar o mouse sobre o ícone

    tray.on('click', () => {
      win.show(); // Mostra a janela quando o ícone da bandeja é clicado
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  // Adicione o listener IPC para mostrar notificações
  ipcMain.on('show-notification', (event, message) => {
    new Notification({ title: 'Mudança nos Contadores de RAPs', body: message }).show();
  });
}
