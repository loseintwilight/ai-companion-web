@echo off
chcp 65001 >nul
cls
echo ========================================
echo Live2D WebGL 修复后启动
echo ========================================
echo.

echo 📋 修复内容:
echo   ✅ 使用完整的 Live2D Widget SDK
echo   ✅ 包含 Live2DModelWebGL 核心类
echo   ✅ 包含 Live2DMotion 动作系统
echo   ✅ 包含 MotionQueueManager 队列管理
echo.

echo 🔍 验证修复...
echo.

set "INDEX_FILE=ai-companion-web\frontend\public\index.html"

if not exist "%INDEX_FILE%" (
    echo ❌ index.html 不存在！
    echo    请确保在正确的目录运行此脚本
    pause
    exit /b 1
)

findstr /C:"L2Dwidget.0.min.js" "%INDEX_FILE%" >nul
if %errorlevel% equ 0 (
    echo ✅ index.html 已配置完整 SDK
) else (
    echo ⚠️  index.html 可能未正确配置
    echo    请检查是否包含 L2Dwidget.0.min.js
)

echo.
echo 🧹 清理缓存...
echo.

cd ai-companion-web\frontend

if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" 2>nul
    echo ✅ 已清理 node_modules 缓存
) else (
    echo ℹ️  没有缓存需要清理
)

echo.
echo 🚀 启动开发服务器...
echo.
echo ========================================
echo 💡 重要提示:
echo ========================================
echo.
echo 1. 服务器启动后，访问: http://localhost:3000
echo.
echo 2. 清除浏览器缓存:
echo    - 按 Ctrl+Shift+Delete
echo    - 选择"缓存的图像和文件"
echo    - 清除数据
echo.
echo 3. 打开控制台 (F12) 验证:
echo    应该看到:
echo    ✅ Live2D: function
echo    ✅ Live2DModelWebGL: function
echo    ✅ Live2DMotion: function
echo    ✅ MotionQueueManager: function
echo.
echo 4. 如果仍有问题:
echo    - 硬刷新页面 (Ctrl+F5)
echo    - 等待 1-2 秒让 SDK 初始化
echo    - 查看 Network 标签确认 SDK 加载
echo.
echo ========================================
echo.

npm start
