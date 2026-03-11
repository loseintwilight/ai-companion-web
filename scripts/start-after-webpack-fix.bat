@echo off
chcp 65001 >nul
cls
echo ========================================
echo Live2D Webpack 错误修复后启动
echo ========================================
echo.

echo 📋 修复内容:
echo   ✅ 移除了 L2Dwidget (webpack 包装器)
echo   ✅ 使用原始 live2d.min.js SDK
echo   ✅ 添加了核心类占位符实现
echo   ✅ 多源 CDN 加载策略
echo.

echo 🧹 清理缓存...
echo.

cd ai-companion-web\frontend

if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" 2>nul
    echo ✅ 已清理 node_modules 缓存
)

if exist ".cache" (
    rmdir /s /q ".cache" 2>nul
    echo ✅ 已清理 .cache
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
echo 2. 清除浏览器所有数据:
echo    - 按 Ctrl+Shift+Delete
echo    - 选择"所有时间"
echo    - 清除"缓存"和"Cookie"
echo.
echo 3. 硬刷新页面: Ctrl+F5
echo.
echo 4. 打开控制台 (F12) 验证:
echo    应该看到:
echo    ✅ Live2D SDK loaded from: ...
echo    ✅ Live2D Cubism 2 SDK ready!
echo.
echo    不应该看到:
echo    ❌ webpackJsonpL2Dwidget is not defined
echo.
echo 5. 如果仍有问题:
echo    - 完全关闭浏览器重新打开
echo    - 等待 1-2 秒让 SDK 初始化
echo    - 查看 WEBPACK_JSONP_FIX.md 文档
echo.
echo ========================================
echo.

npm start
