@echo off
REM 前端启动脚本 (Windows) - 包含AJV冲突检测和修复

echo 🚀 启动AI伴侣Web应用前端...

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装Node.js 16+
    pause
    exit /b 1
)

REM 进入前端目录
cd frontend

REM 检查是否存在ajv冲突问题
if exist "node_modules\ajv\dist\compile\codegen\index.js" (
    echo ✅ AJV模块路径正常
) else (
    if exist "node_modules" (
        echo ⚠️  检测到AJV路径问题，需要修复
        echo 运行修复脚本...
        cd ..
        call scripts\fix-ajv-conflict.bat
        exit /b 0
    ) else (
        echo � 首次运行，安装依赖...
    )
)

REM 检查是否存在node_modules
if not exist "node_modules" (
    echo 📦 安装依赖（使用兼容配置）...
    
    REM 设置环境变量
    set NPM_CONFIG_LEGACY_PEER_DEPS=true
    set NPM_CONFIG_FORCE=true
    
    REM 分步安装关键依赖
    npm install ajv@6.12.6 ajv-keywords@3.5.2 --legacy-peer-deps --force
    npm install --legacy-peer-deps --force
    
    if errorlevel 1 (
        echo ❌ 依赖安装失败，运行专用修复脚本
        cd ..
        call scripts\fix-ajv-conflict.bat
        exit /b 1
    )
)

echo 🔍 验证关键模块...
if not exist "node_modules\ajv\dist\compile\codegen\index.js" (
    echo ❌ AJV模块路径异常，运行修复脚本
    cd ..
    call scripts\fix-ajv-conflict.bat
    exit /b 1
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
set NODE_OPTIONS=--max_old_space_size=4096

REM 启动开发服务器
npm start

if errorlevel 1 (
    echo ❌ 启动失败，可能存在依赖问题
    echo 运行以下命令进行修复：
    echo cd ..
    echo scripts\fix-ajv-conflict.bat
)

pause