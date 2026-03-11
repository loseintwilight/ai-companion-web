@echo off
REM 手动清理脚本 - 当自动脚本失败时使用

echo 🧹 手动清理所有依赖和缓存...

cd frontend

echo 步骤1: 删除node_modules
if exist "node_modules" (
    echo 正在删除 node_modules...
    rmdir /s /q node_modules
    echo ✅ node_modules 已删除
) else (
    echo ℹ️  node_modules 不存在
)

echo 步骤2: 删除package-lock.json
if exist "package-lock.json" (
    del package-lock.json
    echo ✅ package-lock.json 已删除
) else (
    echo ℹ️  package-lock.json 不存在
)

echo 步骤3: 删除yarn.lock
if exist "yarn.lock" (
    del yarn.lock
    echo ✅ yarn.lock 已删除
) else (
    echo ℹ️  yarn.lock 不存在
)

echo 步骤4: 清理npm缓存
npm cache clean --force
echo ✅ npm缓存已清理

echo 步骤5: 清理全局npm缓存
if exist "%APPDATA%\npm-cache" (
    rmdir /s /q "%APPDATA%\npm-cache"
    echo ✅ 全局npm缓存已清理
)

echo 步骤6: 验证清理结果
if not exist "node_modules" (
    echo ✅ node_modules 清理成功
) else (
    echo ❌ node_modules 仍然存在
)

if not exist "package-lock.json" (
    echo ✅ package-lock.json 清理成功
) else (
    echo ❌ package-lock.json 仍然存在
)

echo.
echo 🎯 清理完成！现在可以运行以下命令重新安装：
echo.
echo npm install ajv@6.12.6 ajv-keywords@3.5.2 --legacy-peer-deps --force
echo npm install --legacy-peer-deps --force
echo npm start
echo.

pause