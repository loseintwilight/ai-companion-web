const { app, BrowserWindow, Tray, Menu, ipcMain, screen, globalShortcut, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

let mainWindow = null;
let tray = null;

// 注册自定义协议用于安全加载本地文件
function registerLocalFileProtocol() {
  protocol.registerFileProtocol('local', (request, callback) => {
    const url = request.url.substr(8); // 移除 'local://' 前缀
    try {
      // 解码 URL 并返回文件路径
      const decodedPath = decodeURIComponent(url);
      callback({ path: decodedPath });
    } catch (error) {
      console.error('加载本地文件失败:', error);
      callback({ error: -2 }); // net::FAILED
    }
  });
}

// 内容安全策略
const createCSP = () => {
  if (isDev) {
    // 开发环境：允许 eval 和本地开发服务器
    return [
      "default-src 'self';",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3000;",
      "style-src 'self' 'unsafe-inline' http://localhost:3000;",
      "img-src 'self' data: blob: local: http://localhost:3000;",
      "connect-src 'self' http://localhost:3000 ws://localhost:3000;",
      "font-src 'self' data:;",
      "worker-src 'self' blob:;"
    ].join(' ');
  } else {
    // 生产环境：更严格的策略
    return [
      "default-src 'self';",
      "script-src 'self';",
      "style-src 'self' 'unsafe-inline';",
      "img-src 'self' data: blob: local:;",
      "connect-src 'self';",
      "font-src 'self' data:;",
      "worker-src 'self' blob:;"
    ].join(' ');
  }
};

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: width - 420,
    y: height - 620,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,   // 启用安全策略
      webgl: true,         // 启用 WebGL
      allowRunningInsecureContent: false  // 禁止不安全内容
    }
  });

  // 设置 CSP
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [createCSP()]
      }
    });
  });

  // 开发环境加载本地服务器
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // 设置为可穿透点击（桌面宠物模式）
  mainWindow.setIgnoreMouseEvents(false);
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets/icon.png');
  const fs = require('fs');
  
  // 检查图标文件是否存在
  if (!fs.existsSync(iconPath)) {
    console.warn('托盘图标文件不存在:', iconPath);
    console.warn('请创建 assets/icon.png 文件，或使用默认图标');
    // 创建一个 1x1 像素的透明图标作为降级方案
    const { nativeImage } = require('electron');
    const emptyIcon = nativeImage.createEmpty();
    tray = new Tray(emptyIcon);
  } else {
    tray = new Tray(iconPath);
  }
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示', click: () => mainWindow?.show() },
    { label: '隐藏', click: () => mainWindow?.hide() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ]);
  
  tray.setToolTip('AI Companion');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  // 注册自定义协议
  registerLocalFileProtocol();
  
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信
ipcMain.handle('get-window-position', () => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    return { x, y };
  }
  return null;
});
