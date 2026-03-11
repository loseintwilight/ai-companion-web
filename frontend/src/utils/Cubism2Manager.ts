/**
 * Cubism2Manager - Live2D Cubism 2 模型管理器
 * 
 * 严格遵循初始化顺序：
 * 1. 创建 Canvas 并获取 WebGL 上下文
 * 2. 将上下文传递给 Live2D SDK
 * 3. 加载模型配置和 MOC 文件
 * 4. 加载纹理并上传到 GPU
 * 5. 初始化矩阵和启动渲染循环
 */

export interface Cubism2Config {
  modelPath: string;
  width: number;
  height: number;
  scale?: number;
  x?: number;
  y?: number;
}

export class Cubism2Manager {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;
  private model: any = null;
  private config: Cubism2Config;
  private isInitialized: boolean = false;
  private animationFrameId: number | null = null;
  
  // 模型数据
  private modelJson: any = null;
  private basePath: string = '';

  constructor(config: Cubism2Config) {
    this.config = {
      scale: 0.8,
      x: 0,
      y: 0,
      ...config
    };
  }

  /**
   * 主初始化方法 - 严格按顺序执行
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    console.log('=== Cubism2Manager 初始化开始 ===');
    
    try {
      // 步骤1: 设置 Canvas
      this.setupCanvas(canvas);
      
      // 步骤2: 获取 WebGL 上下文
      await this.initWebGL();
      
      // 步骤3: 等待 Live2D SDK 加载
      await this.waitForLive2DSDK();
      
      // 步骤4: 加载模型配置
      await this.loadModelConfig();
      
      // 步骤5: 加载 MOC 文件
      await this.loadMOCFile();
      
      // 步骤6: 加载纹理
      await this.loadTextures();
      
      // 步骤7: 初始化矩阵
      this.initializeMatrices();
      
      // 步骤8: 启动渲染循环
      this.startRenderLoop();
      
      this.isInitialized = true;
      console.log('=== Cubism2Manager 初始化完成 ===');
      
    } catch (error) {
      console.error('[Cubism2Manager] 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 步骤1: 设置 Canvas
   */
  private setupCanvas(canvas: HTMLCanvasElement): void {
    console.log('[步骤1] 设置 Canvas...');
    
    if (!canvas) {
      throw new Error('Canvas 元素不存在');
    }
    
    this.canvas = canvas;
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    
    console.log(`[步骤1] Canvas 尺寸: ${this.canvas.width} x ${this.canvas.height}`);
  }

  /**
   * 步骤2: 获取 WebGL 上下文
   */
  private async initWebGL(): Promise<void> {
    console.log('[步骤2] 获取 WebGL 上下文...');
    
    if (!this.canvas) {
      throw new Error('Canvas 未初始化');
    }

    // 尝试获取 WebGL 上下文
    const contextOptions = {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      preserveDrawingBuffer: false
    };

    this.gl = this.canvas.getContext('webgl', contextOptions) as WebGLRenderingContext;
    
    if (!this.gl) {
      this.gl = this.canvas.getContext('experimental-webgl', contextOptions) as WebGLRenderingContext;
    }
    
    if (!this.gl) {
      throw new Error('无法获取 WebGL 上下文，请检查浏览器是否支持 WebGL');
    }

    // 配置 WebGL
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

    console.log('[步骤2] WebGL 上下文获取成功');
    console.log('[步骤2] WebGL 版本:', this.gl.getParameter(this.gl.VERSION));
    
    // 打印 GPU 信息
    const debugInfo = this.gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      console.log('[步骤2] GPU:', this.gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    }
  }

  /**
   * 步骤3: 等待 Live2D SDK 加载
   */
  private async waitForLive2DSDK(): Promise<void> {
    console.log('[步骤3] 等待 Live2D SDK 加载...');
    
    // 等待 Live2D
    let retries = 0;
    while (typeof (window as any).Live2D === 'undefined' && retries < 50) {
      await this.delay(100);
      retries++;
    }
    
    if (typeof (window as any).Live2D === 'undefined') {
      throw new Error('Live2D SDK 未加载，请检查 live2d.min.js 是否正确引入');
    }

    // 等待 Live2DModelWebGL
    retries = 0;
    while (typeof (window as any).Live2DModelWebGL === 'undefined' && retries < 50) {
      await this.delay(100);
      retries++;
    }
    
    if (typeof (window as any).Live2DModelWebGL === 'undefined') {
      throw new Error('Live2DModelWebGL 未定义，请检查 SDK 是否正确加载');
    }

    // 将 WebGL 上下文传递给 Live2D SDK
    const Live2D = (window as any).Live2D;
    Live2D.setGL(this.gl);
    
    // 同时设置全局上下文（供 live2d-extend.js 使用）
    if (typeof (window as any).setLive2DGLContext === 'function') {
      (window as any).setLive2DGLContext(this.gl);
    }

    console.log('[步骤3] Live2D SDK 就绪');
    console.log('[步骤3] Live2D:', typeof (window as any).Live2D);
    console.log('[步骤3] Live2DModelWebGL:', typeof (window as any).Live2DModelWebGL);
    console.log('[步骤3] L2DMatrix44:', typeof (window as any).L2DMatrix44);
  }

  /**
   * 步骤4: 加载模型配置
   */
  private async loadModelConfig(): Promise<void> {
    console.log('[步骤4] 加载模型配置...');
    
    const response = await fetch(this.config.modelPath);
    if (!response.ok) {
      throw new Error(`无法加载模型配置: ${response.status}`);
    }
    
    this.modelJson = await response.json();
    this.basePath = this.config.modelPath.substring(0, this.config.modelPath.lastIndexOf('/'));
    
    console.log('[步骤4] 模型名称:', this.modelJson.name || 'Unknown');
    console.log('[步骤4] 模型文件:', this.modelJson.model);
    console.log('[步骤4] 纹理数量:', this.modelJson.textures?.length || 0);
  }

  /**
   * 步骤5: 加载 MOC 文件
   */
  private async loadMOCFile(): Promise<void> {
    console.log('[步骤5] 加载 MOC 文件...');
    
    if (!this.modelJson || !this.modelJson.model) {
      throw new Error('模型配置无效');
    }

    const mocPath = `${this.basePath}/${this.modelJson.model}`;
    console.log('[步骤5] MOC 路径:', mocPath);
    
    const response = await fetch(mocPath);
    if (!response.ok) {
      throw new Error(`无法加载 MOC 文件: ${response.status}`);
    }
    
    const mocBuffer = await response.arrayBuffer();
    console.log('[步骤5] MOC 文件大小:', mocBuffer.byteLength, 'bytes');
    
    // 创建模型实例
    const Live2DModelWebGL = (window as any).Live2DModelWebGL;
    this.model = Live2DModelWebGL.loadModel(mocBuffer);
    
    if (!this.model) {
      throw new Error('无法创建模型实例');
    }
    
    console.log('[步骤5] 模型实例创建成功');
  }

  /**
   * 步骤6: 加载纹理
   * 注意：Cubism 2 SDK 的着色器初始化由 SDK 内部处理，无需手动调用
   */
  private async loadTextures(): Promise<void> {
    console.log('[步骤6] 加载纹理...');
    
    if (!this.model) {
      throw new Error('模型未初始化，无法加载纹理');
    }
    
    if (!this.gl) {
      throw new Error('WebGL 上下文不可用，无法加载纹理');
    }
    
    if (!this.modelJson.textures || this.modelJson.textures.length === 0) {
      console.warn('[步骤6] 没有纹理需要加载');
      return;
    }

    // 确保模型有 textures 数组
    if (!this.model.textures) {
      this.model.textures = [];
    }

    for (let i = 0; i < this.modelJson.textures.length; i++) {
      const texturePath = `${this.basePath}/${this.modelJson.textures[i]}`;
      console.log(`[步骤6] 加载纹理 ${i + 1}/${this.modelJson.textures.length}: ${texturePath}`);
      
      await this.loadSingleTexture(texturePath, i);
    }
    
    console.log('[步骤6] 所有纹理加载完成');
  }

  /**
   * 加载单个纹理
   */
  private loadSingleTexture(texturePath: string, index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // 再次检查 WebGL 上下文
      if (!this.gl) {
        reject(new Error(`纹理 ${index} 加载失败: WebGL 上下文不可用`));
        return;
      }
      
      if (!this.model) {
        reject(new Error(`纹理 ${index} 加载失败: 模型不可用`));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          // 在回调中再次验证上下文
          if (!this.gl) {
            reject(new Error(`纹理 ${index} 处理失败: WebGL 上下文丢失`));
            return;
          }

          // 创建 WebGL 纹理
          const texture = this.gl.createTexture();
          if (!texture) {
            reject(new Error(`纹理 ${index} 创建失败`));
            return;
          }

          // 绑定并配置纹理
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
          this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
          this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
          this.gl.bindTexture(this.gl.TEXTURE_2D, null);

          // 设置到模型
          this.model.setTexture(index, texture);
          
          console.log(`[步骤6] 纹理 ${index + 1} 加载成功: ${img.width}x${img.height}`);
          resolve();
          
        } catch (error) {
          console.error(`[步骤6] 纹理 ${index + 1} 处理异常:`, error);
          reject(error);
        }
      };

      img.onerror = () => {
        console.error(`[步骤6] 纹理图片加载失败: ${texturePath}`);
        reject(new Error(`纹理图片加载失败: ${texturePath}`));
      };

      img.src = texturePath;
    });
  }

  /**
   * 步骤7: 初始化矩阵
   */
  private initializeMatrices(): void {
    console.log('[步骤7] 初始化矩阵...');
    
    if (!this.model) {
      throw new Error('模型未初始化，无法设置矩阵');
    }

    const L2DMatrix44 = (window as any).L2DMatrix44;
    const Live2DModelMatrix = (window as any).Live2DModelMatrix;

    if (!L2DMatrix44 || !Live2DModelMatrix) {
      console.warn('[步骤7] 矩阵类不可用，使用 Float32Array');
      this.initializeMatricesFallback();
      return;
    }

    try {
      // 获取模型画布尺寸
      const canvasWidth = this.model.getCanvasWidth?.() || 2.0;
      const canvasHeight = this.model.getCanvasHeight?.() || 2.0;
      
      console.log('[步骤7] 模型画布尺寸:', canvasWidth, 'x', canvasHeight);

      // 创建模型矩阵
      const modelMatrix = new Live2DModelMatrix(canvasWidth, canvasHeight);
      modelMatrix.setWidth(this.config.scale || 0.8);
      modelMatrix.setCenterPosition(this.config.x || 0, this.config.y || 0);

      // 创建投影矩阵
      const projMatrix = new L2DMatrix44();
      if (this.canvas) {
        const aspectRatio = this.canvas.height / this.canvas.width;
        projMatrix.multScale(1, aspectRatio);
      }

      // 合并矩阵
      const combinedMatrix = projMatrix.mult(modelMatrix);

      // 设置到模型
      if (this.model.setMatrix) {
        this.model.setMatrix(combinedMatrix);
      }

      console.log('[步骤7] 矩阵初始化完成');
      
    } catch (error) {
      console.warn('[步骤7] 矩阵初始化异常，使用回退方案:', error);
      this.initializeMatricesFallback();
    }
  }

  /**
   * 矩阵初始化回退方案
   */
  private initializeMatricesFallback(): void {
    if (!this.model || !this.canvas) return;
    
    const scale = this.config.scale || 0.8;
    const aspectRatio = this.canvas.height / this.canvas.width;
    
    const matrix = new Float32Array([
      scale, 0, 0, 0,
      0, scale * aspectRatio, 0, 0,
      0, 0, 1, 0,
      this.config.x || 0, this.config.y || 0, 0, 1
    ]);
    
    if (this.model.setMatrix) {
      this.model.setMatrix(matrix);
    }
    
    console.log('[步骤7] 使用 Float32Array 矩阵');
  }

  /**
   * 步骤8: 启动渲染循环
   */
  private startRenderLoop(): void {
    console.log('[步骤8] 启动渲染循环...');
    
    const render = () => {
      if (!this.model || !this.gl || !this.canvas) {
        return;
      }

      // 清除画布
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      // 更新模型
      if (this.model.update) {
        this.model.update();
      }

      // 绘制模型
      if (this.model.draw) {
        this.model.draw();
      }

      // 继续循环
      this.animationFrameId = requestAnimationFrame(render);
    };

    // 开始渲染
    render();
    
    console.log('[步骤8] 渲染循环已启动');
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 调整大小
   */
  resize(width: number, height: number): void {
    if (!this.canvas || !this.gl) return;

    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);

    // 重新初始化矩阵
    this.initializeMatrices();
    
    console.log(`[Cubism2Manager] 尺寸调整: ${width}x${height}`);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    console.log('[Cubism2Manager] 销毁中...');

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.model = null;
    this.gl = null;
    this.canvas = null;
    this.modelJson = null;
    this.isInitialized = false;

    console.log('[Cubism2Manager] 已销毁');
  }

  /**
   * 检查是否已初始化
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

export default Cubism2Manager;
