@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title AI Companion - Diagnostic Starter

echo ================================================================
echo                AI Companion Diagnostic Starter                
echo ================================================================
echo.

REM Get project root and switch to frontend
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

echo Project Root: %CD%
echo.

REM System diagnostics
echo [INFO] Running system diagnostics...
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

REM Check available memory
for /f "skip=1" %%p in ('wmic computersystem get TotalPhysicalMemory') do (
    if not "%%p"=="" (
        set /a TOTAL_MEMORY=%%p/1024/1024
        goto :memory_done
    )
)
:memory_done
echo [INFO] Total System Memory: %TOTAL_MEMORY% MB

REM Memory recommendations
if %TOTAL_MEMORY% LSS 4096 (
    echo [WARN] Low system memory detected ^(%TOTAL_MEMORY% MB^)
    echo [WARN] React development may be slow or fail
    set MEMORY_LIMIT=2048
) else if %TOTAL_MEMORY% LSS 8192 (
    echo [INFO] Moderate system memory ^(%TOTAL_MEMORY% MB^)
    set MEMORY_LIMIT=4096
) else (
    echo [OK] Good system memory ^(%TOTAL_MEMORY% MB^)
    set MEMORY_LIMIT=8192
)

echo [INFO] Setting Node.js memory limit to: %MEMORY_LIMIT% MB
echo.

REM Check Node.js version compatibility
echo [INFO] Checking Node.js compatibility...
echo %NODE_VERSION% | findstr /r "^v16\." >nul
if not errorlevel 1 (
    echo [OK] Node.js v16 - Excellent compatibility
    set LEGACY_PROVIDER=false
    goto :version_ok
)

echo %NODE_VERSION% | findstr /r "^v18\." >nul
if not errorlevel 1 (
    echo [OK] Node.js v18 - Good compatibility
    set LEGACY_PROVIDER=true
    goto :version_ok
)

echo %NODE_VERSION% | findstr /r "^v[2-9][0-9]\." >nul
if not errorlevel 1 (
    echo [WARN] Node.js %NODE_VERSION% - May have compatibility issues
    echo [WARN] Recommended: Node.js v16.20.2 or v18.18.0
    set LEGACY_PROVIDER=true
    goto :version_ok
)

echo [WARN] Unknown Node.js version compatibility
set LEGACY_PROVIDER=true

:version_ok
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

REM Set optimized environment variables
echo [INFO] Configuring environment for your system...

if "%LEGACY_PROVIDER%"=="true" (
    set NODE_OPTIONS=--max_old_space_size=%MEMORY_LIMIT% --openssl-legacy-provider --no-deprecation
    echo [OK] Legacy provider enabled
) else (
    set NODE_OPTIONS=--max_old_space_size=%MEMORY_LIMIT% --no-deprecation
    echo [OK] Standard provider
)

REM React/Build optimizations
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set GENERATE_SOURCEMAP=false
set FAST_REFRESH=false

REM npm optimizations
set NPM_CONFIG_LEGACY_PEER_DEPS=true
set NPM_CONFIG_AUDIT=false
set NPM_CONFIG_FUND=false

echo [OK] Environment optimized for %MEMORY_LIMIT%MB heap
echo.

REM Check port availability
echo [INFO] Checking port 3000 availability...
netstat -an | findstr ":3000" >nul
if not errorlevel 1 (
    echo [WARN] Port 3000 appears to be in use
    echo [INFO] React will try to use an alternative port
)
echo.

REM Dependency check and installation
echo [INFO] Checking dependencies...

if not exist "node_modules" (
    echo [WARN] node_modules not found
    goto :install_deps
)

if not exist "node_modules\react-scripts" (
    echo [WARN] react-scripts missing
    goto :install_deps
)

REM Check ajv specifically (common issue)
if not exist "node_modules\ajv" (
    echo [WARN] ajv missing
    goto :install_deps
)

if not exist "node_modules\ajv\dist\compile\codegen\index.js" (
    if not exist "node_modules\ajv\lib\compile\codegen\index.js" (
        echo [WARN] ajv version incompatible
        goto :install_deps
    )
)

echo [OK] Dependencies appear to be installed correctly
goto :start_app

:install_deps
echo.
echo [INFO] Installing/fixing dependencies...
echo [INFO] This may take 3-5 minutes depending on your internet speed
echo.

REM Clean installation
if exist "package-lock.json" (
    echo [INFO] Removing package-lock.json
    del /f /q "package-lock.json"
)

echo [INFO] Cleaning npm cache...
npm cache clean --force >nul 2>&1

echo [INFO] Installing dependencies with optimized settings...

REM Try standard installation first
npm install --legacy-peer-deps --no-audit --no-fund --progress=false

if errorlevel 1 (
    echo [WARN] Standard installation failed, trying alternative method...
    
    REM Try with force flag
    npm install --legacy-peer-deps --force --no-audit --no-fund --progress=false
    
    if errorlevel 1 (
        echo [ERROR] Installation failed
        echo.
        echo Possible solutions:
        echo 1. Check internet connection
        echo 2. Try using a VPN if in restricted network
        echo 3. Use yarn instead: npm install -g yarn ^&^& yarn install
        echo 4. Clear all caches: npm cache clean --force
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
echo System Configuration:
echo   Node.js: %NODE_VERSION%
echo   Memory Limit: %MEMORY_LIMIT% MB
echo   Legacy Provider: %LEGACY_PROVIDER%
echo   Total RAM: %TOTAL_MEMORY% MB
echo.
echo Service Information:
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
    echo [ERROR] Application failed to start
    echo.
    echo Diagnostic Information:
    echo   Node.js: %NODE_VERSION%
    echo   Memory: %MEMORY_LIMIT% MB
    echo   System RAM: %TOTAL_MEMORY% MB
    echo.
    echo Possible solutions:
    echo 1. Restart your computer to free memory
    echo 2. Close other applications
    echo 3. Try: yarn start (if yarn is installed)
    echo 4. Use a different Node.js version (v16.20.2 recommended)
    echo.
    echo Manual startup command:
    echo   set NODE_OPTIONS=--max_old_space_size=%MEMORY_LIMIT% --openssl-legacy-provider
    echo   npm start
    echo.
)

echo.
echo Script execution completed
pause