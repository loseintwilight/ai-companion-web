@echo off
chcp 65001 >nul
echo 修复 index.html 文件...
echo.

set "INDEX_FILE=ai-companion-web\frontend\public\index.html"
set "BACKUP_FILE=ai-companion-web\frontend\public\index.html.backup"

REM 备份原文件
if exist "%INDEX_FILE%" (
    copy "%INDEX_FILE%" "%BACKUP_FILE%" >nul
    echo ✅ 已备份原文件
)

echo 正在创建新的 index.html...

(
echo ^<!DOCTYPE html^>
echo ^<html lang="zh-CN"^>
echo   ^<head^>
echo     ^<meta charset="utf-8" /^>
echo     ^<link rel="icon" href="%%PUBLIC_URL%%/favicon.ico" /^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1" /^>
echo     ^<meta name="theme-color" content="#6366f1" /^>
echo     ^<meta name="description" content="AI伴侣Web应用" /^>
echo     ^<link rel="apple-touch-icon" href="%%PUBLIC_URL%%/logo192.png" /^>
echo     ^<link rel="manifest" href="%%PUBLIC_URL%%/manifest.json" /^>
echo     ^<title^>AI伴侣^</title^>
echo   ^</head^>
echo   ^<body^>
echo     ^<noscript^>您需要启用JavaScript才能运行此应用。^</noscript^>
echo     ^<div id="root"^>^</div^>
echo     ^<script src="https://fastly.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.0.min.js"^>^</script^>
echo   ^</body^>
echo ^</html^>
) > "%INDEX_FILE%"

echo ✅ 新文件已创建
echo.
echo 📋 说明:
echo   - 使用 live2d-widget 完整 SDK
echo   - 包含所有必需的类
echo   - 如果需要恢复，备份文件在: %BACKUP_FILE%
echo.
pause
