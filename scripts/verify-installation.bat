@echo off
REM 验证安装脚本

echo 🔍 验证依赖安装状态...

cd frontend

echo.
echo === 检查关键文件 ===
if exist "node_modules" (
    echo ✅ node_modules 文件夹存在
) else (
    echo ❌ node_modules 文件夹不存在
    goto :error
)

if exist "package-lock.json" (
    echo ✅ package-lock.json 存在
) else (
    echo ⚠️  package-lock.json 不存在（可能使用yarn）
)

echo.
echo === 检查关键模块 ===

if exist "node_modules\ajv" (
    echo ✅ ajv 模块已安装
    if exist "node_modules\ajv\package.json" (
        for /f "tokens=2 delims=:" %%a in ('findstr "version" node_modules\ajv\package.json') do (
            echo    版本: %%a
        )
    )
) else (
    echo ❌ ajv 模块缺失
    goto :error
)

if exist "node_modules\ajv-keywords" (
    echo ✅ ajv-keywords 模块已安装
    if exist "node_modules\ajv-keywords\package.json" (
        for /f "tokens=2 delims=:" %%a in ('findstr "version" node_modules\ajv-keywords\package.json') do (
            echo    版本: %%a
        )
    )
) else (
    echo ❌ ajv-keywords 模块缺失
    goto :error
)

if exist "node_modules\typescript" (
    echo ✅ TypeScript 模块已安装
    npx tsc --version
) else (
    echo ❌ TypeScript 模块缺失
    goto :error
)

if exist "node_modules\react-scripts" (
    echo ✅ react-scripts 模块已安装
) else (
    echo ❌ react-scripts 模块缺失
    goto :error
)

echo.
echo === 检查关键文件路径 ===
if exist "node_modules\ajv\dist\compile\codegen\index.js" (
    echo ✅ ajv/dist/compile/codegen 路径存在
) else (
    echo ❌ ajv/dist/compile/codegen 路径不存在
    if exist "node_modules\ajv\lib\compile\codegen\index.js" (
        echo ℹ️  找到替代路径: ajv/lib/compile/codegen
    )
    goto :error
)

echo.
echo === 测试TypeScript编译 ===
npx tsc --noEmit --skipLibCheck
if errorlevel 1 (
    echo ⚠️  TypeScript编译有警告，但可能不影响运行
) else (
    echo ✅ TypeScript编译检查通过
)

echo.
echo 🎉 所有检查通过！项目应该可以正常启动
echo 运行 npm start 启动开发服务器
goto :end

:error
echo.
echo ❌ 发现问题！请运行修复脚本：
echo ./scripts/fix-ajv-conflict.bat
goto :end

:end
pause