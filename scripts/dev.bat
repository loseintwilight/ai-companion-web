@echo off
REM AI伴侣Web应用开发启动脚本 (Windows)

echo 🚀 启动AI伴侣Web应用开发环境...

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装，请先安装Python 3.9+
    pause
    exit /b 1
)

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装Node.js 16+
    pause
    exit /b 1
)

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装，请先安装npm
    pause
    exit /b 1
)

echo ✅ 依赖检查完成

REM 安装后端依赖
echo 📦 安装后端依赖...
cd backend

REM 创建虚拟环境（如果不存在）
if not exist "venv" (
    echo 创建Python虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境并安装依赖
call venv\Scripts\activate.bat
pip install -r requirements.txt

cd ..
echo ✅ 后端依赖安装完成

REM 安装前端依赖
echo 📦 安装前端依赖...
cd frontend
npm install
cd ..
echo ✅ 前端依赖安装完成

REM 创建日志目录
if not exist "logs" mkdir logs

echo 🔥 启动开发服务器...
echo 🌐 前端地址: http://localhost:3000
echo 🔧 后端API: http://localhost:8000
echo 📚 API文档: http://localhost:8000/docs
echo.
echo ⏹️  按 Ctrl+C 停止服务器
echo.

REM 启动后端服务器（新窗口）
start "AI伴侣后端" cmd /k "cd backend && venv\Scripts\activate.bat && python main.py"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端服务器（新窗口）
start "AI伴侣前端" cmd /k "cd frontend && npm start"

echo 🎉 开发环境启动完成！
pause