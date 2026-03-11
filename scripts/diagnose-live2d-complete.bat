@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Live2D 完整诊断脚本
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"
if errorlevel 1 (
    echo [错误] 无法进入前端目录
    pause
    exit /b 1
)

echo [信息] 诊断目录: %CD%
echo.

:: 1. 环境检查
echo [诊断 1] 环境检查
echo ----------------------------------------
node --version 2>nul
if errorlevel 1 (
    echo [❌] Node.js 未安装
) else (
    echo [✅] Node.js 已安装
)

npm --version 2>nul
if errorlevel 1 (
    echo [❌] npm 未安装
) else (
    echo [✅] npm 已安装
)

yarn --version 2>nul
if errorlevel 1 (
    echo [ℹ️] yarn 未安装 ^(可选^)
) else (
    echo [✅] yarn 已安装
)
echo.

:: 2. 文件结构检查
echo [诊断 2] 文件结构检查
echo ----------------------------------------

:: 检查关键文件
set "files_to_check=package.json public\index.html public\lib\live2dcubismcore.min.js public\live2d\rem\rem\model.json src\utils\UniversalLive2DManager.ts src\components\Live2DCharacter.tsx"

for %%f in (%files_to_check%) do (
    if exist "%%f" (
        echo [✅] %%f
    ) else (
        echo [❌] %%f ^(缺失^)
    )
)
echo.

:: 3. Cubism Core 文件详细检查
echo [诊断 3] Cubism Core 文件检查
echo ----------------------------------------
if exist "public\lib\live2dcubismcore.min.js" (
    for %%A in ("public\lib\live2dcubismcore.min.js") do (
        set filesize=%%~zA
        echo [✅] Cubism Core 文件存在
        echo [ℹ️] 文件大小: !filesize! 字节
        
        if !filesize! LSS 5000 (
            echo [⚠️] 文件较小，可能是占位符实现
            echo [ℹ️] 建议下载官方 live2dcubismcore.min.js
        ) else if !filesize! LSS 50000 (
            echo [ℹ️] 使用增强本地实现
        ) else (
            echo [✅] 可能是官方完整实现
        )
    )
    
    :: 检查文件内容特征
    findstr /C:"Enhanced local Cubism Core" "public\lib\live2dcubismcore.min.js" >nul 2>&1
    if not errorlevel 1 (
        echo [ℹ️] 检测到增强本地实现
    )
    
    findstr /C:"Live2D Inc" "public\lib\live2dcubismcore.min.js" >nul 2>&1
    if not errorlevel 1 (
        echo [✅] 检测到官方实现特征
    )
) else (
    echo [❌] Cubism Core 文件不存在
)
echo.

:: 4. Live2D 模型文件检查
echo [诊断 4] Live2D 模型文件检查
echo ----------------------------------------
if exist "public\live2d\rem\rem\model.json" (
    echo [✅] 模型配置文件存在
    
    :: 检查模型版本
    findstr /C:"Version" "public\live2d\rem\rem\model.json" >nul 2>&1
    if not errorlevel 1 (
        echo [ℹ️] 检测到版本信息
        for /f "tokens=2 delims=:" %%a in ('findstr /C:"Version" "public\live2d\rem\rem\model.json"') do (
            echo [ℹ️] 模型版本: %%a
        )
    )
    
    :: 检查纹理文件
    if exist "public\live2d\rem\rem\*.png" (
        echo [✅] 纹理文件存在
    ) else (
        echo [❌] 纹理文件缺失
    )
    
    :: 检查 MOC 文件
    if exist "public\live2d\rem\rem\*.moc3" (
        echo [✅] MOC3 文件存在 ^(Cubism 3/4^)
    ) else if exist "public\live2d\rem\rem\*.moc" (
        echo [✅] MOC 文件存在 ^(Cubism 2^)
    ) else (
        echo [❌] MOC 文件缺失
    )
) else (
    echo [❌] 模型配置文件不存在
)
echo.

:: 5. 依赖检查
echo [诊断 5] 依赖检查
echo ----------------------------------------
if exist "node_modules" (
    echo [✅] node_modules 目录存在
    
    :: 检查关键依赖
    if exist "node_modules\pixi.js" (
        echo [✅] pixi.js 已安装
    ) else (
        echo [❌] pixi.js 未安装
    )
    
    if exist "node_modules\pixi-live2d-display" (
        echo [✅] pixi-live2d-display 已安装
    ) else (
        echo [❌] pixi-live2d-display 未安装
    )
    
    if exist "node_modules\typescript" (
        echo [✅] typescript 已安装
    ) else (
        echo [❌] typescript 未安装
    )
    
    if exist "node_modules\react-scripts" (
        echo [✅] react-scripts 已安装
    ) else (
        echo [❌] react-scripts 未安装
    )
) else (
    echo [❌] node_modules 目录不存在
    echo [ℹ️] 需要运行 npm install
)
echo.

:: 6. 配置文件检查
echo [诊断 6] 配置文件检查
echo ----------------------------------------

:: 检查 package.json 中的关键配置
if exist "package.json" (
    findstr /C:"pixi-live2d-display" "package.json" >nul 2>&1
    if not errorlevel 1 (
        echo [✅] pixi-live2d-display 在 package.json 中
    ) else (
        echo [❌] pixi-live2d-display 不在 package.json 中
    )
    
    findstr /C:"typescript.*4.9.5" "package.json" >nul 2>&1
    if not errorlevel 1 (
        echo [✅] TypeScript 版本锁定为 4.9.5
    ) else (
        echo [⚠️] TypeScript 版本可能有冲突
    )
    
    findstr /C:"schema-utils.*3.3.0" "package.json" >nul 2>&1
    if not errorlevel 1 (
        echo [✅] schema-utils 版本锁定为 3.3.0
    ) else (
        echo [⚠️] schema-utils 版本可能有冲突
    )
)

:: 检查 .npmrc
if exist ".npmrc" (
    echo [✅] .npmrc 配置文件存在
    findstr /C:"legacy-peer-deps" ".npmrc" >nul 2>&1
    if not errorlevel 1 (
        echo [✅] legacy-peer-deps 已配置
    )
) else (
    echo [⚠️] .npmrc 配置文件不存在
)
echo.

:: 7. 编译检查
echo [诊断 7] 编译检查
echo ----------------------------------------
if exist "node_modules" (
    echo [ℹ️] 运行 TypeScript 编译检查...
    npx tsc --noEmit >nul 2>&1
    if errorlevel 1 (
        echo [⚠️] TypeScript 编译检查发现问题
        echo [ℹ️] 运行 'npx tsc --noEmit' 查看详细错误
    ) else (
        echo [✅] TypeScript 编译检查通过
    )
) else (
    echo [⚠️] 无法进行编译检查，需要先安装依赖
)
echo.

:: 8. 生成诊断报告
echo [诊断 8] 生成诊断报告
echo ----------------------------------------

set "report_file=live2d-diagnostic-report.txt"
echo Live2D 诊断报告 > "%report_file%"
echo 生成时间: %date% %time% >> "%report_file%"
echo. >> "%report_file%"

echo 环境信息: >> "%report_file%"
node --version >> "%report_file%" 2>&1
npm --version >> "%report_file%" 2>&1
echo. >> "%report_file%"

echo 文件检查结果: >> "%report_file%"
for %%f in (%files_to_check%) do (
    if exist "%%f" (
        echo [存在] %%f >> "%report_file%"
    ) else (
        echo [缺失] %%f >> "%report_file%"
    )
)

echo [✅] 诊断报告已生成: %report_file%
echo.

:: 9. 修复建议
echo [诊断 9] 修复建议
echo ----------------------------------------

:: 检查是否需要安装依赖
if not exist "node_modules" (
    echo [建议] 运行依赖安装:
    echo   fix-live2d-complete.bat
    echo.
)

:: 检查是否需要获取官方 Cubism Core
if exist "public\lib\live2dcubismcore.min.js" (
    for %%A in ("public\lib\live2dcubismcore.min.js") do (
        set filesize=%%~zA
        if !filesize! LSS 50000 (
            echo [建议] 获取官方 Cubism Core:
            echo   1. 访问 https://www.live2d.com/download/cubism-sdk/
            echo   2. 下载 "Cubism SDK for Web"
            echo   3. 解压后找到 Core/live2dcubismcore.min.js
            echo   4. 替换 public/lib/live2dcubismcore.min.js
            echo.
        )
    )
)

:: 检查模型文件
if not exist "public\live2d\rem\rem\model.json" (
    echo [建议] 确保 Live2D 模型文件完整:
    echo   - model.json ^(模型配置^)
    echo   - *.moc3 或 *.moc ^(模型数据^)
    echo   - *.png ^(纹理文件^)
    echo   - *.json ^(动作和表情文件^)
    echo.
)

echo ========================================
echo 诊断完成！
echo ========================================
echo.
echo 如需修复问题，请运行: fix-live2d-complete.bat
echo 如需查看详细报告，请打开: %report_file%
echo.
pause