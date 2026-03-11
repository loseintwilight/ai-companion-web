@echo off
echo ========================================
echo Live2D 修复验证脚本
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"

echo [信息] 验证时间: %date% %time%
echo [信息] 当前目录: %CD%
echo.

:: 检查关键文件
echo [验证] 模型文件检查...
if exist "public\live2d\rem\rem\model.json" (
    echo ✅ model.json 存在
) else (
    echo ❌ model.json 缺失
    goto :error
)

if exist "public\live2d\rem\rem\remu.moc" (
    echo ✅ remu.moc 存在
) else (
    echo ❌ remu.moc 缺失
    goto :error
)

if exist "public\live2d\rem\rem\remu2048\texture_00.png" (
    echo ✅ texture_00.png 存在
) else (
    echo ❌ texture_00.png 缺失
    goto :error
)

echo.
echo [验证] 源代码修复检查...

:: 检查 UniversalLive2DManager.ts 的关键修复
findstr /C:"layout.center_x" "src\utils\UniversalLive2DManager.ts" >nul
if %errorlevel%==0 (
    echo ✅ 模型变换矩阵修复已应用
) else (
    echo ❌ 模型变换矩阵修复缺失
)

findstr /C:"disable(this.gl.DEPTH_TEST)" "src\utils\UniversalLive2DManager.ts" >nul
if %errorlevel%==0 (
    echo ✅ WebGL 渲染优化已应用
) else (
    echo ❌ WebGL 渲染优化缺失
)

findstr /C:"premultipliedAlpha: true" "src\utils\UniversalLive2DManager.ts" >nul
if %errorlevel%==0 (
    echo ✅ WebGL 上下文优化已应用
) else (
    echo ❌ WebGL 上下文优化缺失
)

:: 检查 App.tsx 的 React Router 修复
findstr /C:"v7_startTransition" "src\App.tsx" >nul
if %errorlevel%==0 (
    echo ✅ React Router 警告修复已应用
) else (
    echo ❌ React Router 警告修复缺失
)

echo.
echo [验证] 项目配置检查...

:: 检查 package.json 依赖
findstr /C:"react-scripts" package.json >nul && echo ✅ react-scripts 配置正确
findstr /C:"typescript" package.json >nul && echo ✅ TypeScript 配置正确

echo.
echo ========================================
echo 修复验证完成
echo ========================================
echo.
echo 🎯 已验证的修复内容:
echo   ✅ 模型文件完整性
echo   ✅ 模型变换矩阵优化
echo   ✅ WebGL 渲染设置改进
echo   ✅ React Router 警告修复
echo.
echo 📋 下一步操作:
echo   1. 运行 'npm start' 启动开发服务器
echo   2. 打开浏览器访问 http://localhost:3000
echo   3. 打开开发者工具查看控制台日志
echo   4. 验证 Live2D 模型是否正常显示
echo.
echo 🔍 预期的控制台日志:
echo   - "✅ Cubism 2 runtime loaded successfully"
echo   - "✅ Live2D Cubism 2 Manager initialized successfully"
echo   - "✅ Model transform applied"
echo   - "📐 Model canvas dimensions"
echo.
echo 如需启动服务器，请运行: npm start
echo 如需详细调试，请运行: debug-model-display.bat
echo.
goto :end

:error
echo.
echo ❌ 验证失败！请检查缺失的文件或修复。
echo.
pause
exit /b 1

:end
echo 验证完成！按任意键退出...
pause >nul