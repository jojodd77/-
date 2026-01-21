# 🔧 配置 OpenAI API

## 📋 快速配置指南

### 第一步：获取 OpenAI API Key

1. 访问：https://platform.openai.com/api-keys
2. 登录你的 OpenAI 账号
3. 点击 "Create new secret key"
4. 复制生成的 API Key（只显示一次，请妥善保存）

### 第二步：配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
cd /Users/jojodd/my-tool-platform
```

创建文件：

```bash
# 使用编辑器创建
nano .env.local
# 或
vim .env.local
# 或使用 VS Code
code .env.local
```

添加以下内容：

```env
# OpenAI 配置
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

**重要**：
- 将 `sk-your-api-key-here` 替换为你的真实 API Key
- `gpt-4o-mini` 是推荐的模型（性价比高）
- 也可以使用 `gpt-4` 或 `gpt-3.5-turbo`

### 第三步：重启开发服务器

```bash
# 停止当前服务器（Ctrl + C）
# 然后重新启动
npm run dev
```

### 第四步：测试

1. 访问：http://localhost:3001
2. 进入"发音修正"页面
3. 输入测试文本，查看修正结果

---

## 💰 费用说明

### 模型价格（每1000 tokens）

- **gpt-4o-mini**: $0.15 / $0.60（输入/输出）
- **gpt-3.5-turbo**: $0.50 / $1.50（输入/输出）
- **gpt-4**: $30 / $60（输入/输出）

### 成本估算

- 每次修正大约消耗 500-1000 tokens
- 使用 gpt-4o-mini：每次约 $0.0003-0.0006
- 1000 次修正约 $0.3-0.6

---

## 🔒 安全提示

1. **不要提交 API Key 到 Git**
   - `.env.local` 已在 `.gitignore` 中
   - 不要在任何代码中硬编码 API Key

2. **定期检查使用量**
   - 访问：https://platform.openai.com/usage
   - 设置使用限额

3. **使用环境变量**
   - 生产环境使用服务器环境变量
   - 不要在前端代码中暴露 API Key

---

## ⚙️ 高级配置

### 使用其他模型

```env
# 使用 GPT-4
OPENAI_MODEL=gpt-4

# 使用 GPT-3.5
OPENAI_MODEL=gpt-3.5-turbo
```

### 自定义 API 端点（如使用代理）

修改 `app/api/correct/route.ts` 中的 API 地址。

---

## 🧪 测试 API Key

配置完成后，可以测试 API Key 是否有效：

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## ❓ 常见问题

### Q: API Key 无效？

- 检查 API Key 是否正确
- 检查账户是否有余额
- 检查 API Key 是否过期

### Q: 调用失败？

- 检查网络连接
- 检查 API 配额
- 查看服务器日志

### Q: 响应慢？

- 使用 gpt-4o-mini（更快）
- 检查网络延迟
- 考虑使用国内代理

---

**配置完成后，平台就可以使用真实的大模型进行发音修正了！** 🚀



