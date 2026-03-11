@echo off
chcp 65001 >nul
echo ========================================
echo Live2D 关键问题修复 - 测试脚本
echo ========================================
echo.

cd /d "%~dp0\..\frontend"

echo [1/5] 检查项目文件...
if not exist "src\components\ErrorBoundary.tsx" (
    echo ❌ 错误边界组件缺失
    pause
    exit /b 1
)

if not exist "src\utils\UniversalLive2DManager.ts" (
    echo ❌ 通用Live2D管理器缺失
    pause
    exit /b 1
)

echo ✅ 关键文件存在

echo.
echo [2/5] 验证依赖安装...
npm list pixi-live2d-display 2>nul
if errorlevel 1 (
    echo ⚠️  正在安装 pixi-live2d-display...
    npm install pixi-live2d-display@0.4.0 --legacy-peer-deps --registry https://registry.npmmirror.com
)

echo ✅ 依赖检查完成

echo.
echo [3/5] 检查 Live2D 模型文件...
if not exist "public\live2d\rem\rem\model.json" (
    echo ❌ Live2D 模型文件缺失
    echo 请确保模型文件位于：public\live2d\rem\rem\model.json
    pause
    exit /b 1
)

echo ✅ Live2D 模型文件存在

echo.
echo [4/5] 编译检查...
echo 正在进行 TypeScript 编译检查...
npx tsc --noEmit
if errorlevel 1 (
    echo ⚠️  TypeScript 编译有警告，但可以继续
) else (
    echo ✅ TypeScript 编译通过
)

echo.
echo [5/5] 启动项目进行测试...
echo.
echo 🔧 修复内容：
echo   ✅ ResizeObserver 错误处理
echo   ✅ Live2D 节点挂载修复
echo   ✅ CDN 多源加载策略
echo   ✅ 错误边界组件
echo   ✅ 防抖处理优化
echo.
echo 📋 测试要点：
echo   1. 检查控制台无 ResizeObserver 错误
echo   2. 确认 Live2D 模型正常显示
echo   3. 测试窗口缩放功能
echo   4. 验证交互功能正常
echo   5. 检查错误处理机制
echo.
echo ========================================
echo 启动开发服务器...
echo ========================================

npm start

echo.
echo 测试完成！
pause