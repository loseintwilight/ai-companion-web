@echo off
chcp 65001 >nul
echo ========================================
echo Live2D 运行时诊断工具
echo ========================================
echo.

echo 📋 检查 Live2D 库文件...
echo.

set "LIB_DIR=ai-companion-web\frontend\public\lib"
set "MODEL_DIR=ai-companion-web\frontend\public\live2d\rem\rem"

REM 检查库文件
if exist "%LIB_DIR%\live2d.min.js" (
    echo ✅ live2d.min.js 存在（本地备用文件）
    for %%F in ("%LIB_DIR%\live2d.min.js") do echo    大小: %%~zF bytes
) else (
    echo ❌ live2d.min.js 不存在
    echo    将依赖 CDN 加载
)

if exist "%LIB_DIR%\live2dcubismcore.min.js" (
    echo ⚠️  live2dcubismcore.min.js 存在（Cubism 4，不适用）
    echo    Cubism 2 模型不需要此文件
) else (
    echo ✅ 没有 Cubism 4 core 文件（正确）
)

echo.
echo 📋 检查模型文件格式...
echo.

if exist "%MODEL_DIR%\model.json" (
    echo ✅ model.json 存在（Cubism 2 格式）
    findstr /C:"\"version\"" "%MODEL_DIR%\model.json" 2>nul
) else (
    echo ❌ model.json 不存在
)

if exist "%MODEL_DIR%\remu.moc" (
    echo ✅ remu.moc 存在（Cubism 2 模型文件）
) else (
    echo ❌ remu.moc 不存在
)

if exist "%MODEL_DIR%\rem.model3.json" (
    echo ⚠️  rem.model3.json 存在（Cubism 4 格式，不匹配）
    echo    当前模型是 Cubism 2，不应该有此文件
) else (
    echo ✅ 没有 Cubism 4 模型文件（正确）
)

echo.
echo 📋 检查必需的类和模块...
echo.

echo 需要的 Cubism 2 类:
echo   - Live2D (核心对象)
echo   - Live2DModelWebGL (模型类)
echo   - Live2DMotion (动作类)
echo   - MotionQueueManager (动作队列)
echo   - L2DMatrix44 (矩阵类)
echo   - Live2DMatrix44 (矩阵类别名)
echo   - Live2DModelMatrix (模型矩阵)
echo   - L2DEyeBlink (眨眼管理器)
echo   - L2DPose (姿势管理器)
echo   - PhysicsHandler (物理效果)

echo.
echo 📋 检查 index.html 配置...
echo.

set "INDEX_HTML=ai-companion-web\frontend\public\index.html"
if exist "%INDEX_HTML%" (
    echo ✅ index.html 存在
    
    findstr /C:"live2d.min.js" "%INDEX_HTML%" >nul
    if %errorlevel% equ 0 (
        echo ✅ 已配置加载 live2d.min.js
    ) else (
        echo ❌ 未配置加载 live2d.min.js
    )
    
    findstr /C:"Live2D Cubism 2" "%INDEX_HTML%" >nul
    if %errorlevel% equ 0 (
        echo ✅ 已标记为 Cubism 2 运行时
    ) else (
        echo ⚠️  未明确标记 Cubism 2
    )
) else (
    echo ❌ index.html 不存在
)

echo.
echo 📋 问题诊断结果...
echo.

set "HAS_ISSUES=0"

if not exist "%LIB_DIR%\live2d.min.js" (
    echo ⚠️  问题 1: 缺少本地 live2d.min.js 备用文件
    echo    影响: 如果 CDN 加载失败，将无法使用 Live2D
    echo    解决: 文件已创建，重新启动应用即可
    set "HAS_ISSUES=1"
)

if exist "%LIB_DIR%\live2dcubismcore.min.js" (
    echo ⚠️  问题 2: 存在不兼容的 Cubism 4 core 文件
    echo    影响: 可能导致版本冲突
    echo    解决: 可以删除此文件（Cubism 2 不需要）
    set "HAS_ISSUES=1"
)

if not exist "%MODEL_DIR%\model.json" (
    echo ❌ 问题 3: 缺少 model.json 文件
    echo    影响: 无法加载模型
    echo    解决: 确保模型文件完整
    set "HAS_ISSUES=1"
)

if not exist "%MODEL_DIR%\remu.moc" (
    echo ❌ 问题 4: 缺少 remu.moc 文件
    echo    影响: 无法加载模型数据
    echo    解决: 确保模型文件完整
    set "HAS_ISSUES=1"
)

if %HAS_ISSUES% equ 0 (
    echo ✅ 未发现严重问题！
    echo.
    echo 如果仍然出现类找不到的警告，请检查:
    echo   1. 浏览器控制台是否显示 live2d.min.js 加载成功
    echo   2. 是否有网络错误阻止 CDN 加载
    echo   3. 清除浏览器缓存后重试
)

echo.
echo 📋 建议的解决方案...
echo.

echo 1. 使用本地备用文件（已创建）
echo    - 文件位置: %LIB_DIR%\live2d.min.js
echo    - 包含所有必需的类和模块
echo    - 优先级高于 CDN
echo.

echo 2. 清除浏览器缓存
echo    - 按 Ctrl+Shift+Delete
echo    - 选择"缓存的图像和文件"
echo    - 清除后重新加载页面
echo.

echo 3. 检查浏览器控制台
echo    - 按 F12 打开开发者工具
echo    - 查看 Console 标签
echo    - 确认 "Live2D Cubism 2 SDK loaded" 消息
echo.

echo 4. 验证 API 可用性
echo    - 在控制台输入: window.Live2D
echo    - 应该显示对象，而不是 undefined
echo    - 检查: window.L2DMatrix44, window.L2DEyeBlink 等
echo.

echo ========================================
echo 诊断完成！
echo ========================================
echo.

echo 💡 下一步操作:
echo   1. 如果刚创建了 live2d.min.js，请重启开发服务器
echo   2. 清除浏览器缓存
echo   3. 重新加载页面
echo   4. 检查控制台是否还有警告
echo.

pause
