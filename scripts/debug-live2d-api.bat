@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Live2D API 调试脚本
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

:: 创建调试 HTML 文件
echo [创建] 生成 Live2D API 调试页面...

set "debug_file=public\debug-live2d.html"

echo ^<!DOCTYPE html^> > "%debug_file%"
echo ^<html^> >> "%debug_file%"
echo ^<head^> >> "%debug_file%"
echo     ^<title^>Live2D API Debug^</title^> >> "%debug_file%"
echo     ^<style^> >> "%debug_file%"
echo         body { font-family: monospace; padding: 20px; } >> "%debug_file%"
echo         .success { color: green; } >> "%debug_file%"
echo         .error { color: red; } >> "%debug_file%"
echo         .warning { color: orange; } >> "%debug_file%"
echo         pre { background: #f5f5f5; padding: 10px; border-radius: 4px; } >> "%debug_file%"
echo     ^</style^> >> "%debug_file%"
echo ^</head^> >> "%debug_file%"
echo ^<body^> >> "%debug_file%"
echo     ^<h1^>Live2D Cubism 2 API 调试^</h1^> >> "%debug_file%"
echo     ^<div id="output"^>^</div^> >> "%debug_file%"
echo. >> "%debug_file%"
echo     ^<script^> >> "%debug_file%"
echo         function log(message, type = 'info'^) { >> "%debug_file%"
echo             const output = document.getElementById('output'^); >> "%debug_file%"
echo             const div = document.createElement('div'^); >> "%debug_file%"
echo             div.className = type; >> "%debug_file%"
echo             div.textContent = message; >> "%debug_file%"
echo             output.appendChild(div^); >> "%debug_file%"
echo             console.log(message^); >> "%debug_file%"
echo         } >> "%debug_file%"
echo. >> "%debug_file%"
echo         function checkAPI(^) { >> "%debug_file%"
echo             log('=== Live2D API 检测开始 ==='^); >> "%debug_file%"
echo. >> "%debug_file%"
echo             // 检查基础 Live2D 对象 >> "%debug_file%"
echo             if (typeof window.Live2D !== 'undefined'^) { >> "%debug_file%"
echo                 log('✅ window.Live2D 存在', 'success'^); >> "%debug_file%"
echo                 log('Live2D 版本: ' + (window.Live2D.getVersion ? window.Live2D.getVersion(^) : '未知'^)^); >> "%debug_file%"
echo             } else { >> "%debug_file%"
echo                 log('❌ window.Live2D 不存在', 'error'^); >> "%debug_file%"
echo                 return; >> "%debug_file%"
echo             } >> "%debug_file%"
echo. >> "%debug_file%"
echo             // 检查矩阵类 >> "%debug_file%"
echo             const matrixClasses = ['L2DMatrix44', 'Live2DMatrix44', 'Live2DModelMatrix'^; >> "%debug_file%"
echo             let matrixFound = false; >> "%debug_file%"
echo             matrixClasses.forEach(className =^> { >> "%debug_file%"
echo                 if (typeof window[className] !== 'undefined'^) { >> "%debug_file%"
echo                     log('✅ ' + className + ' 存在', 'success'^); >> "%debug_file%"
echo                     matrixFound = true; >> "%debug_file%"
echo                     try { >> "%debug_file%"
echo                         const matrix = new window[className](^); >> "%debug_file%"
echo                         log('✅ ' + className + ' 可以实例化', 'success'^); >> "%debug_file%"
echo                         log('矩阵方法: ' + Object.getOwnPropertyNames(matrix^).join(', '^)^); >> "%debug_file%"
echo                     } catch (e^) { >> "%debug_file%"
echo                         log('❌ ' + className + ' 实例化失败: ' + e.message, 'error'^); >> "%debug_file%"
echo                     } >> "%debug_file%"
echo                 } else { >> "%debug_file%"
echo                     log('❌ ' + className + ' 不存在', 'error'^); >> "%debug_file%"
echo                 } >> "%debug_file%"
echo             }^); >> "%debug_file%"
echo. >> "%debug_file%"
echo             // 检查 Live2D 内部对象 >> "%debug_file%"
echo             if (window.Live2D^) { >> "%debug_file%"
echo                 log('Live2D 对象属性:'^); >> "%debug_file%"
echo                 const props = Object.getOwnPropertyNames(window.Live2D^); >> "%debug_file%"
echo                 props.forEach(prop =^> { >> "%debug_file%"
echo                     log('  - ' + prop + ': ' + typeof window.Live2D[prop]^); >> "%debug_file%"
echo                 }^); >> "%debug_file%"
echo             } >> "%debug_file%"
echo. >> "%debug_file%"
echo             // 检查其他关键类 >> "%debug_file%"
echo             const classes = [ >> "%debug_file%"
echo                 'Live2DModelWebGL', >> "%debug_file%"
echo                 'Live2DMotion', >> "%debug_file%"
echo                 'MotionQueueManager', >> "%debug_file%"
echo                 'L2DEyeBlink', >> "%debug_file%"
echo                 'L2DPose', >> "%debug_file%"
echo                 'PhysicsHandler' >> "%debug_file%"
echo             ]; >> "%debug_file%"
echo. >> "%debug_file%"
echo             classes.forEach(className =^> { >> "%debug_file%"
echo                 if (typeof window[className] !== 'undefined'^) { >> "%debug_file%"
echo                     log('✅ ' + className + ' 存在', 'success'^); >> "%debug_file%"
echo                 } else if (window.Live2D && typeof window.Live2D[className] !== 'undefined'^) { >> "%debug_file%"
echo                     log('✅ Live2D.' + className + ' 存在', 'success'^); >> "%debug_file%"
echo                 } else { >> "%debug_file%"
echo                     log('❌ ' + className + ' 不存在', 'error'^); >> "%debug_file%"
echo                 } >> "%debug_file%"
echo             }^); >> "%debug_file%"
echo. >> "%debug_file%"
echo             log('=== API 检测完成 ==='^); >> "%debug_file%"
echo         } >> "%debug_file%"
echo. >> "%debug_file%"
echo         // 加载 Live2D 运行时 >> "%debug_file%"
echo         const script = document.createElement('script'^); >> "%debug_file%"
echo         script.src = 'https://fastly.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js'; >> "%debug_file%"
echo         script.onload = function(^) { >> "%debug_file%"
echo             log('Live2D 运行时加载完成', 'success'^); >> "%debug_file%"
echo             setTimeout(checkAPI, 100^); >> "%debug_file%"
echo         }; >> "%debug_file%"
echo         script.onerror = function(^) { >> "%debug_file%"
echo             log('Live2D 运行时加载失败', 'error'^); >> "%debug_file%"
echo         }; >> "%debug_file%"
echo         document.head.appendChild(script^); >> "%debug_file%"
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
start http://localhost:3000/debug-live2d.html

echo.
echo ========================================
echo 调试说明
echo ========================================
echo.
echo 1. 浏览器将自动打开调试页面
echo 2. 查看页面上的 API 检测结果
echo 3. 打开浏览器开发者工具查看详细日志
echo 4. 根据检测结果调整代码中的 API 调用
echo.
echo 常见问题:
echo - 如果 L2DMatrix44 不存在，尝试 Live2DMatrix44
echo - 如果全局对象不存在，检查 Live2D.* 命名空间
echo - 如果实例化失败，检查构造函数参数
echo.
echo 按任意键关闭...
pause >nul