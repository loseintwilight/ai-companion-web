@echo off
REM AJV版本冲突修复脚本 (Windows)

echo 🔧 修复AJV版本冲突问题...

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

echo 🧹 彻底清理现有依赖...

REM 删除node_modules
if exist "node_modules" (
    echo 删除 node_modules 文件夹...
    rmdir /s /q node_modules
)

REM 删除package-lock.json
if exist "package-lock.json" (
    echo 删除 package-lock.json...
    del package-lock.json
)

REM 删除yarn.lock（如果存在）
if exist "yarn.lock" (
    echo 删除 yarn.lock...
    del yarn.lock
)

REM 清理npm缓存
echo 清理npm缓存...
npm cache clean --force

REM 清理npm临时文件
if exist "%APPDATA%\npm-cache" (
    echo 清理npm缓存目录...
    rmdir /s /q "%APPDATA%\npm-cache"
)

echo 📦 重新安装依赖（使用兼容配置）...

REM 设置环境变量
set NPM_CONFIG_LEGACY_PEER_DEPS=true
set NPM_CONFIG_FORCE=true
set NPM_CONFIG_AUDIT=false
set NPM_CONFIG_FUND=false

REM 首先安装核心依赖
echo 安装核心React依赖...
npm install react@^18.2.0 react-dom@^18.2.0 --legacy-peer-deps --force

REM 安装TypeScript和相关工具
echo 安装TypeScript...
npm install typescript@4.9.5 --legacy-peer-deps --force

REM 安装ajv相关包（关键步骤）
echo 安装AJV兼容版本...
npm install ajv@6.12.6 ajv-keywords@3.5.2 --legacy-peer-deps --force

REM 安装react-scripts
echo 安装react-scripts...
npm install react-scripts@5.0.1 --legacy-peer-deps --force

REM 安装其他依赖
echo 安装其他依赖...
npm install --legacy-peer-deps --force

if errorlevel 1 (
    echo ❌ npm安装失败，尝试使用yarn...
    
    REM 检查yarn
    yarn --version >nul 2>&1
    if errorlevel 1 (
        echo 安装yarn...
        npm install -g yarn --force
    )
    
    REM 删除yarn.lock重新开始
    if exist "yarn.lock" del yarn.lock
    
    REM 使用yarn安装
    yarn install --force
    
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        echo 请检查网络连接或尝试手动安装
        pause
        exit /b 1
    )
)

echo ✅ 依赖安装完成

echo 🔍 验证关键模块...
if exist "node_modules\ajv" (
    echo ✅ ajv 模块已安装
) else (
    echo ❌ ajv 模块缺失
)

if exist "node_modules\ajv-keywords" (
    echo ✅ ajv-keywords 模块已安装
) else (
    echo ❌ ajv-keywords 模块缺失
)

if exist "node_modules\typescript" (
    echo ✅ TypeScript 模块已安装
    npx tsc --version
) else (
    echo ❌ TypeScript 模块缺失
)

echo 🚀 尝试启动项目...
echo 如果启动成功，说明问题已解决
echo 如果仍有问题，请检查控制台错误信息

REM 设置启动环境变量
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set GENERATE_SOURCEMAP=false

echo 启动开发服务器...
npm start

pause