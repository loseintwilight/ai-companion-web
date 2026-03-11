#!/bin/bash

# Live2D依赖安装脚本 (Linux/Mac)

echo "🎭 安装Live2D相关依赖..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装Node.js 16+"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装npm"
    exit 1
fi

echo "✅ Node.js 和 npm 检查完成"

# 进入前端目录
cd frontend

echo "📦 安装Live2D相关依赖..."

# 安装PIXI.js和Live2D显示库
npm install pixi.js@^7.3.2 pixi-live2d-display@^0.5.0 --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Live2D依赖安装失败"
    exit 1
fi

echo "✅ Live2D依赖安装完成"

echo ""
echo "📋 安装完成！接下来请："
echo "1. 将Live2D模型文件放入 frontend/public/live2d/rem/rem/ 目录"
echo "2. 确保模型文件包含："
echo "   - rem.model3.json (主模型文件)"
echo "   - motions/ (动作文件夹)"
echo "   - remu2048/ (纹理文件夹)"
echo "   - voice/ (语音文件夹，可选)"
echo "3. 运行 npm start 启动开发服务器"
echo ""