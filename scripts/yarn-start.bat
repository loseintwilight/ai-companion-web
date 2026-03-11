@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title AI Companion - Yarn Starter

echo ================================================================
echo                   AI Companion Yarn Starter                   
echo ================================================================
echo.

REM Get project root and switch to frontend
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

echo Project Root: %CD%
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not installed. Please install from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js: %NODE_VERSION%

REM Enter frontend directory
if not exist "frontend" (
    echo [ERROR] Frontend directory not found
    pause
    exit /b 1
)

cd frontend
echo [OK] Switched to: %CD%
echo.

REM Check if yarn is installed
yarn --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Yarn not found, installing globally...
    npm install -g yarn
    
    if errorlevel 1 (
        echo [ERROR] Failed to install yarn
        echo Please install yarn manually: npm install -g yarn
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('yarn --version') do set YARN_VERSION=%%i
echo [OK] Yarn: %YARN_VERSION%
echo.

REM Set environment variables
echo [INFO] Setting environment variables...
set NODE_OPTIONS=--max_old_space_size=8192 --openssl-legacy-provider
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set GENERATE_SOURCEMAP=false

echo [OK] Environment configured
echo.

REM Check dependencies
if not exist "node_modules" (
    echo [INFO] Installing dependencies with yarn...
    echo This may take a few minutes...
    echo.
    
    REM Clean any existing lock files
    if exist "package-lock.json" del /f /q "package-lock.json"
    if exist "yarn.lock" del /f /q "yarn.lock"
    
    REM Install with yarn
    yarn install
    
    if errorlevel 1 (
        echo [ERROR] Yarn installation failed
        echo.
        echo Trying with legacy flags...
        yarn install --legacy-peer-deps
        
        if errorlevel 1 (
            echo [ERROR] Installation failed completely
            echo.
            echo Manual steps:
            echo 1. Delete node_modules
            echo 2. Run: yarn install --legacy-peer-deps
            pause
            exit /b 1
        )
    )
    
    echo [OK] Dependencies installed with yarn
    echo.
) else (
    echo [OK] Dependencies already exist
)

REM Start application
echo ================================================================
echo                      Starting Application                     
echo ================================================================
echo.
echo Using Yarn for better memory management
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

yarn start

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start with yarn
    echo.
    echo Fallback to npm:
    npm start
)

echo.
echo Script completed
pause