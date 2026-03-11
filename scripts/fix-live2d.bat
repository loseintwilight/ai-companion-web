@echo off
echo ========================================
echo Live2D 模型显示修复脚本
echo ========================================
echo.

:: 设置工作目录
cd /d "%~dp0..\frontend"

echo 当前目录: %CD%
echo.

:: 检查模型文件
echo [1/4] 检查Live2D模型文件...
if not exist "public\live2d\rem\rem\model.json" (
    echo ❌ 错误: Live2D模型文件不存在
    echo 请确保模型文件位于: public\live2d\rem\rem\model.json
    pause
    exit /b 1
)
echo ✅ Live2D模型文件检查完成
echo.

:: 创建favicon.ico文件
echo [2/4] 创建favicon.ico文件...
if not exist "public\favicon.ico" (
    echo. > "public\favicon.ico"
    echo ✅ 创建favicon.ico文件
) else (
    echo ✅ favicon.ico文件已存在
)
echo.

:: 检查依赖
echo [3/4] 检查Live2D依赖...
npm list pixi.js pixi-live2d-display >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ⚠ 警告: Live2D依赖可能未正确安装
    echo 重新安装依赖...
    npm install --legacy-peer-deps --no-audit --no-fund
)
echo ✅ Live2D依赖检查完成
echo.

:: 启动项目
echo [4/4] 启动项目进行测试...
echo.
echo ========================================
echo Live2D修复完成！
echo 项目启动中，请检查控制台是否还有错误...
echo 浏览器将自动打开 http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

npm start