#!/bin/bash

# AI伴侣Web应用开发启动脚本

echo "🚀 启动AI伴侣Web应用开发环境..."

# 检查是否安装了必要的依赖
check_dependencies() {
    echo "📋 检查依赖..."
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 未安装，请先安装Python 3.9+"
        exit 1
    fi
    
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
    
    echo "✅ 依赖检查完成"
}

# 安装后端依赖
install_backend_deps() {
    echo "📦 安装后端依赖..."
    cd backend
    
    # 创建虚拟环境（如果不存在）
    if [ ! -d "venv" ]; then
        echo "创建Python虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 安装依赖
    pip install -r requirements.txt
    
    cd ..
    echo "✅ 后端依赖安装完成"
}

# 安装前端依赖
install_frontend_deps() {
    echo "📦 安装前端依赖..."
    cd frontend
    
    # 安装npm依赖
    npm install
    
    cd ..
    echo "✅ 前端依赖安装完成"
}

# 启动开发服务器
start_dev_servers() {
    echo "🔥 启动开发服务器..."
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动后端服务器（后台运行）
    echo "启动后端服务器 (http://localhost:8000)..."
    cd backend
    source venv/bin/activate
    python main.py > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # 等待后端启动
    sleep 3
    
    # 启动前端服务器（后台运行）
    echo "启动前端服务器 (http://localhost:3000)..."
    cd frontend
    npm start > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # 保存进程ID
    echo $BACKEND_PID > logs/backend.pid
    echo $FRONTEND_PID > logs/frontend.pid
    
    echo "✅ 开发服务器启动完成"
    echo ""
    echo "🌐 前端地址: http://localhost:3000"
    echo "🔧 后端API: http://localhost:8000"
    echo "📚 API文档: http://localhost:8000/docs"
    echo ""
    echo "📝 日志文件:"
    echo "   后端: logs/backend.log"
    echo "   前端: logs/frontend.log"
    echo ""
    echo "⏹️  停止服务器: ./scripts/stop.sh"
}

# 主函数
main() {
    check_dependencies
    install_backend_deps
    install_frontend_deps
    start_dev_servers
    
    echo "🎉 开发环境启动完成！"
}

# 运行主函数
main