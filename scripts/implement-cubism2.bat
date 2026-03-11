@echo off
echo ========================================
echo 实现 Cubism 2 方案到主应用
echo ========================================
echo.
echo 这个脚本会：
echo 1. 备份当前的 Live2DCharacter 组件
echo 2. 使用新的 Cubism2 版本
echo 3. 重启开发服务器
echo.
pause

cd ai-companion-web\frontend

echo.
echo ========================================
echo 步骤 1: 备份当前组件
echo ========================================
echo.

if exist "src\components\Live2DCharacter.tsx" (
    if not exist "src\components\Live2DCharacter.OLD2.tsx" (
        copy "src\components\Live2DCharacter.tsx" "src\components\Live2DCharacter.OLD2.tsx"
        echo ✅ 已备份 Live2DCharacter.tsx 为 Live2DCharacter.OLD2.tsx
    ) else (
        echo ⚠️  备份文件已存在，跳过备份
    )
) else (
    echo ⚠️  Live2DCharacter.tsx 不存在
)

echo.
echo ========================================
echo 步骤 2: 使用新版本组件
echo ========================================
echo.

if exist "src\components\Live2DCharacter.Cubism2.tsx" (
    copy /Y "src\components\Live2DCharacter.Cubism2.tsx" "src\components\Live2DCharacter.tsx"
    echo ✅ 已使用新的 Cubism2 版本组件
) else (
    echo ❌ Live2DCharacter.Cubism2.tsx 不存在！
    pause
    exit /b 1
)

echo.
echo ========================================
echo 步骤 3: 验证文件
echo ========================================
echo.

if exist "src\utils\Cubism2Manager.ts" (
    echo ✅ Cubism2Manager.ts 存在
) else (
    echo ❌ Cubism2Manager.ts 不存在！
    pause
    exit /b 1
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
echo 步骤 4: 启动开发服务器
echo ========================================
echo.
echo 正在启动前端服务器...
echo.
echo 请在浏览器中访问: http://localhost:3000
echo.
echo 预期结果：
echo - ✅ 看到 "Live2D 已加载" 指示器
echo - ✅ 控制台显示加载成功的日志
echo - ⚠️  模型可能不完全渲染（使用备用实现）
echo.
echo 如果出现问题：
echo 1. 按 Ctrl+C 停止服务器
echo 2. 运行 scripts\rollback-cubism2.bat 回滚
echo.
pause

start http://localhost:3000

npm start
