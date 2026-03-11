// Electron Preload Script
// 注入 electronAPI 到渲染进程

const { contextBridge, ipcRenderer } = require('electron');

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, callback) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  invoke: async (channel, data) => {
    const validChannels = ['get-window-position', 'set-window-position', 'minimize-window', 'close-window'];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
    return null;
  }
});

console.log('✅ Electron preload script loaded - electronAPI injected');
