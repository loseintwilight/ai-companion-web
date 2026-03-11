@echo off
echo ========================================
echo Live2D 静态资源访问诊断
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"

echo [信息] 诊断时间: %date% %time%
echo [信息] 当前目录: %CD%
echo.

echo [对比] 文档要求 vs 实际结构...
echo.

echo 📋 文档要求的目录结构:
echo   live2d/rem/rem/
echo   ├── rem_config.json
echo   ├── rem.model3.json          (Cubism 4)
echo   ├── motions/*.motion3.json   (Cubism 4)
echo   ├── remu2048/texture_*.png
echo   └── expressions/*.exp3.json
echo.

echo 📋 实际的目录结构:
if exist "public\live2d\rem\rem" (
    echo   live2d/rem/rem/ ✅ 存在
    dir /B "public\live2d\rem\rem" | findstr /V ".DS_Store"
) else (
    echo   live2d/rem/rem/ ❌ 不存在
)

echo.
echo [检查] React 开发服务器配置...
echo.

:: 检查 package.json 中的服务器配置
echo 📋 package.json 服务器配置:
if exist "package.json" (
    findstr /C:"start" package.json
    findstr /C:"proxy" package.json
    findstr /C:"homepage" package.json
) else (
    echo ❌ package.json 不存在
)

echo.
echo [检查] public 目录权限...
echo.

:: 检查 public 目录及其子目录的权限
echo 📁 public 目录:
if exist "public" (
    echo ✅ public 目录存在
    attrib public
) else (
    echo ❌ public 目录不存在
    goto :error
)

echo.
echo 📁 live2d 目录:
if exist "public\live2d" (
    echo ✅ live2d 目录存在
    attrib "public\live2d"
) else (
    echo ❌ live2d 目录不存在
    goto :error
)

echo.
echo [检查] 关键资源文件...
echo.

set "RESOURCE_BASE=public\live2d\rem\rem"

:: 检查配置文件
if exist "%RESOURCE_BASE%\rem_config.json" (
    echo ✅ rem_config.json 存在
    for %%A in ("%RESOURCE_BASE%\rem_config.json") do echo    大小: %%~zA 字节
) else (
    echo ❌ rem_config.json 不存在
)

if exist "%RESOURCE_BASE%\model.json" (
    echo ✅ model.json 存在
    for %%A in ("%RESOURCE_BASE%\model.json") do echo    大小: %%~zA 字节
) else (
    echo ❌ model.json 不存在
)

:: 检查纹理文件
if exist "%RESOURCE_BASE%\remu2048\texture_00.png" (
    echo ✅ texture_00.png 存在
    for %%A in ("%RESOURCE_BASE%\remu2048\texture_00.png") do echo    大小: %%~zA 字节
    attrib "%RESOURCE_BASE%\remu2048\texture_00.png"
) else (
    echo ❌ texture_00.png 不存在
)

if exist "%RESOURCE_BASE%\remu2048\texture_01.png" (
    echo ✅ texture_01.png 存在
    for %%A in ("%RESOURCE_BASE%\remu2048\texture_01.png") do echo    大小: %%~zA 字节
    attrib "%RESOURCE_BASE%\remu2048\texture_01.png"
) else (
    echo ❌ texture_01.png 不存在
)

:: 检查模型文件
if exist "%RESOURCE_BASE%\remu.moc" (
    echo ✅ remu.moc 存在 (Cubism 2)
    for %%A in ("%RESOURCE_BASE%\remu.moc") do echo    大小: %%~zA 字节
) else (
    echo ❌ remu.moc 不存在
)

echo.
echo [分析] 500 错误可能原因...
echo.

echo 🔍 React 开发服务器静态文件服务分析:
echo   1. React 开发服务器默认服务 public 目录下的所有文件
echo   2. 访问路径应该是: http://localhost:3000/live2d/rem/rem/...
echo   3. 500 错误表示服务器内部错误，不是文件不存在 (404)
echo.

echo 💡 可能的问题:
echo   1. React 开发服务器未正确启动
echo   2. public 目录配置有问题
echo   3. 文件权限限制
echo   4. 路径中包含特殊字符或编码问题
echo   5. 防病毒软件或安全软件拦截
echo   6. Windows 文件系统权限问题
echo.

echo [建议] 解决步骤:
echo   1. 重启 React 开发服务器
echo   2. 检查控制台是否有错误信息
echo   3. 尝试访问其他 public 目录下的文件 (如 manifest.json)
echo   4. 检查文件路径是否包含中文或特殊字符
echo   5. 临时关闭防病毒软件测试
echo.

echo 诊断完成！
echo.
echo 下一步: 运行 npm start 启动服务器，然后访问:
echo   http://localhost:3000/manifest.json (测试基础静态文件)
echo   http://localhost:3000/live2d/rem/rem/rem_config.json (测试配置文件)
echo   http://localhost:3000/live2d/rem/rem/remu2048/texture_00.png (测试纹理文件)
echo.

pause

goto :end

:error
echo.
echo ❌ 发现关键目录缺失，无法继续！
echo.
pause
exit /b 1

:end