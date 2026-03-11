@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title AI Companion - Memory Fix Starter

echo ================================================================
echo                AI Companion Memory Fix Starter                
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

REM Set memory and compatibility environment variables
echo [INFO] Setting memory and compatibility options...

REM Increase memory limits significantly
set NODE_OPTIONS=--max_old_space_size=16384 --max_semi_space_size=512 --max_executable_size=512 --openssl-legacy-provider --no-deprecation

REM React/Webpack compatibility
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set GENERATE_SOURCEMAP=false
set FAST_REFRESH=false

REM npm configuration
set NPM_CONFIG_LEGACY_PEER_DEPS=true
set NPM_CONFIG_AUDIT=false
set NPM_CONFIG_FUND=false

REM Webpack memory settings
set WEBPACK_MEMORY_LIMIT=8192

echo [OK] Memory settings: 16GB heap, 512MB semi-space
echo [OK] Legacy provider enabled for Node.js %NODE_VERSION%
echo.

REM Check if dependencies exist and are valid
echo [INFO] Checking dependencies...

if not exist "node_modules" (
    echo [WARN] node_modules not found, installing...
    goto :install_deps
)

if not exist "node_modules\react-scripts" (
    echo [WARN] react-scripts missing, reinstalling...
    goto :install_deps
)

if not exist "node_modules\ajv\dist\compile\codegen\index.js" (
    if not exist "node_modules\ajv\lib\compile\codegen\index.js" (
        echo [WARN] ajv incompatible version, fixing...
        goto :install_deps
    )
)

echo [OK] Dependencies check passed
goto :start_app

:install_deps
echo.
echo [INFO] Installing/fixing dependencies...
echo This process may take several minutes...
echo.

REM Clean previous installations
if exist "package-lock.json" (
    echo [INFO] Removing package-lock.json
    del /f /q "package-lock.json"
)

if exist "yarn.lock" (
    echo [INFO] Removing yarn.lock
    del /f /q "yarn.lock"
)

echo [INFO] Cleaning npm cache...
npm cache clean --force >nul 2>&1

echo [INFO] Installing core dependencies...

REM Install in specific order to avoid conflicts
echo [1/5] Installing React...
npm install react@^18.2.0 react-dom@^18.2.0 --legacy-peer-deps --no-audit --no-fund --silent

echo [2/5] Installing ajv (compatible version)...
npm install ajv@6.12.6 ajv-keywords@3.5.2 --save-exact --legacy-peer-deps --no-audit --no-fund --silent

echo [3/5] Installing TypeScript...
npm install typescript@4.9.5 --save-exact --legacy-peer-deps --no-audit --no-fund --silent

echo [4/5] Installing react-scripts...
npm install react-scripts@5.0.1 --legacy-peer-deps --no-audit --no-fund --silent

echo [5/5] Installing remaining dependencies...
npm install --legacy-peer-deps --no-audit --no-fund --silent

if errorlevel 1 (
    echo [WARN] Standard installation failed, trying force install...
    npm install --legacy-peer-deps --force --no-audit --no-fund --silent
    
    if errorlevel 1 (
        echo [ERROR] Installation failed completely
        echo.
        echo Manual steps to try:
        echo 1. Delete node_modules folder
        echo 2. Run: npm install --legacy-peer-deps --force
        echo 3. If still failing, try using yarn instead of npm
        pause
        exit /b 1
    )
)

echo [OK] Dependencies installed successfully
echo.

:start_app
REM Final verification
echo [INFO] Final verification...

if exist "node_modules\react-scripts\bin\react-scripts.js" (
    echo [OK] react-scripts verified
) else (
    echo [ERROR] react-scripts verification failed
    goto :manual_help
)

if exist "node_modules\ajv\dist\compile\codegen\index.js" (
    echo [OK] ajv path verified (dist)
) else (
    if exist "node_modules\ajv\lib\compile\codegen\index.js" (
        echo [OK] ajv path verified (lib)
    ) else (
        echo [ERROR] ajv verification failed
        goto :manual_help
    )
)

echo.
echo ================================================================
echo                      Starting Application                     
echo ================================================================
echo.
echo Memory Configuration:
echo   Node.js Heap: 16GB
echo   Semi-space: 512MB
echo   Legacy Provider: Enabled
echo.
echo Service Information:
echo   Frontend: http://localhost:3000
echo   Backend: http://localhost:8000 (start separately)
echo.
echo Press Ctrl+C to stop the development server
echo.

REM Start with explicit memory settings
echo [INFO] Starting React development server...
echo.

npm start

if errorlevel 1 (
    echo.
    echo [ERROR] Application failed to start
    goto :manual_help
)

goto :end

:manual_help
echo.
echo ================================================================
echo                         Manual Help                           
echo ================================================================
echo.
echo The automatic startup failed. Try these manual steps:
echo.
echo 1. Open a new command prompt
echo 2. Navigate to: %CD%
echo 3. Set environment variables:
echo    set NODE_OPTIONS=--max_old_space_size=16384 --openssl-legacy-provider
echo    set SKIP_PREFLIGHT_CHECK=true
echo 4. Run: npm start
echo.
echo Alternative approaches:
echo.
echo A. Use Yarn instead of npm:
echo    npm install -g yarn
echo    yarn install
echo    yarn start
echo.
echo B. Try different Node.js version:
echo    Install Node.js v16.20.2 or v18.18.0
echo.
echo C. Check system resources:
echo    Close other applications to free memory
echo    Restart your computer if needed
echo.

:end
echo.
echo Script execution completed
pause