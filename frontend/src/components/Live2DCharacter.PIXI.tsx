/**
 * Live2D角色组件 - PIXI版本 (Cubism 2 only)
 * 
 * 使用 pixi-live2d-display 库集成 Live2D Cubism 2 模型
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import PixiLive2DManager from '../utils/PixiLive2DManager';
import FallbackLive2DManager from '../utils/fallbackLive2DManager';

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
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 缩放比例 */
  scale?: number;
}

// 类型联合
type Live2DManagerType = PixiLive2DManager | FallbackLive2DManager;

const Live2DCharacter: React.FC<Live2DCharacterProps> = ({
  modelPath = '/live2d/rem/rem/model.json',
  visible = true,
  chatState = 'idle',
  lastMessage = '',
  className = '',
  interactive = true,
  onError,
  onLoaded,
  width: propWidth,
  height: propHeight,
  scale = 0.15,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<Live2DManagerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<'checking' | 'ready' | 'failed'>('checking');
  const previousChatState = useRef<string>(chatState);
  const initAttempted = useRef(false);
  const hasTriggeredFallback = useRef(false);

  /**
   * 检查 Live2D Cubism 2 运行时状态
   */
  const checkCubism2Runtime = useCallback(() => {
    const cubism2 = typeof window !== 'undefined' && !!window.Live2D;
    const pixiAvailable = typeof window !== 'undefined' && !!(window as any).PIXI;
    const pixiLive2D = pixiAvailable && !!(window as any).PIXI?.live2d;
    const hasLive2DModel = pixiLive2D && !!(window as any).PIXI?.live2d?.Live2DModel;
    
    if (cubism2 && pixiAvailable && pixiLive2D && hasLive2DModel) {
      console.log('[Live2DCharacter] Cubism 2 运行时就绪');
      return true;
    }
    console.log('[Live2DCharacter] Cubism 2 检测:', { cubism2, pixiAvailable, pixiLive2D, hasLive2DModel });
    return false;
  }, []);

  /**
   * 等待 Live2D 运行时加载
   */
  const waitForRuntime = useCallback(async (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      let attempts = 0;
      const maxAttempts = 50;

      const checkInterval = setInterval(() => {
        attempts++;
        
        if (checkCubism2Runtime()) {
          clearInterval(checkInterval);
          setRuntimeStatus('ready');
          resolve(true);
        }
        else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setRuntimeStatus('failed');
          resolve(false);
        }
      }, 100);
    });
  }, [checkCubism2Runtime]);

  /**
   * 初始化 Cubism 2 管理器
   */
  const initCubism2 = useCallback(async (width: number, height: number) => {
    console.log('[Live2DCharacter] 初始化 PixiLive2DManager (Cubism 2)...');
    
    const manager = new PixiLive2DManager({
      modelPath,
      width,
      height,
      scale,
      x: width / 2,
      y: height / 2,
      autoInteract: interactive
    });
    
    if (canvasRef.current) {
      await manager.initialize(canvasRef.current);
    }
    
    return manager;
  }, [modelPath, scale, interactive]);

  /**
   * 初始化降级模式
   */
  const initFallback = useCallback(async (width: number, height: number) => {
    console.log('[Live2DCharacter] 启动降级模式...');
    
    const manager = new FallbackLive2DManager({
      width,
      height,
      modelName: modelPath.split('/').pop() || 'Live2D模型'
    });
    
    if (canvasRef.current) {
      await manager.initialize(canvasRef.current);
    }
    
    return manager;
  }, [modelPath]);

  /**
   * 初始化 Live2D 管理器
   */
  const initializeLive2D = useCallback(async () => {
    if (initAttempted.current || managerRef.current?.getIsInitialized()) {
      return;
    }
    initAttempted.current = true;

    if (!containerRef.current || !canvasRef.current) {
      initAttempted.current = false;
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 等待 Live2D 运行时
      const runtimeReady = await waitForRuntime();
      if (!runtimeReady) {
        throw new Error('Live2D 运行时加载失败，请刷新页面重试');
      }

      // 获取容器尺寸
      const width = propWidth || containerRef.current.clientWidth || 400;
      const height = propHeight || containerRef.current.clientHeight || 600;

      // 初始化 Cubism 2 管理器
      const manager = await initCubism2(width, height);
      managerRef.current = manager;
      
      setIsInitialized(true);
      setIsLoading(false);
      onLoaded?.();
      console.log('✅ Live2D Cubism 2 初始化成功');
      
    } catch (err) {
      const error = err as Error;
      console.error('[Live2DCharacter] Live2D 初始化失败:', error);
      
      // 防止无限降级
      if (hasTriggeredFallback.current) {
        console.error('[Live2DCharacter] 降级模式已触发过，不再重试');
        setError('Live2D 加载失败，请刷新页面重试');
        setIsLoading(false);
        onError?.(error);
        return;
      }
      
      try {
        hasTriggeredFallback.current = true;
        
        const width = propWidth || containerRef.current?.clientWidth || 400;
        const height = propHeight || containerRef.current?.clientHeight || 600;
        
        // 启动降级模式
        const fallbackManager = await initFallback(width, height);
        managerRef.current = fallbackManager;
        
        setIsInitialized(true);
        setIsLoading(false);
        console.log('✅ Live2D 降级模式启动成功');
        onLoaded?.();
        
      } catch (fallbackError) {
        console.error('[Live2DCharacter] 降级模式也失败了:', fallbackError);
        hasTriggeredFallback.current = false;
        setError('Live2D 加载失败，请刷新页面重试');
        setIsLoading(false);
        initAttempted.current = false;
        onError?.(error);
      }
    }
  }, [modelPath, interactive, onError, onLoaded, waitForRuntime, propWidth, propHeight, scale, initCubism2, initFallback]);

  /**
   * 处理聊天状态变化
   */
  const handleChatStateChange = useCallback(async () => {
    if (!managerRef.current?.getIsInitialized() || !chatState) return;

    if (previousChatState.current !== chatState) {
      try {
        const motionMap: Record<string, string> = {
          'idle': 'idle',
          'user_message': 'tap_body',
          'ai_typing': 'tap_head',
          'ai_speaking': 'tap_body'
        };

        const motionGroup = motionMap[chatState] || 'idle';
        
        if (managerRef.current instanceof PixiLive2DManager) {
          await managerRef.current.playMotion(motionGroup);
        }
        
        previousChatState.current = chatState;
      } catch (error) {
        // 忽略动作播放错误
      }
    }
  }, [chatState]);

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
      // 忽略调整大小错误
    }
  }, []);

  // 运行时检查
  useEffect(() => {
    if (visible && checkCubism2Runtime()) {
      setRuntimeStatus('ready');
    }
  }, [visible, checkCubism2Runtime]);

  // 初始化
  useEffect(() => {
    if (visible && containerRef.current && canvasRef.current && runtimeStatus === 'ready' && !initAttempted.current) {
      initializeLive2D();
    } else if (visible && containerRef.current && canvasRef.current && runtimeStatus === 'checking') {
      waitForRuntime().then(ready => {
        if (ready && !initAttempted.current) {
          initializeLive2D();
        }
      });
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
        setIsInitialized(false);
        initAttempted.current = false;
      }
    };
  }, [visible, runtimeStatus, initializeLive2D, waitForRuntime]);

  // 聊天状态变化
  useEffect(() => {
    if (isInitialized) {
      handleChatStateChange();
    }
  }, [chatState, isInitialized, handleChatStateChange]);

  // 窗口大小变化
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const debouncedResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [handleResize]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
        setIsInitialized(false);
        initAttempted.current = false;
      }
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className={`live2d-character-container ${className}`}>
      <div
        ref={containerRef}
        className="live2d-canvas-container w-full h-full relative overflow-hidden"
        style={{
          minHeight: '400px',
          minWidth: '300px',
          background: 'transparent',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600">加载中...</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-80 rounded-lg">
          <div className="flex flex-col items-center space-y-2 p-4 text-center">
            <p className="text-sm text-red-600">Live2D 加载失败</p>
            <p className="text-xs text-red-500 max-w-xs">{error}</p>
            <button
              onClick={() => {
                setError(null);
                hasTriggeredFallback.current = false;
                initAttempted.current = false;
                setRuntimeStatus('checking');
                initializeLive2D();
              }}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* 成功状态 */}
      {isInitialized && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600 bg-white bg-opacity-80 px-2 py-1 rounded">
            Live2D Cubism 2
          </span>
        </div>
      )}
    </div>
  );
};

export default Live2DCharacter;