#!/bin/bash

# AI伴侣Web应用构建脚本

echo "🔨 构建AI伴侣Web应用..."

# 创建构建目录
mkdir -p dist

# 构建前端
echo "📦 构建前端应用..."
cd frontend
npm run build
cd ..

# 复制前端构建文件到dist目录
echo "📁 复制前端构建文件..."
cp -r frontend/build/* dist/

# 复制后端文件到dist目录
echo "📁 复制后端文件..."
mkdir -p dist/api
cp -r backend/* dist/api/

# 创建生产环境配置文件
echo "⚙️  创建生产环境配置..."
cat > dist/api/.env << EOF
DEBUG=false
HOST=0.0.0.0
PORT=8000
DATABASE_URL=sqlite+aiosqlite:///./ai_companion.db

# 请配置您的AI模型API密钥
OPENAI_API_KEY=
BYTEDANCE_API_KEY=
BAIDU_API_KEY=
BAIDU_SECRET_KEY=

DEFAULT_AI_PROVIDER=openai
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_WINDOW=60
LOG_LEVEL=INFO
EOF

# 创建启动脚本
echo "🚀 创建生产环境启动脚本..."
cat > dist/start.sh << 'EOF'
#!/bin/bash

echo "🚀 启动AI伴侣Web应用生产环境..."

# 进入API目录
cd api

# 检查Python虚拟环境
if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境并安装依赖
source venv/bin/activate
pip install -r requirements.txt

# 启动应用
echo "启动服务器..."
python main.py
EOF

chmod +x dist/start.sh

# 创建Docker配置
echo "🐳 创建Docker配置..."
cat > dist/Dockerfile << 'EOF'
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

FROM python:3.9-slim

WORKDIR /app

# 安装Python依赖
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ ./

# 复制前端构建文件
COPY --from=frontend-build /app/frontend/build ./static

# 创建数据目录
RUN mkdir -p data logs

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["python", "main.py"]
EOF

cat > dist/docker-compose.yml << 'EOF'
version: '3.8'

services:
  ai-companion:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEBUG=false
      - HOST=0.0.0.0
      - PORT=8000
      - DATABASE_URL=sqlite+aiosqlite:///./data/ai_companion.db
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./.env:/app/.env
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - ai-companion
    restart: unless-stopped
EOF

# 创建Nginx配置
cat > dist/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server ai-companion:8000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            try_files $uri $uri/ @backend;
        }

        location @backend {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# 创建部署说明
cat > dist/README.md << 'EOF'
# AI伴侣Web应用 - 生产环境部署

## 快速部署

### 方式1: 直接运行
1. 配置环境变量文件 `.env`
2. 运行启动脚本: `./start.sh`

### 方式2: Docker部署
1. 配置环境变量文件 `.env`
2. 运行: `docker-compose up -d`

## 配置说明

请在 `.env` 文件中配置以下参数:

```env
# AI模型API密钥
OPENAI_API_KEY=your_openai_api_key
BYTEDANCE_API_KEY=your_bytedance_api_key
BAIDU_API_KEY=your_baidu_api_key
BAIDU_SECRET_KEY=your_baidu_secret_key

# 默认AI提供商
DEFAULT_AI_PROVIDER=openai
```

## 访问地址

- 应用地址: http://localhost (使用Nginx) 或 http://localhost:8000 (直接访问)
- API文档: http://localhost:8000/docs

## 日志查看

- 应用日志: `logs/app.log`
- Docker日志: `docker-compose logs -f`
EOF

echo "✅ 构建完成！"
echo ""
echo "📁 构建文件位置: dist/"
echo "🚀 生产环境启动: cd dist && ./start.sh"
echo "🐳 Docker部署: cd dist && docker-compose up -d"