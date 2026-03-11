@echo off
REM 依赖修复脚本 (Windows)

echo 🔧 修复前端依赖冲突...

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装Node.js 16+
    pause
    exit /b 1
)

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装，请先安装npm
    pause
    exit /b 1
)

echo ✅ Node.js 和 npm 检查完成

REM 进入前端目录
cd frontend

echo 🧹 清理现有依赖...

REM 删除node_modules和package-lock.json
if exist "node_modules" (
    echo 删除 node_modules...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo 删除 package-lock.json...
    del package-lock.json
)

echo 📦 重新安装依赖...

REM 清理npm缓存
npm cache clean --force

REM 使用legacy-peer-deps安装依赖
npm install --legacy-peer-deps

if errorlevel 1 (
    echo ❌ 依赖安装失败，尝试使用yarn...
    
    REM 检查yarn
    yarn --version >nul 2>&1
    if errorlevel 1 (
        echo 安装yarn...
        npm install -g yarn
    )
    
    REM 使用yarn安装
    yarn install
    
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

echo ✅ 依赖安装完成

echo 🔍 验证TypeScript版本...
npx tsc --version

echo 🚀 尝试启动开发服务器...
echo 如果仍有问题，请手动运行: npm start

pause