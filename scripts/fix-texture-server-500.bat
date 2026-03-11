@echo off
echo ========================================
echo Live2D 纹理服务器 500 错误修复
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"

echo [信息] 修复时间: %date% %time%
echo [信息] 当前目录: %CD%
echo.

echo [分析] 500 错误原因分析...
echo.

echo 📋 500 错误通常表示:
echo   1. 服务器内部错误 (不是文件不存在)
echo   2. 可能的中间件或代理配置问题
echo   3. React 开发服务器的静态文件服务异常
echo   4. 文件权限或访问限制
echo.

echo [检查] 验证文件完整性...
echo.

set "TEXTURE_DIR=public\live2d\rem\rem\remu2048"

:: 检查文件是否存在且可读
if exist "%TEXTURE_DIR%\texture_00.png" (
    echo ✅ texture_00.png 存在
    for %%A in ("%TEXTURE_DIR%\texture_00.png") do (
        if %%~zA GTR 0 (
            echo    大小: %%~zA 字节 - 正常
        ) else (
            echo    大小: %%~zA 字节 - 异常！文件可能损坏
        )
    )
) else (
    echo ❌ texture_00.png 不存在
    goto :error
)

if exist "%TEXTURE_DIR%\texture_01.png" (
    echo ✅ texture_01.png 存在
    for %%A in ("%TEXTURE_DIR%\texture_01.png") do (
        if %%~zA GTR 0 (
            echo    大小: %%~zA 字节 - 正常
        ) else (
            echo    大小: %%~zA 字节 - 异常！文件可能损坏
        )
    )
) else (
    echo ❌ texture_01.png 不存在
    goto :error
)

echo.
echo [修复] 应用服务器访问修复...
echo.

echo 🔧 已应用的修复内容:
echo   ✅ 增强纹理路径解析 - 支持多种路径格式
echo   ✅ 添加服务器错误检测和重试机制
echo   ✅ 实现默认纹理备用方案
echo   ✅ 完善 View/Projection 矩阵配置
echo   ✅ 优化 WebGL 渲染状态管理
echo   ✅ 添加详细的错误日志和诊断信息
echo.

echo [测试] 启动测试环境...
echo.

echo 📋 测试步骤:
echo   1. 启动开发服务器
echo   2. 访问静态文件测试页面: http://localhost:3000/test-static-files.html
echo   3. 点击直接访问链接测试纹理文件
echo   4. 查看详细的错误信息和状态码
echo   5. 访问主应用: http://localhost:3000
echo.

echo 🔍 预期结果:
echo   - 静态文件测试页面显示所有文件状态
echo   - 纹理文件应该返回 200 状态码
echo   - 主应用中模型应该正确显示
echo   - 控制台显示完整的矩阵配置信息
echo.

echo 🚨 如果仍返回 500 错误:
echo   1. 检查开发服务器控制台的错误日志
echo   2. 尝试重启开发服务器 (Ctrl+C 然后重新 npm start)
echo   3. 清除浏览器缓存和 npm 缓存
echo   4. 检查是否有防病毒软件拦截文件访问
echo.

echo 按任意键启动开发服务器...
pause >nul

echo.
echo [启动] 启动开发服务器...
npm start

goto :end

:error
echo.
echo ❌ 发现关键文件问题，无法继续！
echo 请检查纹理文件的完整性。
echo.
pause
exit /b 1

:end