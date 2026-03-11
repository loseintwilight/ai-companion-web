@echo off
echo ========================================
echo 回滚 Cubism2 实现
echo ========================================
echo.
echo 这个脚本会恢复旧版本的 Live2DCharacter 组件
echo.
pause

cd ai-companion-web\frontend

echo.
echo ========================================
echo 恢复旧版本组件
echo ========================================
echo.

if exist "src\components\Live2DCharacter.OLD2.tsx" (
    copy /Y "src\components\Live2DCharacter.OLD2.tsx" "src\components\Live2DCharacter.tsx"
    echo ✅ 已恢复旧版本 Live2DCharacter.tsx
) else (
    echo ❌ 备份文件 Live2DCharacter.OLD2.tsx 不存在！
    echo 无法回滚。
    pause
    exit /b 1
)

echo.
echo ========================================
echo 重启开发服务器
echo ========================================
echo.

start http://localhost:3000

npm start
