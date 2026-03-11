@echo off
chcp 65001 >nul
echo ========================================
echo Live2D Cubism 2 SDK 下载工具
echo ========================================
echo.

echo 📋 说明:
echo   此脚本将下载完整的 Live2D Cubism 2 SDK
echo   包含 Live2DModelWebGL、Live2DMotion 等核心类
echo.

set "LIB_DIR=ai-companion-web\frontend\public\lib"
set "SDK_URL=https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.0.min.js"

echo 📂 检查目录...
if not exist "%LIB_DIR%" (
    echo 创建 lib 目录...
    mkdir "%LIB_DIR%"
)

echo.
echo 📥 下载 Live2D Cubism 2 SDK...
echo 源: %SDK_URL%
echo.

powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%SDK_URL%' -OutFile '%LIB_DIR%\live2d-sdk.min.js' -UseBasicParsing}"

if %errorlevel% equ 0 (
    echo ✅ SDK 下载成功！
    echo.
    
    for %%F in ("%LIB_DIR%\live2d-sdk.min.js") do (
        echo 文件大小: %%~zF bytes
    )
    
    echo.
    echo 📋 下一步:
    echo   1. 重启开发服务器
    echo   2. 清除浏览器缓存
    echo   3. 重新加载页面
    echo.
) else (
    echo ❌ 下载失败！
    echo.
    echo 请尝试手动下载:
    echo   1. 访问: %SDK_URL%
    echo   2. 保存为: %LIB_DIR%\live2d-sdk.min.js
    echo.
)

pause
