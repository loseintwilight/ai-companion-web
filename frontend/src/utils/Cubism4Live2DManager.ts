/**
 * Cubism 4 Live2D 管理器
 * 专门处理 Live2D Cubism 4 格式模型的加载和渲染
 * 
 * 注意：此管理器仅在检测到 Cubism 4 运行时时才应该被使用
 */

import * as PIXI from 'pixi.js';
import type {
  ILive2DModel,
  ILive2DModelConstructor,
} from '../types/live2d';

export interface Cubism4ModelConfig {
  modelPath: string;
  width: number;
  height: number;
  scale: number;
  x: number;
  y: number;
}

export class Cubism4Live2DManager {
  private app: PIXI.Application | null = null;
  private container: HTMLElement | null = null;
  private model: ILive2DModel | null = null;
  private isInitialized: boolean = false;
  private isLoading: boolean = false;
  private Live2DModelClass: ILive2DModelConstructor | null = null;

  constructor() {}

  /**
   * 检查 Live2D Cubism 4 运行时是否可用
   */
  private checkCubism4Runtime(): boolean {
    if (typeof window !== 'undefined' && (window.LIVE2DCUBISMCORE || window.Live2DCubismCore)) {
      console.log('Live2D Cubism 4 runtime found');
      return true;
    }
    console.error('Live2D Cubism 4 runtime not found. Please ensure live2dcubismcore.min.js is loaded.');
    return false;
  }

  /**
   * 等待 Live2D Cubism 4 运行时加载
   */
  private async waitForCubism4Runtime(): Promise<boolean> {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 100; // 10秒超时

      const checkInterval = setInterval(() => {
        attempts++;
        if (this.checkCubism4Runtime()) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  }

  /**
   * 初始化管理器
   */
  async initialize(container: HTMLElement, config: Cubism4ModelConfig): Promise<void> {
    if (this.isLoading || this.isInitialized) return;

    try {
      this.isLoading = true;
      this.container = container;

      console.log('Initializing Cubism4Live2DManager...');

      // 等待 Live2D Cubism 4 运行时加载
      const runtimeReady = await this.waitForCubism4Runtime();
      if (!runtimeReady) {
        throw new Error('Live2D Cubism 4 runtime not available');
      }

      // 创建 PIXI 应用
      this.app = new PIXI.Application({
        width: container.clientWidth || 400,
        height: container.clientHeight || 600,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // 将 canvas 添加到容器
      if (this.app.view && container) {
        // 清空容器
        container.innerHTML = '';
        container.appendChild(this.app.view as HTMLCanvasElement);
      }

      // 设置全局 PIXI（用于 pixi-live2d-display 内部引用）
      // 使用类型断言避免类型不兼容问题
      if (typeof window !== 'undefined') {
        (window as any).PIXI = PIXI;
      }

      // 动态加载 Live2D 显示库
      await this.loadLive2DDisplay();

      // 加载模型
      await this.loadModel(config);

      // 设置响应式
      this.setupResponsive();

      this.isInitialized = true;
      this.isLoading = false;
      console.log('Cubism4Live2DManager initialized successfully');
    } catch (error) {
      this.isLoading = false;
      console.error('Failed to initialize Cubism4Live2DManager:', error);
      // 创建占位符
      this.createErrorPlaceholder(error as Error);
      throw error;
    }
  }

  /**
   * 加载 Live2D 显示库
   */
  private async loadLive2DDisplay(): Promise<void> {
    try {
      const live2dModule = await import('pixi-live2d-display');
      
      // 获取 Live2DModel 构造器 - 使用 unknown 中间转换避免类型不兼容
      this.Live2DModelClass = live2dModule.Live2DModel as unknown as ILive2DModelConstructor;

      // 注册 PIXI Ticker
      if (this.Live2DModelClass?.registerTicker && PIXI.Ticker) {
        this.Live2DModelClass.registerTicker(PIXI.Ticker);
      }

      console.log('pixi-live2d-display loaded successfully');
    } catch (error) {
      console.error('Failed to load pixi-live2d-display:', error);
      throw new Error('pixi-live2d-display library not available');
    }
  }

  /**
   * 加载 Live2D 模型
   */
  private async loadModel(config: Cubism4ModelConfig): Promise<void> {
    if (!this.Live2DModelClass || !this.app) {
      throw new Error('Live2DModel or PIXI app not available');
    }

    try {
      const modelUrl = `${config.modelPath}/model.json`;
      console.log('Loading Live2D model from:', modelUrl);

      // 加载模型
      this.model = await this.Live2DModelClass.from(modelUrl, {
        autoInteract: false,
        autoFocus: false,
      });

      if (!this.model) {
        throw new Error('Failed to create Live2D model instance');
      }

      console.log('Live2D model loaded successfully');

      // 设置模型属性
      this.setupModel(config);

      // 添加到舞台
      this.app.stage.addChild(this.model);

      // 设置交互
      this.setupInteraction();

      console.log('Live2D model setup completed');
    } catch (error) {
      console.error('Failed to load Live2D model:', error);
      throw error;
    }
  }

  /**
   * 设置模型属性
   */
  private setupModel(config: Cubism4ModelConfig): void {
    if (!this.model || !this.app) return;

    try {
      // 设置位置
      this.model.x = config.x;
      this.model.y = config.y;

      // 设置缩放
      this.model.scale.set(config.scale);

      // 设置锚点到中心
      if (this.model.anchor) {
        this.model.anchor.set(0.5);
      }

      console.log(`Model positioned at (${config.x}, ${config.y}) with scale ${config.scale}`);
    } catch (error) {
      console.error('Failed to setup model:', error);
    }
  }

  /**
   * 设置交互
   */
  private setupInteraction(): void {
    if (!this.model) return;

    try {
      // 使用 PixiJS 6.x API
      this.model.interactive = true;
      this.model.buttonMode = true;

      // 点击事件
      this.model.on('pointerdown', (_event: PIXI.InteractionEvent) => {
        console.log('Live2D model clicked');
        this.playMotion('tap_body');
      });

      // 鼠标移动事件（视线跟踪）
      this.model.on('pointermove', (event: PIXI.InteractionEvent) => {
        if (this.model?.focus) {
          this.updateLookAt(event.data.global);
        }
      });

      console.log('Model interaction setup completed');
    } catch (error) {
      console.error('Failed to setup interaction:', error);
    }
  }

  /**
   * 更新视线跟踪
   */
  private updateLookAt(globalPoint: PIXI.IPoint): void {
    if (!this.model || !this.app || !this.model.focus) return;

    try {
      const { width, height } = this.app.screen;
      const x = (globalPoint.x / width - 0.5) * 2;
      const y = (globalPoint.y / height - 0.5) * 2;

      this.model.focus(x, y);
    } catch (error) {
      console.error('Failed to update look at:', error);
    }
  }

  /**
   * 播放动作
   */
  async playMotion(group: string, index: number = 0): Promise<void> {
    if (!this.model) return;

    try {
      if (this.model.motion) {
        await this.model.motion(group, index, {
          priority: 2,
        });
        console.log(`Playing motion: ${group}[${index}]`);
      }
    } catch (error) {
      console.error(`Failed to play motion "${group}":`, error);
    }
  }

  /**
   * 设置表情
   */
  async setExpression(name: string): Promise<void> {
    if (!this.model) return;

    try {
      if (this.model.expression) {
        await this.model.expression(name);
        console.log(`Set expression: ${name}`);
      }
    } catch (error) {
      console.error(`Failed to set expression "${name}":`, error);
    }
  }

  /**
   * 根据聊天状态触发动作
   */
  async triggerChatMotion(chatState: 'user_message' | 'ai_typing' | 'ai_speaking' | 'idle'): Promise<void> {
    const motionMap: Record<string, string> = {
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

    // 简单的情绪分析
    if (message.includes('开心') || message.includes('高兴') || message.includes('哈哈')) {
      await this.playMotion('tap_head');
    } else if (message.includes('难过') || message.includes('伤心')) {
      await this.playMotion('pinch_in');
    } else {
      await this.playMotion('tap_body');
    }
  }

  /**
   * 创建错误占位符
   */
  private createErrorPlaceholder(error: Error): void {
    if (!this.app) return;

    const placeholder = new PIXI.Container();

    // 背景
    const bg = new PIXI.Graphics();
    bg.beginFill(0xef4444, 0.1);
    bg.drawRoundedRect(0, 0, 200, 300, 20);
    bg.endFill();

    // 错误图标
    const icon = new PIXI.Graphics();
    icon.beginFill(0xef4444);
    icon.drawCircle(100, 100, 30);
    icon.endFill();
    icon.beginFill(0xffffff);
    icon.drawRect(95, 85, 10, 20);
    icon.drawCircle(100, 115, 3);
    icon.endFill();

    // 错误文本
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xef4444,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 180,
    });

    const text = new PIXI.Text(`Live2D加载失败\n${error.message}`, style);
    text.anchor.set(0.5);
    text.x = 100;
    text.y = 200;

    placeholder.addChild(bg);
    placeholder.addChild(icon);
    placeholder.addChild(text);

    // 居中显示
    placeholder.x = (this.app.screen.width - 200) / 2;
    placeholder.y = (this.app.screen.height - 300) / 2;

    this.app.stage.addChild(placeholder);
  }

  /**
   * 设置响应式
   */
  private setupResponsive(): void {
    if (!this.app || !this.container) return;

    const resizeObserver = new ResizeObserver(() => {
      this.resize();
    });

    resizeObserver.observe(this.container);
  }

  /**
   * 调整大小
   */
  resize(): void {
    if (!this.app || !this.container) return;

    const { clientWidth, clientHeight } = this.container;
    this.app.renderer.resize(clientWidth, clientHeight);

    // 重新定位模型
    if (this.model) {
      this.model.x = clientWidth / 2;
      this.model.y = clientHeight / 2;
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.model) {
      this.model.destroy();
      this.model = null;
    }

    if (this.app) {
      this.app.destroy(true);
      this.app = null;
    }

    this.isInitialized = false;
    console.log('Cubism4Live2DManager destroyed');
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
  get currentModel(): ILive2DModel | null {
    return this.model;
  }

  /**
   * 获取初始化状态 (兼容 PixiLive2DManager 接口)
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * 设置缩放 (兼容接口)
   */
  setScale(scale: number): void {
    if (this.model) {
      this.model.scale.set(scale);
    }
  }

  /**
   * 设置位置 (兼容接口)
   */
  setPosition(x: number, y: number): void {
    if (this.model) {
      this.model.x = x;
      this.model.y = y;
    }
  }
}

export default Cubism4Live2DManager;
