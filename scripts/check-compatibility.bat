@echo off
REM 兼容性检查脚本

echo 🔍 检查开发环境兼容性...
echo.

REM 检查Node.js版本
echo === Node.js版本检查 ===
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装
    set NODE_OK=false
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo 当前版本: %NODE_VERSION%
    
    REM 检查是否为兼容版本
    echo %NODE_VERSION% | findstr "v16." >nul
    if not errorlevel 1 (
        echo ✅ Node.js版本兼容 (v16.x)
        set NODE_OK=true
    ) else (
        echo %NODE_VERSION% | findstr "v18." >nul
        if not errorlevel 1 (
            echo ⚠️  Node.js v18.x 可能兼容，但推荐v16.x
            set NODE_OK=partial
        ) else (
            echo ❌ Node.js版本不兼容 (需要v16.x，推荐v16.20.2)
            set NODE_OK=false
        )
    )
)

echo.

REM 检查npm版本
echo === npm版本检查 ===
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装
    set NPM_OK=false
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo 当前版本: %NPM_VERSION%
    
    REM 检查npm版本 (推荐8.x)
    echo %NPM_VERSION% | findstr "^8\." >nul
    if not errorlevel 1 (
        echo ✅ npm版本兼容 (v8.x)
        set NPM_OK=true
    ) else (
        echo %NPM_VERSION% | findstr "^9\." >nul
        if not errorlevel 1 (
            echo ⚠️  npm v9.x 可能兼容
            set NPM_OK=partial
        ) else (
            echo ⚠️  npm版本可能不是最佳选择 (推荐v8.x)
            set NPM_OK=partial
        )
    )
)

echo.

REM 检查nvm安装
echo === nvm-windows检查 ===
nvm version >nul 2>&1
if errorlevel 1 (
    echo ❌ nvm-windows 未安装
    set NVM_OK=false
) else (
    for /f "tokens=*" %%i in ('nvm version') do set NVM_VERSION=%%i
    echo 当前版本: %NVM_VERSION%
    echo ✅ nvm-windows 已安装
    set NVM_OK=true
    
    echo.
    echo 已安装的Node.js版本:
    nvm list
)

echo.

REM 检查项目依赖状态
echo === 项目依赖检查 ===
cd frontend

if exist "node_modules" (
    echo ✅ node_modules 存在
    
    if exist "node_modules\react-scripts" (
        echo ✅ react-scripts 已安装
    ) else (
        echo ❌ react-scripts 未安装
    )
    
    if exist "node_modules\ajv\dist\compile\codegen\index.js" (
        echo ✅ ajv 模块路径正常
    ) else (
        echo ❌ ajv 模块路径异常
    )
    
    if exist "node_modules\typescript" (
        echo ✅ TypeScript 已安装
    ) else (
        echo ❌ TypeScript 未安装
    )
) else (
    echo ❌ node_modules 不存在，需要安装依赖
)

cd ..

echo.
echo === 兼容性报告 ===

if "%NODE_OK%"=="true" if "%NPM_OK%"=="true" (
    echo 🎉 环境兼容性良好！
    echo 可以直接启动项目: npm start
) else (
    echo ⚠️  发现兼容性问题，需要修复
    echo.
    echo 🔧 修复建议:
    
    if "%NODE_OK%"=="false" (
        echo - Node.js版本不兼容，运行: scripts\fix-nodejs-version.bat
    )
    
    if "%NVM_OK%"=="false" (
        echo - 安装nvm-windows，运行: scripts\install-nvm-windows.bat
    )
    
    if not exist "frontend\node_modules" (
        echo - 重新安装依赖，运行: npm install --legacy-peer-deps
    )
)

echo.
echo === 推荐的开发环境 ===
echo - Node.js: v16.20.2 (LTS)
echo - npm: v8.19.4
echo - TypeScript: v4.9.5
echo - react-scripts: v5.0.1
echo.

pause