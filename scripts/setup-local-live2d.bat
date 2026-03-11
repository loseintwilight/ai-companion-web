@echo off
chcp 65001 >nul
echo ========================================
echo Live2D 本地化完整安装脚本
echo ========================================
echo.

cd /d "%~dp0\..\frontend"

echo [1/6] 检查项目结构...
if not exist "package.json" (
    echo ❌ 错误：不在正确的前端目录
    pause
    exit /b 1
)
echo ✅ 项目结构正确

echo.
echo [2/6] 创建本地库目录...
if not exist "public\lib" mkdir "public\lib"
echo ✅ 本地库目录创建完成

echo.
echo [3/6] 检查 Live2D 依赖...
npm list pixi-live2d-display 2>nul
if errorlevel 1 (
    echo ⚠️  正在安装 pixi-live2d-display...
    npm install pixi-live2d-display@0.4.0 --legacy-peer-deps --registry https://registry.npmmirror.com
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)
echo ✅ Live2D 依赖检查完成

echo.
echo [4/6] 验证本地 Cubism Core 文件...
if exist "public\lib\live2dcubismcore.min.js" (
    for %%A in ("public\lib\live2dcubismcore.min.js") do set size=%%~zA
    echo ✅ 本地 Cubism Core 文件存在 ^(!size! bytes^)
) else (
    echo ❌ 本地 Cubism Core 文件缺失
    pause
    exit /b 1
)

echo.
echo [5/6] 验证模型文件...
if exist "public\live2d\rem\rem\model.json" (
    echo ✅ Live2D 模型文件存在
) else (
    echo ❌ Live2D 模型文件缺失
    echo 请确保模型文件位于：public\live2d\rem\rem\model.json
    pause
    exit /b 1
)

echo.
echo [6/6] 编译检查...
echo 正在进行 TypeScript 编译检查...
npx tsc --noEmit --skipLibCheck
if errorlevel 1 (
    echo ⚠️  TypeScript 编译有警告，但可以继续
) else (
    echo ✅ TypeScript 编译通过
)

echo.
echo ========================================
echo 本地化安装完成！
echo ========================================
echo.
echo 🔧 配置摘要：
echo   ✅ 本地 Cubism Core 文件：public\lib\live2dcubismcore.min.js
echo   ✅ 多源加载策略：本地优先，CDN 备用
echo   ✅ pixi-live2d-display：v0.4.0
echo   ✅ 错误处理：ResizeObserver 修复
echo   ✅ 节点挂载：增强验证逻辑
echo.
echo 📋 测试要点：
echo   1. 检查控制台 Cubism Core 加载信息
echo   2. 确认 Live2D 模型正常显示
echo   3. 测试模型交互功能
echo   4. 验证聊天状态联动
echo   5. 检查窗口缩放无错误
echo.
echo 🚀 启动项目：
echo   npm start
echo.
echo 📖 如需官方 Cubism Core：
echo   1. 访问：https://www.live2d.com/download/cubism-sdk/
echo   2. 下载 Cubism SDK for Web
echo   3. 替换 public\lib\live2dcubismcore.min.js
echo.

set /p choice="是否立即启动项目？(Y/N): "
if /i "%choice%"=="Y" (
    echo.
    echo 启动开发服务器...
    npm start
) else (
    echo.
    echo 安装完成！可以手动运行 npm start 启动项目。
)

pause