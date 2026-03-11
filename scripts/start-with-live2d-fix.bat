@echo off
chcp 65001 >nul
echo ========================================
echo Live2D 修复后启动脚本
echo ========================================
echo.

echo 📋 修复摘要:
echo   ✅ 创建了本地 live2d.min.js 备用文件
echo   ✅ 更新了 index.html 加载顺序
echo   ✅ 删除了冲突的 Cubism 4 文件
echo.

echo 🔍 验证文件...
echo.

if exist "ai-companion-web\frontend\public\lib\live2d.min.js" (
    echo ✅ live2d.min.js 存在
) else (
    echo ❌ live2d.min.js 不存在！
    echo    请确保修复已完成
    pause
    exit /b 1
)

if exist "ai-companion-web\frontend\public\lib\live2dcubismcore.min.js" (
    echo ⚠️  检测到 Cubism 4 文件，正在删除...
    del "ai-companion-web\frontend\public\lib\live2dcubismcore.min.js"
    echo ✅ 已删除冲突文件
) else (
    echo ✅ 没有冲突文件
)

echo.
echo 🚀 启动开发服务器...
echo.

cd ai-companion-web\frontend

echo 清理缓存...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ 缓存已清理
)

echo.
echo 启动服务器...
echo.
echo 💡 提示:
echo   1. 服务器启动后，按 Ctrl+Shift+Delete 清除浏览器缓存
echo   2. 打开 http://localhost:3000
echo   3. 按 F12 打开控制台
echo   4. 查找 "Live2D Cubism 2 SDK loaded" 消息
echo   5. 验证没有 "找不到" 的警告
echo.
echo ========================================
echo.

npm start
