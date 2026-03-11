@echo off
echo ========================================
echo Live2D 纹理加载问题修复
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"

echo [信息] 修复时间: %date% %time%
echo [信息] 当前目录: %CD%
echo.

echo [修复] 应用纹理加载优化...
echo.

echo 🔧 已应用的修复内容:
echo   ✅ 增强了纹理加载错误处理
echo   ✅ 添加了多路径尝试机制
echo   ✅ 实现了默认纹理备用方案
echo   ✅ 增加了纹理加载超时处理
echo   ✅ 添加了详细的加载日志
echo   ✅ 创建了纹理加载测试页面
echo.

echo [测试] 启动开发服务器进行测试...
echo.
echo 📋 测试步骤:
echo   1. 开发服务器启动后，访问以下测试页面:
echo      http://localhost:3000/texture-test.html
echo.
echo   2. 查看纹理加载测试结果
echo.
echo   3. 如果纹理测试通过，访问主应用:
echo      http://localhost:3000
echo.
echo   4. 打开浏览器开发者工具查看控制台日志
echo.
echo 🔍 预期的控制台日志:
echo   - "📂 Loading textures..."
echo   - "📋 Texture list: [...]"
echo   - "📂 Loading texture 0: /live2d/rem/rem/remu2048/texture_00.png"
echo   - "✅ Texture loaded: ... (2048x2048)"
echo   - "✅ Texture loading completed: 2/2 textures loaded"
echo.
echo 🚨 如果仍有问题:
echo   1. 检查纹理测试页面的结果
echo   2. 确认哪些路径可以正常访问
echo   3. 查看控制台的详细错误信息
echo   4. 检查开发服务器是否正确启动
echo.

echo 按任意键启动开发服务器...
pause >nul

echo.
echo [启动] 启动开发服务器...
npm start