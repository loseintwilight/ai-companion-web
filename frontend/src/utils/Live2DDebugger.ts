/**
 * Live2D 调试工具
 * 可直接在浏览器/Electron 控制台运行，排查模型加载问题
 * 
 * 使用方法：
 * 1. 在控制台运行: await window.debugLive2D('/live2d/rem/rem/model.json')
 * 2. 查看输出结果，定位问题
 */

export interface DebugResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export async function debugLive2D(modelPath: string): Promise<DebugResult[]> {
  const results: DebugResult[] = [];
  
  console.log('🔍 ========== Live2D 调试开始 ==========');
  console.log(`📋 模型路径: ${modelPath}`);
  
  // ========================================
  // Step 1: 检查全局对象
  // ========================================
  console.log('\n📌 Step 1: 检查全局对象...');
  
  const hasPIXI = typeof (window as any).PIXI !== 'undefined';
  const hasLive2DNamespace = !!(window as any).PIXI?.live2d;
  const hasLive2DModel = !!(window as any).PIXI?.live2d?.Live2DModel;
  const hasLive2DRuntime = typeof (window as any).Live2D !== 'undefined';
  const hasCubismCore = typeof (window as any).Live2DCubismCore !== 'undefined';
  
  results.push({
    step: '检查全局对象',
    success: hasPIXI && hasLive2DModel,
    message: `PIXI: ${hasPIXI ? '✅' : '❌'}, live2d命名空间: ${hasLive2DNamespace ? '✅' : '❌'}, Live2DModel: ${hasLive2DModel ? '✅' : '❌'}, Cubism2运行时: ${hasLive2DRuntime ? '✅' : '❌'}, Cubism4运行时: ${hasCubismCore ? '✅' : '❌'}`,
    data: { hasPIXI, hasLive2DNamespace, hasLive2DModel, hasLive2DRuntime, hasCubismCore }
  });
  
  if (!hasPIXI) {
    console.error('❌ PIXI 未加载！请确保 pixi.js 已正确引入');
    return results;
  }
  
  if (!hasLive2DModel) {
    console.error('❌ pixi-live2d-display 未加载！');
    if (hasCubismCore && !hasLive2DRuntime) {
      console.error('   检测到 Cubism 4 SDK，但 pixi-live2d-display@0.4.0 仅支持 Cubism 2');
      console.error('   解决方案: 使用 pixi-live2d-display@cubism4 或更换为 Cubism 2 SDK');
    }
    return results;
  }
  
  console.log('✅ 全局对象检查通过');
  
  // ========================================
  // Step 2: 检查模型配置文件
  // ========================================
  console.log('\n📌 Step 2: 检查模型配置文件...');
  
  try {
    const configResponse = await fetch(modelPath);
    
    if (!configResponse.ok) {
      results.push({
        step: '获取模型配置',
        success: false,
        message: `HTTP ${configResponse.status}: ${configResponse.statusText}`,
        error: `无法获取 ${modelPath}`
      });
      console.error(`❌ 无法获取模型配置: HTTP ${configResponse.status}`);
      return results;
    }
    
    const configText = await configResponse.text();
    let config: any;
    
    try {
      config = JSON.parse(configText);
    } catch (e) {
      results.push({
        step: '解析模型配置',
        success: false,
        message: 'model.json 不是有效的 JSON',
        error: String(e)
      });
      console.error('❌ model.json 解析失败:', e);
      return results;
    }
    
    results.push({
      step: '获取模型配置',
      success: true,
      message: `成功获取并解析 model.json`,
      data: config
    });
    
    console.log('✅ 模型配置获取成功');
    console.log('📄 配置内容:', config);
    
    // ========================================
    // Step 3: 检查模型引用的资源文件
    // ========================================
    console.log('\n📌 Step 3: 检查模型资源文件...');
    
    const baseUrl = modelPath.substring(0, modelPath.lastIndexOf('/') + 1);
    const resourceChecks: { file: string; exists: boolean; status?: number }[] = [];
    
    // 检查模型文件 (.moc3 或 .moc)
    const modelFile = config.model || config.Model;
    if (modelFile) {
      const modelUrl = baseUrl + modelFile;
      try {
        const resp = await fetch(modelUrl, { method: 'HEAD' });
        resourceChecks.push({ file: modelFile, exists: resp.ok, status: resp.status });
        console.log(`${resp.ok ? '✅' : '❌'} 模型文件: ${modelFile} (${resp.status})`);
      } catch (e) {
        resourceChecks.push({ file: modelFile, exists: false });
        console.log(`❌ 模型文件: ${modelFile} (请求失败)`);
      }
    }
    
    // 检查纹理文件
    const textures = config.textures || config.FileReferences?.Textures || [];
    for (const tex of textures) {
      const texPath = typeof tex === 'string' ? tex : tex.File;
      if (texPath) {
        try {
          const resp = await fetch(baseUrl + texPath, { method: 'HEAD' });
          resourceChecks.push({ file: texPath, exists: resp.ok, status: resp.status });
          console.log(`${resp.ok ? '✅' : '❌'} 纹理: ${texPath} (${resp.status})`);
        } catch (e) {
          resourceChecks.push({ file: texPath, exists: false });
          console.log(`❌ 纹理: ${texPath} (请求失败)`);
        }
      }
    }
    
    // 检查动作文件
    const motions = config.motions || config.FileReferences?.MotionGroups || {};
    let motionCount = 0;
    for (const [group, files] of Object.entries(motions)) {
      const fileArray = Array.isArray(files) ? files : [];
      for (const motion of fileArray) {
        const motionFile = typeof motion === 'string' ? motion : motion.file;
        if (motionFile) {
          motionCount++;
          // 只检查前几个动作文件，避免请求过多
          if (motionCount <= 3) {
            try {
              const resp = await fetch(baseUrl + motionFile, { method: 'HEAD' });
              console.log(`${resp.ok ? '✅' : '❌'} 动作: ${motionFile} (${resp.status})`);
            } catch (e) {
              console.log(`❌ 动作: ${motionFile} (请求失败)`);
            }
          }
        }
      }
    }
    if (motionCount > 3) {
      console.log(`   ... 还有 ${motionCount - 3} 个动作文件未检查`);
    }
    
    results.push({
      step: '检查资源文件',
      success: resourceChecks.every(r => r.exists),
      message: `${resourceChecks.filter(r => r.exists).length}/${resourceChecks.length} 文件存在`,
      data: resourceChecks
    });
    
    // ========================================
    // Step 4: 测试 Live2DModel 加载
    // ========================================
    console.log('\n📌 Step 4: 测试 Live2DModel 加载...');
    
    const Live2DModel = (window as any).PIXI.live2d.Live2DModel;
    
    try {
      console.log('⏳ 正在加载 Live2D 模型...');
      const startTime = Date.now();
      
      const model = await Live2DModel.from(modelPath, {
        autoInteract: false
      });
      
      const loadTime = Date.now() - startTime;
      
      results.push({
        step: 'Live2DModel 加载',
        success: true,
        message: `模型加载成功，耗时 ${loadTime}ms`,
        data: {
          loadTime,
          hasInternalModel: !!model.internalModel,
          width: model.width,
          height: model.height
        }
      });
      
      console.log(`✅ 模型加载成功！耗时 ${loadTime}ms`);
      console.log('📐 模型尺寸:', model.width, 'x', model.height);
      console.log('🎭 内部模型:', model.internalModel);
      
      // ========================================
      // Step 5: 测试渲染
      // ========================================
      console.log('\n📌 Step 5: 测试渲染...');
      
      // 创建测试 canvas
      let testCanvas = document.getElementById('live2d-debug-canvas') as HTMLCanvasElement;
      if (!testCanvas) {
        testCanvas = document.createElement('canvas');
        testCanvas.id = 'live2d-debug-canvas';
        testCanvas.width = 400;
        testCanvas.height = 600;
        testCanvas.style.cssText = 'position: fixed; bottom: 20px; right: 20px; border: 2px solid red; z-index: 99999; background: rgba(0,0,0,0.1);';
        document.body.appendChild(testCanvas);
        console.log('📦 已创建测试 Canvas（右下角红框）');
      }
      
      // 检查是否需要注册 Ticker
      if (typeof Live2DModel.registerTicker === 'function') {
        try {
          Live2DModel.registerTicker((window as any).PIXI.Ticker);
          console.log('✅ Ticker 注册成功');
        } catch (e) {
          console.warn('⚠️ Ticker 注册失败（可能已注册）:', e);
        }
      }
      
      // 创建 PIXI Application
      const PIXI = (window as any).PIXI;
      const app = new PIXI.Application({
        view: testCanvas,
        width: 400,
        height: 600,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });
      
      console.log('✅ PIXI Application 创建成功');
      
      // 设置模型
      model.anchor.set(0.5, 0.5);
      model.x = 200;
      model.y = 500;
      model.scale.set(0.2);
      
      app.stage.addChild(model);
      
      console.log('✅ 模型已添加到舞台');
      console.log('🖼️ 如果在右下角看到 Live2D 角色，说明渲染正常！');
      
      results.push({
        step: '渲染测试',
        success: true,
        message: '模型已渲染到测试 Canvas，请查看页面右下角',
        data: {
          canvasSize: `${testCanvas.width}x${testCanvas.height}`,
          modelPosition: { x: model.x, y: model.y, scale: model.scale.x }
        }
      });
      
      // 清理函数
      (window as any).cleanupLive2DDebug = () => {
        model.destroy();
        app.destroy(true);
        testCanvas.remove();
        console.log('🧹 调试资源已清理');
      };
      console.log('💡 运行 cleanupLive2DDebug() 清理调试资源');
      
    } catch (loadError) {
      results.push({
        step: 'Live2DModel 加载',
        success: false,
        message: '模型加载失败',
        error: String(loadError)
      });
      console.error('❌ 模型加载失败:', loadError);
      
      // 分析错误原因
      const errorMsg = String(loadError).toLowerCase();
      if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        console.error('   可能原因: 网络错误或文件路径错误');
      } else if (errorMsg.includes('moc') || errorMsg.includes('moc3')) {
        console.error('   可能原因: 模型文件格式不支持或损坏');
      } else if (errorMsg.includes('texture')) {
        console.error('   可能原因: 纹理文件缺失或格式错误');
      } else if (errorMsg.includes('cubism')) {
        console.error('   可能原因: SDK 版本不匹配');
      }
    }
    
  } catch (error) {
    results.push({
      step: '获取模型配置',
      success: false,
      message: '请求失败',
      error: String(error)
    });
    console.error('❌ 获取模型配置失败:', error);
  }
  
  console.log('\n🔍 ========== Live2D 调试结束 ==========');
  console.log('📊 调试结果汇总:', results);
  
  return results;
}

// 注册到全局
(window as any).debugLive2D = debugLive2D;
console.log('✅ Live2D 调试工具已加载');
console.log('💡 使用方法: await debugLive2D("/live2d/rem/rem/model.json")');

export default debugLive2D;
