const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  notify: (message) => ipcRenderer.send('show-notification', message)
});
