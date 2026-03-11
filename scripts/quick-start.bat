@echo off
REM =================================================================
REM AI伴侣Web应用快速启动脚本 - 简化版
REM =================================================================

echo 🚀 AI伴侣Web应用快速启动...

REM 切换到项目根目录
cd /d "%~dp0.."

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 设置环境变量
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set NODE_OPTIONS=--max_old_space_size=4096 --openssl-legacy-provider

REM 进入前端目录
cd frontend

REM 检查依赖
if not exist "node_modules" (
    echo 📦 安装依赖...
    npm install --legacy-peer-deps --no-audit --no-fund
)

REM 启动项目
echo 🌐 启动服务器...
echo 前端地址: http://localhost:3000
npm start