@echo off
REM AI伴侣Web应用构建脚本 (Windows)

echo 🔨 构建AI伴侣Web应用...

REM 创建构建目录
if not exist "dist" mkdir dist

REM 构建前端
echo 📦 构建前端应用...
cd frontend
call npm run build
cd ..

REM 复制前端构建文件到dist目录
echo 📁 复制前端构建文件...
xcopy /E /I /Y frontend\build\* dist\

REM 复制后端文件到dist目录
echo 📁 复制后端文件...
if not exist "dist\api" mkdir dist\api
xcopy /E /I /Y backend\* dist\api\

REM 创建生产环境配置文件
echo ⚙️  创建生产环境配置...
(
echo DEBUG=false
echo HOST=0.0.0.0
echo PORT=8000
echo DATABASE_URL=sqlite+aiosqlite:///./ai_companion.db
echo.
echo # 请配置您的AI模型API密钥
echo OPENAI_API_KEY=
echo BYTEDANCE_API_KEY=
echo BAIDU_API_KEY=
echo BAIDU_SECRET_KEY=
echo.
echo DEFAULT_AI_PROVIDER=openai
echo RATE_LIMIT_REQUESTS=60
echo RATE_LIMIT_WINDOW=60
echo LOG_LEVEL=INFO
) > dist\api\.env

REM 创建Windows启动脚本
echo 🚀 创建生产环境启动脚本...
(
echo @echo off
echo echo 🚀 启动AI伴侣Web应用生产环境...
echo.
echo REM 进入API目录
echo cd api
echo.
echo REM 检查Python虚拟环境
echo if not exist "venv" ^(
echo     echo 创建Python虚拟环境...
echo     python -m venv venv
echo ^)
echo.
echo REM 激活虚拟环境并安装依赖
echo call venv\Scripts\activate.bat
echo pip install -r requirements.txt
echo.
echo REM 启动应用
echo echo 启动服务器...
echo python main.py
echo pause
) > dist\start.bat

echo ✅ 构建完成！
echo.
echo 📁 构建文件位置: dist\
echo 🚀 生产环境启动: cd dist && start.bat
pause