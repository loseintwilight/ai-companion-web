/**
 * PixiLive2DManager - Live2D Manager using pixi-live2d-display
 * 
 * 使用 pixi-live2d-display 库，支持完整的 Live2D Cubism 2 渲染
 * 
 * Requirements:
 * - pixi.js@6.5.10 (CDN)
 * - pixi-live2d-display@0.4.0 (CDN)
 * - live2d.min.js (Cubism 2 runtime, CDN)
 */

import * as PIXI from 'pixi.js';

// ============================================
// pixi-live2d-display 原生类型定义
// ============================================

interface Live2DModel extends PIXI.Container {
  x: number;
  y: number;
  scale: PIXI.ObservablePoint;
  anchor: PIXI.ObservablePoint;
  width: number;
  height: number;
  rotation: number;
  alpha: number;
  visible: boolean;
  interactive: boolean;
  buttonMode: boolean;
  
  internalModel: {
    coreModel: any;
    motionManager: {
      startMotion: (group: string, index: number, priority: number) => Promise<void>;
      startRandomMotion: (group: string, priority: number) => Promise<void>;
      stopAllMotions: () => void;
      expressionManager?: {
        setExpression: (name: string) => Promise<void>;
        resetExpression: () => void;
      };
    };
    settings?: {
      expressions?: Array<{ name: string; file: string }>;
      motions?: Record<string, Array<{ file: string }>>;
    };
    focusController?: {
      focus: (x: number, y: number) => void;
    };
  };
  
  motion(group: string, index?: number, priority?: number): Promise<void>;
  expression(name: string): Promise<void>;
  focus(x: number, y: number, instant?: boolean): void;
  tap(x: number, y: number): boolean;
}

interface Live2DModelConstructor {
  new (): Live2DModel;
  from(source: string, options?: { autoInteract?: boolean }): Promise<Live2DModel>;
  registerTicker(ticker: typeof PIXI.Ticker): void;
}

interface Live2DNamespace {
  Live2DModel: Live2DModelConstructor;
}

// ============================================
// 日志工具
// ============================================

const LOG_PREFIX = '[PixiLive2D]';
const log = {
  info: (message: string, ...args: any[]) => console.log(`${LOG_PREFIX} ℹ️ ${message}`, ...args),
  success: (message: string, ...args: any[]) => console.log(`${LOG_PREFIX} ✅ ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`${LOG_PREFIX} ⚠️ ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`${LOG_PREFIX} ❌ ${message}`, ...args),
  step: (step: number, total: number, message: string) => 
    console.log(`${LOG_PREFIX} [${step}/${total}] ${message}`),
};

// ============================================
// 配置
// ============================================

export interface Live2DManagerConfig {
  modelPath: string;
  width: number;
  height: number;
  scale?: number;
  x?: number;
  y?: number;
  autoInteract?: boolean;
  debug?: boolean;
}

// ============================================
// PixiLive2DManager 类
// ============================================

export class PixiLive2DManager {
  private app: PIXI.Application | null = null;
  private model: Live2DModel | null = null;
  private config: Live2DManagerConfig;
  private isInitialized: boolean = false;
  private expressionNames: string[] = [];
  private loadError: Error | null = null;
  
  // 回调
  private onLoadComplete?: () => void;
  private onLoadError?: (error: Error) => void;

  constructor(config: Live2DManagerConfig) {
    this.config = {
      scale: 0.15,
      x: config.width / 2,
      y: config.height / 2,
      autoInteract: true,
      debug: false,
      ...config
    };
    
    log.info(`创建管理器实例，模型路径: ${this.config.modelPath}`);
  }

  /**
   * 设置加载回调
   */
  setCallbacks(callbacks: {
    onLoadComplete?: () => void;
    onLoadError?: (error: Error) => void;
  }): void {
    this.onLoadComplete = callbacks.onLoadComplete;
    this.onLoadError = callbacks.onLoadError;
  }

  /**
   * 获取加载错误
   */
  getLoadError(): Error | null {
    return this.loadError;
  }

  /**
   * 获取全局 PIXI.live2d 对象
   */
  private getLive2DNamespace(): Live2DNamespace | null {
    const pixi = (window as any).PIXI;
    return pixi?.live2d || null;
  }

  /**
   * Step 1: 检查运行时环境
   */
  private async checkRuntime(): Promise<Live2DNamespace> {
    log.step(1, 5, '检查运行时环境...');
    
    // 检查 PIXI
    const hasPIXI = typeof (window as any).PIXI !== 'undefined';
    if (!hasPIXI) {
      throw new Error('PIXI.js 未加载，请确保 pixi.js 已正确引入');
    }
    log.success('PIXI.js 已加载');
    
    // 检查 pixi-live2d-display
    const live2d = this.getLive2DNamespace();
    if (!live2d?.Live2DModel) {
      // 检测是否是 SDK 版本不匹配
      const hasCubism4 = typeof (window as any).Live2DCubismCore !== 'undefined';
      const hasCubism2 = typeof (window as any).Live2D !== 'undefined';
      
      let errorMsg = 'pixi-live2d-display 未正确加载';
      if (hasCubism4 && !hasCubism2) {
        errorMsg += '\n检测到 Cubism 4 SDK，但 pixi-live2d-display@0.4.0 仅支持 Cubism 2';
        errorMsg += '\n解决方案: 使用 pixi-live2d-display@cubism4 或更换为 Cubism 2 SDK';
      }
      throw new Error(errorMsg);
    }
    log.success('pixi-live2d-display 已加载');
    
    // 检查 Cubism 运行时
    const hasCubism2 = typeof (window as any).Live2D !== 'undefined';
    const hasCubism4 = typeof (window as any).Live2DCubismCore !== 'undefined';
    log.info(`Cubism 2 运行时: ${hasCubism2 ? '已加载' : '未加载'}`);
    log.info(`Cubism 4 运行时: ${hasCubism4 ? '已加载' : '未加载'}`);
    
    return live2d;
  }

  /**
   * Step 2: 检查模型配置文件
   */
  private async checkModelConfig(): Promise<any> {
    log.step(2, 5, '检查模型配置文件...');
    
    try {
      const response = await fetch(this.config.modelPath);
      
      if (!response.ok) {
        throw new Error(`无法获取模型配置: HTTP ${response.status} ${response.statusText}`);
      }
      
      const config = await response.json();
      log.success(`模型配置获取成功: ${this.config.modelPath}`);
      
      // 打印配置信息
      if (this.config.debug) {
        log.info('模型配置内容:', config);
      }
      
      // 检查必要字段
      const modelFile = config.model || config.Model;
      const textures = config.textures || config.FileReferences?.Textures || [];
      
      if (!modelFile) {
        log.warn('配置文件中未找到模型文件定义 (model/Model)');
      } else {
        log.info(`模型文件: ${modelFile}`);
      }
      
      log.info(`纹理文件数量: ${textures.length}`);
      
      return config;
    } catch (error) {
      throw new Error(`模型配置检查失败: ${error}`);
    }
  }

  /**
   * Step 3: 初始化 PIXI Application
   */
  private async initPixiApp(canvas: HTMLCanvasElement): Promise<void> {
    log.step(3, 5, '初始化 PIXI Application...');
    
    try {
      this.app = new PIXI.Application({
        view: canvas,
        width: this.config.width,
        height: this.config.height,
        backgroundColor: 0xffffff,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });
      
      log.success(`PIXI Application 创建成功，画布尺寸: ${this.config.width}x${this.config.height}`);
      
      // 添加背景提示（加载完成前显示）
      this.showLoadingPlaceholder();
      
    } catch (error) {
      throw new Error(`PIXI Application 初始化失败: ${error}`);
    }
  }

  /**
   * 显示加载占位符
   */
  private showLoadingPlaceholder(): void {
    if (!this.app) return;
    
    const placeholder = new PIXI.Text('正在加载 Live2D 模型...', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0x999999,
      align: 'center'
    });
    placeholder.name = 'loadingPlaceholder';
    placeholder.anchor.set(0.5);
    placeholder.x = this.config.width / 2;
    placeholder.y = this.config.height / 2;
    
    this.app.stage.addChild(placeholder);
    log.info('已显示加载占位符');
  }

  /**
   * 显示错误占位符
   */
  private showErrorPlaceholder(errorMsg: string): void {
    if (!this.app) return;
    
    // 移除加载占位符
    this.app.stage.getChildByName('loadingPlaceholder')?.destroy();
    
    const errorText = new PIXI.Text(`Live2D 加载失败\n${errorMsg}`, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xff0000,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: this.config.width - 40
    });
    errorText.name = 'errorPlaceholder';
    errorText.anchor.set(0.5);
    errorText.x = this.config.width / 2;
    errorText.y = this.config.height / 2;
    
    this.app.stage.addChild(errorText);
    log.info('已显示错误占位符');
  }

  /**
   * 移除占位符
   */
  private removePlaceholder(): void {
    if (!this.app) return;
    
    this.app.stage.getChildByName('loadingPlaceholder')?.destroy();
    this.app.stage.getChildByName('errorPlaceholder')?.destroy();
  }

  /**
   * Step 4: 加载 Live2D 模型
   */
  private async loadLive2DModel(): Promise<void> {
    log.step(4, 5, '加载 Live2D 模型...');
    
    const live2d = this.getLive2DNamespace();
    if (!live2d) {
      throw new Error('Live2D 运行时不可用');
    }
    
    // 注册 Ticker
    if (typeof live2d.Live2DModel.registerTicker === 'function') {
      try {
        live2d.Live2DModel.registerTicker(PIXI.Ticker);
        log.success('Ticker 注册成功');
      } catch (e) {
        log.warn('Ticker 注册跳过（可能已注册）');
      }
    }
    
    log.info(`开始加载模型: ${this.config.modelPath}`);
    const startTime = Date.now();
    
    try {
      const loadedModel = await live2d.Live2DModel.from(this.config.modelPath, {
        autoInteract: this.config.autoInteract
      });
      
      const loadTime = Date.now() - startTime;
      log.success(`模型加载成功！耗时: ${loadTime}ms`);
      
      this.model = loadedModel;
      
      // 缓存表情名称
      this.cacheExpressionNames();
      
    } catch (error) {
      const errorMsg = String(error);
      log.error(`模型加载失败: ${errorMsg}`);
      
      // 分析错误原因
      if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch')) {
        throw new Error('网络错误或文件不存在，请检查模型路径');
      } else if (errorMsg.includes('moc') || errorMsg.includes('.moc3')) {
        throw new Error('模型文件格式不支持，请检查 SDK 版本');
      } else if (errorMsg.includes('texture')) {
        throw new Error('纹理文件加载失败');
      }
      
      throw error;
    }
  }

  /**
   * Step 5: 设置模型并渲染
   */
  private setupAndRender(): void {
    log.step(5, 5, '设置模型并渲染...');
    
    if (!this.app) {
      throw new Error('PIXI Application 未初始化');
    }
    
    if (!this.model) {
      throw new Error('Live2D 模型未加载');
    }
    
    // 移除占位符
    this.removePlaceholder();
    
    // 设置模型属性
    this.model.x = this.config.x ?? this.config.width / 2;
    this.model.y = this.config.y ?? this.config.height / 2;
    this.model.scale.set(this.config.scale ?? 0.15);
    
    // 设置锚点
    if (this.model.anchor) {
      this.model.anchor.set(0.5, 0.5);
    }
    
    log.info(`模型位置: (${this.model.x}, ${this.model.y})`);
    log.info(`模型缩放: ${this.model.scale.x}`);
    log.info(`模型尺寸: ${this.model.width}x${this.model.height}`);
    
    // 添加到舞台
    this.app.stage.addChild(this.model);
    log.success('模型已添加到舞台');
    
    // 设置交互
    this.setupInteraction();
    log.success('交互设置完成');
  }

  /**
   * 主初始化方法
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    log.info('========== Live2D 初始化开始 ==========');
    log.info(`配置: ${JSON.stringify({ ...this.config, modelPath: this.config.modelPath })}`);
    
    try {
      // Step 1: 检查运行时
      await this.checkRuntime();
      
      // Step 2: 检查模型配置
      await this.checkModelConfig();
      
      // Step 3: 初始化 PIXI
      await this.initPixiApp(canvas);
      
      // Step 4: 加载模型
      await this.loadLive2DModel();
      
      // Step 5: 渲染
      this.setupAndRender();
      
      this.isInitialized = true;
      log.success('========== Live2D 初始化完成 ==========');
      
      // 触发回调
      this.onLoadComplete?.();
      
    } catch (error) {
      this.loadError = error instanceof Error ? error : new Error(String(error));
      log.error(`初始化失败: ${this.loadError.message}`);
      
      // 显示错误占位符
      this.showErrorPlaceholder(this.loadError.message);
      
      // 触发回调
      this.onLoadError?.(this.loadError);
      
      throw this.loadError;
    }
  }

  /**
   * 缓存表情名称
   */
  private cacheExpressionNames(): void {
    if (!this.model?.internalModel?.settings?.expressions) {
      return;
    }
    
    this.expressionNames = this.model.internalModel.settings.expressions
      .map(expr => expr.name)
      .filter((name): name is string => typeof name === 'string');
    
    log.info(`缓存了 ${this.expressionNames.length} 个表情: ${this.expressionNames.join(', ')}`);
  }

  /**
   * 设置交互
   */
  private setupInteraction(): void {
    if (!this.model) return;

    this.model.interactive = true;
    this.model.buttonMode = true;

    this.model.on('pointerdown', () => {
      log.info('模型被点击');
      this.playMotion('tap_body');
    });

    this.model.on('hit', (hitAreas: string[]) => {
      if (hitAreas.length > 0) {
        log.info(`命中区域: ${hitAreas.join(', ')}`);
        this.playMotion('tap_body');
      }
    });
  }

  /**
   * 播放动作
   */
  async playMotion(group: string, index?: number, priority: number = 2): Promise<void> {
    if (!this.model) return;

    try {
      await this.model.motion(group, index, priority);
      if (this.config.debug) {
        log.info(`播放动作: ${group}[${index ?? 'random'}]`);
      }
    } catch (error) {
      log.warn(`动作播放失败: ${group}[${index ?? 'random'}]`);
    }
  }

  /**
   * 设置表情（按名称）
   */
  async setExpressionByName(name: string): Promise<void> {
    if (!this.model) return;

    try {
      await this.model.expression(name);
      log.info(`设置表情: ${name}`);
    } catch (error) {
      log.warn(`表情设置失败: ${name}`);
    }
  }

  /**
   * 设置表情（按索引）
   */
  async setExpression(index: number): Promise<void> {
    if (!this.model) return;

    const expressionName = this.expressionNames[index];
    if (!expressionName) {
      log.warn(`无效的表情索引: ${index}，可用: ${this.expressionNames.join(', ')}`);
      return;
    }

    await this.setExpressionByName(expressionName);
  }

  /**
   * 获取可用表情名称
   */
  getExpressionNames(): string[] {
    return [...this.expressionNames];
  }

  /**
   * 设置缩放
   */
  setScale(scale: number): void {
    if (!this.model) return;
    this.model.scale.set(scale);
  }

  /**
   * 设置位置
   */
  setPosition(x: number, y: number): void {
    if (!this.model) return;
    this.model.x = x;
    this.model.y = y;
  }

  /**
   * 视线聚焦
   */
  focusAt(x: number, y: number): void {
    if (!this.model) return;
    this.model.focus(x, y);
  }

  /**
   * 调整尺寸
   */
  resize(width: number, height: number): void {
    if (!this.app) return;
    
    this.app.renderer.resize(width, height);
    
    if (this.model) {
      this.model.x = width / 2;
      this.model.y = height / 2;
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    log.info('销毁管理器...');
    
    if (this.model) {
      this.model.destroy();
      this.model = null;
    }

    if (this.app) {
      this.app.destroy(true, { children: true, texture: true, baseTexture: true });
      this.app = null;
    }

    this.expressionNames = [];
    this.isInitialized = false;
    this.loadError = null;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  getApp(): PIXI.Application | null {
    return this.app;
  }

  getModel(): Live2DModel | null {
    return this.model;
  }
}

export default PixiLive2DManager;
