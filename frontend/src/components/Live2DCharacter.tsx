/**
 * Live2D角色组件 - Cubism 2 版本
 * 使用 Cubism2Manager 加载和渲染 Cubism 2 模型
 * 
 * 基于 working-cubism2-test.html 的成功实现
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Cubism2Manager } from '../utils/Cubism2Manager';

interface Live2DCharacterProps {
  /** 模型路径 */
  modelPath?: string;
  /** 是否显示 */
  visible?: boolean;
  /** 聊天状态 */
  chatState?: 'idle' | 'user_message' | 'ai_typing' | 'ai_speaking';
  /** 最新消息内容 */
  lastMessage?: string;
  /** 容器类名 */
  className?: string;
  /** 是否启用交互 */
  interactive?: boolean;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 加载完成回调 */
  onLoaded?: () => void;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
}

const Live2DCharacter: React.FC<Live2DCharacterProps> = ({
  modelPath = './live2d/rem/rem/model.json',
  visible = true,
  chatState = 'idle',
  lastMessage = '',
  className = '',
  interactive = true,
  onError,
  onLoaded,
  style,
  width: propWidth,
  height: propHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<Cubism2Manager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * 初始化Live2D管理器
   */
  const initializeLive2D = useCallback(async () => {
    if (!canvasRef.current || !containerRef.current || managerRef.current?.getIsInitialized()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('[Live2DCharacter] Starting initialization...');

      // 等待 Live2D SDK 加载
      let retries = 0;
      while (typeof window.Live2D === 'undefined' && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (typeof window.Live2D === 'undefined') {
        throw new Error('Live2D library not loaded after 5 seconds');
      }

      console.log('[Live2DCharacter] Live2D SDK loaded');

      // 获取容器尺寸 - 使用props或容器实际尺寸
      const width = propWidth || containerRef.current.clientWidth || 400;
      const height = propHeight || containerRef.current.clientHeight || 600;

      console.log('[Live2DCharacter] Container dimensions:', { width, height });

      // 创建管理器实例
      managerRef.current = new Cubism2Manager({
        modelPath,
        width,
        height,
        scale: 0.8, // 使用之前成功的缩放值
        x: 0, // 居中
        y: 0
      });

      // 初始化
      await managerRef.current.initialize(canvasRef.current);

      setIsInitialized(true);
      setIsLoading(false);
      onLoaded?.();

      console.log('[Live2DCharacter] Initialization complete');
    } catch (err) {
      const error = err as Error;
      console.error('[Live2DCharacter] Initialization failed:', error);
      setError(error.message);
      setIsLoading(false);
      onError?.(error);
    }
  }, [modelPath, onError, onLoaded, propWidth, propHeight]);

  /**
   * 处理窗口大小变化
   */
  const handleResize = useCallback(() => {
    try {
      if (managerRef.current?.getIsInitialized() && containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        managerRef.current.resize(width, height);
      }
    } catch (error) {
      console.warn('[Live2DCharacter] Resize handler error:', error);
    }
  }, []);

  // 初始化效果
  useEffect(() => {
    if (visible && canvasRef.current && containerRef.current) {
      initializeLive2D();
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [visible, initializeLive2D]);

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
    <div className={`live2d-character-container ${className}`} style={style}>
      {/* Live2D渲染容器 */}
      <div
        ref={containerRef}
        className="live2d-canvas-container w-full h-full relative overflow-hidden"
        style={{
          // 排查4: 确保容器有明确的最小尺寸
          minHeight: '400px',
          minWidth: '300px',
          height: '100%', // 明确设置高度
          width: '100%', // 明确设置宽度
          background: 'transparent',
          border: process.env.NODE_ENV === 'development' ? '1px dashed #ccc' : 'none',
          // 排查5: 确保层级正确
          position: 'relative',
          zIndex: 1
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            // 排查1修复: Canvas样式尺寸与实际尺寸需要分开设置
            // width/height属性在manager.initialize中设置
            // 这里只设置CSS显示样式
            width: '100%',
            height: '100%',
            display: 'block',
            // 排查4修复: 确保Canvas层级足够高
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
            pointerEvents: interactive ? 'auto' : 'none'
          }}
        />
      </div>

      {/* 加载状态 */}
      {isLoading && (
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

      {/* 成功状态指示器 */}
      {isInitialized && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-600 bg-white bg-opacity-80 px-2 py-1 rounded">
            Live2D 已加载
          </span>
        </div>
      )}

      {/* 调试信息（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded max-w-xs">
          <div>状态: {chatState}</div>
          <div>已初始化: {isInitialized ? '是' : '否'}</div>
          <div>交互: {interactive ? '启用' : '禁用'}</div>
          {lastMessage && <div>消息: {lastMessage.slice(0, 20)}...</div>}
          <div>管理器: Cubism2Manager</div>
          <div>版本: 2.1.0 (Fallback)</div>
        </div>
      )}

      {/* 备用实现说明（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && isInitialized && (
        <div className="absolute top-12 right-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-2 rounded max-w-xs">
          <p className="font-bold">⚠️ 使用备用实现</p>
          <p className="mt-1">模型加载成功，但渲染可能不完整。</p>
          <p className="mt-1">需要完整的 Live2D SDK 才能完全渲染。</p>
        </div>
      )}
    </div>
  );
};

export default Live2DCharacter;
