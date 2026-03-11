@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Live2D AI伴侣 - 最终启动脚本
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

:: 快速环境检查
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

:: 检查关键文件
if not exist "public\lib\live2dcubismcore.min.js" (
    echo [错误] Cubism Core 文件缺失
    echo [信息] 请运行 fix-live2d-complete.bat 进行完整修复
    pause
    exit /b 1
)

if not exist "public\live2d\rem\rem\model.json" (
    echo [错误] Live2D 模型文件缺失
    echo [信息] 请确保模型文件位于 public\live2d\rem\rem\ 目录
    pause
    exit /b 1
)

:: 检查依赖
if not exist "node_modules" (
    echo [警告] 依赖未安装，正在安装...
    echo [信息] 使用 --legacy-peer-deps 解决版本冲突...
    
    npm install --legacy-peer-deps --no-audit --no-fund
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        echo [建议] 请运行 fix-live2d-complete.bat 进行完整修复
        pause
        exit /b 1
    )
    echo [成功] 依赖安装完成
)

:: 验证关键依赖
npm list pixi-live2d-display >nul 2>&1
if errorlevel 1 (
    echo [警告] pixi-live2d-display 未正确安装，尝试修复...
    npm install pixi-live2d-display@^0.4.0 --legacy-peer-deps
)

npm list pixi.js >nul 2>&1
if errorlevel 1 (
    echo [警告] pixi.js 未正确安装，尝试修复...
    npm install pixi.js@^7.3.2 --legacy-peer-deps
)

echo [成功] 环境检查通过
echo.

:: 设置环境变量
echo [配置] 设置环境变量...
set GENERATE_SOURCEMAP=false
set SKIP_PREFLIGHT_CHECK=true
set FAST_REFRESH=true
set BROWSER=none

:: 显示启动信息
echo ========================================
echo 🚀 启动 Live2D AI伴侣应用
echo ========================================
echo.
echo 📍 访问地址: http://localhost:3000
echo 🎭 Live2D模型: Rem (Cubism 4 增强实现)
echo 🔧 运行时: 本地 Cubism Core + pixi-live2d-display
echo 📱 支持功能: 聊天交互、动作联动、响应式布局
echo.
echo 💡 提示:
echo   - 首次加载可能需要几秒钟
echo   - 如遇问题请查看浏览器控制台
echo   - 按 Ctrl+C 停止服务器
echo.
echo ⚠️  注意:
echo   - 当前使用增强本地 Cubism Core 实现
echo   - 如需完整功能，请替换为官方 live2dcubismcore.min.js
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
    echo   1. 运行 diagnose-live2d-complete.bat 进行诊断
    echo   2. 运行 fix-live2d-complete.bat 进行完整修复
    echo   3. 检查 Node.js 版本是否兼容 (推荐 16.x 或 18.x)
    echo   4. 清理依赖: rm -rf node_modules package-lock.json
    echo   5. 重新安装: npm install --legacy-peer-deps
    echo.
    pause
    exit /b 1
)

:success
echo.
echo ========================================
echo ✅ Live2D AI伴侣应用已启动
echo ========================================
echo.
echo 🎉 恭喜！应用已成功启动
echo 📱 请在浏览器中访问: http://localhost:3000
echo 🎭 Live2D 模型应该正常显示和交互
echo.
echo 📋 功能检查清单:
echo   □ Live2D 模型是否显示
echo   □ 点击模型是否有反应
echo   □ 发送消息时模型是否有动作
echo   □ 窗口缩放时模型是否正常调整
echo   □ 右上角状态指示器是否工作
echo.
echo 🐛 如遇问题:
echo   - 打开浏览器开发者工具查看控制台
echo   - 查看 docs\LIVE2D_COMPLETE_FIX.md 文档
echo   - 运行 diagnose-live2d-complete.bat 诊断
echo.
echo 按任意键关闭此窗口...
pause >nul