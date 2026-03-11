@echo off
echo ========================================
echo 测试 Simple Live2D (Script Order Fix)
echo ========================================
echo.
echo 这个脚本会：
echo 1. 启动前端开发服务器
echo 2. 自动打开测试页面
echo.
echo 测试页面: http://localhost:3000/simple-live2d-test.html
echo.
echo 如果模型显示成功，我们将在主应用中实现相同的方案
echo.
pause

cd ai-companion-web\frontend

echo.
echo 正在启动前端服务器...
echo.

start http://localhost:3000/simple-live2d-test.html

npm start
