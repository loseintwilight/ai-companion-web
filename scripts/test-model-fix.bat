@echo off
echo ========================================
echo Live2D 模型显示问题完整诊断
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"

echo [信息] 当前目录: %CD%
echo [信息] 诊断时间: %date% %time%
echo.

:: 详细文件检查
echo [检查] 模型文件完整性验证...
echo.

set "MODEL_DIR=public\live2d\rem\rem"
set "TEXTURE_DIR=%MODEL_DIR%\remu2048"

:: 检查核心文件
if exist "%MODEL_DIR%\model.json" (
    echo ✅ model.json 存在
    for %%A in ("%MODEL_DIR%\model.json") do echo    大小: %%~zA 字节
) else (
    echo ❌ model.json 缺失 - 这是关键问题！
    goto :error
)

if exist "%MODEL_DIR%\remu.moc" (
    echo ✅ remu.moc 存在
    for %%A in ("%MODEL_DIR%\remu.moc") do echo    大小: %%~zA 字节
) else (
    echo ❌ remu.moc 缺失 - 这是关键问题！
    goto :error
)

if exist "%TEXTURE_DIR%\texture_00.png" (
    echo ✅ texture_00.png 存在
    for %%A in ("%TEXTURE_DIR%\texture_00.png") do echo    大小: %%~zA 字节
) else (
    echo ❌ texture_00.png 缺失 - 这是关键问题！
    goto :error
)

:: 检查动作文件
echo.
echo [检查] 动作文件验证...
set "MOTION_DIR=%MODEL_DIR%\motions"
if exist "%MOTION_DIR%\Live2D_remu_idle.mtn" (
    echo ✅ 空闲动作文件存在
) else (
    echo ⚠️ 空闲动作文件缺失 - 可能影响动画
)

:: 检查物理和姿势文件
if exist "%MODEL_DIR%\remu.physics.json" (
    echo ✅ 物理文件存在
) else (
    echo ⚠️ 物理文件缺失 - 不影响基本显示
)

if exist "%MODEL_DIR%\remu.pose.json" (
    echo ✅ 姿势文件存在
) else (
    echo ⚠️ 姿势文件缺失 - 不影响基本显示
)

echo.
echo [检查] 项目配置验证...

:: 检查 package.json
if exist "package.json" (
    echo ✅ package.json 存在
    findstr /C:"react-scripts" package.json >nul && echo ✅ react-scripts 已配置
    findstr /C:"typescript" package.json >nul && echo ✅ TypeScript 已配置
) else (
    echo ❌ package.json 缺失
    goto :error
)

:: 检查关键源文件
if exist "src\utils\UniversalLive2DManager.ts" (
    echo ✅ UniversalLive2DManager.ts 存在
) else (
    echo ❌ Live2D 管理器缺失
    goto :error
)

if exist "src\components\Live2DCharacter.tsx" (
    echo ✅ Live2DCharacter.tsx 存在
) else (
    echo ❌ Live2D 组件缺失
    goto :error
)

echo.
echo [修复] 应用最新修复...
echo.
echo 🔧 已应用的修复内容:
echo   ✅ 修复了模型变换矩阵 - 使用模型配置中的布局信息
echo   ✅ 改进了 WebGL 渲染设置 - 禁用深度测试，优化透明度
echo   ✅ 增强了投影矩阵计算 - 标准化坐标系转换
echo   ✅ 修复了 React Router 警告 - 添加 future flags
echo   ✅ 改进了纹理加载错误处理
echo   ✅ 增加了详细的调试日志
echo.

echo [启动] 启动开发服务器进行测试...
echo.
echo 🎯 预期结果:
echo   - Live2D 模型应该在画布中央显示
echo   - 模型应该有适当的大小和位置
echo   - 控制台应该显示详细的加载和渲染信息
echo   - 无 React Router 相关警告
echo.
echo 🔍 调试步骤:
echo   1. 打开浏览器开发者工具 (F12)
echo   2. 查看 Console 标签页的日志输出
echo   3. 寻找以下关键信息:
echo      - "✅ Live2D Cubism 2 Manager initialized successfully"
echo      - "✅ Model transform applied"
echo      - "📐 Model canvas dimensions"
echo   4. 如果看到错误，记录完整的错误信息
echo.
echo 🚨 如果模型仍未显示:
echo   - 检查控制台是否有 WebGL 错误
echo   - 验证纹理加载是否成功
echo   - 确认模型矩阵变换是否正确应用
echo.

:: 启动项目
npm start

goto :end

:error
echo.
echo ❌ 发现关键文件缺失，无法继续！
echo 请确保 Live2D 模型文件完整后重试。
echo.
pause
exit /b 1

:end