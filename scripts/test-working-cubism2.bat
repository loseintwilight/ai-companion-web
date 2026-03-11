@echo off
echo ========================================
echo 测试 Working Cubism 2 实现
echo ========================================
echo.
echo 这个测试使用完整的加载流程
echo 包含备用 Live2D 实现
echo.
echo 测试页面: http://localhost:3000/working-cubism2-test.html
echo.
pause

cd ai-companion-web\frontend

echo.
echo 正在启动前端服务器...
echo.

start http://localhost:3000/working-cubism2-test.html

npm start
