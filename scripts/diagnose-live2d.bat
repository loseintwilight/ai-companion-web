@echo off
echo ========================================
echo Live2D 问题诊断脚本
echo ========================================
echo.

:: 设置工作目录
cd /d "%~dp0..\frontend"

echo 当前目录: %CD%
echo.

echo [诊断报告]
echo ========================================
echo.

:: 检查模型文件
echo 1. Live2D模型文件检查:
if exist "public\live2d\rem\rem\model.json" (
    echo ✅ model.json 存在
    findstr "version" "public\live2d\rem\rem\model.json" | head -1
) else (
    echo ❌ model.json 不存在
)

if exist "public\live2d\rem\rem\remu.moc" (
    echo ✅ remu.moc 存在 (Live2D v2 模型文件)
) else (
    echo ❌ remu.moc 不存在
)

if exist "public\live2d\rem\rem\remu2048\texture_00.png" (
    echo ✅ 纹理文件存在
) else (
    echo ❌ 纹理文件不存在
)
echo.

:: 检查依赖
echo 2. 依赖库检查:
npm list pixi.js 2>nul | findstr "pixi.js"
npm list pixi-live2d-display 2>nul | findstr "pixi-live2d-display"
echo.

:: 检查网络访问
echo 3. 模型文件网络访问测试:
echo 启动临时服务器测试...
start /b npm start >nul 2>&1
timeout /t 5 /nobreak >nul
curl -s -o nul -w "HTTP状态码: %%{http_code}" http://localhost:3000/live2d/rem/rem/model.json
echo.
curl -s -o nul -w "HTTP状态码: %%{http_code}" http://localhost:3000/live2d/rem/rem/remu.moc
echo.

:: 停止临时服务器
taskkill /f /im node.exe >nul 2>&1

echo.
echo 4. 建议解决方案:
echo ----------------------------------------
echo 如果看到以上错误，请尝试以下解决方案：
echo.
echo 问题1: Live2D库不可用
echo 解决: 运行 scripts\fix-live2d.bat
echo.
echo 问题2: 模型文件404错误  
echo 解决: 检查模型文件路径是否正确
echo.
echo 问题3: 模型格式不兼容
echo 解决: 确认使用Live2D v2格式的模型
echo.
echo ========================================
pause