#!/bin/bash

# AI伴侣Web应用停止脚本

echo "⏹️  停止AI伴侣Web应用..."

# 停止后端服务器
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        echo "停止后端服务器 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm logs/backend.pid
    else
        echo "后端服务器已停止"
        rm -f logs/backend.pid
    fi
else
    echo "未找到后端服务器进程ID"
fi

# 停止前端服务器
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "停止前端服务器 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm logs/frontend.pid
    else
        echo "前端服务器已停止"
        rm -f logs/frontend.pid
    fi
else
    echo "未找到前端服务器进程ID"
fi

# 停止所有相关的Node.js进程（备用方案）
echo "清理残留进程..."
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "uvicorn.*main:app" 2>/dev/null || true

echo "✅ 所有服务器已停止"