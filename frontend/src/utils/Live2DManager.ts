/**
 * Live2D模型管理器
 * 负责Live2D模型的加载、渲染和动作控制
 */

import * as PIXI from 'pixi.js';
import type {
  ILive2DModel,
  ILive2DModelConstructor,
  Live2DModelConfig,
  MotionOptions,
} from '../types/live2d';

export type { Live2DModelConfig, MotionOptions };

export class Live2DManager {
  private app: PIXI.Application | null = null;
  private model: ILive2DModel | null = null;
  private config: Live2DModelConfig | null = null;
  private container: HTMLElement | null = null;
  private modelBasePath: string = '';
  private isInitialized: boolean = false;
  private currentMotion: string | null = null;
  private idleTimer: ReturnType<typeof setInterval> | null = null;
  private blinkTimer: ReturnType<typeof setInterval> | null = null;
  private breathTimer: ReturnType<typeof setInterval> | null = null;
  private isLoading: boolean = false;
  private Live2DModelClass: ILive2DModelConstructor | null = null;

  constructor() {
    // 延迟加载PIXI和Live2D模块
    this.loadDependencies();
  }

  private async loadDependencies(): Promise<void> {
    try {
      // 设置全局PIXI（用于 pixi-live2d-display 内部引用）
      // 使用类型断言避免类型不兼容问题
      if (typeof window !== 'undefined') {
        (window as any).PIXI = PIXI;
      }

      // 动态导入Live2D显示库
      try {
        const live2dModule = await import('pixi-live2d-display');
        
        // 获取 Live2DModel 构造器 - 使用 unknown 中间转换避免类型不兼容
        const ModelClass = live2dModule.Live2DModel as unknown as ILive2DModelConstructor;

        // 注册Live2D v2支持
        if (ModelClass && typeof ModelClass.registerTicker === 'function') {
          ModelClass.registerTicker(PIXI.Ticker);
        }

        // 启用Live2D v2支持
        if (ModelClass && typeof ModelClass.from === 'function') {
          this.Live2DModelClass = ModelClass;
          console.log('Live2D display library loaded successfully');
        } else {
          throw new Error('Live2DModel.from is not a function');
        }
      } catch (error) {
        console.warn('Live2D display library not available:', error);
      }
    } catch (error) {
      console.error('Failed to load Live2D dependencies:', error);
    }
  }

  /**
   * 初始化Live2D管理器
   */
  async initialize(container: HTMLElement, modelPath: string): Promise<void> {
    if (this.isLoading) return;
    
    try {
      this.isLoading = true;
      this.container = container;
      this.modelBasePath = modelPath;

      // 确保依赖已加载
      await this.loadDependencies();

      // 创建PIXI应用
      this.app = new PIXI.Application({
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // 将canvas添加到容器
      if (this.app.view) {
        container.appendChild(this.app.view as HTMLCanvasElement);
      }

      // 加载配置文件
      await this.loadConfig();

      // 尝试加载模型
      if (this.Live2DModelClass) {
        await this.loadModel();
      } else {
        console.warn('Live2D model loading not available, showing placeholder');
        this.createPlaceholder();
      }

      // 设置响应式
      this.setupResponsive();

      // 启动自动动作
      this.startAutoActions();

      this.isInitialized = true;
      this.isLoading = false;
      console.log('Live2D Manager initialized successfully');
    } catch (error) {
      this.isLoading = false;
      console.error('Failed to initialize Live2D Manager:', error);
      // 创建错误占位符
      this.createErrorPlaceholder(error as Error);
      throw error;
    }
  }

  /**
   * 创建占位符
   */
  private createPlaceholder(): void {
    if (!this.app) return;

    // 创建一个简单的占位符图形
    const placeholder = new PIXI.Graphics();
    placeholder.beginFill(0x4f46e5, 0.1);
    placeholder.drawRoundedRect(0, 0, 200, 300, 20);
    placeholder.endFill();

    // 添加文本
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0x4f46e5,
      align: 'center',
    });

    const text = new PIXI.Text('Live2D\n角色占位符', style);
    text.anchor.set(0.5);
    text.x = 100;
    text.y = 150;

    placeholder.addChild(text);

    // 居中显示
    placeholder.x = (this.app.screen.width - 200) / 2;
    placeholder.y = (this.app.screen.height - 300) / 2;

    this.app.stage.addChild(placeholder);
  }

  /**
   * 创建错误占位符
   */
  private createErrorPlaceholder(error: Error): void {
    if (!this.app) return;

    const placeholder = new PIXI.Graphics();
    placeholder.beginFill(0xef4444, 0.1);
    placeholder.drawRoundedRect(0, 0, 200, 300, 20);
    placeholder.endFill();

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
    text.y = 150;

    placeholder.addChild(text);
    placeholder.x = (this.app.screen.width - 200) / 2;
    placeholder.y = (this.app.screen.height - 300) / 2;

    this.app.stage.addChild(placeholder);
  }

  /**
   * 加载配置文件
   */
  private async loadConfig(): Promise<void> {
    try {
      // 首先尝试加载我们的自定义配置
      const configPath = `${this.modelBasePath}/rem_config.json`;
      const response = await fetch(configPath);
      if (response.ok) {
        this.config = await response.json();
        return;
      }
    } catch (error) {
      console.warn('Custom config not found, trying model.json');
    }

    try {
      // 尝试加载标准的 model.json
      const modelJsonPath = `${this.modelBasePath}/model.json`;
      const response = await fetch(modelJsonPath);
      if (response.ok) {
        const modelJson = await response.json();
        this.config = this.convertModelJsonToConfig(modelJson);
        return;
      }
    } catch (error) {
      console.warn('model.json not found, using default config');
    }

    // 使用默认配置
    this.config = this.getDefaultConfig();
  }

  /**
   * 将 model.json 转换为我们的配置格式
   */
  private convertModelJsonToConfig(modelJson: any): Live2DModelConfig {
    return {
      version: modelJson.version || "1.0.0",
      model: {
        name: modelJson.name || "Live2D Model",
        description: "Live2D Model",
        author: "Unknown",
        version: "1.0.0"
      },
      files: {
        model: "model.json",
        textures: modelJson.textures || []
      },
      layout: {
        center_x: modelJson.layout?.center_x || 0.0,
        center_y: modelJson.layout?.center_y || -0.05,
        width: modelJson.layout?.width || 2.0,
        height: modelJson.layout?.height || 2.0
      },
      hit_areas: modelJson.hit_areas || [],
      motions: modelJson.motions || { idle: [] },
      expressions: modelJson.expressions || [],
      voice: {
        enabled: false,
        base_path: "",
        files: {}
      },
      settings: {
        auto_blink: true,
        blink_interval: 3000,
        auto_breath: true,
        breath_interval: 5000,
        idle_motion_interval: 10000,
        look_at_cursor: true,
        physics_enabled: true
      },
      chat_integration: {
        motion_triggers: {
          user_message: "tap_head",
          ai_typing: "idle",
          ai_speaking: "tap_body",
          idle: "idle"
        },
        emotion_mapping: {
          happy: ["开心", "高兴", "快乐", "哈哈"],
          sad: ["难过", "伤心", "哭"],
          surprised: ["惊讶", "哇", "天哪"]
        }
      }
    };
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): Live2DModelConfig {
    return {
      version: "1.0.0",
      model: {
        name: "Rem",
        description: "Default Live2D Model",
        author: "AI Companion Team",
        version: "1.0.0"
      },
      files: {
        model: "model.json",
        textures: []
      },
      layout: {
        center_x: 0.0,
        center_y: -0.05,
        width: 2.0,
        height: 2.0
      },
      hit_areas: [],
      motions: {
        idle: [],
        tap_head: [],
        tap_body: []
      },
      expressions: [],
      voice: {
        enabled: false,
        base_path: "",
        files: {}
      },
      settings: {
        auto_blink: true,
        blink_interval: 3000,
        auto_breath: true,
        breath_interval: 5000,
        idle_motion_interval: 10000,
        look_at_cursor: true,
        physics_enabled: true
      },
      chat_integration: {
        motion_triggers: {
          user_message: "tap_head",
          ai_typing: "idle",
          ai_speaking: "tap_body",
          idle: "idle"
        },
        emotion_mapping: {
          happy: ["开心", "高兴", "快乐", "哈哈"],
          sad: ["难过", "伤心", "哭"],
          surprised: ["惊讶", "哇", "天哪"]
        }
      }
    };
  }

  /**
   * 加载Live2D模型
   */
  private async loadModel(): Promise<void> {
    if (!this.config || !this.app || !this.Live2DModelClass) {
      throw new Error('Config, PIXI app, or Live2DModel not available');
    }

    try {
      const modelPath = `${this.modelBasePath}/${this.config.files.model}`;
      console.log('Loading Live2D model from:', modelPath);
      
      // 尝试加载模型
      this.model = await this.Live2DModelClass.from(modelPath, {
        autoInteract: false,
        autoFocus: false
      });

      if (!this.model) {
        throw new Error('Failed to create Live2D model');
      }

      console.log('Live2D model created successfully');

      // 设置模型布局
      this.setupModelLayout();

      // 添加到舞台
      this.app.stage.addChild(this.model);

      // 设置交互
      this.setupInteraction();

      console.log('Live2D model loaded successfully');
    } catch (error) {
      console.error('Failed to load Live2D model:', error);
      console.log('Creating placeholder instead...');
      // 创建占位符
      this.createPlaceholder();
    }
  }

  /**
   * 设置模型布局
   */
  private setupModelLayout(): void {
    if (!this.model || !this.config || !this.app) return;

    const layout = this.config.layout;
    const { width, height } = this.app.screen;

    // 设置模型位置和缩放
    this.model.x = width * (0.5 + layout.center_x);
    this.model.y = height * (0.5 + layout.center_y);
    
    // 计算合适的缩放比例
    if (this.model.width && this.model.height) {
      const scaleX = (width * layout.width) / this.model.width;
      const scaleY = (height * layout.height) / this.model.height;
      const scale = Math.min(scaleX, scaleY);
      
      this.model.scale.set(scale);
    }
  }

  /**
   * 设置交互
   */
  private setupInteraction(): void {
    if (!this.model || !this.config) return;

    try {
      // 使用 PixiJS 6.x API
      this.model.interactive = true;
      this.model.buttonMode = true;

      // 点击交互
      this.model.on('pointerdown', (_event: PIXI.InteractionEvent) => {
        console.log('Live2D model clicked');
        this.playMotion('tap_body');
      });

      // 鼠标跟踪
      if (this.config.settings.look_at_cursor && typeof this.model.focus === 'function') {
        this.model.on('pointermove', (event: PIXI.InteractionEvent) => {
          this.updateLookAt(event.data.global);
        });
      }
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
  async playMotion(group: string, options: MotionOptions = {}): Promise<void> {
    if (!this.model || !this.config) return;

    try {
      // 如果模型有motion方法，调用它
      if (this.model.motion) {
        await this.model.motion(group, 0, {
          priority: options.priority || 2,
        });
      }

      this.currentMotion = group;
      console.log(`Playing motion: ${group}`);
    } catch (error) {
      console.error(`Failed to play motion "${group}":`, error);
    }
  }

  /**
   * 设置表情
   */
  async setExpression(name: string): Promise<void> {
    if (!this.model || !this.config) return;

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
    if (!this.config) return;

    const motionGroup = this.config.chat_integration.motion_triggers[chatState];
    if (motionGroup) {
      await this.playMotion(motionGroup);
    }
  }

  /**
   * 根据消息内容分析情绪并触发相应动作
   */
  async analyzeEmotionAndTrigger(message: string): Promise<void> {
    if (!this.config) return;

    const emotionMapping = this.config.chat_integration.emotion_mapping;
    
    for (const [emotion, keywords] of Object.entries(emotionMapping)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        await this.playMotion(emotion);
        await this.setExpression(emotion);
        break;
      }
    }
  }

  /**
   * 启动自动动作
   */
  private startAutoActions(): void {
    if (!this.config) return;

    const settings = this.config.settings;

    // 闲置动作
    this.idleTimer = setInterval(() => {
      if (this.currentMotion === null || this.currentMotion === 'idle') {
        this.playMotion('idle');
      }
    }, settings.idle_motion_interval);
  }

  /**
   * 停止自动动作
   */
  private stopAutoActions(): void {
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.blinkTimer) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    if (this.breathTimer) {
      clearInterval(this.breathTimer);
      this.breathTimer = null;
    }
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
    this.setupModelLayout();
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopAutoActions();

    if (this.model) {
      this.model.destroy();
      this.model = null;
    }

    if (this.app) {
      this.app.destroy(true);
      this.app = null;
    }

    this.isInitialized = false;
    console.log('Live2D Manager destroyed');
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
}

export default Live2DManager;
