@echo off
setlocal enabledelayedexpansion

REM =================================================================
REM AI伴侣Web应用一键启动脚本
REM 适配所有Node.js版本，无需nvm，自动处理依赖冲突
REM =================================================================

echo.
echo ========================================
echo   🚀 AI伴侣Web应用启动器
echo ========================================
echo.

REM 获取脚本所在目录的父目录（项目根目录）
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

echo 📁 项目根目录: %CD%
echo.

REM 检查Node.js安装
echo 📋 步骤1: 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装！
    echo.
    echo 请先安装Node.js:
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装LTS版本
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

REM 获取Node.js版本
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo ✅ Node.js版本: %NODE_VERSION%

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装！
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
echo ✅ npm版本: %NPM_VERSION%

REM 版本兼容性检查和警告
echo.
echo 📋 步骤2: 版本兼容性检查...
echo %NODE_VERSION% | findstr /r "^v1[6-8]\." >nul
if errorlevel 1 (
    echo ⚠️  警告: 当前Node.js版本可能与react-scripts@5.0.1不完全兼容
    echo    推荐版本: v16.20.2 或 v18.18.0
    echo    当前版本: %NODE_VERSION%
    echo.
    echo    继续启动可能遇到问题，但会尝试兼容性修复...
    echo.
) else (
    echo ✅ Node.js版本兼容性良好
)

REM 进入前端目录
echo.
echo 📁 步骤3: 进入前端目录...
if not exist "frontend" (
    echo ❌ 未找到frontend目录！
    echo 请确保在项目根目录运行此脚本
    pause
    exit /b 1
)

cd frontend
echo ✅ 当前目录: %CD%

REM 检查package.json
if not exist "package.json" (
    echo ❌ 未找到package.json文件！
    pause
    exit /b 1
)

REM 设置兼容性环境变量
echo.
echo 📋 步骤4: 设置兼容性环境变量...
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set GENERATE_SOURCEMAP=false
set NODE_OPTIONS=--max_old_space_size=4096 --openssl-legacy-provider
set NPM_CONFIG_LEGACY_PEER_DEPS=true
set NPM_CONFIG_AUDIT=false
set NPM_CONFIG_FUND=false

echo ✅ 环境变量已设置

REM 检查依赖状态
echo.
echo 📋 步骤5: 检查项目依赖...
set NEED_INSTALL=false

if not exist "node_modules" (
    echo ⚠️  node_modules不存在，需要安装依赖
    set NEED_INSTALL=true
) else (
    echo ✅ node_modules存在
    
    REM 检查关键依赖
    if not exist "node_modules\react-scripts" (
        echo ⚠️  react-scripts缺失，需要重新安装
        set NEED_INSTALL=true
    )
    
    if not exist "node_modules\ajv" (
        echo ⚠️  ajv缺失，需要重新安装
        set NEED_INSTALL=true
    ) else (
        if not exist "node_modules\ajv\dist\compile\codegen\index.js" (
            echo ⚠️  ajv版本不兼容，需要重新安装
            set NEED_INSTALL=true
        )
    )
)

REM 安装或修复依赖
if "!NEED_INSTALL!"=="true" (
    echo.
    echo 📦 步骤6: 安装/修复项目依赖...
    
    REM 清理可能存在的问题文件
    if exist "package-lock.json" (
        echo 🧹 删除旧的package-lock.json...
        del /f /q "package-lock.json"
    )
    
    if exist "yarn.lock" (
        echo 🧹 删除yarn.lock...
        del /f /q "yarn.lock"
    )
    
    REM 清理npm缓存
    echo 🧹 清理npm缓存...
    npm cache clean --force >nul 2>&1
    
    echo 📦 开始安装依赖（这可能需要几分钟）...
    echo.
    
    REM 分步安装关键依赖以避免冲突
    echo [1/4] 安装核心React依赖...
    npm install react@^18.2.0 react-dom@^18.2.0 --legacy-peer-deps --no-audit --no-fund
    
    echo [2/4] 安装兼容的ajv版本...
    npm install ajv@6.12.6 ajv-keywords@3.5.2 --legacy-peer-deps --no-audit --no-fund
    
    echo [3/4] 安装TypeScript...
    npm install typescript@4.9.5 --save-exact --legacy-peer-deps --no-audit --no-fund
    
    echo [4/4] 安装其他依赖...
    npm install --legacy-peer-deps --no-audit --no-fund
    
    if errorlevel 1 (
        echo.
        echo ❌ 依赖安装失败！
        echo.
        echo 🔧 尝试备用安装方法...
        
        REM 备用方法：强制安装
        npm install --legacy-peer-deps --force --no-audit --no-fund
        
        if errorlevel 1 (
            echo ❌ 备用安装也失败！
            echo.
            echo 💡 建议手动操作:
            echo 1. 删除node_modules文件夹
            echo 2. 运行: npm install --legacy-peer-deps
            echo 3. 如果还有问题，尝试使用yarn
            echo.
            pause
            exit /b 1
        )
    )
    
    echo ✅ 依赖安装完成！
) else (
    echo ✅ 依赖检查通过，跳过安装
)

REM 最终验证
echo.
echo 📋 步骤7: 最终验证...
if exist "node_modules\react-scripts" (
    echo ✅ react-scripts 已安装
) else (
    echo ❌ react-scripts 验证失败
    goto :install_failed
)

if exist "node_modules\ajv\dist\compile\codegen\index.js" (
    echo ✅ ajv 路径验证通过
) else (
    if exist "node_modules\ajv\lib\compile\codegen\index.js" (
        echo ✅ ajv 备用路径验证通过
    ) else (
        echo ❌ ajv 路径验证失败
        goto :install_failed
    )
)

REM 启动开发服务器
echo.
echo 🚀 步骤8: 启动开发服务器...
echo.
echo ========================================
echo   🌐 服务信息
echo ========================================
echo   前端地址: http://localhost:3000
echo   后端API:  http://localhost:8000 (需单独启动)
echo   Live2D:   已集成 (可选)
echo ========================================
echo.
echo ⏹️  按 Ctrl+C 停止服务器
echo.

REM 启动npm start
npm start

REM 如果启动失败
if errorlevel 1 (
    echo.
    echo ❌ 启动失败！
    echo.
    echo 🔧 可能的解决方案:
    echo 1. 检查端口3000是否被占用
    echo 2. 尝试删除node_modules重新安装
    echo 3. 检查Node.js版本兼容性
    echo.
    goto :install_failed
)

goto :end

:install_failed
echo.
echo ❌ 项目启动失败！
echo.
echo 🆘 故障排除建议:
echo.
echo 1. 手动清理重装:
echo    cd frontend
echo    rmdir /s /q node_modules
echo    del package-lock.json
echo    npm install --legacy-peer-deps
echo.
echo 2. 检查Node.js版本:
echo    推荐使用 Node.js v16.20.2 或 v18.18.0
echo.
echo 3. 尝试使用yarn:
echo    npm install -g yarn
echo    yarn install
echo    yarn start
echo.
echo 4. 查看详细错误日志并搜索解决方案
echo.
goto :end

:end
echo.
echo 脚本执行完成
pause