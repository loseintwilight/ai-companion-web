#!/bin/bash

# AI伴侣Web应用测试脚本

echo "🧪 运行AI伴侣Web应用测试..."

# 运行后端测试
echo "🔧 运行后端测试..."
cd backend

# 激活虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ 未找到Python虚拟环境，请先运行 ./scripts/dev.sh"
    exit 1
fi

# 运行pytest
echo "运行Python测试..."
pytest tests/ -v --cov=app --cov-report=html --cov-report=term

BACKEND_EXIT_CODE=$?
cd ..

# 运行前端测试
echo "⚛️  运行前端测试..."
cd frontend

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "❌ 未找到node_modules，请先运行 ./scripts/dev.sh"
    exit 1
fi

# 运行Jest测试
echo "运行React测试..."
npm test -- --coverage --watchAll=false

FRONTEND_EXIT_CODE=$?
cd ..

# 运行代码质量检查
echo "📋 运行代码质量检查..."

# 后端代码检查
echo "检查Python代码质量..."
cd backend
source venv/bin/activate

# 运行flake8
flake8 app/ --max-line-length=88 --extend-ignore=E203,W503

# 运行black检查
black --check app/

# 运行isort检查
isort --check-only app/

cd ..

# 前端代码检查
echo "检查TypeScript代码质量..."
cd frontend

# 运行ESLint
npm run lint

# 运行TypeScript类型检查
npm run type-check

cd ..

# 汇总结果
echo ""
echo "📊 测试结果汇总:"
echo "=================="

if [ $BACKEND_EXIT_CODE -eq 0 ]; then
    echo "✅ 后端测试: 通过"
else
    echo "❌ 后端测试: 失败"
fi

if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo "✅ 前端测试: 通过"
else
    echo "❌ 前端测试: 失败"
fi

# 生成测试报告
echo ""
echo "📄 测试报告:"
echo "- 后端覆盖率报告: backend/htmlcov/index.html"
echo "- 前端覆盖率报告: frontend/coverage/lcov-report/index.html"

# 退出码
if [ $BACKEND_EXIT_CODE -eq 0 ] && [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "🎉 所有测试通过！"
    exit 0
else
    echo ""
    echo "💥 部分测试失败，请检查上述输出"
    exit 1
fi