@echo off
echo ========================================
echo Live2D CubismMatrix44 API 修复测试
echo ========================================
echo.

echo [信息] 测试时间: %date% %time%
echo.

echo [步骤 1] 检查服务器状态...
netstat -an | findstr :3000 > nul
if %errorlevel% == 0 (
    echo ✅ React 开发服务器正在运行 (端口 3000)
) else (
    echo ❌ React 开发服务器未运行
    echo 请先启动服务器: npm start
    pause
    exit /b 1
)

echo.
echo [步骤 2] CubismMatrix44 API 修复说明...
echo.

echo 🔧 已修复的 API 问题:
echo   1. 移除不存在的 L2DViewMatrix 类引用
echo   2. 移除不存在的 L2DMatrix44 类引用  
echo   3. 统一使用 CubismMatrix44 作为矩阵类
echo   4. 更新所有矩阵相关的类型声明
echo   5. 修复矩阵初始化和绑定代码
echo.

echo 📋 Cubism 2 正确的 API 结构:
echo   - Live2D.init() / dispose() / setGL()
echo   - Live2DModelWebGL (模型类)
echo   - CubismMatrix44 (矩阵类)
echo   - Live2DMotion (动作类)
echo   - MotionQueueManager (动作队列)
echo   - L2DEyeBlink / L2DPose / PhysicsHandler
echo.

echo 🎯 修复的关键点:
echo   - 视图矩阵: CubismMatrix44 (不是 L2DViewMatrix)
echo   - 投影矩阵: CubismMatrix44 (不是 L2DMatrix44)
echo   - 矩阵方法: multScale(), multTranslate(), identity()
echo   - 模型绑定: model.setMatrix(cubismMatrix44)
echo.

echo [步骤 3] 打开应用进行测试...
echo.

echo 🌐 在浏览器中打开应用...
start http://localhost:3000

echo.
echo [步骤 4] 关键日志检查...
echo.

echo 🔍 请在浏览器控制台中检查以下修复后的日志:
echo.
echo   📋 运行时检查:
echo     ✅ "Cubism 2 runtime status: { cubism2: true }"
echo     ✅ "Live2D initialized with WebGL context and CubismMatrix44 matrices"
echo.
echo   📋 矩阵创建:
echo     ✅ "CubismMatrix44 view matrix created"
echo     ✅ "CubismMatrix44 projection matrix created"
echo     ❌ 不应该看到 "L2DViewMatrix" 或 "L2DMatrix44" 相关错误
echo.
echo   📋 矩阵配置:
echo     ✅ "Setting up model transform with CubismMatrix44..."
echo     ✅ "Model CubismMatrix44 binding successful"
echo     ✅ "Projection matrix configured for Cubism 2 orthographic projection"
echo.
echo   📋 验证信息:
echo     ✅ "View Matrix (CubismMatrix44): Available"
echo     ✅ "Projection Matrix (CubismMatrix44): Available"
echo.

echo [步骤 5] 错误检查清单...
echo.

echo 🚫 不应该出现的错误:
echo   ❌ "L2DViewMatrix not available"
echo   ❌ "L2DMatrix44 not available"
echo   ❌ "Cannot read property of undefined"
echo   ❌ "TypeError: window.L2DViewMatrix is not a constructor"
echo   ❌ "TypeError: window.L2DMatrix44 is not a constructor"
echo.

echo ✅ 应该看到的成功信息:
echo   ✅ "CubismMatrix44 view matrix created"
echo   ✅ "CubismMatrix44 projection matrix created"
echo   ✅ "Model CubismMatrix44 binding successful"
echo   ✅ "Enhanced render loop started with validation"
echo.

echo [步骤 6] 视觉效果验证...
echo.

echo 📋 预期的视觉效果:
echo   ✅ 画布显示中灰色背景
echo   ✅ Live2D 模型正确显示在画布中央
echo   ✅ 模型大小适中，完全可见
echo   ✅ 鼠标移动时视线跟踪正常
echo   ✅ 点击模型时播放动作
echo.

echo 🐛 如果仍有问题:
echo.
echo   1. 检查 Live2D 运行时加载:
echo      确认控制台显示 "Cubism 2 runtime status: { cubism2: true }"
echo.
echo   2. 检查 CubismMatrix44 可用性:
echo      在控制台执行: console.log(window.CubismMatrix44)
echo      应该返回构造函数，不是 undefined
echo.
echo   3. 检查模型文件:
echo      访问 http://localhost:3000/live2d/rem/rem/model.json
echo      确认配置文件正确加载
echo.
echo   4. 重新启动测试:
echo      关闭浏览器，重新运行 npm start，再次测试
echo.

echo ✅ CubismMatrix44 API 修复测试完成！
echo.
echo 💡 提示: 如果问题仍然存在，请检查 live2d.min.js 是否正确加载
echo.

pause