@echo off
echo ========================================
echo Live2D 简化修复脚本
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"
echo [信息] 当前目录: %CD%
echo.

:: 检查环境
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js 未安装
    pause
    exit /b 1
)

echo [成功] 环境检查通过
echo.

:: 启动项目
echo [启动] 正在启动项目...
npm start

pause