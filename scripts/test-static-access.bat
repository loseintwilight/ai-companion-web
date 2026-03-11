@echo off
echo ========================================
echo 测试静态文件访问
echo ========================================
echo.

echo [信息] 测试时间: %date% %time%
echo.

echo [步骤 1] 检查服务器状态...
netstat -an | findstr :3000 > nul
if %errorlevel% == 0 (
    echo ✅ React 开发服务器正在运行 (端口 3000)
) else (
    echo ❌ React 开发服务器未运行
    echo 请先启动服务器: npm start
    pause
    exit /b 1
)

echo.
echo [步骤 2] 测试基础静态文件...
echo.

:: 使用 curl 测试文件访问（如果可用）
where curl > nul 2>&1
if %errorlevel% == 0 (
    echo 🔍 使用 curl 测试文件访问...
    
    echo 测试 manifest.json:
    curl -s -o nul -w "状态码: %%{http_code}\n" http://localhost:3000/manifest.json
    
    echo 测试 Live2D 配置文件:
    curl -s -o nul -w "状态码: %%{http_code}\n" http://localhost:3000/live2d/rem/rem/model.json
    
    echo 测试纹理文件:
    curl -s -o nul -w "状态码: %%{http_code}\n" http://localhost:3000/live2d/rem/rem/remu2048/texture_00.png
    curl -s -o nul -w "状态码: %%{http_code}\n" http://localhost:3000/live2d/rem/rem/remu2048/texture_01.png
    
) else (
    echo ⚠️ curl 不可用，请手动测试以下 URL:
    echo   http://localhost:3000/manifest.json
    echo   http://localhost:3000/live2d/rem/rem/model.json
    echo   http://localhost:3000/live2d/rem/rem/remu2048/texture_00.png
    echo   http://localhost:3000/live2d/rem/rem/remu2048/texture_01.png
)

echo.
echo [步骤 3] 打开测试页面...
echo.

echo 🌐 在浏览器中打开测试页面...
start http://localhost:3000/test-static-files.html

echo.
echo ✅ 测试脚本完成！
echo.
echo 如果看到 200 状态码，说明静态文件访问正常
echo 如果看到 404 或 500 错误，说明还有问题需要解决
echo.

pause