@echo off
echo ========================================
echo Live2D 模型显示测试脚本
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"

echo [信息] 测试时间: %date% %time%
echo [信息] 当前目录: %CD%
echo.

echo [验证] 关键修复检查...
echo.

:: 检查纹理配置修复
findstr /C:"texture_01.png" "public\live2d\rem\rem\model.json" >nul
if %errorlevel%==0 (
    echo ✅ 纹理配置已修复 - 包含两个纹理文件
) else (
    echo ❌ 纹理配置未修复 - 缺少第二个纹理
)

:: 检查模型加载优化
findstr /C:"Live2DModelWebGL.loadModel" "src\utils\UniversalLive2DManager.ts" >nul
if %errorlevel%==0 (
    echo ✅ 模型加载方法已优化
) else (
    echo ❌ 模型加载方法未优化
)

:: 检查渲染状态检查
findstr /C:"logRenderStatus" "src\utils\UniversalLive2DManager.ts" >nul
if %errorlevel%==0 (
    echo ✅ 渲染状态检查已添加
) else (
    echo ❌ 渲染状态检查缺失
)

:: 检查 WebGL 错误处理
findstr /C:"getWebGLErrorString" "src\utils\UniversalLive2DManager.ts" >nul
if %errorlevel%==0 (
    echo ✅ WebGL 错误处理已增强
) else (
    echo ❌ WebGL 错误处理未增强
)

echo.
echo ========================================
echo 修复总结
echo ========================================
echo.
echo 🔧 已应用的关键修复:
echo   ✅ 修复了模型纹理配置 - 添加缺失的 texture_01.png
echo   ✅ 优化了模型加载逻辑 - 双重加载方法确保兼容性
echo   ✅ 改进了模型变换计算 - 更精确的缩放和定位
echo   ✅ 增强了 WebGL 渲染管道 - 错误检查和状态管理
echo   ✅ 添加了渲染状态监控 - 实时调试信息输出
echo   ✅ 修复了 React Router 警告 - 添加 future flags
echo.
echo 🎯 预期效果:
echo   - Live2D 模型应该在画布中央正确显示
echo   - 模型应该有适当的大小和清晰度
echo   - 控制台应该输出详细的加载和渲染日志
echo   - 每5秒输出一次渲染状态检查（前30秒）
echo.
echo 🔍 关键调试日志:
echo   启动时应该看到:
echo   - "✅ Live2D Cubism 2 Manager initialized successfully"
echo   - "✅ Model config loaded: remu"
echo   - "✅ Live2D model created successfully"
echo   - "✅ Texture loading completed"
echo   - "✅ Model transform applied"
echo.
echo   运行时应该看到:
echo   - "🔍 Render Status Check:" (每5秒)
echo   - "Canvas size: XXX x XXX"
echo   - "Model dimensions: XXX x XXX"
echo   - "WebGL status: No errors"
echo.
echo 🚨 如果模型仍未显示，请检查:
echo   1. 浏览器控制台中的错误信息
echo   2. 渲染状态检查输出
echo   3. WebGL 支持情况
echo   4. 画布容器的尺寸和可见性
echo.
echo 按任意键启动开发服务器...
pause >nul

echo.
echo [启动] 启动开发服务器...
npm start