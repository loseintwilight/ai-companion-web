@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title AI Companion - Solution Menu

:menu
cls
echo ================================================================
echo                   AI Companion Solution Menu                  
echo ================================================================
echo.
echo Current Environment:
for /f "tokens=*" %%i in ('node --version 2^>nul') do echo   Node.js: %%i
for /f "tokens=*" %%i in ('npm --version 2^>nul') do echo   npm: %%i
echo   Project: %CD%
echo.
echo ================================================================
echo                        Choose Solution                        
echo ================================================================
echo.
echo 1. Try Yarn Package Manager (Recommended)
echo 2. Use Production Build Mode  
echo 3. Download Node.js 16.20.2 (Best Solution)
echo 4. Try Extreme Memory Settings
echo 5. Use Docker Container
echo 6. View Detailed Solutions Guide
echo 7. Run System Diagnostics
echo 8. Clean All Caches and Retry
echo 9. Exit
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto :yarn_solution
if "%choice%"=="2" goto :production_build
if "%choice%"=="3" goto :download_node16
if "%choice%"=="4" goto :extreme_memory
if "%choice%"=="5" goto :docker_solution
if "%choice%"=="6" goto :view_guide
if "%choice%"=="7" goto :diagnostics
if "%choice%"=="8" goto :clean_all
if "%choice%"=="9" goto :exit

echo Invalid choice. Please try again.
pause
goto :menu

:yarn_solution
cls
echo ================================================================
echo                      Yarn Solution                            
echo ================================================================
echo.
echo Installing Yarn and using it instead of npm...
echo.

REM Check if yarn is installed
yarn --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing Yarn globally...
    npm install -g yarn
    
    if errorlevel 1 (
        echo [ERROR] Failed to install Yarn
        echo Please check your internet connection
        pause
        goto :menu
    )
)

for /f "tokens=*" %%i in ('yarn --version') do echo [OK] Yarn version: %%i

REM Navigate to frontend
if not exist "frontend" (
    echo [ERROR] Frontend directory not found
    pause
    goto :menu
)

cd frontend

echo [INFO] Cleaning npm dependencies...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del /f /q package-lock.json

echo [INFO] Installing dependencies with Yarn...
yarn install

if errorlevel 1 (
    echo [ERROR] Yarn installation failed
    pause
    cd ..
    goto :menu
)

echo [OK] Dependencies installed successfully
echo.
echo [INFO] Starting application with Yarn...
echo Press Ctrl+C to stop
echo.

yarn start

cd ..
pause
goto :menu

:production_build
cls
echo ================================================================
echo                    Production Build Solution                  
echo ================================================================
echo.
echo Building and serving the production version...
echo.

if not exist "frontend" (
    echo [ERROR] Frontend directory not found
    pause
    goto :menu
)

cd frontend

echo [INFO] Setting production environment...
set NODE_ENV=production
set NODE_OPTIONS=--max_old_space_size=16384 --openssl-legacy-provider

echo [INFO] Building production version...
npm run build

if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    cd ..
    goto :menu
)

echo [OK] Build completed successfully
echo.
echo [INFO] Installing serve globally...
npm install -g serve

echo [INFO] Starting production server...
echo Application will be available at: http://localhost:3000
echo Press Ctrl+C to stop
echo.

serve -s build -l 3000

cd ..
pause
goto :menu

:download_node16
cls
echo ================================================================
echo                    Node.js 16 Download Solution              
echo ================================================================
echo.
echo This is the most reliable solution for fixing the compatibility issue.
echo.
echo [INFO] Downloading Node.js 16.20.2...
echo.

REM Create downloads directory if it doesn't exist
if not exist "downloads" mkdir downloads

echo Downloading Node.js 16.20.2 installer...
curl -L -o downloads\node-v16.20.2-x64.msi https://nodejs.org/dist/v16.20.2/node-v16.20.2-x64.msi

if errorlevel 1 (
    echo [ERROR] Download failed. Please download manually from:
    echo https://nodejs.org/dist/v16.20.2/node-v16.20.2-x64.msi
) else (
    echo [OK] Download completed: downloads\node-v16.20.2-x64.msi
    echo.
    echo [INFO] Please follow these steps:
    echo 1. Close this command prompt
    echo 2. Run the downloaded installer: downloads\node-v16.20.2-x64.msi
    echo 3. Follow the installation wizard
    echo 4. Open a new command prompt
    echo 5. Navigate back to this project
    echo 6. Run: cd frontend ^&^& npm install --legacy-peer-deps ^&^& npm start
    echo.
    echo Would you like to open the installer now? (y/n)
    set /p open_installer=""
    
    if /i "%open_installer%"=="y" (
        start downloads\node-v16.20.2-x64.msi
    )
)

pause
goto :menu

:extreme_memory
cls
echo ================================================================
echo                   Extreme Memory Solution                    
echo ================================================================
echo.
echo Trying with maximum memory allocation...
echo WARNING: This may not work with Node.js v20+
echo.

if not exist "frontend" (
    echo [ERROR] Frontend directory not found
    pause
    goto :menu
)

cd frontend

echo [INFO] Setting extreme memory limits...
set NODE_OPTIONS=--max_old_space_size=32768 --max_semi_space_size=2048 --max_executable_size=2048 --openssl-legacy-provider --expose-gc --no-deprecation

echo [INFO] Memory configuration:
echo   Heap: 32GB
echo   Semi-space: 2GB  
echo   Executable: 2GB
echo.

echo [INFO] Starting with extreme memory settings...
echo Press Ctrl+C to stop
echo.

npm start

cd ..
pause
goto :menu

:docker_solution
cls
echo ================================================================
echo                      Docker Solution                         
echo ================================================================
echo.
echo Using Docker to run the application in a controlled environment...
echo.

REM Check if docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    pause
    goto :menu
)

for /f "tokens=*" %%i in ('docker --version') do echo [OK] %%i

echo [INFO] Starting application with Docker...
echo This may take a few minutes for the first run...
echo.

docker-compose up frontend

if errorlevel 1 (
    echo [ERROR] Docker startup failed
    echo Please check docker-compose.yml file
)

pause
goto :menu

:view_guide
cls
echo ================================================================
echo                    Detailed Solutions Guide                  
echo ================================================================
echo.
echo Opening the detailed solutions guide...
echo.

if exist "scripts\STARTUP_SOLUTIONS.md" (
    start notepad "scripts\STARTUP_SOLUTIONS.md"
    echo [OK] Guide opened in Notepad
) else (
    echo [ERROR] Solutions guide not found
    echo Please check scripts\STARTUP_SOLUTIONS.md
)

pause
goto :menu

:diagnostics
cls
echo ================================================================
echo                      System Diagnostics                     
echo ================================================================
echo.

echo [INFO] Node.js Information:
node --version 2>nul || echo   Node.js: Not installed
npm --version 2>nul || echo   npm: Not installed

echo.
echo [INFO] System Information:
systeminfo | findstr /B /C:"OS Name" /C:"Total Physical Memory" 2>nul

echo.
echo [INFO] Memory Usage:
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:list 2>nul | findstr "="

echo.
echo [INFO] Port 3000 Status:
netstat -ano | findstr ":3000" || echo   Port 3000: Available

echo.
echo [INFO] Project Structure:
if exist "frontend" (
    echo   frontend/: EXISTS
    if exist "frontend\node_modules" (
        echo   node_modules/: EXISTS
    ) else (
        echo   node_modules/: MISSING
    )
    if exist "frontend\package.json" (
        echo   package.json: EXISTS
    ) else (
        echo   package.json: MISSING
    )
) else (
    echo   frontend/: MISSING
)

echo.
pause
goto :menu

:clean_all
cls
echo ================================================================
echo                      Clean All Caches                       
echo ================================================================
echo.
echo Cleaning all caches and temporary files...
echo.

echo [INFO] Cleaning npm cache...
npm cache clean --force

echo [INFO] Cleaning yarn cache...
yarn cache clean 2>nul

echo [INFO] Cleaning frontend dependencies...
if exist "frontend\node_modules" (
    echo   Removing node_modules...
    rmdir /s /q "frontend\node_modules"
)

if exist "frontend\package-lock.json" (
    echo   Removing package-lock.json...
    del /f /q "frontend\package-lock.json"
)

if exist "frontend\yarn.lock" (
    echo   Removing yarn.lock...
    del /f /q "frontend\yarn.lock"
)

echo [INFO] Cleaning system caches...
if exist "%APPDATA%\npm-cache" rmdir /s /q "%APPDATA%\npm-cache" 2>nul
if exist "%LOCALAPPDATA%\Yarn\Cache" rmdir /s /q "%LOCALAPPDATA%\Yarn\Cache" 2>nul

echo [OK] All caches cleaned
echo.
echo Now try one of the other solutions...
pause
goto :menu

:exit
echo.
echo Thank you for using AI Companion Solution Menu!
echo.
echo If you need further help, please check:
echo - scripts\STARTUP_SOLUTIONS.md (Detailed guide)
echo - docs\TROUBLESHOOTING.md (Troubleshooting guide)
echo.
pause
exit /b 0