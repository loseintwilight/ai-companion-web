@echo off
echo ========================================
echo Live2D 模型可见性测试
echo ========================================
echo.

echo [信息] 测试时间: %date% %time%
echo.

echo [步骤 1] 检查服务器状态...
netstat -an | findstr :3000 > nul
if %errorlevel% == 0 (
    echo ✅ React 开发服务器正在运行 (端口 3000)
) else (
    echo ❌ React 开发服务器未运行
    echo 请先启动服务器: npm start
    pause
    exit /b 1
)

echo.
echo [步骤 2] 模型可见性修复说明...
echo.

echo 🔧 已实施的修复:
echo   1. 优化投影矩阵 - 使用正交投影确保模型在可视范围
echo   2. 调整视图矩阵 - 居中显示，合适的缩放比例
echo   3. 修改默认纹理 - 非透明彩色纹理，便于调试
echo   4. 设置浅灰色背景 - 便于观察模型轮廓
echo   5. 增强调试日志 - 详细的矩阵和状态信息
echo.

echo 📐 矩阵优化详情:
echo   - 投影矩阵: 正交投影 (-1,-1) 到 (1,1)
echo   - 视图矩阵: 居中显示，0.8 基础缩放
echo   - 模型变换: 根据画布宽高比自适应
echo.

echo 🎨 视觉改进:
echo   - 背景色: 浅灰色 (便于观察)
echo   - 默认纹理: 彩色渐变 (非透明)
echo   - 缩放优化: 确保模型完全可见
echo.

echo [步骤 3] 打开应用进行测试...
echo.

echo 🌐 在浏览器中打开应用...
start http://localhost:3000

echo.
echo [步骤 4] 调试检查清单...
echo.

echo 🔍 请在浏览器控制台中检查以下信息:
echo   1. "Live2D Cubism 2 runtime ready" - 运行时加载成功
echo   2. "Model config loaded" - 配置文件加载成功  
echo   3. "Texture loaded" - 纹理加载成功
echo   4. "Model transform applied" - 矩阵变换应用成功
echo   5. "Enhanced Render Status Check" - 详细渲染状态
echo.

echo 📋 预期结果:
echo   ✅ 画布显示浅灰色背景
echo   ✅ 模型显示在画布中央
echo   ✅ 模型大小适中，完全可见
echo   ✅ 控制台无 WebGL 错误
echo.

echo 🐛 如果模型仍不可见，请检查:
echo   1. 浏览器控制台是否有错误信息
echo   2. 纹理文件是否正确加载 (200 状态码)
echo   3. WebGL 是否支持 (访问 webglreport.com 检查)
echo   4. 画布元素是否有正确的尺寸
echo.

echo ✅ 测试脚本完成！
echo.

pause