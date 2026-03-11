@echo off
echo ========================================
echo AI伴侣Web应用 - Schema Utils完整修复脚本
echo ========================================
echo.

:: 设置工作目录
cd /d "%~dp0..\frontend"

echo 当前目录: %CD%
echo.

:: 检查Node.js版本
echo [1/6] 检查Node.js环境...
node --version
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: Node.js未安装或不在PATH中
    pause
    exit /b 1
)

npm --version
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: npm未安装或不在PATH中
    pause
    exit /b 1
)
echo ✅ Node.js环境检查完成
echo.

:: 检查package.json
echo [2/6] 检查项目配置...
if not exist "package.json" (
    echo ❌ 错误: 未找到package.json文件
    pause
    exit /b 1
)

:: 验证schema-utils配置
findstr "schema-utils.*3.3.0" "package.json" >nul
if %ERRORLEVEL% neq 0 (
    echo ⚠ 警告: package.json中未找到schema-utils@3.3.0配置
)
echo ✅ 项目配置检查完成
echo.

:: 清理旧的依赖
echo [3/6] 清理旧的依赖文件...
if exist "node_modules" (
    echo 删除旧的node_modules目录...
    rmdir /s /q "node_modules" 2>nul
    if exist "node_modules" (
        echo ⚠ 警告: node_modules删除可能不完整，继续安装...
    )
)
if exist "package-lock.json" (
    echo 删除旧的package-lock.json文件...
    del "package-lock.json" 2>nul
)
echo ✅ 依赖清理完成
echo.

:: 清理npm缓存
echo [4/6] 清理npm缓存...
npm cache clean --force >nul 2>&1
echo ✅ 缓存清理完成
echo.

:: 安装依赖
echo [5/6] 安装项目依赖...
echo 使用阿里云镜像源和兼容性配置安装依赖...
echo 这可能需要几分钟时间，请耐心等待...
npm install --legacy-peer-deps --no-audit --no-fund
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成
echo.

:: 验证安装结果
echo [6/6] 验证修复结果...
if exist "node_modules\schema-utils" (
    findstr "3.3.0" "node_modules\schema-utils\package.json" >nul
    if %ERRORLEVEL% equ 0 (
        echo ✅ Schema Utils 3.3.0 安装成功
    ) else (
        echo ⚠ 警告: Schema Utils版本可能不正确
    )
) else (
    echo ❌ 错误: Schema Utils未安装
    pause
    exit /b 1
)
echo.

:: 启动项目
echo ========================================
echo ✅ Schema Utils修复完成！
echo 项目启动中...
echo 浏览器将自动打开 http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

npm start