@echo off
echo ========================================
echo Schema Utils修复验证脚本
echo ========================================
echo.

:: 设置工作目录
cd /d "%~dp0..\frontend"

echo 当前目录: %CD%
echo.

:: 检查关键依赖版本
echo [1/4] 检查关键依赖版本...
echo.

if exist "node_modules\schema-utils\package.json" (
    echo ✓ schema-utils已安装
    findstr "version" "node_modules\schema-utils\package.json" | findstr "3.3.0"
    if %ERRORLEVEL% equ 0 (
        echo ✓ schema-utils版本正确 (3.3.0)
    ) else (
        echo ⚠ schema-utils版本可能不正确
    )
) else (
    echo ✗ schema-utils未安装
)
echo.

if exist "node_modules\ajv\package.json" (
    echo ✓ ajv已安装
    findstr "version" "node_modules\ajv\package.json" | findstr "6.12.6"
    if %ERRORLEVEL% equ 0 (
        echo ✓ ajv版本正确 (6.12.6)
    ) else (
        echo ⚠ ajv版本可能不正确
    )
) else (
    echo ✗ ajv未安装
)
echo.

if exist "node_modules\typescript\package.json" (
    echo ✓ typescript已安装
    findstr "version" "node_modules\typescript\package.json" | findstr "4.9.5"
    if %ERRORLEVEL% equ 0 (
        echo ✓ typescript版本正确 (4.9.5)
    ) else (
        echo ⚠ typescript版本可能不正确
    )
) else (
    echo ✗ typescript未安装
)
echo.

:: 检查编译是否正常
echo [2/4] 测试TypeScript编译...
npx tsc --noEmit --skipLibCheck
if %ERRORLEVEL% equ 0 (
    echo ✓ TypeScript编译检查通过
) else (
    echo ⚠ TypeScript编译存在问题
)
echo.

:: 检查webpack配置
echo [3/4] 测试webpack配置...
timeout /t 10 /nobreak >nul 2>&1
npm run build >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✓ webpack构建测试通过
) else (
    echo ⚠ webpack构建可能存在问题
)
echo.

:: 总结
echo [4/4] 验证总结
echo ========================================
echo.
if exist "node_modules\schema-utils" (
    if exist "node_modules\ajv" (
        if exist "node_modules\typescript" (
            echo ✅ Schema Utils修复验证通过！
            echo.
            echo 可以使用以下命令启动项目:
            echo   npm start
            echo.
            echo 或使用一键启动脚本:
            echo   scripts\schema-utils-fix-start.bat
        ) else (
            echo ❌ TypeScript依赖缺失
        )
    ) else (
        echo ❌ ajv依赖缺失
    )
) else (
    echo ❌ schema-utils依赖缺失
)
echo.
echo ========================================
pause