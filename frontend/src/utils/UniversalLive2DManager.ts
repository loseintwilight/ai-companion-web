/**
 * Live2D Cubism 2 专用管理器 - 类型安全版本
 * 完全适配 Cubism 2 的实际 API 结构和调用方式
 */

import type {
  ILive2DModelWebGL,
  ILive2DMotion,
  IMotionQueueManager,
  IL2DEyeBlink,
  IL2DPose,
  IPhysicsHandler,
} from '../types/live2d';

// 使用导入的类型作为本地别名
type Live2DModelWebGL = ILive2DModelWebGL;
type Live2DMotion = ILive2DMotion;
type MotionQueueManager = IMotionQueueManager;
type L2DEyeBlink = IL2DEyeBlink;
type L2DPose = IL2DPose;
type PhysicsHandler = IPhysicsHandler;

// Cubism 2 使用简单的矩阵数组，不需要专门的矩阵类
interface SimpleMatrix {
  data: Float32Array;
  identity(): void;
  scale(sx: number, sy: number): void;
  translate(tx: number, ty: number): void;
  getArray(): Float32Array;
}

export interface UniversalModelConfig {
  modelPath: string;
  width: number;
  height: number;
  scale: number;
  x: number;
  y: number;
}

interface DragManager {
  lastX: number;
  lastY: number;
  dragX: number;
  dragY: number;
}

export class UniversalLive2DManager {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;
  private container: HTMLElement | null = null;
  private model: Live2DModelWebGL | null = null;
  private viewMatrix: SimpleMatrix | null = null;
  private projMatrix: SimpleMatrix | null = null;
  private motionManager: MotionQueueManager | null = null;
  private physics: PhysicsHandler | null = null;
  private pose: L2DPose | null = null;
  private eyeBlink: L2DEyeBlink | null = null;
  private isInitialized: boolean = false;
  private isLoading: boolean = false;
  private animationId: number | null = null;
  private modelConfig: any = null;
  private lastTime: number = 0;
  private dragManager: DragManager | null = null;

  constructor() {}

  /**
   * 创建简单的 4x4 矩阵实现
   */
  private createMatrix(): SimpleMatrix {
    return {
      data: new Float32Array(16),
      
      identity() {
        this.data.fill(0);
        this.data[0] = 1;  // m00
        this.data[5] = 1;  // m11
        this.data[10] = 1; // m22
        this.data[15] = 1; // m33
      },
      
      scale(sx: number, sy: number) {
        this.data[0] *= sx;
        this.data[5] *= sy;
      },
      
      translate(tx: number, ty: number) {
        this.data[12] += tx;
        this.data[13] += ty;
      },
      
      getArray() {
        return this.data;
      }
    };
  }
  /**
   * 检查 Live2D 运行时状态
   */
  private checkRuntimeStatus(): { cubism2: boolean } {
    const cubism2 = typeof window !== 'undefined' && 
                   !!window.Live2D && 
                   !!window.Live2DModelWebGL;
    console.log('Cubism 2 runtime status:', { cubism2 });
    return { cubism2 };
  }

  /**
   * 等待运行时加载
   */
  private async waitForRuntime(): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).waitForLive2DRuntime) {
      try {
        const status = await (window as any).waitForLive2DRuntime(10000);
        console.log('Runtime loading status:', status);
        return status.cubism2;
      } catch (error) {
        console.error('Error waiting for runtime:', error);
      }
    }
    
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 100;

      const checkInterval = setInterval(() => {
        attempts++;
        const status = this.checkRuntimeStatus();
        
        if (status.cubism2) {
          clearInterval(checkInterval);
          console.log('✅ Cubism 2 runtime ready after', attempts * 100, 'ms');
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('⏰ Runtime loading timeout after', maxAttempts * 100, 'ms');
          resolve(false);
        }
      }, 100);
    });
  }

  /**
   * 初始化管理器
   */
  async initialize(container: HTMLElement, config: UniversalModelConfig): Promise<void> {
    if (this.isLoading || this.isInitialized) return;

    try {
      this.isLoading = true;
      this.container = container;

      console.log('🚀 Initializing Live2D Cubism 2 Manager...');

      // 验证容器元素
      if (!container || !container.isConnected) {
        throw new Error('Container element is not connected to DOM');
      }

      // 等待运行时加载
      const runtimeReady = await this.waitForRuntime();
      if (!runtimeReady) {
        throw new Error('Live2D Cubism 2 runtime not available');
      }

      // 创建 Canvas
      this.createCanvas(container, config);

      // 初始化 WebGL 上下文
      this.initWebGL();

      // 初始化 Live2D
      this.initLive2D();

      // 加载模型
      await this.loadModel(config);

      // 初始化组件
      this.initComponents();

      // 设置模型变换
      this.setupModelTransform(config);

      // 设置交互
      this.setupInteraction();

      // 开始渲染循环
      this.startRenderLoop();

      this.isInitialized = true;
      this.isLoading = false;
      console.log('✅ Live2D Cubism 2 Manager initialized successfully');
      
      // 输出最终状态
      this.logInitializationStatus();
    } catch (error) {
      this.isLoading = false;
      console.error('❌ Failed to initialize Live2D Manager:', error);
      this.createErrorPlaceholder(error as Error);
      throw error;
    }
  }
  /**
   * 输出初始化状态信息
   */
  private logInitializationStatus(): void {
    console.log('📋 Live2D Manager Initialization Status:');
    console.log('  - Runtime:', window.Live2D ? 'Available' : 'Missing');
    console.log('  - WebGL Context:', this.gl ? 'OK' : 'Missing');
    console.log('  - Canvas:', this.canvas ? `${this.canvas.width}x${this.canvas.height}` : 'Missing');
    console.log('  - Model:', this.model ? 'Loaded' : 'Missing');
    
    // 详细的矩阵状态
    console.log('  - View Matrix:', this.viewMatrix ? 'OK' : 'Missing');
    if (this.viewMatrix) {
      try {
        const viewArray = this.viewMatrix.getArray();
        console.log('    View Matrix Array:', viewArray ? `[${viewArray.slice(0, 4).join(', ')}...]` : 'N/A');
      } catch (e) {
        console.log('    View Matrix Array: Unable to read');
      }
    }
    
    console.log('  - Projection Matrix:', this.projMatrix ? 'OK' : 'Missing');
    if (this.projMatrix) {
      try {
        const projArray = this.projMatrix.getArray();
        console.log('    Projection Matrix Array:', projArray ? `[${projArray.slice(0, 4).join(', ')}...]` : 'N/A');
      } catch (e) {
        console.log('    Projection Matrix Array: Unable to read');
      }
    }
    
    console.log('  - Motion Manager:', this.motionManager ? 'OK' : 'Missing');
    console.log('  - Eye Blink:', this.eyeBlink ? 'OK' : 'Missing');
    
    if (this.model && this.model.getCanvasWidth && this.model.getCanvasHeight) {
      console.log('  - Model Dimensions:', `${this.model.getCanvasWidth()}x${this.model.getCanvasHeight()}`);
    }
    
    console.log('  - Render Loop:', this.animationId ? 'Running' : 'Stopped');
    
    // WebGL 状态检查
    if (this.gl) {
      const error = this.gl.getError();
      console.log('  - WebGL Status:', error === this.gl.NO_ERROR ? 'No errors' : this.getWebGLErrorString(error));
    }
  }

  /**
   * 创建 Canvas 元素
   */
  private createCanvas(container: HTMLElement, config: UniversalModelConfig): void {
    container.innerHTML = '';

    this.canvas = document.createElement('canvas');
    this.canvas.width = config.width || container.clientWidth || 400;
    this.canvas.height = config.height || container.clientHeight || 600;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.cursor = 'pointer';

    container.appendChild(this.canvas);

    if (!container.contains(this.canvas)) {
      throw new Error('Failed to mount canvas to container');
    }

    console.log('✅ Canvas created and mounted successfully');
  }

  /**
   * 初始化 WebGL 上下文
   */
  private initWebGL(): void {
    if (!this.canvas) {
      throw new Error('Canvas not created');
    }

    // 尝试获取 WebGL 上下文，优先使用标准 WebGL
    const contextOptions = {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'default' as WebGLPowerPreference
    };

    this.gl = this.canvas.getContext('webgl', contextOptions) as WebGLRenderingContext || 
              this.canvas.getContext('experimental-webgl', contextOptions) as WebGLRenderingContext;
              
    if (!this.gl) {
      throw new Error('WebGL not supported');
    }

    // 设置 WebGL 参数
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    
    // 禁用深度测试以避免透明度问题
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.CULL_FACE);

    console.log('✅ WebGL context initialized with options:', contextOptions);
    console.log('📋 WebGL info:', {
      version: this.gl.getParameter(this.gl.VERSION),
      vendor: this.gl.getParameter(this.gl.VENDOR),
      renderer: this.gl.getParameter(this.gl.RENDERER)
    });
  }
  /**
   * 初始化 Live2D - 使用简单的矩阵实现
   */
  private initLive2D(): void {
    if (!window.Live2D) {
      throw new Error('Live2D runtime not available');
    }

    // 初始化 Live2D 并设置 WebGL 上下文
    window.Live2D.init();
    if (this.gl) {
      window.Live2D.setGL(this.gl);
      console.log('✅ Live2D WebGL context bound');
    }

    // 创建简单的矩阵实现
    try {
      this.viewMatrix = this.createMatrix();
      this.viewMatrix.identity();
      console.log('✅ View matrix created');
      
      this.projMatrix = this.createMatrix();
      this.projMatrix.identity();
      console.log('✅ Projection matrix created');
    } catch (error) {
      console.error('❌ Failed to create matrices:', error);
      throw new Error('Failed to create Live2D matrices: ' + (error as Error).message);
    }

    console.log('✅ Live2D initialized with WebGL context and simple matrices');
  }

  /**
   * 设置投影矩阵 - 使用简单的矩阵实现
   */
  private setupProjectionMatrix(): void {
    if (!this.projMatrix || !this.canvas) return;

    try {
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      console.log(`📐 Setting up projection matrix for canvas: ${width}x${height}`);
      
      // 重置投影矩阵
      this.projMatrix.identity();
      
      // Cubism 2 标准正交投影
      // 简单的单位矩阵即可，Live2D 会处理坐标转换
      console.log('✅ Projection matrix configured for Cubism 2');
      
      // 验证矩阵
      try {
        const matrixArray = this.projMatrix.getArray();
        if (matrixArray) {
          console.log('📐 Projection matrix elements:', {
            scaleX: matrixArray[0].toFixed(4),
            scaleY: matrixArray[5].toFixed(4),
            translateX: matrixArray[12].toFixed(4),
            translateY: matrixArray[13].toFixed(4)
          });
        }
      } catch (e) {
        console.warn('⚠️ Could not read projection matrix array');
      }
    } catch (error) {
      console.error('❌ Failed to setup projection matrix:', error);
    }
  }
  /**
   * 加载模型 - 使用正确的 Cubism 2 模型加载方式
   */
  private async loadModel(config: UniversalModelConfig): Promise<void> {
    try {
      // 直接使用实际存在的 model.json (Cubism 2 格式)
      const modelUrl = `${config.modelPath}/model.json`;
      console.log('📂 Loading model config from:', modelUrl);
      
      const configResponse = await fetch(modelUrl);
      if (!configResponse.ok) {
        throw new Error(`Failed to load model config: ${configResponse.status} ${configResponse.statusText}`);
      }
      
      this.modelConfig = await configResponse.json();
      console.log('✅ Model config loaded:', this.modelConfig.name || 'Unknown');
      console.log('📋 Model version:', this.modelConfig.version || 'Unknown');

      // 使用 Cubism 2 格式的配置
      const mocFile = this.modelConfig.model || 'remu.moc';
      const textureList = this.modelConfig.textures || [];
      
      console.log('📋 Using Cubism 2 format:');
      console.log('  - MOC file:', mocFile);
      console.log('  - Textures:', textureList);

      // 加载 MOC 文件
      const mocPath = `${config.modelPath}/${mocFile}`;
      console.log('📂 Loading MOC file from:', mocPath);
      
      const mocResponse = await fetch(mocPath);
      if (!mocResponse.ok) {
        throw new Error(`Failed to load MOC file: ${mocResponse.status}`);
      }
      
      const mocBuffer = await mocResponse.arrayBuffer();
      console.log('✅ MOC file loaded, size:', mocBuffer.byteLength, 'bytes');

      // 使用正确的 Cubism 2 模型创建方式
      if (!window.Live2DModelWebGL) {
        throw new Error('Live2DModelWebGL not available');
      }

      // 创建模型实例 - 修复模型加载方式
      try {
        this.model = window.Live2DModelWebGL.loadModel(mocBuffer);
        if (!this.model) {
          throw new Error('Live2DModelWebGL.loadModel returned null');
        }
        console.log('✅ Live2D model created successfully');
      } catch (modelError) {
        console.error('❌ Model creation failed:', modelError);
        // 尝试备用方法
        try {
          this.model = new window.Live2DModelWebGL();
          const loadResult = this.model.loadModel(mocBuffer);
          if (!loadResult) {
            throw new Error('Model loadModel method failed');
          }
          console.log('✅ Live2D model created with backup method');
        } catch (backupError) {
          console.error('❌ Backup model creation also failed:', backupError);
          throw new Error('Failed to create Live2D model with both methods');
        }
      }

      // 加载纹理 - 传递纹理列表
      await this.loadTextures(config.modelPath, textureList);

      console.log('✅ Live2D model loaded completely');
    } catch (error) {
      console.error('❌ Failed to load Live2D model:', error);
      throw error;
    }
  }

  /**
   * 加载纹理
   */
  private async loadTextures(modelPath: string, textureList?: string[]): Promise<void> {
    // 确定纹理列表
    let textures: string[];
    
    if (textureList && textureList.length > 0) {
      textures = textureList;
    } else if (this.modelConfig.textures) {
      textures = this.modelConfig.textures;
    } else if (this.modelConfig.files && this.modelConfig.files.textures) {
      textures = this.modelConfig.files.textures;
    } else {
      throw new Error('No textures defined in model config');
    }

    console.log('📂 Loading textures...');
    console.log('📋 Texture list:', textures);

    const loadedTextures: WebGLTexture[] = [];

    for (let i = 0; i < textures.length; i++) {
      const texturePath = `${modelPath}/${textures[i]}`;
      console.log(`📂 Loading texture ${i}: ${texturePath}`);

      try {
        // 先验证纹理文件是否存在
        const testResponse = await fetch(texturePath, { method: 'HEAD' });
        console.log(`📋 Texture ${i} HEAD response:`, testResponse.status, testResponse.statusText);
        
        if (!testResponse.ok) {
          console.error(`❌ Texture file not accessible: ${texturePath} (${testResponse.status})`);
          
          // 尝试创建默认纹理
          try {
            const defaultTexture = this.createDefaultTexture();
            if (this.model && defaultTexture) {
              this.model.setTexture(i, defaultTexture);
              loadedTextures.push(defaultTexture);
              console.log(`⚠️ Using default texture for slot ${i}`);
            }
          } catch (defaultError) {
            console.error(`❌ Failed to create default texture:`, defaultError);
          }
          continue;
        }
        
        // 正常路径可访问
        const texture = await this.loadTexture(texturePath);
        if (this.model) {
          this.model.setTexture(i, texture);
          loadedTextures.push(texture);
        }
        console.log(`✅ Texture ${i} loaded successfully`);
      } catch (error) {
        console.error(`❌ Failed to load texture ${i}:`, error);
        
        // 尝试创建一个默认纹理以避免完全失败
        try {
          const defaultTexture = this.createDefaultTexture();
          if (this.model && defaultTexture) {
            this.model.setTexture(i, defaultTexture);
            loadedTextures.push(defaultTexture);
            console.log(`⚠️ Using default texture for slot ${i}`);
          }
        } catch (defaultError) {
          console.error(`❌ Failed to create default texture:`, defaultError);
        }
      }
    }

    if (loadedTextures.length === 0) {
      throw new Error('No textures could be loaded');
    }

    console.log(`✅ Texture loading completed: ${loadedTextures.length}/${textures.length} textures loaded`);
  }
  /**
   * 加载单个纹理
   */
  private loadTexture(url: string): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const handleLoad = () => {
        if (!this.gl) {
          reject(new Error('WebGL context not available'));
          return;
        }

        const texture = this.gl.createTexture();
        if (!texture) {
          reject(new Error('Failed to create texture'));
          return;
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        console.log(`✅ Texture loaded: ${url} (${img.width}x${img.height})`);
        resolve(texture);
      };

      const handleError = (error: Event | string) => {
        console.error(`❌ Image load error for ${url}:`, error);
        reject(new Error(`Failed to load image: ${url}`));
      };

      // 添加超时处理
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        reject(new Error(`Texture loading timeout: ${url}`));
      }, 10000); // 10秒超时

      img.onload = () => {
        clearTimeout(timeout);
        handleLoad();
      };

      img.onerror = (error) => {
        clearTimeout(timeout);
        handleError(error);
      };

      img.src = url;
    });
  }

  /**
   * 创建默认纹理（用于纹理加载失败时的备用）- 非透明可见纹理
   */
  private createDefaultTexture(): WebGLTexture | null {
    if (!this.gl) return null;

    try {
      const texture = this.gl.createTexture();
      if (!texture) return null;

      // 创建一个 4x4 的彩色纹理作为默认纹理（非透明）
      const size = 4;
      const pixels = new Uint8Array(size * size * 4);
      
      // 填充渐变色彩，确保可见性
      for (let i = 0; i < size * size; i++) {
        const offset = i * 4;
        // 创建粉色到蓝色的渐变
        pixels[offset] = 255 - (i * 32);     // R: 255 -> 127
        pixels[offset + 1] = 192 - (i * 16); // G: 192 -> 128  
        pixels[offset + 2] = 203 + (i * 13); // B: 203 -> 255
        pixels[offset + 3] = 255;            // A: 完全不透明
      }

      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, size, size, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);

      console.log('✅ Default visible texture created (non-transparent)');
      return texture;
    } catch (error) {
      console.error('❌ Failed to create default texture:', error);
      return null;
    }
  }

  /**
   * 初始化组件 - 使用正确的 Cubism 2 API
   */
  private initComponents(): void {
    try {
      // 初始化动作管理器
      if (window.MotionQueueManager) {
        this.motionManager = new window.MotionQueueManager();
        console.log('✅ MotionQueueManager created');
      }

      // 初始化眨眼
      if (window.L2DEyeBlink) {
        this.eyeBlink = new window.L2DEyeBlink();
        this.eyeBlink.setInterval(4000); // 4秒眨眼间隔
        this.eyeBlink.setEyeMotion('PARAM_EYE_L_OPEN', 'PARAM_EYE_R_OPEN');
        console.log('✅ L2DEyeBlink created');
      }

      // 初始化姿势
      if (window.L2DPose && this.modelConfig.pose) {
        this.pose = new window.L2DPose();
        console.log('✅ L2DPose created');
      }

      // 初始化物理
      if (window.PhysicsHandler && this.modelConfig.physics) {
        this.physics = new window.PhysicsHandler();
        console.log('✅ PhysicsHandler created');
      }

      // 初始化拖拽管理器
      this.dragManager = {
        lastX: 0,
        lastY: 0,
        dragX: 0,
        dragY: 0
      };

      console.log('✅ All components initialized');
    } catch (error) {
      console.error('❌ Failed to initialize components:', error);
    }
  }
  /**
   * 设置模型变换 - 使用简单的矩阵实现
   */
  private setupModelTransform(config: UniversalModelConfig): void {
    if (!this.model || !this.viewMatrix || !this.canvas) return;

    try {
      console.log('📐 Setting up model transform with simple matrix...');
      
      // 重置视图矩阵
      this.viewMatrix.identity();

      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;
      
      // 获取模型布局配置
      let layout: any = {};
      if (this.modelConfig.layout) {
        layout = this.modelConfig.layout;
      } else {
        // Cubism 2 默认布局
        layout = {
          center_x: 0.0,
          center_y: -0.05,  // 稍微向上偏移
          width: 2.8
        };
      }
      
      console.log('📐 Canvas size:', canvasWidth, 'x', canvasHeight);
      console.log('📐 Layout config:', layout);
      
      // 计算缩放 - 简化的缩放算法
      const aspectRatio = canvasWidth / canvasHeight;
      let baseScale = 0.8; // 基础缩放
      
      // 根据宽高比调整
      if (aspectRatio > 1.0) {
        baseScale = 0.8 / aspectRatio;
      }
      
      // 最终缩放
      const finalScale = baseScale * (config.scale || 1.0);
      
      console.log(`📐 Scale calculation: base=${baseScale.toFixed(3)}, final=${finalScale.toFixed(3)}`);
      
      // 应用缩放
      this.viewMatrix.scale(finalScale, finalScale);
      
      // 计算平移 - 居中显示
      const centerX = layout.center_x || 0.0;
      const centerY = layout.center_y || -0.05;
      
      // 转换为屏幕坐标的平移
      const translateX = centerX * canvasWidth * 0.1;
      const translateY = centerY * canvasHeight * 0.1;
      
      this.viewMatrix.translate(translateX, translateY);
      
      console.log(`📐 Transform applied: scale=${finalScale.toFixed(3)}, translate=(${translateX.toFixed(3)}, ${translateY.toFixed(3)})`);
      
      // 验证视图矩阵
      try {
        const viewArray = this.viewMatrix.getArray();
        if (viewArray) {
          console.log('📐 View matrix elements:', {
            scaleX: viewArray[0].toFixed(4),
            scaleY: viewArray[5].toFixed(4),
            translateX: viewArray[12].toFixed(4),
            translateY: viewArray[13].toFixed(4)
          });
        }
      } catch (e) {
        console.warn('⚠️ Could not read view matrix array');
      }
      
      // 关键：确保模型绑定到正确的矩阵
      if (this.model.setMatrix) {
        this.model.setMatrix(this.viewMatrix.getArray());
        console.log('✅ Model matrix binding successful');
      } else {
        console.error('❌ Model.setMatrix method not available');
      }
      
      // 验证模型尺寸
      if (this.model.getCanvasWidth && this.model.getCanvasHeight) {
        const modelCanvasWidth = this.model.getCanvasWidth();
        const modelCanvasHeight = this.model.getCanvasHeight();
        console.log(`📐 Model canvas dimensions: ${modelCanvasWidth}x${modelCanvasHeight}`);
        
        if (modelCanvasWidth > 0 && modelCanvasHeight > 0) {
          console.log('✅ Model has valid dimensions');
        } else {
          console.warn('⚠️ Model dimensions are invalid');
        }
      }
      
      // 设置投影矩阵
      this.setupProjectionMatrix();
      
    } catch (error) {
      console.error('❌ Failed to setup model transform:', error);
    }
  }

  /**
   * 设置交互
   */
  private setupInteraction(): void {
    if (!this.canvas) return;

    // 鼠标点击事件
    this.canvas.addEventListener('click', (event) => {
      const rect = this.canvas!.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height * 2 - 1);

      console.log('👆 Model clicked at:', x, y);
      this.handleClick(x, y);
    });

    // 鼠标移动事件（视线跟踪）
    this.canvas.addEventListener('mousemove', (event) => {
      const rect = this.canvas!.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height * 2 - 1);

      this.updateLookAt(x, y);
    });

    console.log('✅ Interaction setup completed');
  }
  /**
   * 处理点击事件
   */
  private handleClick(x: number, y: number): void {
    if (!this.model || !this.modelConfig.hit_areas) return;

    // 检查点击区域
    for (const hitArea of this.modelConfig.hit_areas) {
      if (this.isHitArea(x, y, hitArea)) {
        console.log(`🎯 Hit area clicked: ${hitArea.name}`);
        this.playMotion(hitArea.name);
        break;
      }
    }
  }

  /**
   * 检查是否点击了指定区域
   */
  private isHitArea(x: number, y: number, hitArea: any): boolean {
    if (this.modelConfig.hit_areas_custom && this.modelConfig.hit_areas_custom[hitArea.name + '_x']) {
      const xRange = this.modelConfig.hit_areas_custom[hitArea.name + '_x'];
      const yRange = this.modelConfig.hit_areas_custom[hitArea.name + '_y'];
      
      return x >= xRange[0] && x <= xRange[1] && y >= yRange[0] && y <= yRange[1];
    }

    // 默认区域检测
    return Math.abs(x) < 0.5 && Math.abs(y) < 0.5;
  }

  /**
   * 更新视线跟踪
   */
  private updateLookAt(x: number, y: number): void {
    if (!this.model) return;

    try {
      // 设置视线参数
      this.model.setParamFloat('PARAM_ANGLE_X', x * 30);
      this.model.setParamFloat('PARAM_ANGLE_Y', y * 30);
      this.model.setParamFloat('PARAM_EYE_BALL_X', x);
      this.model.setParamFloat('PARAM_EYE_BALL_Y', y);
    } catch (error) {
      // 忽略参数设置错误
    }
  }

  /**
   * 播放动作 - 使用正确的 Cubism 2 动作 API
   */
  async playMotion(group: string, index: number = 0): Promise<void> {
    if (!this.model || !this.motionManager || !this.modelConfig.motions) return;

    const motions = this.modelConfig.motions[group];
    if (!motions || motions.length === 0) {
      console.warn(`⚠️ No motions found for group: ${group}`);
      return;
    }

    const motionIndex = index < motions.length ? index : Math.floor(Math.random() * motions.length);
    const motionData = motions[motionIndex];

    try {
      const motionPath = `${this.getModelPath()}/${motionData.file}`;
      console.log(`🎬 Playing motion: ${group}[${motionIndex}] from ${motionPath}`);

      const response = await fetch(motionPath);
      if (!response.ok) {
        throw new Error(`Failed to load motion: ${response.status}`);
      }

      const motionBuffer = await response.arrayBuffer();
      
      // 使用正确的 Cubism 2 动作加载方式
      if (window.Live2DMotion) {
        const motion = window.Live2DMotion.loadMotion(motionBuffer);
        if (motion) {
          this.motionManager.startMotion(motion, false);
          console.log(`✅ Motion started: ${group}[${motionIndex}]`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to play motion "${group}":`, error);
    }
  }

  /**
   * 根据聊天状态触发动作
   */
  async triggerChatMotion(chatState: 'user_message' | 'ai_typing' | 'ai_speaking' | 'idle'): Promise<void> {
    const motionMap = {
      user_message: 'tap_head',
      ai_typing: 'idle',
      ai_speaking: 'tap_body',
      idle: 'idle'
    };

    const motionGroup = motionMap[chatState];
    if (motionGroup) {
      await this.playMotion(motionGroup);
    }
  }

  /**
   * 分析情绪并触发动作
   */
  async analyzeEmotionAndTrigger(message: string): Promise<void> {
    if (!message) return;

    if (message.includes('开心') || message.includes('高兴') || message.includes('哈哈')) {
      await this.playMotion('tap_head');
    } else if (message.includes('难过') || message.includes('伤心')) {
      await this.playMotion('pinch_in');
    } else {
      await this.playMotion('tap_body');
    }
  }
  /**
   * 开始渲染循环 - 增强调试和验证
   */
  private startRenderLoop(): void {
    let frameCount = 0;
    let lastLogTime = 0;
    let validationDone = false;
    
    const render = (currentTime: number) => {
      if (!this.isInitialized) return;

      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      // 执行深度验证（仅一次）
      if (!validationDone && frameCount === 5) {
        this.validateModelRenderState();
        validationDone = true;
      }

      this.update(deltaTime);
      this.draw();

      // 每5秒输出一次渲染状态（仅前30秒）
      frameCount++;
      if (currentTime - lastLogTime > 5000 && frameCount < 360) { // 30秒 * 12fps
        console.log(`🎬 Render frame ${frameCount} at ${currentTime.toFixed(0)}ms`);
        if (frameCount % 60 === 0) { // 每5秒详细检查
          this.validateModelRenderState();
        }
        lastLogTime = currentTime;
      }

      this.animationId = requestAnimationFrame(render);
    };

    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(render);
    console.log('✅ Enhanced render loop started with validation');
  }

  /**
   * 验证模型渲染状态 - 深度调试
   */
  private validateModelRenderState(): void {
    console.log('🔍 Deep Model Render State Validation:');
    
    // 1. WebGL 上下文验证
    if (this.gl) {
      console.log('  ✅ WebGL Context: Available');
      console.log('    - Context type:', this.gl.constructor.name);
      console.log('    - Canvas size:', this.canvas?.width, 'x', this.canvas?.height);
      console.log('    - Viewport:', this.gl.getParameter(this.gl.VIEWPORT));
      
      // WebGL 状态检查
      const blendEnabled = this.gl.isEnabled(this.gl.BLEND);
      const depthTestEnabled = this.gl.isEnabled(this.gl.DEPTH_TEST);
      console.log('    - Blend enabled:', blendEnabled);
      console.log('    - Depth test enabled:', depthTestEnabled);
      
      // 检查当前程序
      const currentProgram = this.gl.getParameter(this.gl.CURRENT_PROGRAM);
      console.log('    - Current program:', currentProgram);
    } else {
      console.log('  ❌ WebGL Context: Missing');
    }
    
    // 2. Live2D 运行时验证
    if (window.Live2D) {
      console.log('  ✅ Live2D Runtime: Available');
      try {
        const currentGL = window.Live2D.getGL();
        console.log('    - Live2D GL context:', currentGL === this.gl ? 'Matched' : 'Mismatched');
      } catch (e) {
        console.log('    - Live2D GL context: Cannot verify');
      }
    } else {
      console.log('  ❌ Live2D Runtime: Missing');
    }
    
    // 3. 模型实例验证
    if (this.model) {
      console.log('  ✅ Model Instance: Available');
      console.log('    - Model type:', this.model.constructor.name);
      
      // 检查模型方法
      const hasSetMatrix = typeof this.model.setMatrix === 'function';
      const hasDraw = typeof this.model.draw === 'function';
      const hasUpdate = typeof this.model.update === 'function';
      
      console.log('    - setMatrix method:', hasSetMatrix ? 'Available' : 'Missing');
      console.log('    - draw method:', hasDraw ? 'Available' : 'Missing');
      console.log('    - update method:', hasUpdate ? 'Available' : 'Missing');
      
      // 检查模型尺寸
      if (this.model.getCanvasWidth && this.model.getCanvasHeight) {
        const modelWidth = this.model.getCanvasWidth();
        const modelHeight = this.model.getCanvasHeight();
        console.log('    - Model dimensions:', modelWidth, 'x', modelHeight);
        
        if (modelWidth === 0 || modelHeight === 0) {
          console.warn('    ⚠️ Model has zero dimensions - may not be loaded properly');
        }
      }
    } else {
      console.log('  ❌ Model Instance: Missing');
    }
    
    // 4. 矩阵验证
    if (this.viewMatrix) {
      console.log('  ✅ View Matrix (Simple): Available');
      try {
        const viewArray = this.viewMatrix.getArray();
        if (viewArray && viewArray.length >= 16) {
          console.log('    - Matrix elements [0,5,10,15]:', [
            viewArray[0].toFixed(3),
            viewArray[5].toFixed(3), 
            viewArray[10].toFixed(3),
            viewArray[15].toFixed(3)
          ]);
          console.log('    - Translation [12,13,14]:', [
            viewArray[12].toFixed(3),
            viewArray[13].toFixed(3),
            viewArray[14].toFixed(3)
          ]);
        }
      } catch (e) {
        console.log('    - Matrix array: Cannot read');
      }
    } else {
      console.log('  ❌ View Matrix (Simple): Missing');
    }
    
    if (this.projMatrix) {
      console.log('  ✅ Projection Matrix (Simple): Available');
      try {
        const projArray = this.projMatrix.getArray();
        if (projArray && projArray.length >= 16) {
          console.log('    - Matrix elements [0,5,10,15]:', [
            projArray[0].toFixed(3),
            projArray[5].toFixed(3),
            projArray[10].toFixed(3),
            projArray[15].toFixed(3)
          ]);
        }
      } catch (e) {
        console.log('    - Matrix array: Cannot read');
      }
    } else {
      console.log('  ❌ Projection Matrix (Simple): Missing');
    }
    
    // 5. 画布验证
    if (this.canvas) {
      console.log('  ✅ Canvas: Available');
      console.log('    - Canvas size:', this.canvas.width, 'x', this.canvas.height);
      console.log('    - Display size:', this.canvas.offsetWidth, 'x', this.canvas.offsetHeight);
      console.log('    - In DOM:', document.contains(this.canvas));
      console.log('    - Visible:', this.canvas.offsetWidth > 0 && this.canvas.offsetHeight > 0);
    } else {
      console.log('  ❌ Canvas: Missing');
    }
    
    console.log('🔍 Validation complete');
  }
  /**
   * 更新模型 - 使用正确的 Cubism 2 更新顺序
   */
  private update(deltaTime: number): void {
    if (!this.model) return;

    // 更新动作
    if (this.motionManager) {
      this.motionManager.updateParam(this.model);
    }

    // 更新物理
    if (this.physics) {
      this.physics.updateParam(this.model);
    }

    // 更新姿势
    if (this.pose) {
      this.pose.updateParam(this.model);
    }

    // 更新眨眼
    if (this.eyeBlink) {
      this.eyeBlink.updateParam(this.model);
    }

    // 更新模型
    this.model.update();
  }

  /**
   * 绘制模型 - Cubism 2 标准渲染流程
   */
  private draw(): void {
    if (!this.gl || !this.model) return;

    try {
      // 设置视口
      this.gl.viewport(0, 0, this.canvas!.width, this.canvas!.height);

      // 清空画布 - 使用浅灰色背景便于调试
      this.gl.clearColor(0.85, 0.85, 0.85, 1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      // 设置 WebGL 状态
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.disable(this.gl.DEPTH_TEST);
      this.gl.disable(this.gl.CULL_FACE);

      // 关键：确保 Live2D 使用正确的 WebGL 上下文
      if (window.Live2D && this.gl) {
        window.Live2D.setGL(this.gl);
      }

      // 确保模型有正确的矩阵绑定
      if (this.viewMatrix && this.model.setMatrix) {
        this.model.setMatrix(this.viewMatrix.getArray());
      }

      // 执行绘制 - 关键的渲染调用
      try {
        this.model.draw();
        
        // 检查 WebGL 错误
        const error = this.gl.getError();
        if (error !== this.gl.NO_ERROR) {
          console.warn('⚠️ WebGL error during draw:', this.getWebGLErrorString(error));
        }
      } catch (drawError) {
        console.error('❌ Model draw error:', drawError);
      }
      
      // 强制刷新
      this.gl.flush();
      
    } catch (error) {
      console.error('❌ Draw error:', error);
    }
  }

  /**
   * 获取 WebGL 错误字符串
   */
  private getWebGLErrorString(error: number): string {
    if (!this.gl) return 'Unknown error';
    
    switch (error) {
      case this.gl.NO_ERROR: return 'NO_ERROR';
      case this.gl.INVALID_ENUM: return 'INVALID_ENUM';
      case this.gl.INVALID_VALUE: return 'INVALID_VALUE';
      case this.gl.INVALID_OPERATION: return 'INVALID_OPERATION';
      case this.gl.OUT_OF_MEMORY: return 'OUT_OF_MEMORY';
      case this.gl.CONTEXT_LOST_WEBGL: return 'CONTEXT_LOST_WEBGL';
      default: return `Unknown error: ${error}`;
    }
  }

  /**
   * 获取模型路径
   */
  private getModelPath(): string {
    return '/live2d/rem/rem';
  }

  /**
   * 创建错误占位符
   */
  private createErrorPlaceholder(error: Error): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: rgba(239, 68, 68, 0.1);
        border-radius: 8px;
        padding: 20px;
        text-align: center;
      ">
        <div style="
          width: 60px;
          height: 60px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        ">
          <span style="color: white; font-size: 24px;">!</span>
        </div>
        <h3 style="color: #ef4444; margin: 0 0 8px 0;">Live2D加载失败</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">${error.message}</p>
        <button onclick="window.location.reload()" style="
          margin-top: 16px;
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">刷新页面</button>
      </div>
    `;
  }
  /**
   * 调整大小 - 优化矩阵重新计算
   */
  resize(): void {
    if (!this.canvas || !this.container) return;

    try {
      const { clientWidth, clientHeight } = this.container;
      
      if (clientWidth <= 0 || clientHeight <= 0) return;
      
      this.canvas.width = clientWidth;
      this.canvas.height = clientHeight;

      if (this.gl) {
        this.gl.viewport(0, 0, clientWidth, clientHeight);
      }

      // 重新设置投影矩阵
      if (this.projMatrix) {
        this.setupProjectionMatrix();
      }

      // 重新设置模型变换 - 使用优化的配置
      if (this.model && this.viewMatrix) {
        const config = {
          modelPath: '/live2d/rem/rem',
          width: clientWidth,
          height: clientHeight,
          scale: 1.0, // 标准缩放
          x: clientWidth / 2,
          y: clientHeight / 2
        };
        this.setupModelTransform(config);
      }

      console.log(`✅ Resized to ${clientWidth}x${clientHeight}, matrices updated`);
    } catch (error) {
      console.warn('⚠️ Resize operation failed:', error);
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    // 停止渲染循环
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // 清理组件
    this.model = null;
    this.motionManager = null;
    this.physics = null;
    this.pose = null;
    this.eyeBlink = null;
    this.viewMatrix = null;
    this.projMatrix = null;

    // 清理 WebGL 上下文
    if (this.gl) {
      this.gl = null;
    }

    // 清理 Canvas
    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas);
      this.canvas = null;
    }

    // 清理 Live2D
    if (window.Live2D) {
      window.Live2D.dispose();
    }

    this.isInitialized = false;
    console.log('✅ Live2D Manager destroyed');
  }

  /**
   * 获取初始化状态
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * 获取当前模型
   */
  get currentModel(): Live2DModelWebGL | null {
    return this.model;
  }

  /**
   * 获取模型版本
   */
  get version(): string {
    return 'cubism2';
  }
}

export default UniversalLive2DManager;