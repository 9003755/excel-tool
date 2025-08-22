# Excel Tool 完整部署指南

## 项目概述

本项目是一个基于 React + Vite + TypeScript 的 Excel 批量处理工具，将部署到 GitHub Pages。

## 当前配置状态

### ✅ 已完成的配置

1. **项目配置**
   - `package.json` 中 homepage 已设置为：`https://9003755.github.io/excel-tool`
   - `vite.config.ts` 中 base 路径已设置为：`/excel-tool/`
   - 构建输出目录：`./dist`

2. **GitHub Actions 工作流**
   - 文件位置：`.github/workflows/deploy.yml`
   - 所有 Actions 已固定到完整的 commit SHA（符合 GitHub 安全要求）
   - 使用的 Actions 版本：
     - `actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332` # v4.1.7
     - `actions/setup-node@1e60f620b9541d16bece96c5465dc8ee9832be0b` # v4.0.3
     - `actions/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b` # v4.0.0
     - `actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa` # v3.0.1
     - `actions/deploy-pages@d6db901a6782ca56580995ba3a895ac3a72f3935` # v4.0.5

## 部署步骤

### 第一步：创建新的 GitHub 仓库

1. 访问 GitHub：https://github.com/9003755
2. 点击 "New repository"
3. 仓库名称：`excel-tool`
4. 设置为 Public（GitHub Pages 免费版需要公开仓库）
5. 不要初始化 README、.gitignore 或 license
6. 点击 "Create repository"

### 第二步：推送代码到新仓库

在项目根目录执行以下命令：

```bash
# 移除旧的远程仓库
git remote remove origin

# 添加新的远程仓库
git remote add origin https://github.com/9003755/excel-tool.git

# 确保所有更改都已提交
git add .
git commit -m "Update configuration for excel-tool repository"

# 推送到新仓库
git push -u origin main
```

### 第三步：启用 GitHub Actions

1. **访问仓库设置**
   - 打开：https://github.com/9003755/excel-tool
   - 点击 "Settings" 选项卡

2. **启用 Actions**
   - 在左侧菜单中点击 "Actions"
   - 在 "General" 部分，选择 "Allow all actions and reusable workflows"
   - 点击 "Save"

### 第四步：配置 GitHub Pages

1. **进入 Pages 设置**
   - 在仓库设置页面，点击左侧菜单中的 "Pages"

2. **配置部署源**
   - 在 "Source" 部分，选择 "GitHub Actions"
   - 这将启用自定义工作流部署

### 第五步：验证部署

1. **检查 Actions 运行**
   - 访问：https://github.com/9003755/excel-tool/actions
   - 确认工作流正在运行或已完成

2. **访问部署的网站**
   - 部署成功后，网站将在以下地址可用：
   - https://9003755.github.io/excel-tool

## 重要注意事项

### GitHub Actions 安全要求 <mcreference link="https://www.stepsecurity.io/blog/pinning-github-actions-for-enhanced-security-a-complete-guide" index="3">3</mcreference>

- ✅ 所有 Actions 都已固定到完整的 commit SHA
- ✅ 符合 GitHub 最新的安全最佳实践
- ✅ 防止供应链攻击和恶意代码注入

### GitHub Pages 要求 <mcreference link="https://github.blog/changelog/2024-12-05-deprecation-notice-github-pages-actions-to-require-artifacts-actions-v4-on-github-com/" index="2">2</mcreference>

- ✅ 使用 `actions/upload-pages-artifact@v3`
- ✅ 使用 `actions/deploy-pages@v4`
- ⚠️ 注意：`actions/upload-artifact@v3` 将于 2025年1月30日弃用 <mcreference link="https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/" index="1">1</mcreference>

### 构建配置

- ✅ Node.js 18 环境
- ✅ npm ci 安装依赖
- ✅ TypeScript 编译检查
- ✅ Vite 构建优化
- ✅ 输出到 `./dist` 目录

## 故障排除

### 如果 Actions 不可用

1. 确保仓库是公开的
2. 检查 GitHub 账户的 Actions 配额
3. 确认在仓库设置中启用了 Actions

### 如果部署失败

1. 检查 Actions 日志中的错误信息
2. 确认所有依赖项都能正确安装
3. 验证构建命令能成功生成 `dist` 目录
4. 检查 `package.json` 中的 `homepage` 字段
5. 确认 `vite.config.ts` 中的 `base` 路径正确

### 如果网站无法访问

1. 确认 GitHub Pages 已启用
2. 检查部署是否成功完成
3. 等待 DNS 传播（可能需要几分钟）
4. 确认 URL 格式正确：`https://9003755.github.io/excel-tool`

## 后续维护

### 代码更新

每次推送到 `main` 分支时，GitHub Actions 会自动：
1. 安装依赖
2. 运行 TypeScript 检查
3. 构建项目
4. 部署到 GitHub Pages

### 定期检查

- 关注 GitHub Actions 的弃用通知
- 定期更新 Actions 到最新的 commit SHA
- 监控网站性能和可用性

## 联系支持

如果遇到问题：
1. 检查 GitHub Actions 运行日志
2. 参考 GitHub Pages 官方文档
3. 查看项目的 Issues 页面

---

**部署完成后，您的 Excel 批量处理工具将在 https://9003755.github.io/excel-tool 上线！**