@echo off
echo ========================================
echo Live2D 纹理加载问题诊断
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"

echo [信息] 诊断时间: %date% %time%
echo [信息] 当前目录: %CD%
echo.

echo [检查] 纹理文件存在性验证...
echo.

set "TEXTURE_DIR=public\live2d\rem\rem\remu2048"

:: 检查纹理文件
if exist "%TEXTURE_DIR%\texture_00.png" (
    echo ✅ texture_00.png 存在
    for %%A in ("%TEXTURE_DIR%\texture_00.png") do echo    大小: %%~zA 字节
) else (
    echo ❌ texture_00.png 缺失
    goto :error
)

if exist "%TEXTURE_DIR%\texture_01.png" (
    echo ✅ texture_01.png 存在
    for %%A in ("%TEXTURE_DIR%\texture_01.png") do echo    大小: %%~zA 字节
) else (
    echo ❌ texture_01.png 缺失
    goto :error
)

echo.
echo [检查] 文件权限和属性...

:: 检查文件属性
attrib "%TEXTURE_DIR%\texture_00.png"
attrib "%TEXTURE_DIR%\texture_01.png"

echo.
echo [检查] 路径结构验证...
echo 完整路径结构:
echo   - public/live2d/rem/rem/model.json
echo   - public/live2d/rem/rem/remu2048/texture_00.png
echo   - public/live2d/rem/rem/remu2048/texture_01.png
echo.

echo [检查] 模型配置中的纹理路径...
findstr /C:"remu2048/texture_00.png" "public\live2d\rem\rem\model.json" >nul
if %errorlevel%==0 (
    echo ✅ texture_00.png 路径配置正确
) else (
    echo ❌ texture_00.png 路径配置错误
)

findstr /C:"remu2048/texture_01.png" "public\live2d\rem\rem\model.json" >nul
if %errorlevel%==0 (
    echo ✅ texture_01.png 路径配置正确
) else (
    echo ❌ texture_01.png 路径配置错误
)

echo.
echo [分析] 可能的 500 错误原因:
echo   1. 开发服务器静态文件服务配置问题
echo   2. 文件权限或访问限制
echo   3. 文件路径大小写敏感问题
echo   4. 文件损坏或格式问题
echo   5. React 开发服务器的 public 目录配置
echo.

echo [建议] 修复步骤:
echo   1. 检查 React 开发服务器是否正确服务 public 目录
echo   2. 验证纹理文件的完整性
echo   3. 检查文件路径的大小写匹配
echo   4. 添加纹理加载的错误处理和重试机制
echo.

echo 诊断完成！按任意键继续...
pause >nul

goto :end

:error
echo.
echo ❌ 发现关键文件缺失，无法继续！
echo.
pause
exit /b 1

:end