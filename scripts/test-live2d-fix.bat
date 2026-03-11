@echo off
echo ========================================
echo Live2D 修复测试脚本
echo ========================================
echo.

:: 设置工作目录
cd /d "%~dp0..\frontend"

echo 当前目录: %CD%
echo.

echo [修复说明]
echo ========================================
echo 1. 已创建 SimpleLive2DManager 来处理 Live2D v2 兼容性问题
echo 2. 如果 Live2D 库加载失败，会显示动画占位符
echo 3. 占位符支持聊天状态变化和交互
echo 4. 已修复 favicon.ico 404 错误
echo.

echo [启动项目进行测试]
echo ========================================
echo 项目启动后，请检查：
echo - Live2D 区域是否显示（模型或占位符）
echo - 控制台是否还有 Live2D 相关错误
echo - 聊天状态变化时角色是否有反应
echo - 点击角色是否有交互效果
echo.
echo 按任意键启动项目...
pause >nul

npm start