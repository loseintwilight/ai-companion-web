@echo off
REM NVM-Windows 自动安装脚本

echo 📥 安装nvm-windows (Node.js版本管理器)...
echo.

REM 检查是否已安装nvm
nvm version >nul 2>&1
if not errorlevel 1 (
    echo ✅ nvm-windows 已安装
    nvm version
    goto :install_node
)

REM 检查是否安装了Chocolatey
choco --version >nul 2>&1
if not errorlevel 1 (
    echo ✅ 检测到Chocolatey，使用Chocolatey安装nvm
    choco install nvm -y
    if errorlevel 1 (
        echo ❌ Chocolatey安装nvm失败
        goto :manual_install
    )
    echo ✅ nvm安装成功，请重新打开命令行窗口
    goto :end
)

REM 检查是否安装了Scoop
scoop --version >nul 2>&1
if not errorlevel 1 (
    echo ✅ 检测到Scoop，使用Scoop安装nvm
    scoop install nvm
    if errorlevel 1 (
        echo ❌ Scoop安装nvm失败
        goto :manual_install
    )
    echo ✅ nvm安装成功，请重新打开命令行窗口
    goto :end
)

:manual_install
echo.
echo 📋 需要手动安装nvm-windows
echo.
echo 方法1: 使用PowerShell安装 (推荐)
echo 以管理员身份运行PowerShell，然后执行:
echo.
echo Set-ExecutionPolicy Bypass -Scope Process -Force
echo iwr -useb https://raw.githubusercontent.com/coreybutler/nvm-windows/master/install.ps1 ^| iex
echo.
echo 方法2: 手动下载安装
echo 1. 访问: https://github.com/coreybutler/nvm-windows/releases
echo 2. 下载最新版本的 nvm-setup.zip
echo 3. 解压并运行 nvm-setup.exe
echo 4. 按照安装向导完成安装
echo.
echo 方法3: 使用包管理器
echo 安装Chocolatey后运行: choco install nvm
echo 或安装Scoop后运行: scoop install nvm
echo.
echo 安装完成后请:
echo 1. 重新打开命令行窗口
echo 2. 运行: nvm version (验证安装)
echo 3. 运行: fix-nodejs-version.bat (继续修复)
echo.
goto :end

:install_node
echo.
echo 🔄 继续Node.js版本修复...
call fix-nodejs-version.bat
goto :end

:end
pause