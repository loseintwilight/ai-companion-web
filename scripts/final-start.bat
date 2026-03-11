@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title AI Companion - Final Starter

echo ================================================================
echo                   AI Companion Final Starter                  
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
    echo [ERROR] Node.js not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js: %NODE_VERSION%

REM Check npm
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm: %NPM_VERSION%

REM Set memory limit based on Node.js version
echo [INFO] Configuring for Node.js %NODE_VERSION%...

echo %NODE_VERSION% | findstr /r "^v16\." >nul
if not errorlevel 1 (
    echo [OK] Node.js v16 - Excellent compatibility
    set MEMORY_LIMIT=4096
    set LEGACY_PROVIDER=false
    goto :version_ok
)

echo %NODE_VERSION% | findstr /r "^v18\." >nul
if not errorlevel 1 (
    echo [OK] Node.js v18 - Good compatibility  
    set MEMORY_LIMIT=6144
    set LEGACY_PROVIDER=true
    goto :version_ok
)

echo [WARN] Node.js %NODE_VERSION% - Using compatibility mode
set MEMORY_LIMIT=8192
set LEGACY_PROVIDER=true

:version_ok
echo [INFO] Memory limit set to: %MEMORY_LIMIT% MB
echo.

REM Enter frontend directory
if not exist "frontend" (
    echo [ERROR] Frontend directory not found
    pause
    exit /b 1
)

cd frontend
echo [OK] Switched to: %CD%
echo.

REM Set environment variables
echo [INFO] Setting environment variables...

if "%LEGACY_PROVIDER%"=="true" (
    set NODE_OPTIONS=--max_old_space_size=%MEMORY_LIMIT% --openssl-legacy-provider --no-deprecation --no-warnings
    echo [OK] Legacy provider enabled
) else (
    set NODE_OPTIONS=--max_old_space_size=%MEMORY_LIMIT% --no-deprecation --no-warnings
    echo [OK] Standard provider
)

REM React optimizations
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set GENERATE_SOURCEMAP=false
set FAST_REFRESH=false

REM npm optimizations
set NPM_CONFIG_LEGACY_PEER_DEPS=true
set NPM_CONFIG_AUDIT=false
set NPM_CONFIG_FUND=false
set NPM_CONFIG_PROGRESS=false

echo [OK] Environment configured
echo.

REM Check dependencies
echo [INFO] Checking dependencies...

if not exist "node_modules" (
    echo [WARN] node_modules not found, installing...
    goto :install_deps
)

if not exist "node_modules\react-scripts" (
    echo [WARN] react-scripts missing, reinstalling...
    goto :install_deps
)

if not exist "node_modules\ajv" (
    echo [WARN] ajv missing, reinstalling...
    goto :install_deps
)

echo [OK] Dependencies appear to be installed
goto :start_app

:install_deps
echo.
echo [INFO] Installing dependencies...
echo [INFO] This may take 3-5 minutes...
echo.

REM Clean installation
if exist "package-lock.json" (
    echo [INFO] Removing package-lock.json
    del /f /q "package-lock.json" >nul 2>&1
)

if exist "yarn.lock" (
    echo [INFO] Removing yarn.lock  
    del /f /q "yarn.lock" >nul 2>&1
)

echo [INFO] Cleaning npm cache...
npm cache clean --force >nul 2>&1

echo [INFO] Installing with optimized settings...
npm install --legacy-peer-deps --no-audit --no-fund --progress=false --silent

if errorlevel 1 (
    echo [WARN] Standard installation failed, trying force install...
    npm install --legacy-peer-deps --force --no-audit --no-fund --progress=false --silent
    
    if errorlevel 1 (
        echo [ERROR] Installation failed
        echo.
        echo Try these alternatives:
        echo 1. Use yarn: npm install -g yarn ^&^& yarn install
        echo 2. Check internet connection
        echo 3. Try different npm registry
        pause
        exit /b 1
    )
)

echo [OK] Dependencies installed successfully
echo.

:start_app
echo ================================================================
echo                      Starting Application                     
echo ================================================================
echo.
echo Configuration:
echo   Node.js: %NODE_VERSION%
echo   Memory: %MEMORY_LIMIT% MB
echo   Legacy Provider: %LEGACY_PROVIDER%
echo.
echo Service will be available at:
echo   Frontend: http://localhost:3000
echo   Backend: http://localhost:8000 (start separately)
echo.
echo [INFO] Starting React development server...
echo [INFO] First startup may take 30-60 seconds
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the application
npm start

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start application
    echo.
    echo Quick fixes to try:
    echo 1. Close other applications to free memory
    echo 2. Restart your computer
    echo 3. Try: yarn start (if yarn is installed)
    echo 4. Check if port 3000 is available
    echo.
    echo Manual startup command:
    echo   set NODE_OPTIONS=--max_old_space_size=%MEMORY_LIMIT% --openssl-legacy-provider
    echo   npm start
    echo.
)

echo.
echo Script execution completed
pause