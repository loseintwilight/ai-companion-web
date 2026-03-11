# 启动脚本使用指南

## 🚀 一键启动脚本

### 推荐使用（按优先级排序）

#### 1. `diagnose-and-start.bat` - 智能诊断启动脚本 ⭐⭐⭐⭐
**最新推荐，最智能**
- 🎯 **功能**: 自动诊断系统配置，智能优化启动参数
- 🔧 **特点**: 检测内存、Node.js版本，自动设置最佳配置
- 💻 **使用**: 适合所有用户，特别是遇到内存或兼容性问题
- ✅ **适用**: 所有情况，自动适配系统环境

```bash
scripts\diagnose-and-start.bat
```

#### 2. `memory-fix-start.bat` - 内存优化启动脚本 ⭐⭐⭐
**专门解决内存问题**
- 🎯 **功能**: 大内存配置，解决JavaScript OOM错误
- 🔧 **特点**: 16GB堆内存，512MB半空间，完整兼容性支持
- 💻 **使用**: 遇到内存不足或OOM错误时使用
- ✅ **适用**: 高内存系统，Node.js v20+用户

#### 3. `yarn-start.bat` - Yarn包管理器启动 ⭐⭐⭐
**使用Yarn替代npm**
- 🎯 **功能**: 自动安装Yarn，使用Yarn管理依赖
- 🔧 **特点**: 更好的内存管理，更稳定的依赖解析
- 💻 **使用**: npm经常出问题时的替代方案
- ✅ **适用**: npm安装失败或内存问题用户

#### 4. `launch.bat` - 终极一键启动脚本 ⭐⭐⭐
**功能最完整**
- 🎯 **功能**: 完全自动化，处理所有问题
- 🔧 **特点**: 自动检测环境、修复兼容性、安装依赖、启动项目
- 💻 **使用**: 双击运行或命令行执行
- ✅ **适用**: 所有情况，特别是首次运行

#### 5. `simple-start.bat` - 简单启动脚本 ⭐⭐
**最简单快速**
- 🎯 **功能**: 基础启动功能，快速执行
- 🔧 **特点**: 代码简洁，启动迅速
- 💻 **使用**: 环境配置良好时使用
- ✅ **适用**: 依赖已安装，系统配置正常

#### 6. `start-app.bat` - 完整启动脚本 ⭐⭐
**详细过程显示**
- 🎯 **功能**: 详细的环境检查和依赖修复
- 🔧 **特点**: 分步骤显示进度，详细的错误提示
- 💻 **使用**: 适合需要了解详细过程的用户
- ✅ **适用**: 复杂环境或需要调试时

## 🔧 修复脚本

### `fix-compatibility.bat` - 兼容性修复
**解决Node.js版本问题**
- 🎯 **功能**: 修复Node.js版本兼容性问题
- 🔧 **特点**: 无需nvm，适配当前Node.js版本
- 💻 **使用**: 当遇到版本兼容性问题时运行
- ✅ **适用**: Node.js v20+ 用户

### `fix-ajv-conflict.bat` - AJV冲突修复
**解决依赖冲突**
- 🎯 **功能**: 专门修复ajv版本冲突问题
- 🔧 **特点**: 强制安装兼容版本
- 💻 **使用**: 当遇到ajv相关错误时运行
- ✅ **适用**: 出现 `Cannot find module 'ajv/dist/compile/codegen'` 错误

## 📋 使用场景

### 场景1: 首次运行项目（推荐）
```bash
# 使用智能诊断启动
scripts\diagnose-and-start.bat
```

### 场景2: 遇到内存不足或OOM错误
```bash
# 使用内存优化启动
scripts\memory-fix-start.bat
```

### 场景3: npm安装经常失败
```bash
# 使用Yarn启动
scripts\yarn-start.bat
```

### 场景4: Node.js版本兼容性问题
```bash
# 先修复兼容性
scripts\fix-compatibility.bat
# 然后使用诊断启动
scripts\diagnose-and-start.bat
```

### 场景5: 依赖冲突问题
```bash
# 修复ajv冲突
scripts\fix-ajv-conflict.bat
# 然后启动项目
scripts\diagnose-and-start.bat
```

### 场景6: 快速启动（环境已配置）
```bash
# 使用简单启动
scripts\simple-start.bat
```

## ⚠️ 常见问题

### Q1: JavaScript heap out of memory / OOM错误
**A**: 
1. 使用 `scripts\memory-fix-start.bat` (推荐)
2. 或使用 `scripts\diagnose-and-start.bat` 自动优化
3. 手动设置: `set NODE_OPTIONS=--max_old_space_size=16384 --openssl-legacy-provider`

### Q2: 提示 "nvm 不是内部或外部命令"
**A**: 使用我们的脚本无需安装nvm，直接运行 `diagnose-and-start.bat`

### Q3: Node.js版本过高导致启动失败
**A**: 
1. 运行 `scripts\diagnose-and-start.bat` 自动适配
2. 或运行 `scripts\fix-compatibility.bat` 修复兼容性

### Q4: npm依赖安装失败
**A**: 
1. 使用 `scripts\yarn-start.bat` 替代npm
2. 或运行 `scripts\diagnose-and-start.bat` 自动修复
3. 手动清理: `rmdir /s /q node_modules && npm install --legacy-peer-deps`

### Q5: 端口3000被占用
**A**: 
```bash
# 查找占用进程
netstat -ano | findstr :3000
# 杀死进程
taskkill /PID <PID> /F
```

### Q6: ajv模块找不到
**A**: 
1. 运行 `scripts\fix-ajv-conflict.bat`
2. 或使用 `scripts\diagnose-and-start.bat` 自动修复

## 🎯 脚本特性

### 自动化特性
- ✅ 自动检测Node.js版本
- ✅ 自动设置兼容性环境变量
- ✅ 自动处理依赖冲突
- ✅ 自动清理缓存
- ✅ 自动分步安装依赖
- ✅ 自动验证安装结果

### 兼容性支持
- ✅ Node.js 16.x (完美兼容)
- ✅ Node.js 18.x (良好兼容)
- ✅ Node.js 20.x+ (自动修复)
- ✅ Windows 10/11
- ✅ 各种npm版本

### 错误处理
- ✅ 详细的错误提示
- ✅ 自动重试机制
- ✅ 备用安装方案
- ✅ 故障排除建议

## 📞 获取帮助

如果脚本运行遇到问题:

1. **查看控制台输出**: 脚本会显示详细的错误信息
2. **运行完整修复**: `scripts\fix-compatibility.bat`
3. **手动清理重装**: 删除 `node_modules` 和 `package-lock.json`
4. **检查环境**: 确保Node.js和npm正确安装
5. **查看文档**: `docs\TROUBLESHOOTING.md`

## 🎉 成功启动后

项目启动成功后，你可以访问:
- **前端应用**: http://localhost:3000
- **API文档**: http://localhost:8000/docs (需要启动后端)
- **Live2D角色**: 已集成在前端界面中