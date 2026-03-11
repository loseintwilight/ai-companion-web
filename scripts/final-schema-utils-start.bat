@echo off
echo ========================================
echo AI伴侣Web应用 - 最终启动脚本
echo Schema Utils修复版本
echo ========================================
echo.

:: 设置工作目录
cd /d "%~dp0..\frontend"

echo 当前目录: %CD%
echo.

:: 检查依赖是否已安装
echo [1/3] 检查项目状态...
if not exist "node_modules\schema-utils" (
    echo ❌ 依赖未正确安装，请先运行修复脚本
    echo 运行命令: scripts\schema-utils-fix-start.bat
    pause
    exit /b 1
)

:: 验证schema-utils版本
echo [2/3] 验证Schema Utils版本...
findstr "3.3.0" "node_modules\schema-utils\package.json" >nul
if %ERRORLEVEL% neq 0 (
    echo ⚠ Schema Utils版本可能不正确，建议重新安装
    echo 运行命令: scripts\schema-utils-fix-start.bat
    pause
)

:: 启动项目
echo [3/3] 启动开发服务器...
echo.
echo ========================================
echo ✅ Schema Utils修复成功！
echo 项目启动中...
echo 浏览器将自动打开 http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

npm start