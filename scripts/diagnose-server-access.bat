@echo off
echo ========================================
echo Live2D 服务器访问问题诊断
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"

echo [信息] 诊断时间: %date% %time%
echo [信息] 当前目录: %CD%
echo.

echo [检查] React 开发服务器配置...
echo.

:: 检查 package.json 中的服务器配置
echo 📋 package.json 配置:
findstr /C:"start" package.json
findstr /C:"proxy" package.json
echo.

:: 检查文件权限和属性
echo [检查] 纹理文件权限和属性...
echo.

set "TEXTURE_DIR=public\live2d\rem\rem\remu2048"

if exist "%TEXTURE_DIR%\texture_00.png" (
    echo ✅ texture_00.png 存在
    for %%A in ("%TEXTURE_DIR%\texture_00.png") do echo    大小: %%~zA 字节
    attrib "%TEXTURE_DIR%\texture_00.png"
    echo    完整路径: %CD%\%TEXTURE_DIR%\texture_00.png
) else (
    echo ❌ texture_00.png 不存在
)

if exist "%TEXTURE_DIR%\texture_01.png" (
    echo ✅ texture_01.png 存在
    for %%A in ("%TEXTURE_DIR%\texture_01.png") do echo    大小: %%~zA 字节
    attrib "%TEXTURE_DIR%\texture_01.png"
    echo    完整路径: %CD%\%TEXTURE_DIR%\texture_01.png
) else (
    echo ❌ texture_01.png 不存在
)

echo.
echo [检查] public 目录结构...
echo.

echo 📁 public 目录结构:
dir /B public
echo.

echo 📁 live2d 目录结构:
if exist "public\live2d" (
    dir /B public\live2d
) else (
    echo ❌ live2d 目录不存在
)

echo.
echo [分析] 可能的 500 错误原因:
echo.
echo 🔍 根据文档分析:
echo   1. React 开发服务器默认服务 public 目录
echo   2. 纹理文件应该通过 /live2d/rem/rem/remu2048/texture_*.png 访问
echo   3. 500 错误通常表示服务器内部错误，而非文件不存在 (404)
echo.
echo 💡 可能的解决方案:
echo   1. 检查 React 开发服务器是否正确启动
echo   2. 验证 public 目录的静态文件服务配置
echo   3. 检查文件路径中的特殊字符或编码问题
echo   4. 确认没有中间件拦截静态文件请求
echo.

echo [建议] 下一步操作:
echo   1. 启动开发服务器: npm start
echo   2. 手动访问: http://localhost:3000/live2d/rem/rem/remu2048/texture_00.png
echo   3. 检查浏览器网络面板的详细错误信息
echo   4. 查看开发服务器控制台的错误日志
echo.

echo 诊断完成！按任意键退出...
pause >nul