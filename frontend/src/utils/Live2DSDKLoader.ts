/**
 * Live2D SDK 加载管理器
 * 负责安全、可靠地加载 Live2D SDK，提供加载状态管理和错误处理
 */

export interface Live2DSDKConfig {
  live2dPath: string;
  cubismCorePath: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class Live2DSDKLoader {
  private static instance: Live2DSDKLoader;
  private config: Live2DSDKConfig;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private retryCount: number = 0;

  constructor(config?: Partial<Live2DSDKConfig>) {
    this.config = {
      live2dPath: '/lib/live2d.min.js',  // Cubism 2 SDK
      cubismCorePath: '',  // 不需要 Cubism 4 Core
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...config
    };
  }

  static getInstance(config?: Partial<Live2DSDKConfig>): Live2DSDKLoader {
    if (!Live2DSDKLoader.instance) {
      Live2DSDKLoader.instance = new Live2DSDKLoader(config);
    }
    return Live2DSDKLoader.instance;
  }

  /**
   * 检查 SDK 是否已加载
   */
  isSDKLoaded(): boolean {
    return this.isLoaded || typeof (window as any).Live2D !== 'undefined';
  }

  /**
   * 异步加载 Live2D SDK
   */
  async loadSDK(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.loadWithRetry();
    
    try {
      await this.loadPromise;
      this.isLoaded = true;
    } catch (error) {
      this.isLoading = false;
      throw error;
    }

    return this.loadPromise;
  }

  /**
   * 带重试机制的加载
   */
  private async loadWithRetry(): Promise<void> {
    while (this.retryCount <= this.config.maxRetries!) {
      try {
        await this.loadSingleAttempt();
        return;
      } catch (error) {
        this.retryCount++;
        
        if (this.retryCount > this.config.maxRetries!) {
          throw new Error(`Live2D SDK 加载失败，重试 ${this.config.maxRetries} 次后仍然失败: ${error}`);
        }

        console.warn(`Live2D SDK 加载失败，第 ${this.retryCount} 次重试...`, error);
        await this.delay(this.config.retryDelay!);
      }
    }
  }

  /**
   * 单次加载尝试
   */
  private async loadSingleAttempt(): Promise<void> {
    // 检查是否已经通过其他方式加载
    if (this.isSDKLoaded()) {
      console.log('Live2D SDK 已通过其他方式加载');
      return;
    }

    // 只加载 Cubism 2 SDK
    await this.loadScript(this.config.live2dPath, 'Live2D');

    // 验证加载是否成功
    await this.validateSDK();
  }

  /**
   * 动态加载脚本
   */
  private loadScript(src: string, scriptName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查是否已存在该脚本
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        console.log(`${scriptName} 脚本已存在`);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;

      const timeoutId = setTimeout(() => {
        reject(new Error(`${scriptName} 加载超时 (${this.config.timeout}ms)`));
      }, this.config.timeout);

      script.onload = () => {
        clearTimeout(timeoutId);
        console.log(`${scriptName} 加载成功`);
        resolve();
      };

      script.onerror = (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`${scriptName} 加载失败: ${error}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 验证 SDK 加载完整性
   */
  private async validateSDK(): Promise<void> {
    const startTime = Date.now();
    const maxWaitTime = 5000; // 最多等待5秒

    // 等待 Live2D 对象可用
    while (Date.now() - startTime < maxWaitTime) {
      if (typeof (window as any).Live2D !== 'undefined') {
        console.log('Live2D SDK 验证成功');
        return;
      }
      await this.delay(100);
    }

    throw new Error('Live2D SDK 加载超时，window.Live2D 未定义');
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 重置加载状态
   */
  reset(): void {
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
    this.retryCount = 0;
  }

  /**
   * 获取当前加载状态
   */
  getStatus(): {
    isLoaded: boolean;
    isLoading: boolean;
    retryCount: number;
  } {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      retryCount: this.retryCount
    };
  }
}

// 导出默认实例
export const live2DSDKLoader = Live2DSDKLoader.getInstance();

// 预加载钩子 - 在应用启动时预加载SDK
export const preloadLive2DSDK = async (): Promise<void> => {
  try {
    await live2DSDKLoader.loadSDK();
    console.log('Live2D SDK 预加载成功');
  } catch (error) {
    console.error('Live2D SDK 预加载失败:', error);
    // 不抛出错误，让组件处理降级方案
  }
};