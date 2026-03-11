/**
 * 简化的Live2D管理器
 * 专门处理Live2D v2模型的兼容性问题
 */

import * as PIXI from 'pixi.js';

export interface SimpleLive2DConfig {
  modelPath: string;
  width: number;
  height: number;
  scale: number;
  x: number;
  y: number;
}

export class SimpleLive2DManager {
  private app: PIXI.Application | null = null;
  private container: HTMLElement | null = null;
  private placeholder: PIXI.Container | null = null;
  private isInitialized: boolean = false;

  constructor() {}

  /**
   * 初始化管理器
   */
  async initialize(container: HTMLElement, config: SimpleLive2DConfig): Promise<void> {
    try {
      this.container = container;

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

      // 尝试加载Live2D模型，如果失败则创建占位符
      try {
        await this.loadLive2DModel(config);
      } catch (error) {
        console.warn('Live2D model loading failed, creating placeholder:', error);
        this.createAnimatedPlaceholder();
      }

      // 设置响应式
      this.setupResponsive();

      this.isInitialized = true;
      console.log('SimpleLive2DManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SimpleLive2DManager:', error);
      throw error;
    }
  }

  /**
   * 尝试加载Live2D模型
   */
  private async loadLive2DModel(config: SimpleLive2DConfig): Promise<void> {
    // 动态导入Live2D库
    try {
      const { Live2DModel } = await import('pixi-live2d-display');
      
      // 注册PIXI ticker
      if (Live2DModel.registerTicker) {
        Live2DModel.registerTicker(PIXI.Ticker);
      }

      // 加载模型
      const model = await Live2DModel.from(`${config.modelPath}/model.json`);
      
      if (model && this.app) {
        // 设置模型位置和缩放
        model.x = config.x;
        model.y = config.y;
        model.scale.set(config.scale);

        // 添加到舞台
        this.app.stage.addChild(model);

        // 设置交互
        model.interactive = true;
        model.on('pointerdown', () => {
          console.log('Live2D model clicked');
          // 播放动作
          if (model.motion) {
            model.motion('tap_body', 0);
          }
        });

        console.log('Live2D model loaded successfully');
        return;
      }
    } catch (error) {
      console.error('Live2D library error:', error);
    }

    // 如果到这里说明加载失败
    throw new Error('Failed to load Live2D model');
  }

  /**
   * 创建动画占位符
   */
  private createAnimatedPlaceholder(): void {
    if (!this.app) return;

    this.placeholder = new PIXI.Container();

    // 创建角色轮廓
    const character = new PIXI.Graphics();
    character.beginFill(0x6366f1, 0.8);
    character.drawRoundedRect(0, 0, 120, 200, 15);
    character.endFill();

    // 创建头部
    const head = new PIXI.Graphics();
    head.beginFill(0x8b5cf6, 0.9);
    head.drawCircle(60, 40, 25);
    head.endFill();

    // 创建眼睛
    const leftEye = new PIXI.Graphics();
    leftEye.beginFill(0xffffff);
    leftEye.drawCircle(50, 35, 4);
    leftEye.endFill();

    const rightEye = new PIXI.Graphics();
    rightEye.beginFill(0xffffff);
    rightEye.drawCircle(70, 35, 4);
    rightEye.endFill();

    // 创建嘴巴
    const mouth = new PIXI.Graphics();
    mouth.lineStyle(2, 0xffffff);
    mouth.arc(60, 45, 8, 0, Math.PI);

    // 添加文本
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xffffff,
      align: 'center',
    });

    const text = new PIXI.Text('Rem\n(Live2D占位符)', style);
    text.anchor.set(0.5);
    text.x = 60;
    text.y = 130;

    // 组装角色
    this.placeholder.addChild(character);
    this.placeholder.addChild(head);
    this.placeholder.addChild(leftEye);
    this.placeholder.addChild(rightEye);
    this.placeholder.addChild(mouth);
    this.placeholder.addChild(text);

    // 居中显示
    this.placeholder.x = (this.app.screen.width - 120) / 2;
    this.placeholder.y = (this.app.screen.height - 200) / 2;

    // 添加到舞台
    this.app.stage.addChild(this.placeholder);

    // 添加交互
    this.placeholder.interactive = true;
    this.placeholder.buttonMode = true;
    this.placeholder.on('pointerdown', () => {
      this.playPlaceholderAnimation();
    });

    // 添加呼吸动画
    this.startBreathingAnimation();

    console.log('Animated placeholder created');
  }

  /**
   * 播放占位符动画
   */
  private playPlaceholderAnimation(): void {
    if (!this.placeholder) return;

    // 简单的缩放动画
    const originalScale = this.placeholder.scale.x;
    this.placeholder.scale.set(originalScale * 1.1);

    setTimeout(() => {
      if (this.placeholder) {
        this.placeholder.scale.set(originalScale);
      }
    }, 200);

    console.log('Placeholder animation played');
  }

  /**
   * 开始呼吸动画
   */
  private startBreathingAnimation(): void {
    if (!this.placeholder || !this.app) return;

    let time = 0;
    const breathingSpeed = 0.02;
    const breathingAmount = 0.05;

    this.app.ticker.add(() => {
      if (this.placeholder) {
        time += breathingSpeed;
        const scale = 1 + Math.sin(time) * breathingAmount;
        this.placeholder.scale.set(scale);
      }
    });
  }

  /**
   * 触发聊天动作
   */
  async triggerChatMotion(chatState: 'user_message' | 'ai_typing' | 'ai_speaking' | 'idle'): Promise<void> {
    console.log(`Chat state changed to: ${chatState}`);
    
    if (this.placeholder) {
      // 根据聊天状态改变颜色
      const character = this.placeholder.children[0] as PIXI.Graphics;
      if (character) {
        character.clear();
        let color = 0x6366f1;
        
        switch (chatState) {
          case 'user_message':
            color = 0x10b981; // 绿色 - 用户消息
            break;
          case 'ai_typing':
            color = 0xf59e0b; // 黄色 - AI思考中
            break;
          case 'ai_speaking':
            color = 0xef4444; // 红色 - AI回复中
            break;
          case 'idle':
            color = 0x6366f1; // 蓝色 - 空闲
            break;
        }
        
        character.beginFill(color, 0.8);
        character.drawRoundedRect(0, 0, 120, 200, 15);
        character.endFill();
      }
    }
  }

  /**
   * 分析情绪并触发动作
   */
  async analyzeEmotionAndTrigger(message: string): Promise<void> {
    console.log(`Analyzing emotion for message: ${message.slice(0, 50)}...`);
    
    // 简单的情绪分析
    if (message.includes('开心') || message.includes('高兴') || message.includes('哈哈')) {
      this.playPlaceholderAnimation();
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

    // 重新居中占位符
    if (this.placeholder) {
      this.placeholder.x = (clientWidth - 120) / 2;
      this.placeholder.y = (clientHeight - 200) / 2;
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.app) {
      this.app.destroy(true);
      this.app = null;
    }

    this.placeholder = null;
    this.isInitialized = false;
    console.log('SimpleLive2DManager destroyed');
  }

  /**
   * 获取初始化状态
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

export default SimpleLive2DManager;