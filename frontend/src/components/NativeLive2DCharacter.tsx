/**
 * NativeLive2DCharacter - Live2D Cubism 2 角色组件
 * 
 * 严格遵循初始化顺序，确保 WebGL 上下文稳定
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { live2DSDKLoader, preloadLive2DSDK } from '../utils/Live2DSDKLoader';

interface NativeLive2DCharacterProps {
  modelPath: string;
  visible?: boolean;
  chatState?: 'idle' | 'user_message' | 'ai_typing' | 'ai_speaking';
  lastMessage?: string;
  className?: string;
  interactive?: boolean;
  onError?: (error: Error) => void;
  onLoaded?: () => void;
  scale?: number;
}

interface ModelState {
  model: any;
  gl: WebGLRenderingContext | null;
  modelMatrix: any;
  projMatrix: any;
}

// 单例控制 - 用于防止重复初始化
let isGloballyInitialized: boolean = false;
let instanceId: number = 0;

const NativeLive2DCharacter: React.FC<NativeLive2DCharacterProps> = ({
  modelPath,
  visible = true,
  chatState = 'idle',
  lastMessage = '',
  className = '',
  interactive = true,
  onError,
  onLoaded,
  scale = 2.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ModelState>({
    model: null,
    gl: null,
    modelMatrix: null,
    projMatrix: null
  });
  const animationRef = useRef<number | null>(null);
  const currentInstanceId = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false); // 使用 ref 避免重复初始化
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initStep, setInitStep] = useState('等待中...');
  const [debugInfo, setDebugInfo] = useState<string>('');

  /**
   * 延迟辅助函数
   */
  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  /**
   * 步骤1: 初始化 WebGL 上下文
   */
  const initWebGL = useCallback(async (): Promise<WebGLRenderingContext> => {
    setInitStep('初始化 WebGL...');
    
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('Canvas 元素不存在');
    }

    // 获取容器实际尺寸
    const container = containerRef.current;
    const width = container?.clientWidth || 400;
    const height = container?.clientHeight || 600;
    
    // 设置 Canvas 实际尺寸（不是 CSS 尺寸）
    canvas.width = width;
    canvas.height = height;
    
    console.log(`[NativeLive2D] Canvas 尺寸: ${width}x${height}`);

    const contextOptions = {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      preserveDrawingBuffer: false
    };

    let gl = canvas.getContext('webgl', contextOptions) as WebGLRenderingContext;
    if (!gl) {
      gl = canvas.getContext('experimental-webgl', contextOptions) as WebGLRenderingContext;
    }

    if (!gl) {
      throw new Error('无法获取 WebGL 上下文');
    }

    // 配置 WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    stateRef.current.gl = gl;
    console.log('[NativeLive2D] WebGL 上下文初始化成功');
    
    return gl;
  }, []);

  /**
   * 步骤2: 初始化 Live2D SDK
   */
  const initLive2DSDK = useCallback(async (gl: WebGLRenderingContext): Promise<void> => {
    setInitStep('初始化 Live2D SDK...');
    
    try {
      // 使用改进的SDK加载器
      await live2DSDKLoader.loadSDK();

      // 验证Live2D对象已加载
      if (typeof (window as any).Live2D === 'undefined') {
        throw new Error('Live2D SDK 加载完成但 window.Live2D 未定义');
      }

      // 设置 GL 上下文
      const Live2D = (window as any).Live2D;
      Live2D.setGL(gl);

      // 设置全局 GL 上下文
      if (typeof (window as any).setLive2DGLContext === 'function') {
        (window as any).setLive2DGLContext(gl);
      }

      console.log('[NativeLive2D] Live2D SDK 初始化完成');
    } catch (error) {
      console.error('[NativeLive2D] Live2D SDK 初始化失败:', error);
      throw new Error(`Live2D SDK 初始化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  /**
   * 步骤3: 加载模型
   */
  const loadModel = useCallback(async (): Promise<any> => {
    setInitStep('加载模型...');
    
    console.log(`[NativeLive2D] 开始加载模型配置: ${modelPath}`);
    
    // 加载模型配置
    const response = await fetch(modelPath);
    if (!response.ok) {
      throw new Error(`无法加载模型配置: ${response.status}`);
    }

    const modelJson = await response.json();
    const basePath = modelPath.substring(0, modelPath.lastIndexOf('/'));

    console.log('[NativeLive2D] 模型名称:', modelJson.name);
    console.log('[NativeLive2D] 模型文件:', modelJson.model);
    console.log('[NativeLive2D] 纹理列表:', modelJson.textures);
    console.log('[NativeLive2D] 基础路径:', basePath);

    // 加载 MOC 文件
    const mocPath = `${basePath}/${modelJson.model}`;
    const mocResponse = await fetch(mocPath);
    if (!mocResponse.ok) {
      throw new Error(`无法加载 MOC 文件: ${mocResponse.status}`);
    }

    const mocBuffer = await mocResponse.arrayBuffer();
    console.log('[NativeLive2D] MOC 文件大小:', mocBuffer.byteLength);

    // 创建模型
    const Live2DModelWebGL = (window as any).Live2DModelWebGL;
    if (!Live2DModelWebGL) {
      throw new Error('Live2DModelWebGL 未定义');
    }

    const model = Live2DModelWebGL.loadModel(mocBuffer);
    if (!model) {
      throw new Error('无法创建模型实例');
    }

    // 存储模型和纹理信息
    stateRef.current.model = model;
    
    return { model, modelJson, basePath };
  }, [modelPath]);

  /**
   * 步骤4: 加载纹理
   * 注意：Cubism 2 SDK 的着色器初始化由 SDK 内部处理，无需手动调用
   */
  const loadTextures = useCallback(async (model: any, modelJson: any, basePath: string): Promise<void> => {
    setInitStep('加载纹理...');
    
    const gl = stateRef.current.gl;
    if (!gl) {
      throw new Error('WebGL 上下文不可用');
    }

    if (!modelJson.textures || modelJson.textures.length === 0) {
      console.log('[NativeLive2D] 无纹理需要加载');
      return;
    }

    // 确保模型有 textures 数组
    if (!model.textures) {
      model.textures = [];
    }

    for (let i = 0; i < modelJson.textures.length; i++) {
      const texturePath = `${basePath}/${modelJson.textures[i]}`;
      console.log(`[NativeLive2D] 加载纹理 ${i + 1}: ${texturePath}`);
      
      await loadSingleTexture(gl, model, texturePath, i);
    }

    console.log('[NativeLive2D] 所有纹理加载完成');
  }, []);

  /**
   * 加载单个纹理
   */
  const loadSingleTexture = (gl: WebGLRenderingContext, model: any, texturePath: string, index: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          // 验证 GL 上下文
          if (!stateRef.current.gl) {
            reject(new Error('WebGL 上下文丢失'));
            return;
          }

          // 创建纹理
          const texture = gl.createTexture();
          if (!texture) {
            reject(new Error('纹理创建失败'));
            return;
          }

          // 配置纹理 - 先绑定再设置参数
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          
          // 生成 mipmap
          gl.generateMipmap(gl.TEXTURE_2D);
          
          // 重要：不解绑纹理，让 Live2D SDK 内部可以使用
          // 保持绑定状态直到明确需要解绑
          // gl.bindTexture(gl.TEXTURE_2D, null);  // 移除这行

          // 设置到模型
          model.setTexture(index, texture);
          console.log(`[NativeLive2D] 纹理 ${index + 1} 加载成功 (纹理ID: ${texture})`);
          resolve();
        } catch (error) {
          console.error(`[NativeLive2D] 纹理 ${index + 1} 加载失败:`, error);
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error(`纹理图片加载失败: ${texturePath}`));
      };

      img.src = texturePath;
    });
  };

  /**
   * 步骤6: 初始化矩阵
   * 
   * Live2D Cubism 2 坐标系统说明：
   * - 模型坐标系：原点在中心，Y轴向上，范围约 -1 到 1
   * - Canvas坐标系：原点在左上角，Y轴向下，范围 0 到 width/height
   * 
   * 变换步骤：
   * 1. 缩放模型到合适大小
   * 2. 翻转Y轴（WebGL Y轴向上 vs Canvas Y轴向下）
   * 3. 平移到画布中心
   */
  const initializeMatrices = useCallback((model: any): void => {
    setInitStep('初始化矩阵...');
    
    const canvas = canvasRef.current;
    const gl = stateRef.current.gl;
    if (!gl || !canvas) return;

    console.log(`[NativeLive2D] Canvas 尺寸: ${canvas.width}x${canvas.height}`);

    const L2DMatrix44 = (window as any).L2DMatrix44;
    const Live2DModelMatrix = (window as any).Live2DModelMatrix;

    try {
      // 获取模型原始尺寸
      const modelWidth = model.getCanvasWidth?.() || 600;
      const modelHeight = model.getCanvasHeight?.() || 800;
      console.log(`[NativeLive2D] 模型原始尺寸: ${modelWidth}x${modelHeight}`);

      // 计算缩放比例，使模型适应 Canvas
      // 注意：Live2D模型的宽高可能需要根据实际情况调整
      const scaleX = canvas.width / modelWidth;
      const scaleY = canvas.height / modelHeight;
      const modelScale = Math.min(scaleX, scaleY) * (scale || 1);
      
      console.log(`[NativeLive2D] 计算缩放比例: ${modelScale}`);
      console.log(`[NativeLive2D] scaleX: ${scaleX}, scaleY: ${scaleY}`);

      if (Live2DModelMatrix && L2DMatrix44) {
        // 方案1: 使用 Live2DModelMatrix 的便捷方法
        const modelMatrix = new Live2DModelMatrix(modelWidth, modelHeight);
        
        // setWidth 会自动计算正确的缩放并保持宽高比
        modelMatrix.setWidth(canvas.width * (scale || 1));
        
        // 设置模型在画布中心
        // 注意：setCenterPosition 使用的是模型坐标系
        modelMatrix.setCenterPosition(0, 0);

        // 创建投影矩阵
        // Live2D 使用的是归一化坐标 (-1 到 1)
        // 需要将 Canvas 像素坐标转换到归一化坐标
        const projMatrix = new L2DMatrix44();
        
        // 获取画布宽高比
        const aspectRatio = canvas.height / canvas.width;
        
        // 调整投影以适应 Canvas
        // 这会将模型从归一化坐标映射到屏幕空间
        projMatrix.scale(1.0, aspectRatio);

        // 合并矩阵
        const combinedMatrix = projMatrix.mult(modelMatrix);
        
        console.log(`[NativeLive2D] 投影矩阵宽高比: ${aspectRatio}`);
        console.log(`[NativeLive2D] 组合矩阵类型: ${combinedMatrix?.constructor?.name || typeof combinedMatrix}`);

        if (model.setMatrix) {
          model.setMatrix(combinedMatrix);
          console.log('[NativeLive2D] 矩阵已设置到模型');
        } else {
          console.warn('[NativeLive2D] 模型没有 setMatrix 方法');
        }

        stateRef.current.modelMatrix = modelMatrix;
        stateRef.current.projMatrix = projMatrix;
        console.log('[NativeLive2D] 矩阵初始化完成 (使用 SDK)');
      } else {
        // 方案2: 手动创建矩阵
        console.log('[NativeLive2D] SDK 矩阵类不可用，使用手动矩阵');
        initializeMatricesFallback(model, modelScale);
      }
    } catch (error) {
      console.warn('[NativeLive2D] 矩阵初始化异常:', error);
      initializeMatricesFallback(model, 0.5);
    }
  }, [scale]);

  /**
   * 矩阵初始化回退
   * 
   * 使用 Float32Array 手动创建变换矩阵
   * 这是一个正确的正交投影矩阵，用于将 Live2D 模型渲染到 Canvas
   */
  const initializeMatricesFallback = (model: any, modelScale: number = 0.5) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    console.log(`[NativeLive2D] 手动创建矩阵`);
    console.log(`[NativeLive2D] Canvas: ${canvasWidth}x${canvasHeight}`);
    console.log(`[NativeLive2D] Scale: ${modelScale}`);
    
    // Live2D Cubism 2 的坐标系统：
    // - 模型坐标范围大约 -1 到 1，原点在中心
    // - Y轴向上（与 Canvas Y轴向下相反）
    //
    // 变换矩阵需要完成：
    // 1. 缩放模型到合适大小
    // 2. 翻转Y轴
    // 3. 平移到画布中心
    //
    // 正交投影矩阵（将像素坐标转换为归一化坐标）：
    // x: [0, width] -> [-1, 1]
    // y: [0, height] -> [-1, 1]（注意Y轴翻转）
    
    // 简化的变换矩阵（列主序）
    // Live2D SDK 期望 4x4 矩阵，但实际只使用前 4 个元素（2D 变换）
    //
    // 矩阵布局（Live2D SDK 使用的 2D 变换）：
    // | a  c  tx |
    // | b  d  ty |
    // | 0  0  1  |
    //
    // 其中：
    // a = scale_x
    // b = 0 (shear_y)
    // c = 0 (shear_x)
    // d = scale_y (负值表示Y翻转)
    // tx, ty = 平移
    
    // 使用正确的变换：
    // 1. 缩放模型
    // 2. Y轴翻转（乘以 -1）
    // 3. 居中
    
    // 计算归一化缩放
    const normScaleX = modelScale * 2 / canvasWidth;
    const normScaleY = -modelScale * 2 / canvasHeight; // 负号翻转Y轴
    
    // Live2D SDK 的矩阵格式（16个元素的 Float32Array）
    // 这是一个 2D 变换矩阵的扩展形式
    const matrix = new Float32Array([
      normScaleX,  0,           0, 0,
      0,           normScaleY,  0, 0,
      0,           0,           1, 0,
      0,           0,           0, 1
    ]);
    
    console.log(`[NativeLive2D] 矩阵值: [${Array.from(matrix).map(v => v.toFixed(4)).join(', ')}]`);
    
    if (model.setMatrix) {
      model.setMatrix(matrix);
      console.log('[NativeLive2D] 手动矩阵已设置');
    }
  };

  /**
   * 步骤7: 启动渲染循环
   */
  const startRenderLoop = useCallback(() => {
    // 防止重复启动渲染循环
    if (animationRef.current !== null) {
      console.log('[NativeLive2D] 渲染循环已在运行，跳过');
      return;
    }
    
    setInitStep('启动渲染...');
    
    const gl = stateRef.current.gl;
    const model = stateRef.current.model;
    
    // 预先绑定所有纹理到不同的纹理单元
    if (gl && model && model.textures) {
      model.textures.forEach((texture: WebGLTexture, index: number) => {
        if (texture) {
          gl.activeTexture(gl.TEXTURE0 + index);
          gl.bindTexture(gl.TEXTURE_2D, texture);
        }
      });
      console.log(`[NativeLive2D] 预绑定了 ${model.textures.length} 个纹理单元`);
    }
    
    let errorCount = 0;
    const maxErrors = 5;
    
    const render = () => {
      const { model, gl } = stateRef.current;
      if (!model || !gl) {
        // 停止渲染
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }

      // 每次渲染前清除错误状态
      gl.getError();

      // 渲染前重新绑定纹理（解决 texParameteri 错误）
      if (model.textures) {
        model.textures.forEach((texture: WebGLTexture, index: number) => {
          if (texture) {
            gl.activeTexture(gl.TEXTURE0 + index);
            gl.bindTexture(gl.TEXTURE_2D, texture);
          }
        });
      }

      gl.clear(gl.COLOR_BUFFER_BIT);

      if (model.update) {
        model.update();
      }

      if (model.draw) {
        model.draw();
      }

      // 检查 WebGL 错误
      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        errorCount++;
        if (errorCount <= maxErrors) {
          console.warn(`[NativeLive2D] WebGL 错误 ${errorCount}: ${error}`);
        } else if (errorCount === maxErrors + 1) {
          console.warn('[NativeLive2D] WebGL 错误过多，停止报告');
        }
      } else {
        // 重置错误计数
        errorCount = 0;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    console.log('[NativeLive2D] 渲染循环已启动');
  }, []);

  /**
   * 完整初始化流程
   */
  const fullInitialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('=== NativeLive2D 初始化开始 ===');
      
      // 步骤1: 初始化 WebGL
      const gl = await initWebGL();
      
      // 步骤2: 初始化 Live2D SDK
      await initLive2DSDK(gl);
      
      // 步骤3: 加载模型
      const { model, modelJson, basePath } = await loadModel();
      
      // 步骤4: 加载纹理
      await loadTextures(model, modelJson, basePath);
      
      // 步骤5: 初始化矩阵
      initializeMatrices(model);
      
      // 步骤6: 启动渲染循环
      startRenderLoop();
      
      setIsInitialized(true);
      setIsLoading(false);
      setInitStep('初始化完成');
      
      console.log('=== NativeLive2D 初始化完成 ===');
      onLoaded?.();
      
    } catch (err) {
      const error = err as Error;
      console.error('[NativeLive2D] 初始化失败:', error);
      setError(error.message);
      setIsLoading(false);
      setInitStep('初始化失败');
      onError?.(error);
    }
  }, [initWebGL, initLive2DSDK, loadModel, loadTextures, initializeMatrices, startRenderLoop, onLoaded, onError]);

  // 预加载SDK - 组件挂载时预加载
  useEffect(() => {
    if (visible) {
      preloadLive2DSDK().catch(error => {
        console.warn('[NativeLive2D] SDK 预加载失败，将在需要时重试:', error);
      });
    }
  }, [visible]);

  // 初始化效果 - 使用 ref 防止无限循环
  useEffect(() => {
    // 使用 ref 防止重复初始化
    if (!visible || !canvasRef.current || isInitializedRef.current) {
      return;
    }
    
    // 标记已开始初始化，防止重复
    isInitializedRef.current = true;
    
    fullInitialize().catch(error => {
      console.error('[NativeLive2D] 初始化失败:', error);
      isInitializedRef.current = false; // 失败时允许重试
    });

    // 清理函数
    return () => {
      console.log('[NativeLive2D] 清理资源...');
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // 注意：不完全清理 stateRef，保留模型供复用
      setIsInitialized(false);
    };
  }, [visible]); // 只依赖 visible，不依赖 fullInitialize

  if (!visible) {
    return null;
  }

  return (
    <div className={`native-live2d-character-container ${className}`}>
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
            <p className="text-sm text-gray-600">{initStep}</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-80 rounded-lg">
          <div className="flex flex-col items-center space-y-2 p-4 text-center">
            <p className="text-sm text-red-600">Live2D 模型加载失败</p>
            <p className="text-xs text-red-500 max-w-xs">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fullInitialize();
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
            Live2D 已加载
          </span>
        </div>
      )}
    </div>
  );
};

export default NativeLive2DCharacter;
