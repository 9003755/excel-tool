# GitHub Actions 启用指南

## 问题描述
您遇到的错误："Actions is currently unavailable for your repository, and your Pages site requires a Jekyll build step. To continue building your site on pushes, you need to enable Actions."

## 解决步骤

### 1. 启用 GitHub Actions

1. **访问您的 GitHub 仓库**
   - 打开浏览器，访问：https://github.com/9003755/excel-tool

2. **进入仓库设置**
   - 点击仓库页面顶部的 "Settings" 选项卡

3. **启用 Actions**
   - 在左侧菜单中找到并点击 "Actions"
   - 在 "General" 部分，确保选择了 "Allow all actions and reusable workflows"
   - 如果显示 "Disable actions"，请选择 "Allow all actions and reusable workflows"
   - 点击 "Save" 保存设置

### 2. 配置 GitHub Pages

1. **进入 Pages 设置**
   - 在仓库设置页面，在左侧菜单中找到并点击 "Pages"

2. **配置部署源**
   - 在 "Source" 部分，选择 "GitHub Actions"
   - 这将允许使用自定义的 GitHub Actions 工作流来部署 Pages

### 3. 推送代码到新仓库

如果您还没有将代码推送到新的 excel-tool 仓库，请执行以下命令：

```bash
# 添加新的远程仓库
git remote remove origin
git remote add origin https://github.com/9003755/excel-tool.git

# 推送代码
git add .
git commit -m "Initial commit for excel-tool repository"
git push -u origin main
```

### 4. 验证部署

1. **检查 Actions 运行**
   - 推送代码后，访问仓库的 "Actions" 选项卡
   - 您应该看到工作流正在运行或已完成

2. **访问部署的网站**
   - 部署成功后，您的网站将在以下地址可用：
   - https://9003755.github.io/excel-tool

## 当前配置状态

✅ **package.json 配置正确**
- homepage: "https://9003755.github.io/excel-tool"
- 构建脚本配置正确

✅ **GitHub Actions 工作流配置正确**
- 使用最新的完整 commit SHA
- 所有 Actions 都已固定到安全版本
- 部署到 ./dist 目录

## 常见问题解决

### 如果 Actions 仍然不可用
1. 确保您的 GitHub 账户有足够的权限
2. 检查仓库是否为私有仓库（私有仓库可能有 Actions 使用限制）
3. 确认您的 GitHub 账户没有超出 Actions 使用配额

### 如果部署失败
1. 检查 Actions 日志中的错误信息
2. 确保所有依赖项都正确安装
3. 验证构建命令能够成功生成 dist 目录

## 下一步

完成上述步骤后，您的 excel-tool 仓库应该能够：
1. 自动运行 GitHub Actions 工作流
2. 成功构建和部署到 GitHub Pages
3. 在每次推送到 main 分支时自动更新网站

如果遇到任何问题，请检查 GitHub Actions 的运行日志获取详细的错误信息。