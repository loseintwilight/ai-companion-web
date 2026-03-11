@echo off
REM AI伴侣Web应用完整启动脚本

echo 🚀 AI伴侣Web应用启动脚本
echo ================================
echo.

REM 检查兼容性
echo 📋 步骤1: 检查环境兼容性...
call scripts\check-compatibility.bat

echo.
echo 按任意键继续，或Ctrl+C取消...
pause >nul

REM 检查Node.js版本
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
if "%NODE_VERSION%"=="" (
    echo ❌ Node.js 未安装，请先安装Node.js
    goto :error
)

echo 当前Node.js版本: %NODE_VERSION%

REM 检查是否为兼容版本
echo %NODE_VERSION% | findstr "v16\." >nul
if errorlevel 1 (
    echo ⚠️  检测到Node.js版本可能不兼容
    echo 推荐版本: v16.20.2
    echo.
    echo 是否要自动修复Node.js版本? (Y/N)
    set /p CHOICE=请选择: 
    if /i "%CHOICE%"=="Y" (
        echo 🔧 启动Node.js版本修复...
        call scripts\fix-nodejs-version.bat
        goto :end
    ) else (
        echo 继续使用当前版本...
    )
)

REM 进入前端目录
echo.
echo 📁 步骤2: 进入前端目录...
cd frontend

REM 检查依赖
echo.
echo 📦 步骤3: 检查项目依赖...
if not exist "node_modules" (
    echo 依赖未安装，开始安装...
    goto :install_deps
)

if not exist "node_modules\react-scripts" (
    echo react-scripts缺失，重新安装依赖...
    goto :install_deps
)

if not exist "node_modules\ajv\dist\compile\codegen\index.js" (
    echo ajv模块异常，重新安装依赖...
    goto :install_deps
)

echo ✅ 依赖检查通过
goto :start_app

:install_deps
echo.
echo 📦 安装项目依赖...
set NPM_CONFIG_LEGACY_PEER_DEPS=true
set NPM_CONFIG_AUDIT=false
set NPM_CONFIG_FUND=false

npm install --legacy-peer-deps
if errorlevel 1 (
    echo ❌ 依赖安装失败
    echo 尝试运行修复脚本: scripts\fix-ajv-conflict.bat
    goto :error
)

echo ✅ 依赖安装完成

:start_app
echo.
echo 🌐 步骤4: 启动开发服务器...
echo.
echo 服务信息:
echo - 前端地址: http://localhost:3000
echo - 后端API: http://localhost:8000 (需要单独启动)
echo - Live2D: 已集成 (可选)
echo.
echo ⏹️  按 Ctrl+C 停止服务器
echo.

REM 设置环境变量
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set GENERATE_SOURCEMAP=false
set NODE_OPTIONS=--max_old_space_size=4096

REM 启动开发服务器
npm start

if errorlevel 1 (
    echo.
    echo ❌ 启动失败！
    echo.
    echo 🔧 可能的解决方案:
    echo 1. 检查Node.js版本: node --version (推荐v16.20.2)
    echo 2. 运行版本修复: scripts\fix-nodejs-version.bat
    echo 3. 运行依赖修复: scripts\fix-ajv-conflict.bat
    echo 4. 手动清理重装: rm -rf node_modules package-lock.json && npm install --legacy-peer-deps
    echo.
    goto :error
)

goto :end

:error
echo.
echo ❌ 启动过程中出现错误
echo.
echo 🆘 故障排除步骤:
echo 1. 运行兼容性检查: scripts\check-compatibility.bat
echo 2. 修复Node.js版本: scripts\fix-nodejs-version.bat  
echo 3. 修复依赖冲突: scripts\fix-ajv-conflict.bat
echo 4. 查看详细文档: docs\TROUBLESHOOTING.md
echo.
goto :end

:end
cd ..
pause