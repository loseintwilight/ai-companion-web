@echo off
setlocal enabledelayedexpansion

REM =================================================================
REM Node.js兼容性修复脚本 - 无需nvm版本
REM 适配当前Node.js版本，自动处理兼容性问题
REM =================================================================

echo 🔧 Node.js兼容性修复工具
echo ================================
echo.

REM 切换到项目根目录
cd /d "%~dp0.."

REM 检查Node.js版本
echo 📋 检查当前Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装！
    echo 请访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ 当前Node.js版本: %NODE_VERSION%

REM 版本兼容性分析
echo.
echo 📋 版本兼容性分析...
set COMPAT_LEVEL=unknown
set NEED_LEGACY_PROVIDER=false

echo %NODE_VERSION% | findstr /r "^v1[6-7]\." >nul
if not errorlevel 1 (
    echo ✅ 版本兼容性: 优秀 (Node.js 16-17)
    set COMPAT_LEVEL=excellent
) else (
    echo %NODE_VERSION% | findstr /r "^v18\." >nul
    if not errorlevel 1 (
        echo ⚠️  版本兼容性: 良好 (Node.js 18, 需要legacy provider)
        set COMPAT_LEVEL=good
        set NEED_LEGACY_PROVIDER=true
    ) else (
        echo %NODE_VERSION% | findstr /r "^v[2-9][0-9]\." >nul
        if not errorlevel 1 (
            echo ⚠️  版本兼容性: 需要修复 (Node.js 20+, 需要legacy provider和额外配置)
            set COMPAT_LEVEL=needs_fix
            set NEED_LEGACY_PROVIDER=true
        ) else (
            echo ❓ 版本兼容性: 未知版本，尝试兼容性修复
            set COMPAT_LEVEL=unknown
            set NEED_LEGACY_PROVIDER=true
        )
    )
)

REM 进入前端目录
echo.
echo 📁 进入前端目录...
cd frontend

REM 创建兼容性配置
echo.
echo 🔧 创建兼容性配置...

REM 更新.env文件
echo 创建/更新 .env 文件...
(
echo # React App Environment Variables
echo GENERATE_SOURCEMAP=false
echo SKIP_PREFLIGHT_CHECK=true
echo TSC_COMPILE_ON_ERROR=true
echo ESLINT_NO_DEV_ERRORS=true
echo FAST_REFRESH=true
echo.
echo # Node.js兼容性配置
echo DISABLE_ESLINT_PLUGIN=true
echo EXTEND_ESLINT=true
echo.
echo # Webpack配置
echo WEBPACK_OVERRIDE_RESOLVE_FALLBACK=true
echo.
echo # Live2D Configuration
echo REACT_APP_LIVE2D_ENABLED=true
echo REACT_APP_LIVE2D_MODEL_PATH=/live2d/rem/rem
echo.
echo # API Configuration
echo REACT_APP_API_BASE_URL=http://localhost:8000
echo REACT_APP_WS_URL=ws://localhost:8000
echo.
echo # Node.js内存和兼容性配置
if "!NEED_LEGACY_PROVIDER!"=="true" (
    echo NODE_OPTIONS=--max_old_space_size=4096 --openssl-legacy-provider
) else (
    echo NODE_OPTIONS=--max_old_space_size=4096
)
) > .env

echo ✅ .env 文件已更新

REM 更新.npmrc文件
echo 创建/更新 .npmrc 文件...
(
echo legacy-peer-deps=true
echo strict-peer-deps=false
echo auto-install-peers=true
echo fund=false
echo audit=false
echo force=false
echo registry=https://registry.npmjs.org/
) > .npmrc

echo ✅ .npmrc 文件已更新

REM 清理和重新安装依赖
echo.
echo 🧹 清理现有依赖...
if exist "node_modules" (
    echo 删除 node_modules...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo 删除 package-lock.json...
    del /f /q package-lock.json
)

echo 清理npm缓存...
npm cache clean --force

REM 设置npm环境变量
echo.
echo 📦 设置npm环境变量...
set NPM_CONFIG_LEGACY_PEER_DEPS=true
set NPM_CONFIG_AUDIT=false
set NPM_CONFIG_FUND=false
set NPM_CONFIG_FORCE=false

REM 分步安装依赖
echo.
echo 📦 重新安装依赖（兼容模式）...
echo.

echo [1/5] 安装核心React依赖...
npm install react@^18.2.0 react-dom@^18.2.0 --legacy-peer-deps --no-audit --no-fund

echo [2/5] 安装兼容的ajv版本...
npm install ajv@6.12.6 ajv-keywords@3.5.2 --save-exact --legacy-peer-deps --no-audit --no-fund

echo [3/5] 安装TypeScript...
npm install typescript@4.9.5 --save-exact --legacy-peer-deps --no-audit --no-fund

echo [4/5] 安装react-scripts...
npm install react-scripts@5.0.1 --legacy-peer-deps --no-audit --no-fund

echo [5/5] 安装其他依赖...
npm install --legacy-peer-deps --no-audit --no-fund

if errorlevel 1 (
    echo.
    echo ❌ 标准安装失败，尝试强制安装...
    npm install --legacy-peer-deps --force --no-audit --no-fund
    
    if errorlevel 1 (
        echo ❌ 依赖安装完全失败！
        goto :install_failed
    )
)

REM 验证安装
echo.
echo 🔍 验证安装结果...
if exist "node_modules\react-scripts" (
    echo ✅ react-scripts 已安装
) else (
    echo ❌ react-scripts 安装失败
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

echo.
echo 🎉 兼容性修复完成！
echo.
echo 📋 修复结果:
echo - Node.js版本: %NODE_VERSION%
echo - 兼容性等级: %COMPAT_LEVEL%
echo - Legacy Provider: !NEED_LEGACY_PROVIDER!
echo - 依赖状态: 已重新安装并验证
echo.
echo 🚀 现在可以启动项目:
echo npm start
echo.
echo 或者运行: scripts\start-app.bat
echo.
goto :end

:install_failed
echo.
echo ❌ 兼容性修复失败！
echo.
echo 🆘 手动修复建议:
echo.
echo 1. 检查网络连接
echo 2. 尝试使用yarn:
echo    npm install -g yarn
echo    yarn install
echo.
echo 3. 降级Node.js版本:
echo    推荐安装Node.js 16.20.2
echo    https://nodejs.org/dist/v16.20.2/
echo.
echo 4. 清理全局npm缓存:
echo    npm cache clean --force
echo    npm config delete cache
echo.
goto :end

:end
echo 脚本执行完成
pause