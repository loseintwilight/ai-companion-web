@echo off
chcp 65001 >nul
echo ========================================
echo Live2D 诊断工具启动
echo ========================================
echo.

echo 📋 说明:
echo   此工具将打开一个诊断页面
echo   帮助你找出 Live2D 模型不显示的原因
echo.

echo 🚀 启动步骤:
echo   1. 确保开发服务器正在运行
echo   2. 浏览器将自动打开诊断页面
echo   3. 查看诊断结果
echo.

echo 💡 如果服务器未运行，请先运行:
echo    .\ai-companion-web\scripts\start-after-webpack-fix.bat
echo.

pause

echo.
echo 正在打开诊断页面...
start http://localhost:3000/diagnose-live2d.html

echo.
echo ✅ 诊断页面已打开
echo.
echo 📋 诊断内容:
echo   1. SDK 加载状态
echo   2. 模型文件检测
echo   3. WebGL 支持
echo   4. 模型加载测试
echo.
echo 💡 提示:
echo   - 查看每个部分的检测结果
echo   - 红色 ❌ 表示有问题
echo   - 绿色 ✅ 表示正常
echo   - 黄色 ⚠️ 表示警告
echo.
echo   - 点击"测试加载模型"按钮
echo   - 查看是否能在 Canvas 中看到模型
echo   - 查看详细日志了解具体问题
echo.
pause
