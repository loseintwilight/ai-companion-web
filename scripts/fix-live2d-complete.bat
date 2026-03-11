@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Live2D 完整修复脚本
echo ========================================
echo.

:: 设置颜色
for /f %%A in ('"prompt $H &echo on &for %%B in (1) do rem"') do set BS=%%A

:: 进入前端目录
cd /d "%~dp0..\frontend"
if errorlevel 1 (
    echo [错误] 无法进入前端目录
    pause
    exit /b 1
)

echo [信息] 当前目录: %CD%
echo.

:: 步骤 1: 检查 Node.js 和 npm
echo [步骤 1/8] 检查环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js 未安装或不在 PATH 中
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo [错误] npm 未安装或不在 PATH 中
    pause
    exit /b 1
)

echo [成功] Node.js 和 npm 环境正常
echo.

:: 步骤 2: 清理旧的依赖
echo [步骤 2/8] 清理旧依赖...
if exist node_modules (
    echo [信息] 删除 node_modules 目录...
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo [信息] 删除 package-lock.json...
    del package-lock.json
)

echo [信息] 清理 npm 缓存...
npm cache clean --force >nul 2>&1

echo [成功] 依赖清理完成
echo.

:: 步骤 3: 验证 Cubism Core 本地文件
echo [步骤 3/8] 验证 Cubism Core 本地文件...
if not exist "public\lib" (
    echo [信息] 创建 lib 目录...
    mkdir "public\lib"
)

if not exist "public\lib\live2dcubismcore.min.js" (
    echo [错误] Cubism Core 本地文件不存在
    echo [信息] 请确保 public\lib\live2dcubismcore.min.js 文件存在
    pause
    exit /b 1
)

:: 检查文件大小
for %%A in ("public\lib\live2dcubismcore.min.js") do set filesize=%%~zA
if !filesize! LSS 5000 (
    echo [警告] Cubism Core 文件可能不完整 ^(大小: !filesize! 字节^)
    echo [信息] 当前使用增强的本地实现，建议替换为官方文件
) else (
    echo [成功] Cubism Core 文件存在 ^(大小: !filesize! 字节^)
)
echo.

:: 步骤 4: 验证 Live2D 模型文件
echo [步骤 4/8] 验证 Live2D 模型文件...
if not exist "public\live2d\rem\rem\model.json" (
    echo [错误] Live2D 模型文件不存在
    echo [信息] 请确保模型文件位于: public\live2d\rem\rem\model.json
    pause
    exit /b 1
)

echo [成功] Live2D 模型文件存在
echo.

:: 步骤 5: 安装依赖
echo [步骤 5/8] 安装项目依赖...
echo [信息] 使用 --legacy-peer-deps 解决版本冲突...

npm install --legacy-peer-deps --no-audit --no-fund
if errorlevel 1 (
    echo [错误] 依赖安装失败
    echo [信息] 尝试使用 yarn 安装...
    
    yarn --version >nul 2>&1
    if not errorlevel 1 (
        yarn install --ignore-engines
        if errorlevel 1 (
            echo [错误] yarn 安装也失败了
            pause
            exit /b 1
        )
    ) else (
        echo [错误] npm 和 yarn 都无法安装依赖
        pause
        exit /b 1
    )
)

echo [成功] 依赖安装完成
echo.

:: 步骤 6: 验证关键依赖
echo [步骤 6/8] 验证关键依赖...

npm list pixi.js >nul 2>&1
if errorlevel 1 (
    echo [错误] pixi.js 未正确安装
    pause
    exit /b 1
)

npm list pixi-live2d-display >nul 2>&1
if errorlevel 1 (
    echo [错误] pixi-live2d-display 未正确安装
    pause
    exit /b 1
)

npm list typescript >nul 2>&1
if errorlevel 1 (
    echo [错误] typescript 未正确安装
    pause
    exit /b 1
)

echo [成功] 关键依赖验证通过
echo.

:: 步骤 7: 编译检查
echo [步骤 7/8] TypeScript 编译检查...
npx tsc --noEmit
if errorlevel 1 (
    echo [警告] TypeScript 编译检查发现问题，但继续启动...
) else (
    echo [成功] TypeScript 编译检查通过
)
echo.

:: 步骤 8: 启动项目
echo [步骤 8/8] 启动项目...
echo [信息] 正在启动开发服务器...
echo [信息] 请在浏览器中访问 http://localhost:3000
echo [信息] 按 Ctrl+C 停止服务器
echo.

:: 设置环境变量以避免一些警告
set GENERATE_SOURCEMAP=false
set SKIP_PREFLIGHT_CHECK=true

:: 启动开发服务器
npm start

:: 如果启动失败，尝试备用方案
if errorlevel 1 (
    echo.
    echo [错误] npm start 失败，尝试备用启动方式...
    
    :: 尝试 yarn
    yarn --version >nul 2>&1
    if not errorlevel 1 (
        echo [信息] 尝试使用 yarn start...
        yarn start
    ) else (
        :: 尝试直接运行 react-scripts
        echo [信息] 尝试直接运行 react-scripts...
        npx react-scripts start
    )
)

echo.
echo ========================================
echo Live2D 修复脚本执行完成
echo ========================================
pause