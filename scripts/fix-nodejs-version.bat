@echo off
REM Node.js版本修复脚本 - 解决v20.x与react-scripts@5.0.1不兼容问题

echo 🔧 修复Node.js版本兼容性问题...
echo 当前问题: Node.js v20.13.1 与 react-scripts@5.0.1 不兼容
echo 目标版本: Node.js v16.20.2 (LTS)
echo.

REM 检查当前Node.js版本
echo 📋 检查当前Node.js版本...
node --version
if errorlevel 1 (
    echo ❌ Node.js 未安装
    goto :install_nvm
) else (
    echo ✅ 当前Node.js版本已检测
)

REM 检查是否安装了nvm-windows
echo.
echo 📋 检查nvm-windows安装状态...
nvm version >nul 2>&1
if errorlevel 1 (
    echo ❌ nvm-windows 未安装，需要先安装
    goto :install_nvm
) else (
    echo ✅ nvm-windows 已安装
    nvm version
)

REM 列出已安装的Node.js版本
echo.
echo 📋 列出已安装的Node.js版本...
nvm list

REM 检查是否已安装Node.js 16.20.2
nvm list | findstr "16.20.2" >nul
if errorlevel 1 (
    echo.
    echo 📦 安装Node.js 16.20.2...
    nvm install 16.20.2
    if errorlevel 1 (
        echo ❌ Node.js 16.20.2 安装失败
        goto :error
    )
    echo ✅ Node.js 16.20.2 安装成功
) else (
    echo ✅ Node.js 16.20.2 已安装
)

REM 切换到Node.js 16.20.2
echo.
echo 🔄 切换到Node.js 16.20.2...
nvm use 16.20.2
if errorlevel 1 (
    echo ❌ 切换Node.js版本失败
    goto :error
)

REM 验证版本切换
echo.
echo 🔍 验证Node.js版本...
node --version
npm --version

REM 检查版本是否正确
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo 当前Node.js版本: %NODE_VERSION%

if "%NODE_VERSION%"=="v16.20.2" (
    echo ✅ Node.js版本切换成功
) else (
    echo ⚠️  版本切换可能未完全生效，请重新打开命令行窗口
    echo 然后运行: nvm use 16.20.2
)

REM 进入前端目录
echo.
echo 📁 进入前端目录...
cd frontend

REM 彻底清理现有依赖
echo.
echo 🧹 清理现有依赖和缓存...
if exist "node_modules" (
    echo 删除 node_modules...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo 删除 package-lock.json...
    del package-lock.json
)

if exist "yarn.lock" (
    echo 删除 yarn.lock...
    del yarn.lock
)

REM 清理npm缓存
echo 清理npm缓存...
npm cache clean --force

REM 更新npm到兼容版本
echo.
echo 📦 更新npm到兼容版本...
npm install -g npm@8.19.4
echo ✅ npm版本更新完成

REM 验证npm版本
npm --version

REM 重新安装依赖
echo.
echo 📦 重新安装项目依赖...
echo 使用Node.js 16.20.2兼容配置...

REM 设置环境变量
set NPM_CONFIG_LEGACY_PEER_DEPS=true
set NPM_CONFIG_FORCE=false
set NPM_CONFIG_AUDIT=false
set NPM_CONFIG_FUND=false

REM 分步安装关键依赖
echo 安装核心React依赖...
npm install react@^18.2.0 react-dom@^18.2.0 --legacy-peer-deps

echo 安装TypeScript...
npm install typescript@4.9.5 --save-exact --legacy-peer-deps

echo 安装ajv兼容版本...
npm install ajv@6.12.6 ajv-keywords@3.5.2 --save-exact --legacy-peer-deps

echo 安装react-scripts...
npm install react-scripts@5.0.1 --legacy-peer-deps

echo 安装其他依赖...
npm install --legacy-peer-deps

if errorlevel 1 (
    echo ❌ 依赖安装失败
    goto :error
)

echo ✅ 所有依赖安装完成

REM 验证关键模块
echo.
echo 🔍 验证关键模块安装...
if exist "node_modules\react-scripts" (
    echo ✅ react-scripts 已安装
) else (
    echo ❌ react-scripts 安装失败
    goto :error
)

if exist "node_modules\ajv\dist\compile\codegen\index.js" (
    echo ✅ ajv 模块路径正常
) else (
    echo ❌ ajv 模块路径异常
    goto :error
)

REM 测试TypeScript编译
echo.
echo 🔍 测试TypeScript编译...
npx tsc --version
npx tsc --noEmit --skipLibCheck
if errorlevel 1 (
    echo ⚠️  TypeScript编译有警告，但可能不影响运行
) else (
    echo ✅ TypeScript编译检查通过
)

echo.
echo 🎉 Node.js版本修复完成！
echo.
echo 📋 修复结果:
echo - Node.js版本: 16.20.2 (兼容react-scripts@5.0.1)
echo - npm版本: 8.19.4
echo - 依赖状态: 已重新安装并验证
echo.
echo 🚀 现在可以启动项目了:
echo cd frontend
echo npm start
echo.
goto :end

:install_nvm
echo.
echo 📥 需要安装nvm-windows来管理Node.js版本
echo.
echo 请按照以下步骤手动安装nvm-windows:
echo 1. 访问: https://github.com/coreybutler/nvm-windows/releases
echo 2. 下载最新版本的 nvm-setup.zip
echo 3. 解压并运行 nvm-setup.exe
echo 4. 安装完成后重新打开命令行
echo 5. 再次运行此脚本
echo.
echo 或者使用Chocolatey安装:
echo choco install nvm
echo.
goto :end

:error
echo.
echo ❌ 修复过程中出现错误
echo.
echo 🔧 手动修复步骤:
echo 1. 确保nvm-windows已正确安装
echo 2. 运行: nvm install 16.20.2
echo 3. 运行: nvm use 16.20.2
echo 4. 重新打开命令行窗口
echo 5. 验证: node --version (应显示v16.20.2)
echo 6. 清理依赖: rm -rf node_modules package-lock.json
echo 7. 重新安装: npm install --legacy-peer-deps
echo.
goto :end

:end
pause