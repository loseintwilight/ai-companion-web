@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM =================================================================
REM AI Companion Web App - Ultimate One-Click Launcher
REM Auto-fix compatibility issues, no manual operation required
REM =================================================================

title AI Companion Web App Launcher

echo.
echo ================================================================
echo                   AI Companion Web App Launcher                
echo                                                                
echo   Auto-detect environment - Fix compatibility - Install deps   
echo ================================================================
echo.

REM Get project root directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

echo Project Directory: %CD%
echo.

REM ==================== Environment Check ====================
echo Step 1/6: Environment Check
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not installed
    echo.
    echo Please install Node.js first: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js: %NODE_VERSION%

REM Check npm
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm: %NPM_VERSION%

REM Version compatibility check
set NEED_LEGACY=false
echo %NODE_VERSION% | findstr /r "^v1[89]\." >nul
if not errorlevel 1 set NEED_LEGACY=true
echo %NODE_VERSION% | findstr /r "^v[2-9][0-9]\." >nul
if not errorlevel 1 set NEED_LEGACY=true

if "!NEED_LEGACY!"=="true" (
    echo [WARN] Need legacy provider support
) else (
    echo [OK] Version compatibility good
)

echo.
echo Environment check completed
echo.

REM ==================== Directory Switch ====================
echo Step 2/6: Enter frontend directory
echo.

if not exist "frontend" (
    echo [ERROR] Frontend directory not found
    echo.
    echo Please ensure running this script from project root
    pause
    exit /b 1
)

cd frontend
echo [OK] Current directory: %CD%
echo.
echo Directory switch completed
echo.

REM ==================== Environment Variables ====================
echo Step 3/6: Set environment variables
echo.

REM Set npm configuration
set NPM_CONFIG_LEGACY_PEER_DEPS=true
set NPM_CONFIG_AUDIT=false
set NPM_CONFIG_FUND=false

REM Set React environment variables
set SKIP_PREFLIGHT_CHECK=true
set TSC_COMPILE_ON_ERROR=true
set ESLINT_NO_DEV_ERRORS=true
set GENERATE_SOURCEMAP=false

REM Set Node.js options
if "!NEED_LEGACY!"=="true" (
    set NODE_OPTIONS=--max_old_space_size=8192 --openssl-legacy-provider
    echo [OK] Legacy provider support enabled
) else (
    set NODE_OPTIONS=--max_old_space_size=8192
)

echo [OK] Environment variables configured
echo.
echo Environment configuration completed
echo.

REM ==================== Dependency Check ====================
echo Step 4/6: Check project dependencies
echo.

set NEED_INSTALL=false

if not exist "node_modules" (
    echo [WARN] node_modules does not exist
    set NEED_INSTALL=true
) else (
    echo [OK] node_modules exists
    
    REM Check key dependencies
    if not exist "node_modules\react-scripts" (
        echo [WARN] react-scripts missing
        set NEED_INSTALL=true
    )
    
    if not exist "node_modules\ajv" (
        echo [WARN] ajv missing
        set NEED_INSTALL=true
    ) else (
        if not exist "node_modules\ajv\dist\compile\codegen\index.js" (
            if not exist "node_modules\ajv\lib\compile\codegen\index.js" (
                echo [WARN] ajv version incompatible
                set NEED_INSTALL=true
            )
        )
    )
)

if "!NEED_INSTALL!"=="true" (
    echo [INFO] Need to install/fix dependencies
) else (
    echo [OK] Dependency check passed
)

echo.
echo Dependency check completed
echo.

REM ==================== Dependency Installation ====================
if "!NEED_INSTALL!"=="true" (
    echo Step 5/6: Install project dependencies
    echo.
    
    REM Clean old files
    if exist "package-lock.json" (
        echo [INFO] Cleaning package-lock.json
        del /f /q "package-lock.json"
    )
    
    if exist "yarn.lock" (
        echo [INFO] Cleaning yarn.lock
        del /f /q "yarn.lock"
    )
    
    echo [INFO] Cleaning npm cache
    npm cache clean --force >nul 2>&1
    
    echo.
    echo [INFO] Starting dependency installation...
    echo [INFO] This may take a few minutes, please wait
    echo.
    
    REM Step-by-step installation to avoid conflicts
    echo [1/4] Installing React core...
    npm install react@^18.2.0 react-dom@^18.2.0 --legacy-peer-deps --no-audit --no-fund --silent
    
    echo [2/4] Installing ajv compatible version...
    npm install ajv@6.12.6 ajv-keywords@3.5.2 --save-exact --legacy-peer-deps --no-audit --no-fund --silent
    
    echo [3/4] Installing TypeScript...
    npm install typescript@4.9.5 --save-exact --legacy-peer-deps --no-audit --no-fund --silent
    
    echo [4/4] Installing other dependencies...
    npm install --legacy-peer-deps --no-audit --no-fund --silent
    
    if errorlevel 1 (
        echo [WARN] Standard installation failed, trying force install...
        npm install --legacy-peer-deps --force --no-audit --no-fund --silent
        
        if errorlevel 1 (
            echo [ERROR] Dependency installation failed
            echo.
            echo Please check network connection or install manually
            pause
            exit /b 1
        )
    )
    
    echo [OK] Dependency installation completed
    echo.
    echo Dependency installation completed
    echo.
) else (
    echo Step 5/6: Skip dependency installation
    echo [OK] Dependencies already exist, skipping installation
    echo.
    echo.
)

REM ==================== Final Verification ====================
echo Step 6/6: Final verification
echo.

if exist "node_modules\react-scripts" (
    echo [OK] react-scripts verification passed
) else (
    echo [ERROR] react-scripts verification failed
    goto :failed
)

if exist "node_modules\ajv\dist\compile\codegen\index.js" (
    echo [OK] ajv path verification passed
) else (
    if exist "node_modules\ajv\lib\compile\codegen\index.js" (
        echo [OK] ajv backup path verification passed
    ) else (
        echo [ERROR] ajv path verification failed
        goto :failed
    )
)

echo [OK] All verifications passed
echo.
echo Verification completed
echo.

REM ==================== Start Project ====================
echo ================================================================
echo                        Starting Project                        
echo ================================================================
echo.
echo Service Information:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000 (needs separate startup)
echo    Live2D: Integrated support
echo.
echo Press Ctrl+C to stop server
echo.

REM Start development server
npm start

REM If startup fails
if errorlevel 1 (
    echo.
    echo [ERROR] Project startup failed!
    goto :failed
)

goto :end

:failed
echo.
echo ================================================================
echo                        Startup Failed                         
echo ================================================================
echo.
echo Troubleshooting suggestions:
echo.
echo 1. Check port usage:
echo    netstat -ano ^| findstr :3000
echo.
echo 2. Manual cleanup and reinstall:
echo    rmdir /s /q node_modules
echo    del package-lock.json
echo    npm install --legacy-peer-deps
echo.
echo 3. Run compatibility fix:
echo    scripts\fix-compatibility.bat
echo.
echo 4. Check Node.js version:
echo    Recommended: Node.js v16.20.2 or v18.18.0
echo.
goto :end

:end
echo.
echo Script execution completed
pause