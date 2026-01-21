# 🚀 部署到 Vercel - 详细步骤

## 📋 前置准备

### 1. 确保代码在 GitHub

```bash
cd /Users/jojodd/my-tool-platform

# 检查 Git 状态
git status

# 如果有未提交的更改
git add .
git commit -m "准备部署到 Vercel"
git push
```

### 2. 检查环境变量

确保 `.env.local` 中的 API Key 已准备好：
- `ZHIPU_API_KEY` = 你的智谱清言 API Key

---

## 🎯 部署步骤

### 第一步：注册 Vercel

1. 访问：https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"
4. 授权 GitHub 访问

### 第二步：导入项目

1. 登录后，点击 "Add New Project"
2. 选择你的 GitHub 仓库（`my-tool-platform` 或你的仓库名）
3. 点击 "Import"

### 第三步：配置项目

Vercel 会自动检测 Next.js 项目，通常不需要修改：

- **Framework Preset**: Next.js（自动检测）
- **Root Directory**: `./`（默认）
- **Build Command**: `npm run build`（默认）
- **Output Directory**: `.next`（默认）
- **Install Command**: `npm install`（默认）

### 第四步：配置环境变量

**重要**：必须配置环境变量，否则大模型 API 无法使用！

1. 在项目配置页面，找到 "Environment Variables"
2. 添加环境变量：
   - **Name**: `ZHIPU_API_KEY`
   - **Value**: `dff3af0865ac4a75b7511dd22d6188b8.JBxKqerah1FuJVba`
   - **Environment**: Production, Preview, Development（全部勾选）

3. 如果有其他环境变量，也一并添加

### 第五步：部署

1. 点击 "Deploy"
2. 等待构建完成（通常 2-5 分钟）
3. 部署成功后，会显示：
   - ✅ Production URL: `https://your-project.vercel.app`
   - ✅ 可以访问了！

---

## ✅ 部署后

### 访问你的平台

- **URL**: `https://your-project.vercel.app`
- 任何人都可以通过这个 URL 访问
- 自动 HTTPS，安全可靠

### 自动更新

- 每次 `git push` 到 GitHub
- Vercel 会自动重新部署
- 无需手动操作

---

## 🔧 常见问题

### Q: 部署失败？

**检查**：
1. 代码是否有语法错误
2. 环境变量是否配置正确
3. 查看 Vercel 的构建日志

### Q: API 调用失败？

**检查**：
1. 环境变量 `ZHIPU_API_KEY` 是否配置
2. API Key 是否有效
3. 查看 Vercel 的 Function Logs

### Q: 如何更新？

**方法**：
1. 修改代码
2. `git push` 到 GitHub
3. Vercel 自动重新部署

---

## 📝 自定义域名（可选）

如果你有自己的域名：

1. 在 Vercel 项目设置中，找到 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS
4. 等待生效（通常几分钟）

---

## 💰 费用

- ✅ **免费版**：完全够用
  - 无限部署
  - 100GB 带宽/月
  - 足够个人和小团队使用

- 💎 **Pro 版**（可选）：$20/月
  - 更多带宽
  - 团队协作
  - 高级功能

---

## 🎉 完成！

部署完成后：
- ✅ 获得公开 URL
- ✅ 任何人都可以访问
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 自动部署更新

**分享 URL 给其他人，他们就可以使用了！** 🚀



