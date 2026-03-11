# Live2D 集成说明

## 当前状态

- **项目**: ai-companion-web 前端
- **模型**: Rem (Cubism 2.0 格式)
- **已安装包**: pixi-live2d-display (仅支持 Cubism 3/4)

## 问题

`pixi-live2d-display` 只支持 Cubism 3/4 格式（.moc3 文件），而现有模型是 Cubism 2 格式（.moc 文件）。

## 解决方案

### 方案 1: 使用 live2d-widget（推荐）

live2d-widget 同时支持 Cubism 2 和 Cubism 3/4。

**安装**:
```bash
npm install live2d-widget
```

**使用**:
```typescript
import { loadLive2DModel } from 'live2d-widget';

const model = await loadLive2DModel('/live2d/rem/rem/model.json');
```

### 方案 2: 转换模型为 Cubism 3

使用 Live2D Cubism SDK for Native 将模型转换为 Cubism 3 格式。

### 方案 3: 使用原始 Live2D Cubism 2 WebGL SDK

直接使用官方的 Cubism 2 WebGL SDK。

## 模型资源路径

```
/live2d/rem/rem/
├── model.json              # Cubism 2 模型配置
├── remu.moc               # Cubism 2 模型文件
├── remu.physics.json      # 物理配置
├── remu.pose.json         # 姿势配置
├── remu2048/             # 纹理目录
│   ├── texture_00.png
│   └── texture_01.png
└── motions/              # 动作目录
    ├── Live2D_remu_idle.mtn
    ├── Live2D_remu01.mtn
    └── ...
```

## 避免错误

- ✅ 正确: `/live2d/rem/rem/model.json`
- ❌ 错误: `/live2d/rem/rem` (返回 HTML 404)

## 下一步

根据你的需求选择方案，我将帮你实现对应的 React 组件。
