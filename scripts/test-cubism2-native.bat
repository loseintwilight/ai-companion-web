@echo off
echo ========================================
echo 测试 Cubism 2 Native SDK
echo ========================================
echo.
echo 这个测试使用原生 Live2D Cubism 2 SDK
echo 不依赖 pixi-live2d-display
echo.
echo 测试页面: http://localhost:3000/cubism2-native-test.html
echo.
pause

cd ai-companion-web\frontend

echo.
echo 正在启动前端服务器...
echo.

start http://localhost:3000/cubism2-native-test.html

npm start
