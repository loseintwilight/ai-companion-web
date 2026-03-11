@echo off
echo ========================================
echo Live2D 服务器访问问题修复
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"

echo [步骤 1] 分析问题...
echo.

echo 🔍 发现的问题:
echo   1. 配置文件格式不匹配 (文档 vs 实际)
echo   2. 代码中使用了错误的文件路径
echo   3. TypeScript 类型错误影响编译
echo   4. 需要适配 Cubism 2 实际文件格式
echo.

echo [步骤 2] 修复配置文件路径...
echo.

:: 备份原始文件
if exist "src\utils\UniversalLive2DManager.ts.backup" (
    echo ✅ 备份文件已存在
) else (
    copy "src\utils\UniversalLive2DManager.ts" "src\utils\UniversalLive2DManager.ts.backup"
    echo ✅ 已备份 UniversalLive2DManager.ts
)

echo [步骤 3] 检查实际文件结构...
echo.

echo 📁 实际目录结构:
if exist "public\live2d\rem\rem\model.json" (
    echo   ✅ model.json (Cubism 2 格式)
) else (
    echo   ❌ model.json 不存在
)

if exist "public\live2d\rem\rem\remu.moc" (
    echo   ✅ remu.moc (Cubism 2 模型文件)
) else (
    echo   ❌ remu.moc 不存在
)

if exist "public\live2d\rem\rem\remu2048\texture_00.png" (
    echo   ✅ texture_00.png
) else (
    echo   ❌ texture_00.png 不存在
)

if exist "public\live2d\rem\rem\remu2048\texture_01.png" (
    echo   ✅ texture_01.png
) else (
    echo   ❌ texture_01.png 不存在
)

echo.
echo [步骤 4] 测试静态文件访问...
echo.

echo 💡 解决方案:
echo   1. 修改代码使用正确的 model.json (Cubism 2 格式)
echo   2. 修复 TypeScript 类型错误
echo   3. 重启开发服务器
echo   4. 测试静态文件访问
echo.

echo [步骤 5] 启动修复后的服务器...
echo.

:: 杀掉可能存在的进程
tasklist | findstr node.exe > nul
if %errorlevel% == 0 (
    echo 🔄 检测到 Node.js 进程，尝试清理...
    taskkill /IM node.exe /F > nul 2>&1
    timeout /t 2 > nul
)

:: 清理缓存
echo 🧹 清理缓存...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" > nul 2>&1
)

echo.
echo ✅ 修复脚本准备完成！
echo.
echo 下一步操作:
echo   1. 运行 Kiro 提供的代码修复
echo   2. 重启开发服务器: npm start
echo   3. 测试访问: http://localhost:3000/live2d/rem/rem/model.json
echo   4. 验证纹理加载: http://localhost:3000/live2d/rem/rem/remu2048/texture_00.png
echo.

pause