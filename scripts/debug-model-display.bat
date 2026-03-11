@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Live2D 模型显示调试脚本
echo ========================================
echo.

:: 进入前端目录
cd /d "%~dp0..\frontend"
if errorlevel 1 (
    echo [错误] 无法进入前端目录
    pause
    exit /b 1
)

echo [信息] 当前目录: %CD%
echo.

:: 检查模型文件
echo [检查] 验证模型文件...
if not exist "public\live2d\rem\rem\model.json" (
    echo [错误] 模型配置文件不存在: public\live2d\rem\rem\model.json
    pause
    exit /b 1
)

if not exist "public\live2d\rem\rem\remu.moc" (
    echo [错误] MOC 文件不存在: public\live2d\rem\rem\remu.moc
    pause
    exit /b 1
)

:: 检查纹理文件
echo [检查] 验证纹理文件...
if not exist "public\live2d\rem\rem\remu2048\texture_00.png" (
    echo [警告] 纹理文件不存在: public\live2d\rem\rem\remu2048\texture_00.png
) else (
    echo [成功] 纹理文件存在
)

:: 创建调试页面
echo [创建] 生成模型显示调试页面...

set "debug_file=public\debug-model.html"

echo ^<!DOCTYPE html^> > "%debug_file%"
echo ^<html^> >> "%debug_file%"
echo ^<head^> >> "%debug_file%"
echo     ^<title^>Live2D Model Display Debug^</title^> >> "%debug_file%"
echo     ^<style^> >> "%debug_file%"
echo         body { font-family: monospace; padding: 20px; background: #f0f0f0; } >> "%debug_file%"
echo         .container { max-width: 1200px; margin: 0 auto; } >> "%debug_file%"
echo         .debug-panel { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } >> "%debug_file%"
echo         .live2d-container { width: 400px; height: 600px; border: 2px solid #333; background: #fff; position: relative; } >> "%debug_file%"
echo         .success { color: green; } >> "%debug_file%"
echo         .error { color: red; } >> "%debug_file%"
echo         .warning { color: orange; } >> "%debug_file%"
echo         .info { color: blue; } >> "%debug_file%"
echo         pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; } >> "%debug_file%"
echo         .flex { display: flex; gap: 20px; } >> "%debug_file%"
echo         .flex-1 { flex: 1; } >> "%debug_file%"
echo     ^</style^> >> "%debug_file%"
echo ^</head^> >> "%debug_file%"
echo ^<body^> >> "%debug_file%"
echo     ^<div class="container"^> >> "%debug_file%"
echo         ^<h1^>Live2D 模型显示调试^</h1^> >> "%debug_file%"
echo         ^<div class="flex"^> >> "%debug_file%"
echo             ^<div class="flex-1"^> >> "%debug_file%"
echo                 ^<div class="debug-panel"^> >> "%debug_file%"
echo                     ^<h3^>Live2D 模型容器^</h3^> >> "%debug_file%"
echo                     ^<div id="live2d-container" class="live2d-container"^>^</div^> >> "%debug_file%"
echo                 ^</div^> >> "%debug_file%"
echo             ^</div^> >> "%debug_file%"
echo             ^<div class="flex-1"^> >> "%debug_file%"
echo                 ^<div class="debug-panel"^> >> "%debug_file%"
echo                     ^<h3^>调试信息^</h3^> >> "%debug_file%"
echo                     ^<div id="debug-output"^>^</div^> >> "%debug_file%"
echo                 ^</div^> >> "%debug_file%"
echo             ^</div^> >> "%debug_file%"
echo         ^</div^> >> "%debug_file%"
echo     ^</div^> >> "%debug_file%"
echo. >> "%debug_file%"
echo     ^<script^> >> "%debug_file%"
echo         let debugOutput = document.getElementById('debug-output'^); >> "%debug_file%"
echo         let modelContainer = document.getElementById('live2d-container'^); >> "%debug_file%"
echo. >> "%debug_file%"
echo         function log(message, type = 'info'^) { >> "%debug_file%"
echo             const div = document.createElement('div'^); >> "%debug_file%"
echo             div.className = type; >> "%debug_file%"
echo             div.textContent = new Date(^).toLocaleTimeString(^) + ': ' + message; >> "%debug_file%"
echo             debugOutput.appendChild(div^); >> "%debug_file%"
echo             debugOutput.scrollTop = debugOutput.scrollHeight; >> "%debug_file%"
echo             console.log(message^); >> "%debug_file%"
echo         } >> "%debug_file%"
echo. >> "%debug_file%"
echo         function checkFiles(^) { >> "%debug_file%"
echo             log('=== 文件检查开始 ==='^); >> "%debug_file%"
echo. >> "%debug_file%"
echo             const files = [ >> "%debug_file%"
echo                 '/live2d/rem/rem/model.json', >> "%debug_file%"
echo                 '/live2d/rem/rem/remu.moc', >> "%debug_file%"
echo                 '/live2d/rem/rem/remu2048/texture_00.png' >> "%debug_file%"
echo             ]; >> "%debug_file%"
echo. >> "%debug_file%"
echo             files.forEach(async (file^) =^> { >> "%debug_file%"
echo                 try { >> "%debug_file%"
echo                     const response = await fetch(file, { method: 'HEAD' }^); >> "%debug_file%"
echo                     if (response.ok^) { >> "%debug_file%"
echo                         log('✅ 文件存在: ' + file, 'success'^); >> "%debug_file%"
echo                     } else { >> "%debug_file%"
echo                         log('❌ 文件不存在: ' + file + ' (状态: ' + response.status + '^)', 'error'^); >> "%debug_file%"
echo                     } >> "%debug_file%"
echo                 } catch (e^) { >> "%debug_file%"
echo                     log('❌ 文件检查失败: ' + file + ' - ' + e.message, 'error'^); >> "%debug_file%"
echo                 } >> "%debug_file%"
echo             }^); >> "%debug_file%"
echo         } >> "%debug_file%"
echo. >> "%debug_file%"
echo         function testWebGL(^) { >> "%debug_file%"
echo             log('=== WebGL 测试开始 ==='^); >> "%debug_file%"
echo. >> "%debug_file%"
echo             const canvas = document.createElement('canvas'^); >> "%debug_file%"
echo             canvas.width = 400; >> "%debug_file%"
echo             canvas.height = 600; >> "%debug_file%"
echo             canvas.style.border = '1px solid red'; >> "%debug_file%"
echo             modelContainer.appendChild(canvas^); >> "%debug_file%"
echo. >> "%debug_file%"
echo             const gl = canvas.getContext('webgl'^) ^|^| canvas.getContext('experimental-webgl'^); >> "%debug_file%"
echo             if (gl^) { >> "%debug_file%"
echo                 log('✅ WebGL 上下文创建成功', 'success'^); >> "%debug_file%"
echo                 log('WebGL 版本: ' + gl.getParameter(gl.VERSION^), 'info'^); >> "%debug_file%"
echo                 log('渲染器: ' + gl.getParameter(gl.RENDERER^), 'info'^); >> "%debug_file%"
echo. >> "%debug_file%"
echo                 // 测试基本渲染 >> "%debug_file%"
echo                 gl.clearColor(0.2, 0.8, 0.2, 1.0^); >> "%debug_file%"
echo                 gl.clear(gl.COLOR_BUFFER_BIT^); >> "%debug_file%"
echo                 log('✅ WebGL 基本渲染测试通过', 'success'^); >> "%debug_file%"
echo             } else { >> "%debug_file%"
echo                 log('❌ WebGL 不支持', 'error'^); >> "%debug_file%"
echo             } >> "%debug_file%"
echo         } >> "%debug_file%"
echo. >> "%debug_file%"
echo         function loadLive2D(^) { >> "%debug_file%"
echo             log('=== Live2D 加载测试开始 ==='^); >> "%debug_file%"
echo. >> "%debug_file%"
echo             const script = document.createElement('script'^); >> "%debug_file%"
echo             script.src = 'https://fastly.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js'; >> "%debug_file%"
echo             script.onload = function(^) { >> "%debug_file%"
echo                 log('✅ Live2D 运行时加载成功', 'success'^); >> "%debug_file%"
echo                 setTimeout(testLive2DModel, 1000^); >> "%debug_file%"
echo             }; >> "%debug_file%"
echo             script.onerror = function(^) { >> "%debug_file%"
echo                 log('❌ Live2D 运行时加载失败', 'error'^); >> "%debug_file%"
echo             }; >> "%debug_file%"
echo             document.head.appendChild(script^); >> "%debug_file%"
echo         } >> "%debug_file%"
echo. >> "%debug_file%"
echo         function testLive2DModel(^) { >> "%debug_file%"
echo             log('=== Live2D 模型测试开始 ==='^); >> "%debug_file%"
echo. >> "%debug_file%"
echo             if (!window.Live2D^) { >> "%debug_file%"
echo                 log('❌ Live2D 对象不存在', 'error'^); >> "%debug_file%"
echo                 return; >> "%debug_file%"
echo             } >> "%debug_file%"
echo. >> "%debug_file%"
echo             if (!window.Live2DModelWebGL^) { >> "%debug_file%"
echo                 log('❌ Live2DModelWebGL 不存在', 'error'^); >> "%debug_file%"
echo                 return; >> "%debug_file%"
echo             } >> "%debug_file%"
echo. >> "%debug_file%"
echo             log('✅ Live2D API 可用', 'success'^); >> "%debug_file%"
echo. >> "%debug_file%"
echo             // 尝试加载模型 >> "%debug_file%"
echo             fetch('/live2d/rem/rem/remu.moc'^) >> "%debug_file%"
echo                 .then(response =^> response.arrayBuffer(^)^) >> "%debug_file%"
echo                 .then(buffer =^> { >> "%debug_file%"
echo                     log('✅ MOC 文件加载成功，大小: ' + buffer.byteLength + ' 字节', 'success'^); >> "%debug_file%"
echo. >> "%debug_file%"
echo                     try { >> "%debug_file%"
echo                         const model = window.Live2DModelWebGL.loadModel(buffer^); >> "%debug_file%"
echo                         if (model^) { >> "%debug_file%"
echo                             log('✅ Live2D 模型创建成功', 'success'^); >> "%debug_file%"
echo                             log('模型尺寸: ' + model.getCanvasWidth(^) + 'x' + model.getCanvasHeight(^), 'info'^); >> "%debug_file%"
echo                         } else { >> "%debug_file%"
echo                             log('❌ Live2D 模型创建失败', 'error'^); >> "%debug_file%"
echo                         } >> "%debug_file%"
echo                     } catch (e^) { >> "%debug_file%"
echo                         log('❌ 模型创建异常: ' + e.message, 'error'^); >> "%debug_file%"
echo                     } >> "%debug_file%"
echo                 }^) >> "%debug_file%"
echo                 .catch(e =^> { >> "%debug_file%"
echo                     log('❌ MOC 文件加载失败: ' + e.message, 'error'^); >> "%debug_file%"
echo                 }^); >> "%debug_file%"
echo         } >> "%debug_file%"
echo. >> "%debug_file%"
echo         // 开始测试 >> "%debug_file%"
echo         log('开始 Live2D 模型显示调试...'^); >> "%debug_file%"
echo         checkFiles(^); >> "%debug_file%"
echo         setTimeout(testWebGL, 1000^); >> "%debug_file%"
echo         setTimeout(loadLive2D, 2000^); >> "%debug_file%"
echo     ^</script^> >> "%debug_file%"
echo ^</body^> >> "%debug_file%"
echo ^</html^> >> "%debug_file%"

echo [成功] 调试页面已生成: %debug_file%
echo.

:: 启动开发服务器（如果没有运行）
echo [检查] 检查开发服务器状态...
netstat -an | findstr ":3000" >nul 2>&1
if errorlevel 1 (
    echo [信息] 开发服务器未运行，正在启动...
    start /b npm start >nul 2>&1
    echo [信息] 等待服务器启动...
    timeout /t 10 /nobreak >nul
) else (
    echo [信息] 开发服务器已在运行
)

:: 打开调试页面
echo [打开] 启动浏览器访问调试页面...
start http://localhost:3000/debug-model.html

echo.
echo ========================================
echo 调试说明
echo ========================================
echo.
echo 1. 浏览器将自动打开模型显示调试页面
echo 2. 左侧显示 Live2D 模型容器（绿色背景表示 WebGL 正常）
echo 3. 右侧显示详细的调试信息
echo 4. 检查以下关键信息：
echo    - 文件是否存在（model.json, remu.moc, texture_00.png）
echo    - WebGL 是否支持
echo    - Live2D 运行时是否加载成功
echo    - 模型是否创建成功
echo.
echo 常见问题解决：
echo - 如果文件不存在，检查模型文件路径
echo - 如果 WebGL 不支持，更新浏览器或显卡驱动
echo - 如果模型创建失败，检查 MOC 文件是否损坏
echo.
echo 按任意键关闭...
pause >nul