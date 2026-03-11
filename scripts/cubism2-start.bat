@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Live2D Cubism 2 专用启动脚本
echo ========================================
echo.

:: 设置控制台编码为UTF-8
chcp 65001 >nul

:: 进入前端目录
cd /d "%~dp0..\frontend"
if errorlevel 1 (
    echo [错误] 无法进入前端目录
    pause
    exit /b 1
)

echo [信息] 项目目录: %CD%
echo [信息] 启动时间: %date% %time%
echo.

:: 环境检查
echo [检查] 验证环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo [错误] npm 未安装，请检查 Node.js 安装
    pause
    exit /b 1
)

:: 检查 Cubism 2 模型文件
echo [检查] 验证 Cubism 2 模型文件...
if not exist "public\live2d\rem\rem\model.json" (
    echo [错误] 模型配置文件缺失: public\live2d\rem\rem\model.json
    pause
    exit /b 1
)

if not exist "public\live2d\rem\rem\remu.moc" (
    echo [错误] MOC 文件缺失: public\live2d\rem\rem\remu.moc
    pause
    exit /b 1
)

echo [成功] Cubism 2 模型文件验证通过
echo.

:: 清理 Cubism 4 相关文件
echo [清理] 移除 Cubism 4 相关文件...
if exist "public\lib\live2dcubismcore.min.js" (
    echo [信息] 删除 Cubism 4 本地文件...
    del "public\lib\live2dcubismcore.min.js"
)

if exist "public\lib" (
    rmdir /q "public\lib" 2>nul
)

:: 检查并清理依赖
if exist "node_modules\pixi-live2d-display" (
    echo [清理] 移除 pixi-live2d-display...
    rmdir /s /q "node_modules\pixi-live2d-display" 2>nul
)

if exist "node_modules\pixi.js" (
    echo [清理] 移除 pixi.js...
    rmdir /s /q "node_modules\pixi.js" 2>nul
)

:: 安装/更新依赖
echo [安装] 安装项目依赖...
if not exist "node_modules" (
    echo [信息] 首次安装依赖...
    npm install --legacy-peer-deps --no-audit --no-fund
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo [信息] 依赖已存在，跳过安装
)

:: TypeScript 编译检查
echo [检查] TypeScript 编译检查...
npx tsc --noEmit >nul 2>&1
if errorlevel 1 (
    echo [警告] TypeScript 编译检查发现问题，但继续启动...
) else (
    echo [成功] TypeScript 编译检查通过
)

echo [成功] 环境准备完成
echo.

:: 设置环境变量
echo [配置] 设置环境变量...
set GENERATE_SOURCEMAP=false
set SKIP_PREFLIGHT_CHECK=true
set FAST_REFRESH=true
set BROWSER=none

:: 显示启动信息
echo ========================================
echo 🚀 启动 Live2D Cubism 2 AI伴侣应用
echo ========================================
echo.
echo 📍 访问地址: http://localhost:3000
echo 🎭 Live2D模型: Rem (Cubism 2 原生支持)
echo 🔧 运行时: live2d.min.js (CDN)
echo 📱 支持功能: 聊天交互、动作联动、点击响应
echo.
echo 💡 Cubism 2 特性:
echo   - 原生 WebGL 渲染
echo   - .moc 模型格式
echo   - .mtn 动作文件
echo   - 完整物理和姿势支持
echo.
echo ⚠️  注意:
echo   - 模型加载可能需要几秒钟
echo   - 确保网络连接正常 (CDN 加载)
echo   - 按 Ctrl+C 停止服务器
echo.
echo ========================================

:: 启动开发服务器
echo [启动] 正在启动开发服务器...
echo.

:: 尝试启动
npm start

:: 如果 npm start 失败，尝试备用方案
if errorlevel 1 (
    echo.
    echo [错误] npm start 失败，尝试备用方案...
    
    :: 检查是否有 yarn
    yarn --version >nul 2>&1
    if not errorlevel 1 (
        echo [信息] 尝试使用 yarn start...
        yarn start
        if not errorlevel 1 goto :success
    )
    
    :: 尝试直接运行 react-scripts
    echo [信息] 尝试直接运行 react-scripts...
    npx react-scripts start
    if not errorlevel 1 goto :success
    
    :: 所有方法都失败
    echo.
    echo [错误] 所有启动方法都失败了
    echo.
    echo 🔧 故障排除建议:
    echo   1. 检查 Node.js 版本 (推荐 16.x)
    echo   2. 清理依赖: rm -rf node_modules package-lock.json
    echo   3. 重新安装: npm install --legacy-peer-deps
    echo   4. 检查模型文件是否完整
    echo   5. 确保网络连接正常
    echo.
    pause
    exit /b 1
)

:success
echo.
echo ========================================
echo ✅ Live2D Cubism 2 AI伴侣应用已启动
echo ========================================
echo.
echo 🎉 恭喜！应用已成功启动
echo 📱 请在浏览器中访问: http://localhost:3000
echo 🎭 Live2D Rem 模型应该正常显示和交互
echo.
echo 📋 Cubism 2 功能检查清单:
echo   □ Live2D 模型是否显示
echo   □ 点击模型头部是否有动作
echo   □ 点击模型身体是否有动作
echo   □ 鼠标移动时视线是否跟随
echo   □ 发送消息时模型是否有反应
echo   □ 窗口缩放时模型是否正常调整
echo.
echo 🐛 如遇问题:
echo   - 打开浏览器开发者工具查看控制台
echo   - 查看是否有 "✅ Cubism 2 runtime loaded" 消息
echo   - 确认模型文件路径正确
echo   - 检查网络连接 (CDN 加载)
echo.
echo 按任意键关闭此窗口...
pause >nul