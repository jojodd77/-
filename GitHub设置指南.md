# GitHub 仓库设置指南

## 📋 第一步：在 GitHub 创建仓库

### 方式一：网页创建（推荐）

1. 访问 https://github.com
2. 点击右上角 `+` → `New repository`
3. 填写信息：
   - **Repository name**: `my-tool-platform`（或你的项目名）
   - **Description**: 工具平台项目
   - **Visibility**: 选择 Public 或 Private
   - **不要**勾选任何初始化选项（README、.gitignore、LICENSE）
4. 点击 `Create repository`

### 方式二：使用 GitHub CLI

```bash
gh repo create my-tool-platform --public --description "工具平台项目"
```

---

## 🔧 第二步：本地初始化 Git

在项目目录下执行：

```bash
cd /Users/jojodd/my-tool-platform

# 初始化 Git 仓库
git init

# 设置默认分支为 main
git branch -M main

# 添加所有文件
git add .

# 首次提交
git commit -m "chore: 初始化项目"

# 连接远程仓库
git remote add origin https://github.com/jojodd77/-.git

# 推送到 GitHub
git push -u origin main
```

---

## ⚙️ 第三步：GitHub 仓库配置

### 1. 仓库设置

在 GitHub 仓库页面，点击 `Settings`：

- **General**
  - 添加仓库描述
  - 添加 Topics（如：`nextjs`, `typescript`, `tool-platform`）
  - 设置默认分支为 `main`

- **Branches**（可选）
  - 设置分支保护规则
  - 要求 PR 审核后才能合并

### 2. 添加 Collaborators（如需要）

`Settings` → `Collaborators` → `Add people`

---

## 🚀 第四步：安装依赖并运行

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

访问 http://localhost:3000 查看项目

---

## 📝 后续开发流程

### 创建功能分支

```bash
git checkout -b feature/功能名称
```

### 提交代码

```bash
git add .
git commit -m "feat: 添加新功能"
git push origin feature/功能名称
```

### 创建 Pull Request

1. 在 GitHub 仓库页面点击 `Pull requests`
2. 点击 `New pull request`
3. 选择你的功能分支
4. 填写 PR 描述（使用模板）
5. 提交 PR 等待审核

---

## ✅ 检查清单

- [ ] GitHub 仓库已创建
- [ ] 本地 Git 已初始化
- [ ] 代码已推送到 GitHub
- [ ] 仓库描述和 Topics 已设置
- [ ] 依赖已安装
- [ ] 项目可以正常运行

---

完成以上步骤后，你的项目就完全准备好了！🎉

