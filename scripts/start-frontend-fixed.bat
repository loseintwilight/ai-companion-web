@echo off
setlocal enabledelayedexpansion

REM 前端启动脚本 (Windows) - 修复版

echo 🚀 启动AI伴侣Web应用前端...

REM 切换到脚本所在目录的父目录（项目根目录）
cd /d "%~dp0.."

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装Node.js 16+
    pause
    exit /b 1
)

REM 进入前端目录
cd frontend

REM 检查是否存在兼容性问题
set NEED_FIX=false

if exist "node_modules\ajv\dist\compile\codegen\index.js" (
    echo ✅ AJV模块路径正常
) else (
    if exist "node_modules" (
        echo ⚠️  检测到AJV路径问题，需要修复
        set NEED_FIX=true
    ) else (
        echo 📦 首次运行，安装依赖...
        set NEED_FIX=true
    )
)

REM 如果需要修复，执行修复流程
if "!NEED_FIX!"=="true" (
    echo 🔧 执行兼容性修复...
    
    REM 设置环境变量
    set NPM_CONFIG_LEGACY_PEER_DEPS=true
    set NPM_CONFIG_FORCE=false
    
    REM 清理可能的问题文件
    if exist "package-lock.json" del /f /q "package-lock.json"
    
    REM 分步安装关键依赖
    echo 安装ajv兼容版本...
    npm install ajv@6.12.6 ajv-keywords@3.5.2 --legacy-peer-deps --no-audit
    
    echo 安装其他依赖...
    npm install --legacy-peer-deps --no-audit
    
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        echo 请尝试手动运行: npm install --legacy-peer-deps
        pause
        exit /b 1
    )
)

REM 验证关键模块
if not exist "node_modules\ajv\dist\compile\codegen\index.js" (
    if not exist "node_modules\ajv\lib\compile\codegen\index.js" (
        echo ❌ AJV模块路径异常，请运行完整修复脚本
        echo 建议运行: scripts\start-app.bat
        pause
        exit /b 1
    )
)

echo 🔍 检查TypeScript版本...
npx tsc --version

echo 🌐 启动开发服务器...
echo 前端地址: http://localhost:3000
echo 后端API: http://localhost:8000
echo.
echo ⏹️  按 Ctrl+C 停止服务器
echo.

REM 设置启动环境变量
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set GENERATE_SOURCEMAP=false
set NODE_OPTIONS=--max_old_space_size=4096 --openssl-legacy-provider

REM 启动开发服务器
npm start

if errorlevel 1 (
    echo.
    echo ❌ 启动失败！
    echo.
    echo 🔧 可能的解决方案:
    echo 1. 运行完整修复脚本: scripts\start-app.bat
    echo 2. 手动清理重装: rmdir /s /q node_modules && npm install --legacy-peer-deps
    echo 3. 检查端口占用: netstat -ano | findstr :3000
    echo.
)

pause