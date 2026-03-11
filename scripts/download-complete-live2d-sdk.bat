@echo off
echo ========================================
echo 下载完整的 Live2D Cubism 2 SDK
echo ========================================
echo.
echo 这个脚本会下载完整的 Live2D SDK 到本地
echo.

cd ai-companion-web\frontend\public\lib

echo 正在下载 live2d.min.js...
echo.

curl -L -o live2d.min.js "https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"

if errorlevel 1 (
    echo.
    echo ❌ 下载失败！尝试备用源...
    echo.
    curl -L -o live2d.min.js "https://fastly.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"
)

if errorlevel 1 (
    echo.
    echo ❌ 所有下载源都失败了！
    echo.
    echo 请手动下载：
    echo https://github.com/dylanNew/live2d/blob/master/webgl/Live2D/lib/live2d.min.js
    echo.
    echo 并保存到：
    echo ai-companion-web\frontend\public\lib\live2d.min.js
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 下载成功！
echo.
echo 文件位置：ai-companion-web\frontend\public\lib\live2d.min.js
echo.
pause
