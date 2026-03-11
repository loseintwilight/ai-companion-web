@echo off
echo ========================================
echo Live2D 模型可见性最终测试
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
echo [步骤 2] 最终修复说明...
echo.

echo 🔧 最新实施的关键修复:
echo   1. 优化正交投影矩阵 - 标准 Live2D 坐标系映射
echo   2. 改进自适应缩放算法 - 根据画布宽高比智能调整
echo   3. 精确的模型居中算法 - 减小平移幅度，确保可见
echo   4. 简化渲染流程 - 移除不必要的投影矩阵设置
echo   5. 增强 WebGL 上下文绑定 - 确保每帧正确绑定
echo.

echo 📐 矩阵计算优化:
echo   - 投影矩阵: 标准正交投影 (-1,-1) 到 (1,1)
echo   - 视图矩阵: 基础缩放 0.7，自适应宽高比调整
echo   - 模型变换: 居中显示，平移幅度减小到 0.3
echo   - 缩放策略: 宽屏按高度缩放，窄屏适度放大
echo.

echo 🎨 视觉改进:
echo   - 背景色: 中灰色 (0.85) 便于观察
echo   - 默认纹理: 彩色渐变，完全不透明
echo   - 模型定位: 稍微向上偏移 (-0.05)
echo   - 边距控制: 留出 30%% 边距避免裁切
echo.

echo [步骤 3] 打开应用进行测试...
echo.

echo 🌐 在浏览器中打开应用...
start http://localhost:3000

echo.
echo [步骤 4] 详细调试检查清单...
echo.

echo 🔍 请在浏览器控制台中检查以下关键信息:
echo.
echo   📋 运行时加载:
echo     ✅ "Live2D Cubism 2 runtime ready"
echo     ✅ "Live2D initialized with WebGL context"
echo.
echo   📋 资源加载:
echo     ✅ "Model config loaded: remu"
echo     ✅ "Texture loaded: .../texture_00.png (2048x2048)"
echo     ✅ "Texture loaded: .../texture_01.png (2048x2048)"
echo.
echo   📋 矩阵设置:
echo     ✅ "Projection matrix configured for Cubism 2 orthographic projection"
echo     ✅ "Transform applied: scale=X.XXX, translate=(X.XXX, X.XXX)"
echo     ✅ "Model matrix binding successful"
echo.
echo   📋 渲染状态:
echo     ✅ "Enhanced render loop started with validation"
echo     ✅ "Deep Model Render State Validation"
echo     ✅ "WebGL status: No errors"
echo.

echo [步骤 5] 预期结果验证...
echo.

echo 📋 视觉检查清单:
echo   ✅ 画布显示中灰色背景 (不是白色或黑色)
echo   ✅ 模型显示在画布中央偏上位置
echo   ✅ 模型大小适中，完全可见，不被裁切
echo   ✅ 模型纹理清晰，颜色正常
echo   ✅ 鼠标移动时模型视线跟踪
echo   ✅ 点击模型时播放动作
echo.

echo 📋 技术检查清单:
echo   ✅ 控制台无 WebGL 错误
echo   ✅ 控制台无 Live2D 错误
echo   ✅ 纹理加载状态码为 200
echo   ✅ 模型矩阵元素非零
echo   ✅ 画布尺寸正确
echo.

echo [步骤 6] 故障排除指南...
echo.

echo 🐛 如果模型仍不可见:
echo.
echo   1. 检查浏览器 WebGL 支持:
echo      访问 https://webglreport.com 确认 WebGL 可用
echo.
echo   2. 检查纹理文件访问:
echo      打开 http://localhost:3000/live2d/rem/rem/remu2048/texture_00.png
echo      确认返回 200 状态码，能看到纹理图片
echo.
echo   3. 检查控制台错误:
echo      按 F12 打开开发者工具，查看 Console 标签
echo      寻找红色错误信息，特别是 WebGL 相关错误
echo.
echo   4. 检查画布元素:
echo      在控制台执行: document.querySelector('canvas')
echo      确认返回 canvas 元素，且有正确的宽高
echo.
echo   5. 检查模型文件:
echo      打开 http://localhost:3000/live2d/rem/rem/model.json
echo      确认配置文件正确加载
echo.
echo   6. 重启测试:
echo      关闭浏览器，重新运行 npm start，再次测试
echo.

echo ✅ 最终测试脚本完成！
echo.
echo 💡 提示: 如果问题仍然存在，请将控制台完整日志截图反馈
echo.

pause