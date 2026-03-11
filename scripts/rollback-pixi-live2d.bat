@echo off
echo ========================================
echo 回滚 PIXI Live2D 实现
echo ========================================
echo.
echo 这个脚本会：
echo 1. 恢复旧版本的 Live2DCharacter 组件
echo 2. 重启开发服务器
echo.
echo 注意：不会卸载已安装的 npm 包
echo.
pause

cd ai-companion-web\frontend

echo.
echo ========================================
echo 恢复旧版本组件
echo ========================================
echo.

if exist "src\components\Live2DCharacter.OLD.tsx" (
    copy /Y "src\components\Live2DCharacter.OLD.tsx" "src\components\Live2DCharacter.tsx"
    echo ✅ 已恢复旧版本 Live2DCharacter.tsx
) else (
    echo ❌ 备份文件 Live2DCharacter.OLD.tsx 不存在！
    echo 无法回滚。
    pause
    exit /b 1
)

echo.
echo ========================================
echo 重启开发服务器
echo ========================================
echo.
echo 正在启动前端服务器...
echo.

start http://localhost:3000

npm start
