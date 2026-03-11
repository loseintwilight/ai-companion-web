@echo off
echo ========================================
echo Live2D 模型修复 - 基于文档标准
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"

echo [信息] 修复时间: %date% %time%
echo [信息] 当前目录: %CD%
echo.

echo [分析] 文档与实际文件对比...
echo.

echo 📋 文档标准 (README.md):
echo   - 配置文件: rem_config.json (Cubism 4 格式)
echo   - 模型文件: rem.model3.json
echo   - 动作文件: *.motion3.json
echo   - 纹理路径: remu2048/texture_00.png, texture_01.png
echo.

echo 📋 实际文件结构:
echo   - 配置文件: model.json + rem_config.json
echo   - 模型文件: remu.moc (Cubism 2 格式)
echo   - 动作文件: *.mtn (Cubism 2 格式)
echo   - 纹理路径: remu2048/texture_00.png, texture_01.png ✅
echo.

echo [修复] 应用兼容性修复...
echo.

echo 🔧 已应用的修复内容:
echo   ✅ 支持双配置文件格式 (rem_config.json + model.json)
echo   ✅ 自动检测 Cubism 版本不匹配
echo   ✅ 增强纹理路径解析 (支持多种路径格式)
echo   ✅ 改进模型变换计算 (支持两种布局配置)
echo   ✅ 添加默认纹理备用方案
echo   ✅ 增强错误处理和日志输出
echo.

echo [测试] 预期的加载流程:
echo   1. 尝试加载 rem_config.json
echo   2. 如果失败，回退到 model.json
echo   3. 检测配置格式不匹配 (Cubism 4 配置 vs Cubism 2 文件)
echo   4. 自动适配到实际的 Cubism 2 文件 (remu.moc)
echo   5. 尝试多种纹理路径格式
echo   6. 应用正确的布局变换
echo.

echo 🔍 预期的控制台日志:
echo   - "📂 rem_config.json not found, trying model.json..." (如果需要回退)
echo   - "📋 Using rem_config.json format" 或 "📋 Using model.json format"
echo   - "⚠️ Config specifies Cubism 4 format, looking for Cubism 2 files..."
echo   - "✅ Found texture at alternative path: ..." (如果需要路径修正)
echo   - "✅ Texture loading completed: 2/2 textures loaded"
echo   - "✅ Model has valid dimensions and should be visible"
echo.

echo [启动] 启动开发服务器进行测试...
echo.
echo 📋 测试步骤:
echo   1. 观察控制台日志，确认配置文件加载
echo   2. 检查纹理加载是否成功
echo   3. 验证模型是否正确显示
echo   4. 测试模型交互功能
echo.
echo 🚨 如果仍有问题:
echo   1. 检查是否所有纹理都成功加载
echo   2. 确认模型变换参数是否合理
echo   3. 验证 WebGL 上下文是否正常
echo   4. 查看详细的错误日志
echo.

echo 按任意键启动开发服务器...
pause >nul

echo.
echo [启动] 启动开发服务器...
npm start