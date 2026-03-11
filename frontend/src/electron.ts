// Electron API 类型定义和导出
// 注意：Window 接口的 process 属性已在 types/live2d.ts 中统一声明

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.process === 'object' && 
         (window.process as NodeJS.Process & { type?: string })?.type === 'renderer';
};

export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

export const getDesktopEnv = (): 'electron' | 'tauri' | 'web' => {
  if (isElectron()) return 'electron';
  if (isTauri()) return 'tauri';
  return 'web';
};

export const electronAPI = {
  isElectron,
  isTauri,
  getDesktopEnv,
  send: (channel: string, data?: unknown): void => {
    if (window.electronAPI) {
      window.electronAPI.send(channel, data);
    }
  },
  receive: (channel: string, callback: (...args: unknown[]) => void): void => {
    if (window.electronAPI) {
      window.electronAPI.receive(channel, callback);
    }
  },
  invoke: async (channel: string, data?: unknown): Promise<unknown> => {
    if (window.electronAPI) {
      return window.electronAPI.invoke(channel, data);
    }
    return null;
  }
};

export default electronAPI;
