/**
 * Live2D SDK 加载测试脚本
 * 用于验证本地SDK文件加载是否正常
 */

import { live2DSDKLoader } from './Live2DSDKLoader';

export const testLive2DSDKLoad = async (): Promise<{
  success: boolean;
  message: string;
  details: {
    live2dLoaded: boolean;
    cubismCoreLoaded: boolean;
    windowLive2D: boolean;
  };
}> => {
  console.log('=== 开始 Live2D SDK 加载测试 ===');
  
  try {
    // 重置加载器状态
    live2DSDKLoader.reset();
    
    // 测试加载
    await live2DSDKLoader.loadSDK();
    
    // 检查加载结果
    const live2dLoaded = typeof (window as any).Live2D !== 'undefined';
    const cubismCoreLoaded = typeof (window as any).Live2DCubismCore !== 'undefined';
    const windowLive2D = typeof (window as any).Live2D !== 'undefined';
    
    const details = {
      live2dLoaded,
      cubismCoreLoaded,
      windowLive2D
    };
    
    const success = live2dLoaded && windowLive2D;
    
    if (success) {
      console.log('✅ Live2D SDK 加载测试通过');
      return {
        success: true,
        message: 'Live2D SDK 加载成功',
        details
      };
    } else {
      console.error('❌ Live2D SDK 加载测试失败', details);
      return {
        success: false,
        message: 'Live2D SDK 加载失败',
        details
      };
    }
    
  } catch (error) {
    console.error('❌ Live2D SDK 加载测试异常:', error);
    return {
      success: false,
      message: `Live2D SDK 加载异常: ${error instanceof Error ? error.message : String(error)}`,
      details: {
        live2dLoaded: false,
        cubismCoreLoaded: false,
        windowLive2D: false
      }
    };
  }
};

// 自动运行测试（开发环境）
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    testLive2DSDKLoad().then(result => {
      if (!result.success) {
        console.warn('Live2D SDK 开发环境测试失败，建议检查本地文件路径');
      }
    });
  }, 1000);
}