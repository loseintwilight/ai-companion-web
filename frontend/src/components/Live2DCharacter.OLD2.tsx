/**
 * Live2D角色组件
 * 集成Live2D Cubism 2模型到聊天界面，支持响应式布局和动作联动
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import UniversalLive2DManager from '../utils/UniversalLive2DManager';

interface Live2DCharacterProps {
  /** 模型路径 */
  modelPath?: string;
  /** 是否显示 */
  visible?: boolean;
  /** 聊天状态 */
  chatState?: 'idle' | 'user_message' | 'ai_typing' | 'ai_speaking';
  /** 最新消息内容，用于情绪分析 */
  lastMessage?: string;
  /** 容器类名 */
  className?: string;
  /** 是否启用交互 */
  interactive?: boolean;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 加载完成回调 */
  onLoaded?: () => void;
}

const Live2DCharacter: React.FC<Live2DCharacterProps> = ({
  modelPath = '/live2d/rem/rem',
  visible = true,
  chatState = 'idle',
  lastMessage = '',
  className = '',
  interactive = true,
  onError,
  onLoaded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<UniversalLive2DManager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<'checking' | 'ready' | 'failed'>('checking');
  const previousChatState = useRef<string>(chatState);
  const previousMessage = useRef<string>(lastMessage);

  /**
   * 检查 Live2D 运行时状态
   */
  const checkLive2DRuntime = useCallback(() => {
    const cubism4 = typeof window !== 'undefined' && !!window.LIVE2DCUBISMCORE;
    const cubism2 = typeof window !== 'undefined' && !!window.Live2D;
    
    if (cubism4 || cubism2) {
      setRuntimeStatus('ready');
      return true;
    }
    return false;
  }, []);

  /**
   * 等待 Live2D 运行时加载
   */
  const waitForRuntime = useCallback(async () => {
    return new Promise<boolean>((resolve) => {
      let attempts = 0;
      const maxAttempts = 50; // 5秒超时

      const checkInterval = setInterval(() => {
        attempts++;
        if (checkLive2DRuntime()) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setRuntimeStatus('failed');
          resolve(false);
        }
      }, 100);
    });
  }, [checkLive2DRuntime]);

  /**
   * 初始化Live2D管理器
   */
  const initializeLive2D = useCallback(async () => {
    if (!containerRef.current || managerRef.current?.initialized) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting Live2D initialization...');

      // 等待 Live2D 运行时
      const runtimeReady = await waitForRuntime();
      if (!runtimeReady) {
        throw new Error('Live2D runtime not available. Please check if live2dcubismcore.min.js or live2d.min.js is loaded.');
      }

      // 验证容器
      if (!containerRef.current) {
        throw new Error('Container element not found');
      }

      // 创建管理器实例
      managerRef.current = new UniversalLive2DManager();
      
      // 配置参数
      const config = {
        modelPath,
        width: containerRef.current.clientWidth || 400,
        height: containerRef.current.clientHeight || 600,
        scale: 1.0, // 增加默认缩放
        x: (containerRef.current.clientWidth || 400) / 2,
        y: (containerRef.current.clientHeight || 600) / 2,
      };
      
      console.log('🔧 Initializing with config:', config);
      console.log('📐 Container dimensions:', {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        offsetWidth: containerRef.current.offsetWidth,
        offsetHeight: containerRef.current.offsetHeight
      });
      
      // 初始化
      await managerRef.current.initialize(containerRef.current, config);
      
      setIsInitialized(true);
      setIsLoading(false);
      onLoaded?.();
      
      console.log('Live2D character initialized successfully');
    } catch (err) {
      const error = err as Error;
      console.error('Failed to initialize Live2D character:', error);
      setError(error.message);
      setIsLoading(false);
      onError?.(error);
    }
  }, [modelPath, onError, onLoaded, waitForRuntime]);

  /**
   * 处理聊天状态变化
   */
  const handleChatStateChange = useCallback(async () => {
    if (!managerRef.current?.initialized || !chatState) return;

    // 只在状态真正改变时触发动作
    if (previousChatState.current !== chatState) {
      try {
        await managerRef.current.triggerChatMotion(chatState);
        previousChatState.current = chatState;
        console.log(`Chat state changed to: ${chatState}`);
      } catch (error) {
        console.error('Failed to trigger chat motion:', error);
      }
    }
  }, [chatState]);

  /**
   * 处理消息情绪分析
   */
  const handleMessageAnalysis = useCallback(async () => {
    if (!managerRef.current?.initialized || !lastMessage) return;

    // 只在消息真正改变时进行分析
    if (previousMessage.current !== lastMessage) {
      try {
        await managerRef.current.analyzeEmotionAndTrigger(lastMessage);
        previousMessage.current = lastMessage;
        console.log(`Analyzed message: ${lastMessage.slice(0, 30)}...`);
      } catch (error) {
        console.error('Failed to analyze message emotion:', error);
      }
    }
  }, [lastMessage]);

  /**
   * 处理窗口大小变化
   */
  const handleResize = useCallback(() => {
    try {
      if (managerRef.current?.initialized) {
        managerRef.current.resize();
      }
    } catch (error) {
      console.warn('Resize handler error caught:', error);
    }
  }, []);

  // 运行时检查效果
  useEffect(() => {
    if (visible) {
      checkLive2DRuntime();
    }
  }, [visible, checkLive2DRuntime]);

  // 初始化效果
  useEffect(() => {
    if (visible && containerRef.current && runtimeStatus === 'ready') {
      initializeLive2D();
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [visible, runtimeStatus, initializeLive2D]);

  // 聊天状态变化效果
  useEffect(() => {
    if (isInitialized) {
      handleChatStateChange();
    }
  }, [chatState, isInitialized, handleChatStateChange]);

  // 消息分析效果
  useEffect(() => {
    if (isInitialized && lastMessage) {
      handleMessageAnalysis();
    }
  }, [lastMessage, isInitialized, handleMessageAnalysis]);

  // 窗口大小变化监听 - 使用防抖
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const debouncedResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(handleResize, 16);
    };
    
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [handleResize]);

  if (!visible) {
    return null;
  }

  return (
    <div className={`live2d-character-container ${className}`}>
      {/* Live2D渲染容器 */}
      <div
        ref={containerRef}
        className="live2d-canvas-container w-full h-full relative overflow-hidden"
        style={{
          minHeight: '400px',
          minWidth: '300px',
          background: 'transparent',
          border: process.env.NODE_ENV === 'development' ? '1px dashed #ccc' : 'none',
        }}
      />

      {/* 运行时检查状态 */}
      {runtimeStatus === 'checking' && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-80 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-sm text-blue-600">检查Live2D运行时...</p>
          </div>
        </div>
      )}

      {/* 运行时失败状态 */}
      {runtimeStatus === 'failed' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-80 rounded-lg">
          <div className="flex flex-col items-center space-y-2 p-4 text-center">
            <div className="text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-red-600">Live2D运行时加载失败</p>
            <p className="text-xs text-red-500">请检查 live2dcubismcore.min.js 或 live2d.min.js 是否正确加载</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && runtimeStatus === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600">加载Live2D模型中...</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-80 rounded-lg">
          <div className="flex flex-col items-center space-y-2 p-4 text-center">
            <div className="text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-red-600">Live2D模型加载失败</p>
            <p className="text-xs text-red-500 max-w-xs">{error}</p>
            <button
              onClick={initializeLive2D}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* 状态指示器 */}
      {isInitialized && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            chatState === 'idle' ? 'bg-blue-500' :
            chatState === 'user_message' ? 'bg-green-500' :
            chatState === 'ai_typing' ? 'bg-yellow-500' :
            chatState === 'ai_speaking' ? 'bg-red-500' : 'bg-gray-500'
          }`}></div>
          <span className="text-xs text-gray-600 bg-white bg-opacity-80 px-2 py-1 rounded">
            {chatState === 'idle' ? '空闲' :
             chatState === 'user_message' ? '收到消息' :
             chatState === 'ai_typing' ? 'AI思考中' :
             chatState === 'ai_speaking' ? 'AI回复中' : '未知状态'}
          </span>
        </div>
      )}

      {/* 调试信息（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded max-w-xs">
          <div>运行时: {runtimeStatus}</div>
          <div>状态: {chatState}</div>
          <div>已初始化: {isInitialized ? '是' : '否'}</div>
          <div>交互: {interactive ? '启用' : '禁用'}</div>
          {lastMessage && <div>消息: {lastMessage.slice(0, 20)}...</div>}
          <div>管理器: UniversalLive2DManager</div>
          {managerRef.current && <div>版本: {managerRef.current.version}</div>}
        </div>
      )}
    </div>
  );
};

export default Live2DCharacter;