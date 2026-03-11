#!/bin/bash

# 依赖修复脚本 (Linux/Mac)

echo "🔧 修复前端依赖冲突..."

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

echo "🧹 清理现有依赖..."

# 删除node_modules和package-lock.json
if [ -d "node_modules" ]; then
    echo "删除 node_modules..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "删除 package-lock.json..."
    rm package-lock.json
fi

if [ -f "yarn.lock" ]; then
    echo "删除 yarn.lock..."
    rm yarn.lock
fi

echo "📦 重新安装依赖..."

# 清理npm缓存
npm cache clean --force

# 使用legacy-peer-deps安装依赖
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ npm安装失败，尝试使用yarn..."
    
    # 检查yarn
    if ! command -v yarn &> /dev/null; then
        echo "安装yarn..."
        npm install -g yarn
    fi
    
    # 使用yarn安装
    yarn install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

echo "✅ 依赖安装完成"

echo "🔍 验证TypeScript版本..."
npx tsc --version

echo "🚀 尝试启动开发服务器..."
echo "如果仍有问题，请手动运行: npm start"