# AI 伴侣 Web 应用 🤖

一个现代化的 AI 聊天 Web 应用，支持与主流大语言模型进行自然对话，并集成 Live2D 虚拟角色，提供沉浸式交互体验。

## 项目概览

- **项目名称**：AI 伴侣 Web 应用
- **核心定位**：AI 聊天 + Live2D 虚拟角色交互
- **技术栈**：React + TypeScript + FastAPI + Live2D
- **当前状态**：核心功能已实现，存在 Node.js 版本兼容性问题

------

## 项目结构

```
ai-companion-web/
├── backend/          # Python FastAPI后端服务
├── frontend/         # React TypeScript前端应用
│   └── public/
│       └── live2d/   # Live2D模型资源目录
├── docs/             # 项目文档（集成指南、排障手册）
├── scripts/          # 自动化脚本（启动、安装、修复）
├── docker-compose.yml # Docker容器化配置
└── README.md         # 项目说明文档
```

------

## 技术栈

### 后端

- **语言**：Python 3.9+
- **框架**：FastAPI
- **数据库**：SQLAlchemy + SQLite
- **实时通信**：Socket.IO
- **数据验证**：Pydantic

### 前端

- **框架**：React 18 + TypeScript
- **样式**：Tailwind CSS
- **实时通信**：Socket.IO Client
- **HTTP 客户端**：Axios
- **渲染引擎**：PIXI.js + Live2D

------

## 核心功能

### 🎭 Live2D 虚拟角色

- **响应式布局**：桌面端侧边栏、移动端底部自适应显示
- **智能动作**：根据聊天状态自动触发对应动作
- **情绪识别**：分析消息内容，触发对应表情和动作
- **交互体验**：支持点击交互和视线跟踪

### 💬 智能聊天

- **流式回复**：实时显示 AI 生成过程
- **多模型支持**：OpenAI GPT-4、字节跳动即梦大模型、百度文心一言
- **会话管理**：自动保存聊天历史，支持多轮对话

------

## 快速开始

### 前置条件

- Node.js（推荐 v16.20.2，避免 v20 + 兼容性问题）
- Python 3.9+
- 可选：Docker & Docker Compose

### 自动化启动（推荐）

我们提供了多个启动脚本来适应不同环境，优先尝试交互式解决方案菜单：

```
# 选项1: 交互式解决方案菜单（推荐）
scripts\solution-menu.bat

# 选项2: 使用Yarn包管理器启动
scripts\yarn-start.bat

# 选项3: 内存优化启动（解决内存溢出）
scripts\memory-fix-start.bat

# 选项4: 简单启动
scripts\simple-start.bat
```

### 手动启动

如果自动化脚本失败，可以按以下步骤手动启动：

#### 1. 后端启动

```
cd backend
pip install -r requirements.txt
python main.py
```

#### 2. 前端启动

```
cd frontend

# 设置环境变量（解决Node.js v20+兼容性问题）
set NODE_OPTIONS=--max_old_space_size=8192 --openssl-legacy-provider
set SKIP_PREFLIGHT_CHECK=true

# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npm start
```

#### 3. Live2D 集成（可选）

```
# 安装Live2D依赖
./scripts/install-live2d.bat  # Windows
./scripts/install-live2d.sh   # Linux/Mac

# 将模型文件放置到 frontend/public/live2d/rem/rem/ 目录下
```

详细说明请参考 [Live2D 集成文档](docs/LIVE2D_INTEGRATION.md)

------

## 常见问题与解决方案

### Node.js v20+ 兼容性问题

**问题**：使用 Node.js v20.13.1 时出现 JavaScript 内存溢出或依赖冲突。

**解决方案**：

1. **降级到 Node.js 16（最可靠）**

   - 下载：[Node.js 16.20.2](https://nodejs.org/dist/v16.20.2/node-v16.20.2-x64.msi)
   - 安装后重启终端，重新执行启动命令

2. **使用 Yarn 包管理器**

   ```
   npm install -g yarn
   cd frontend
   yarn install
   yarn start
   ```

3. **内存优化启动**

   ```
   scripts\memory-fix-start.bat
   ```

### 其他问题

- `Cannot find module 'ajv/dist/compile/codegen'`
- TypeScript 版本冲突
- 依赖解析错误

请参考 [故障排除指南](docs/TROUBLESHOOTING.md)

------

## 部署

### Docker 部署

项目支持 Docker 容器化部署：

```
docker-compose up -d
```

详细部署流程请参考部署文档。

------

## 贡献与扩展

- 欢迎提交 Issue 和 Pull Request
- 扩展新的 AI 模型：参考`backend/models/`目录下的实现
- 添加新的 Live2D 模型：参考[Live2D 集成文档](docs/LIVE2D_INTEGRATION.md)

------

## 许可证

本项目采用 MIT 许可证。

