@echo off
echo ========================================
echo 实现 PIXI Live2D 方案
echo ========================================
echo.
echo 这个脚本会自动完成以下操作：
echo 1. 安装必要的 npm 依赖
echo 2. 备份当前的 Live2DCharacter 组件
echo 3. 使用新的 PIXI 版本组件
echo 4. 重启开发服务器
echo.
echo 前提条件：
echo - simple-live2d-test.html 测试已成功
echo - 你已经看到模型在测试页面显示
echo.
pause

cd ai-companion-web\frontend

echo.
echo ========================================
echo 步骤 1: 安装 npm 依赖
echo ========================================
echo.
echo 正在安装 pixi.js 和 pixi-live2d-display...
echo.

call npm install pixi.js@6.5.10 pixi-live2d-display@0.4.0

if errorlevel 1 (
    echo.
    echo ❌ 依赖安装失败！
    echo 请检查网络连接或手动运行：
    echo   cd ai-companion-web\frontend
    echo   npm install pixi.js@6.5.10 pixi-live2d-display@0.4.0
    pause
    exit /b 1
)

echo.
echo ✅ 依赖安装成功！
echo.

echo ========================================
echo 步骤 2: 备份当前组件
echo ========================================
echo.

if exist "src\components\Live2DCharacter.tsx" (
    if not exist "src\components\Live2DCharacter.OLD.tsx" (
        copy "src\components\Live2DCharacter.tsx" "src\components\Live2DCharacter.OLD.tsx"
        echo ✅ 已备份 Live2DCharacter.tsx 为 Live2DCharacter.OLD.tsx
    ) else (
        echo ⚠️  备份文件已存在，跳过备份
    )
) else (
    echo ⚠️  Live2DCharacter.tsx 不存在
)

echo.
echo ========================================
echo 步骤 3: 使用新版本组件
echo ========================================
echo.

if exist "src\components\Live2DCharacter.PIXI.tsx" (
    copy /Y "src\components\Live2DCharacter.PIXI.tsx" "src\components\Live2DCharacter.tsx"
    echo ✅ 已使用新的 PIXI 版本组件
) else (
    echo ❌ Live2DCharacter.PIXI.tsx 不存在！
    echo 请确保文件已创建。
    pause
    exit /b 1
)

echo.
echo ========================================
echo 步骤 4: 验证文件
echo ========================================
echo.

echo 检查必要文件...
echo.

if exist "src\utils\PixiLive2DManager.ts" (
    echo ✅ PixiLive2DManager.ts 存在
) else (
    echo ❌ PixiLive2DManager.ts 不存在！
    pause
    exit /b 1
)

if exist "public\lib\live2d.min.js" (
    echo ✅ live2d.min.js 存在
) else (
    echo ⚠️  live2d.min.js 不存在（将使用 CDN）
)

if exist "public\live2d\rem\rem\model.json" (
    echo ✅ model.json 存在
) else (
    echo ❌ model.json 不存在！
    pause
    exit /b 1
)

echo.
echo ========================================
echo 步骤 5: 启动开发服务器
echo ========================================
echo.
echo 正在启动前端服务器...
echo.
echo 请在浏览器中访问: http://localhost:3000
echo.
echo 预期结果：
echo - ✅ 看到 Rem 模型显示在聊天界面
echo - ✅ 控制台无错误信息
echo - ✅ 模型可以响应交互
echo.
echo 如果出现问题：
echo 1. 按 Ctrl+C 停止服务器
echo 2. 查看控制台错误信息
echo 3. 运行 scripts\rollback-pixi-live2d.bat 回滚
echo.
pause

start http://localhost:3000

npm start
