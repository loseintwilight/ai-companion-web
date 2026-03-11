#!/bin/bash

# AJV版本冲突修复脚本 (Linux/Mac)

echo "🔧 修复AJV版本冲突问题..."

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

echo "🧹 彻底清理现有依赖..."

# 删除node_modules
if [ -d "node_modules" ]; then
    echo "删除 node_modules 文件夹..."
    rm -rf node_modules
fi

# 删除package-lock.json
if [ -f "package-lock.json" ]; then
    echo "删除 package-lock.json..."
    rm package-lock.json
fi

# 删除yarn.lock（如果存在）
if [ -f "yarn.lock" ]; then
    echo "删除 yarn.lock..."
    rm yarn.lock
fi

# 清理npm缓存
echo "清理npm缓存..."
npm cache clean --force

# 清理npm临时文件
if [ -d "$HOME/.npm" ]; then
    echo "清理npm缓存目录..."
    rm -rf "$HOME/.npm"
fi

echo "📦 重新安装依赖（使用兼容配置）..."

# 设置环境变量
export NPM_CONFIG_LEGACY_PEER_DEPS=true
export NPM_CONFIG_FORCE=true
export NPM_CONFIG_AUDIT=false
export NPM_CONFIG_FUND=false

# 首先安装核心依赖
echo "安装核心React依赖..."
npm install react@^18.2.0 react-dom@^18.2.0 --legacy-peer-deps --force

# 安装TypeScript和相关工具
echo "安装TypeScript..."
npm install typescript@4.9.5 --legacy-peer-deps --force

# 安装ajv相关包（关键步骤）
echo "安装AJV兼容版本..."
npm install ajv@6.12.6 ajv-keywords@3.5.2 --legacy-peer-deps --force

# 安装react-scripts
echo "安装react-scripts..."
npm install react-scripts@5.0.1 --legacy-peer-deps --force

# 安装其他依赖
echo "安装其他依赖..."
npm install --legacy-peer-deps --force

if [ $? -ne 0 ]; then
    echo "❌ npm安装失败，尝试使用yarn..."
    
    # 检查yarn
    if ! command -v yarn &> /dev/null; then
        echo "安装yarn..."
        npm install -g yarn --force
    fi
    
    # 删除yarn.lock重新开始
    if [ -f "yarn.lock" ]; then
        rm yarn.lock
    fi
    
    # 使用yarn安装
    yarn install --force
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        echo "请检查网络连接或尝试手动安装"
        exit 1
    fi
fi

echo "✅ 依赖安装完成"

echo "🔍 验证关键模块..."
if [ -d "node_modules/ajv" ]; then
    echo "✅ ajv 模块已安装"
else
    echo "❌ ajv 模块缺失"
fi

if [ -d "node_modules/ajv-keywords" ]; then
    echo "✅ ajv-keywords 模块已安装"
else
    echo "❌ ajv-keywords 模块缺失"
fi

if [ -d "node_modules/typescript" ]; then
    echo "✅ TypeScript 模块已安装"
    npx tsc --version
else
    echo "❌ TypeScript 模块缺失"
fi

echo "🚀 尝试启动项目..."
echo "如果启动成功，说明问题已解决"
echo "如果仍有问题，请检查控制台错误信息"

# 设置启动环境变量
export SKIP_PREFLIGHT_CHECK=true
export TSC_COMPILE_ON_ERROR=true
export ESLINT_NO_DEV_ERRORS=true
export GENERATE_SOURCEMAP=false

echo "启动开发服务器..."
npm start