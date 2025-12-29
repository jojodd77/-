# 🚀 快速连接 GitHub 仓库

你的 GitHub 仓库地址：**https://github.com/jojodd77/-**

## 方法一：使用脚本（推荐）

运行连接脚本：

```bash
cd /Users/jojodd/my-tool-platform
./连接GitHub.sh
```

然后推送代码：

```bash
git push -u origin main
```

---

## 方法二：手动执行

### 1. 初始化 Git（如果还没有）

```bash
cd /Users/jojodd/my-tool-platform

# 初始化 Git
git init
git branch -M main
```

### 2. 添加所有文件

```bash
git add .
git commit -m "chore: 初始化项目"
```

### 3. 连接远程仓库

```bash
git remote add origin https://github.com/jojodd77/-.git
```

### 4. 推送到 GitHub

```bash
git push -u origin main
```

如果遇到错误（比如远程仓库不为空），可以使用强制推送：

```bash
git push -u origin main --force
```

⚠️ **注意**: 强制推送会覆盖远程仓库的内容，请确认远程仓库是空的或可以覆盖。

---

## ✅ 验证

推送成功后，访问 https://github.com/jojodd77/- 查看你的代码。

---

## 📝 后续开发

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

在 GitHub 仓库页面创建 Pull Request。

---

## 🔧 如果遇到问题

### 问题：推送被拒绝

**解决方案**：
```bash
# 先拉取远程代码（如果有）
git pull origin main --allow-unrelated-histories

# 或强制推送（如果确定要覆盖）
git push -u origin main --force
```

### 问题：认证失败

**解决方案**：
1. 使用 Personal Access Token（推荐）
2. 或配置 SSH 密钥

查看 GitHub 文档：https://docs.github.com/en/authentication

---

完成连接后，你的项目就完全准备好了！🎉

