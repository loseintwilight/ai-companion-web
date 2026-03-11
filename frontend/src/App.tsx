import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EnhancedChatContainer from './components/EnhancedChatContainer';
import ErrorBoundary from './components/ErrorBoundary';
import DesktopApp from './components/DesktopApp';
import DesktopControls from './components/DesktopControls';
import DesktopPetApp from './components/DesktopPetApp'; // 新增：桌面宠物应用
import './App.css';

function App() {
  const [isDesktopMode, setIsDesktopMode] = React.useState(false);

  React.useEffect(() => {
    // 导入Electron API
    import('./electron');

    // 检测是否在桌面环境中运行
    const checkDesktopMode = async () => {
      try {
        console.log('[App] Checking desktop mode...');

        // 方式1: 检测 Electron API (通过 preload 注入)
        if (typeof window !== 'undefined' && window.electronAPI) {
          console.log('[App] Electron API detected');
          setIsDesktopMode(true);
          return;
        }

        // 方式2: 检测 Electron 进程
        if (typeof window !== 'undefined' && window.process && 
            (window.process as NodeJS.Process & { type?: string })?.type === 'renderer') {
          console.log('[App] Electron renderer process detected');
          setIsDesktopMode(true);
          return;
        }

        // 方式3: 检测 Tauri API
        try {
          const { invoke } = await import('@tauri-apps/api/tauri');
          await invoke('get_window_position');
          console.log('[App] Tauri detected');
          setIsDesktopMode(true);
          return;
        } catch (tauriError) {
          // Tauri not available
        }

        // 方式4: 检测 URL 参数 (用于测试)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('desktop') === 'true') {
          console.log('[App] Desktop mode forced via URL parameter');
          setIsDesktopMode(true);
          return;
        }

        console.log('[App] Not in desktop mode, using web mode');
        setIsDesktopMode(false);
      } catch (error) {
        console.log('[App] Desktop detection failed:', error);
        setIsDesktopMode(false);
      }
    };

    // 延迟检测，等待 preload 脚本执行
    setTimeout(checkDesktopMode, 100);
  }, []);

  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        {isDesktopMode ? (
          // 桌面模式 - 新的桌面宠物应用
          <DesktopPetApp />
        ) : (
          // Web 模式
          <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Routes>
              <Route path="/" element={
                <ErrorBoundary fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center p-8">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">AI伴侣暂时无法使用</h2>
                      <p className="text-gray-600 mb-4">请刷新页面重试</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        刷新页面
                      </button>
                    </div>
                  </div>
                }>
                  <EnhancedChatContainer />
                </ErrorBoundary>
              } />
            </Routes>
          </div>
        )}
      </Router>
    </ErrorBoundary>
  );
}

export default App;