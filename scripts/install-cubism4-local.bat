@echo off
chcp 65001 >nul
echo ========================================
echo Cubism 4 本地安装脚本
echo ========================================
echo.

cd /d "%~dp0\..\frontend"

echo [1/4] 创建本地库目录...
if not exist "public\lib" mkdir "public\lib"
echo ✅ 目录创建完成

echo.
echo [2/4] 检查本地 Cubism Core 文件...
if exist "public\lib\live2dcubismcore.min.js" (
    echo ✅ 本地 Cubism Core 文件已存在
) else (
    echo ⚠️  本地 Cubism Core 文件不存在，使用占位符
)

echo.
echo [3/4] 下载官方 Cubism 4 运行时...
echo 正在尝试下载官方 Live2D Cubism Core...

powershell -Command "try { Invoke-WebRequest -Uri 'https://github.com/Live2D/CubismWebFramework/releases/download/4-r.7/CubismSdkForWeb-4-r.7.zip' -OutFile 'cubism-sdk.zip' -ErrorAction Stop; Write-Host '✅ SDK 下载成功' } catch { Write-Host '⚠️  SDK 下载失败，将使用备用方案' }"

if exist "cubism-sdk.zip" (
    echo 正在解压 SDK...
    powershell -Command "try { Expand-Archive -Path 'cubism-sdk.zip' -DestinationPath 'temp-sdk' -Force; Write-Host '✅ SDK 解压成功' } catch { Write-Host '❌ SDK 解压失败' }"
    
    if exist "temp-sdk\CubismSdkForWeb-4-r.7\Core\live2dcubismcore.min.js" (
        copy "temp-sdk\CubismSdkForWeb-4-r.7\Core\live2dcubismcore.min.js" "public\lib\live2dcubismcore.min.js"
        echo ✅ 官方 Cubism Core 文件复制成功
    ) else (
        echo ⚠️  未找到官方文件，保持使用占位符
    )
    
    echo 清理临时文件...
    rmdir /s /q "temp-sdk" 2>nul
    del "cubism-sdk.zip" 2>nul
) else (
    echo ⚠️  使用备用下载方案...
    
    echo 尝试从 CDN 下载...
    powershell -Command "try { Invoke-WebRequest -Uri 'https://fastly.jsdelivr.net/npm/live2d-cubism-core@4.0.0/live2dcubismcore.min.js' -OutFile 'public\lib\live2dcubismcore.min.js' -ErrorAction Stop; Write-Host '✅ 从 CDN 下载成功' } catch { Write-Host '⚠️  CDN 下载也失败，使用占位符文件' }"
)

echo.
echo [4/4] 验证安装...
if exist "public\lib\live2dcubismcore.min.js" (
    for %%A in ("public\lib\live2dcubismcore.min.js") do set size=%%~zA
    if !size! GTR 1000 (
        echo ✅ Cubism Core 文件安装成功 ^(!size! bytes^)
    ) else (
        echo ⚠️  使用占位符文件 ^(!size! bytes^)
        echo.
        echo 📋 手动安装说明：
        echo 1. 访问 Live2D 官网：https://www.live2d.com/
        echo 2. 下载 Cubism SDK for Web
        echo 3. 将 live2dcubismcore.min.js 复制到 public\lib\ 目录
        echo 4. 重新启动项目
    )
) else (
    echo ❌ Cubism Core 文件安装失败
)

echo.
echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 📋 下一步：
echo 1. 运行 npm start 启动项目
echo 2. 检查浏览器控制台确认 Cubism Core 加载
echo 3. 如有问题，请查看手动安装说明
echo.
pause