@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title AI Companion - Simple Starter

echo ================================================================
echo                   AI Companion Simple Starter                 
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

REM Set essential environment variables
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set NODE_OPTIONS=--max_old_space_size=8192 --openssl-legacy-provider
set NPM_CONFIG_LEGACY_PEER_DEPS=true

echo [INFO] Environment variables set
echo.

REM Check if dependencies exist
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    echo This may take a few minutes...
    echo.
    
    REM Clean install
    if exist "package-lock.json" del /f /q "package-lock.json"
    npm cache clean --force >nul 2>&1
    
    npm install --legacy-peer-deps --no-audit --no-fund
    
    if errorlevel 1 (
        echo [ERROR] Installation failed
        echo.
        echo Try manual installation:
        echo   cd frontend
        echo   npm install --legacy-peer-deps --force
        pause
        exit /b 1
    )
    
    echo [OK] Dependencies installed
    echo.
)

REM Start the application
echo ================================================================
echo                        Starting Application                    
echo ================================================================
echo.
echo Frontend will be available at: http://localhost:3000
echo Press Ctrl+C to stop
echo.

npm start

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start application
    echo.
    echo Troubleshooting:
    echo 1. Check if port 3000 is available
    echo 2. Try: npm install --legacy-peer-deps --force
    echo 3. Check Node.js version compatibility
    pause
)

echo.
echo Script completed
pause