@echo off
echo ========================================
echo 测试所有 Cubism 2 方案
echo ========================================
echo.
echo 这个脚本会依次打开 3 个测试页面
echo.
echo 测试页面：
echo 1. final-cubism2-test.html (推荐)
echo 2. simple-cubism2-test.html
echo 3. cubism2-native-test.html
echo.
echo 请在每个页面中查看结果
echo 如果某个页面成功，告诉我是哪一个！
echo.
pause

cd ai-companion-web\frontend

echo.
echo 正在启动前端服务器...
echo.

echo 打开测试页面 1: final-cubism2-test.html
start http://localhost:3000/final-cubism2-test.html

timeout /t 2 /nobreak >nul

echo 打开测试页面 2: simple-cubism2-test.html
start http://localhost:3000/simple-cubism2-test.html

timeout /t 2 /nobreak >nul

echo 打开测试页面 3: cubism2-native-test.html
start http://localhost:3000/cubism2-native-test.html

echo.
echo ========================================
echo 3 个测试页面已打开
echo ========================================
echo.
echo 请查看每个页面的结果
echo 如果某个页面显示 "所有必要的类都已加载"
echo 那就是成功的方案！
echo.
echo 然后告诉我哪个成功了
echo.

npm start
