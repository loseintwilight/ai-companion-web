/**
 * Live2D 降级管理器
 * 当 pixi-live2d-display 加载失败时，提供简易的静态模型显示
 */

import * as PIXI from 'pixi.js';

export interface FallbackConfig {
  width: number;
  height: number;
  modelName: string;
}

export class FallbackLive2DManager {
  private app: PIXI.Application | null = null;
  private sprite: PIXI.DisplayObject | null = null;  // 使用 DisplayObject 兼容 Graphics/Sprite
  private config: FallbackConfig;
  private isInitialized: boolean = false;

  constructor(config: FallbackConfig) {
    this.config = config;
  }

  /**
   * 初始化降级管理器
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    try {
      // 创建简单的 PIXI 应用
      this.app = new PIXI.Application({
        view: canvas,
        width: this.config.width,
        height: this.config.height,
        backgroundColor: 0xf0f0f0,
        backgroundAlpha: 0.1,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });

      // 创建占位符精灵
      this.createPlaceholder();

      this.isInitialized = true;
      console.log('✅ Live2D 降级模式启动成功');
    } catch (error) {
      console.error('[FallbackLive2DManager] 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 创建占位符显示
   */
  private createPlaceholder(): void {
    if (!this.app) return;

    const graphics = new PIXI.Graphics();
    
    // 绘制背景
    graphics.beginFill(0x4f46e5, 0.1);
    graphics.drawRoundedRect(0, 0, 200, 300, 20);
    graphics.endFill();

    // 添加文本
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0x4f46e5,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 180
    });

    const text = new PIXI.Text(`Live2D 角色占位符\n${this.config.modelName}`, style);
    text.anchor.set(0.5);
    text.x = 100;
    text.y = 150;

    graphics.addChild(text);
    graphics.x = (this.app.screen.width - 200) / 2;
    graphics.y = (this.app.screen.height - 300) / 2;

    this.app.stage.addChild(graphics);
    this.sprite = graphics;
  }

  /**
   * 调整大小
   */
  resize(width: number, height: number): void {
    if (this.app) {
      this.app.renderer.resize(width, height);
      
      // 重新定位占位符
      if (this.sprite) {
        this.sprite.x = (width - 200) / 2;
        this.sprite.y = (height - 300) / 2;
      }
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }

    if (this.app) {
      this.app.destroy(true, { children: true, texture: true, baseTexture: true });
      this.app = null;
    }

    this.isInitialized = false;
  }

  /**
   * 检查是否已初始化
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

export default FallbackLive2DManager;