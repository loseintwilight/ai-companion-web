@echo off
chcp 65001 >nul
echo ========================================
echo Live2D 模型路径验证工具
echo ========================================
echo.

set "MODEL_DIR=ai-companion-web\frontend\public\live2d\rem\rem"

echo 📂 检查模型目录结构...
echo.

REM 检查主目录
if exist "%MODEL_DIR%" (
    echo ✅ 模型主目录存在: %MODEL_DIR%
) else (
    echo ❌ 模型主目录不存在: %MODEL_DIR%
    goto :error
)

REM 检查关键文件
echo.
echo 📋 检查关键文件:
echo.

if exist "%MODEL_DIR%\model.json" (
    echo ✅ model.json 存在
) else (
    echo ❌ model.json 不存在
)

if exist "%MODEL_DIR%\remu.moc" (
    echo ✅ remu.moc 存在
) else (
    echo ❌ remu.moc 不存在
)

if exist "%MODEL_DIR%\remu.physics.json" (
    echo ✅ remu.physics.json 存在
) else (
    echo ⚠️  remu.physics.json 不存在（可选）
)

if exist "%MODEL_DIR%\remu.pose.json" (
    echo ✅ remu.pose.json 存在
) else (
    echo ⚠️  remu.pose.json 不存在（可选）
)

if exist "%MODEL_DIR%\rem_config.json" (
    echo ✅ rem_config.json 存在
) else (
    echo ⚠️  rem_config.json 不存在（可选）
)

REM 检查纹理目录
echo.
echo 📂 检查纹理目录:
echo.

if exist "%MODEL_DIR%\remu2048" (
    echo ✅ 纹理目录存在: remu2048
    
    if exist "%MODEL_DIR%\remu2048\texture_00.png" (
        echo   ✅ texture_00.png 存在
    ) else (
        echo   ❌ texture_00.png 不存在
    )
    
    if exist "%MODEL_DIR%\remu2048\texture_01.png" (
        echo   ✅ texture_01.png 存在
    ) else (
        echo   ❌ texture_01.png 不存在
    )
) else (
    echo ❌ 纹理目录不存在: remu2048
)

REM 检查动作目录
echo.
echo 📂 检查动作目录:
echo.

if exist "%MODEL_DIR%\motions" (
    echo ✅ 动作目录存在: motions
    dir /b "%MODEL_DIR%\motions\*.mtn" 2>nul | find /c ".mtn" >nul
    if %errorlevel% equ 0 (
        echo   ✅ 找到动作文件
        dir /b "%MODEL_DIR%\motions\*.mtn" | findstr /n "^" | findstr "^[1-5]:"
    ) else (
        echo   ⚠️  未找到动作文件
    )
) else (
    echo ⚠️  动作目录不存在: motions（可选）
)

REM 检查语音目录
echo.
echo 📂 检查语音目录:
echo.

if exist "%MODEL_DIR%\voice" (
    echo ✅ 语音目录存在: voice
    dir /b "%MODEL_DIR%\voice\*.wav" 2>nul | find /c ".wav" >nul
    if %errorlevel% equ 0 (
        echo   ✅ 找到语音文件
    ) else (
        echo   ⚠️  未找到语音文件
    )
) else (
    echo ⚠️  语音目录不存在: voice（可选）
)

REM 显示 model.json 内容摘要
echo.
echo 📄 model.json 配置摘要:
echo.

if exist "%MODEL_DIR%\model.json" (
    findstr /C:"\"name\"" "%MODEL_DIR%\model.json"
    findstr /C:"\"model\"" "%MODEL_DIR%\model.json"
    findstr /C:"\"textures\"" "%MODEL_DIR%\model.json"
)

REM 检查前端路径配置
echo.
echo 🔧 检查前端路径配置:
echo.

set "LIVE2D_COMPONENT=ai-companion-web\frontend\src\components\Live2DCharacter.tsx"
if exist "%LIVE2D_COMPONENT%" (
    echo ✅ Live2DCharacter.tsx 存在
    findstr /C:"modelPath" "%LIVE2D_COMPONENT%" | findstr "live2d"
) else (
    echo ❌ Live2DCharacter.tsx 不存在
)

echo.
echo ========================================
echo 路径验证完成！
echo ========================================
echo.
echo 💡 提示:
echo   - 模型路径应该是: /live2d/rem/rem
echo   - 纹理路径应该是相对于模型目录的: remu2048/texture_00.png
echo   - 所有路径都使用正斜杠 (/) 而不是反斜杠 (\)
echo.
pause
exit /b 0

:error
echo.
echo ❌ 发现错误，请检查模型文件是否正确放置
echo.
pause
exit /b 1
