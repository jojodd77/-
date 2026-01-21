# 🔧 配置智谱清言 API Key 指南

## 📋 配置步骤

### 步骤 1：获取智谱清言 API Key

1. **访问智谱清言开放平台**
   - 网址：https://open.bigmodel.cn/
   - 或者搜索"智谱清言开放平台"

2. **注册/登录账号**
   - 如果没有账号，先注册
   - 如果已有账号，直接登录

3. **创建 API Key**
   - 登录后进入控制台
   - 找到"API Key"或"密钥管理"
   - 点击"创建 API Key"或"新建密钥"
   - 复制生成的 API Key（类似：`abc123def456ghi789...`）

4. **查看免费额度**
   - 新用户通常有 1 亿 tokens 的免费额度
   - 可以在控制台查看剩余额度

### 步骤 2：配置到项目中

#### 方法 A：使用命令行（推荐）

```bash
# 1. 进入项目目录
cd /Users/jojodd/my-tool-platform

# 2. 编辑 .env.local 文件
nano .env.local
```

在文件中添加（如果文件不存在会自动创建）：

```bash
ZHIPU_API_KEY=你的API_Key_这里
```

**重要提示**：
- `ZHIPU_API_KEY` 后面是等号，没有空格
- API Key 后面不要加引号
- 不要有多余的空格

**正确格式**：
```bash
ZHIPU_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**错误格式**：
```bash
ZHIPU_API_KEY = abc123...  # ❌ 等号前后有空格
ZHIPU_API_KEY="abc123..."  # ❌ 有引号
ZHIPU_API_KEY= abc123...   # ❌ 等号后有空格
```

保存文件：
- 如果使用 `nano`：按 `Ctrl+X`，然后按 `Y`，再按 `Enter`
- 如果使用 `vim`：按 `Esc`，输入 `:wq`，按 `Enter`

#### 方法 B：使用文本编辑器

1. 打开 Finder，进入 `/Users/jojodd/my-tool-platform`
2. 找到 `.env.local` 文件（如果不存在，创建新文件）
3. 用文本编辑器打开（TextEdit、VS Code、Cursor 等）
4. 添加配置：
   ```bash
   ZHIPU_API_KEY=你的API_Key_这里
   ```
5. 保存文件

#### 方法 C：使用命令行直接添加

```bash
cd /Users/jojodd/my-tool-platform

# 如果文件不存在，先创建
touch .env.local

# 添加 API Key（替换 your_api_key_here 为你的实际 API Key）
echo "ZHIPU_API_KEY=your_api_key_here" >> .env.local
```

### 步骤 3：验证配置

检查配置是否正确：

```bash
cd /Users/jojodd/my-tool-platform

# 查看配置（会隐藏部分内容）
grep "ZHIPU_API_KEY" .env.local | sed 's/=.*/=***/'
```

如果看到 `ZHIPU_API_KEY=***`，说明配置已添加。

### 步骤 4：重启开发服务器

**重要**：修改 `.env.local` 后，必须重启服务器才能生效。

```bash
# 1. 停止当前服务器
# 在运行 npm run dev 的终端窗口按 Ctrl+C

# 2. 重新启动服务器
cd /Users/jojodd/my-tool-platform
npm run dev
```

### 步骤 5：验证大模型是否启用

启动服务器后，查看终端输出：

**成功启用会看到**：
```
✅ 使用智谱清言 API
```

**如果未启用会看到**：
```
⚠️ ZHIPU_API_KEY 未配置
⚠️ 没有配置任何大模型 API，使用模拟逻辑
```

## 🧪 测试功能

1. **访问页面**
   - 打开 http://localhost:3001/correction

2. **输入测试文本**
   - 例如：`图中哪个光路图是正确的？`
   - 或者：`人物传记创作的核心原则中，哪个原则是判断的关键呢？`

3. **点击"判断并修正"**

4. **查看结果**
   - 如果使用大模型，结果会更准确
   - 终端会显示 API 调用日志

## 🐛 常见问题

### 问题 1：配置后仍然显示"未配置"

**可能原因**：
1. 服务器未重启
2. 配置格式错误（有空格、引号等）
3. 文件保存位置不对

**解决方法**：
```bash
# 1. 确认文件位置
cd /Users/jojodd/my-tool-platform
ls -la .env.local

# 2. 检查配置格式
cat .env.local

# 3. 确保格式正确（等号前后无空格，无引号）
# ZHIPU_API_KEY=your_key_here

# 4. 重启服务器
npm run dev
```

### 问题 2：API Key 无效

**可能原因**：
1. API Key 复制不完整
2. API Key 已过期
3. 额度已用完

**解决方法**：
1. 重新复制 API Key
2. 检查控制台中的 API Key 状态
3. 查看是否有剩余额度

### 问题 3：API 调用失败

**查看错误信息**：
- 终端会显示详细的错误信息
- 常见错误：
  - `401 Unauthorized` - API Key 无效
  - `429 Too Many Requests` - 请求频率过高
  - `500 Internal Server Error` - 服务器错误

**解决方法**：
1. 检查 API Key 是否正确
2. 检查是否有剩余额度
3. 等待一段时间后重试

## 📝 完整配置示例

`.env.local` 文件完整示例：

```bash
# 智谱清言 API Key（推荐，免费）
ZHIPU_API_KEY=your_zhipu_api_key_here

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development

# 可选：其他大模型配置
# BAIDU_API_KEY=your_baidu_api_key
# BAIDU_SECRET_KEY=your_baidu_secret_key
# OPENAI_API_KEY=your_openai_api_key
```

## ✅ 配置检查清单

- [ ] 已注册智谱清言账号
- [ ] 已创建 API Key
- [ ] 已复制 API Key
- [ ] 已在 `.env.local` 中添加配置
- [ ] 配置格式正确（无空格、无引号）
- [ ] 已重启开发服务器
- [ ] 终端显示 `✅ 使用智谱清言 API`
- [ ] 功能测试正常

## 🎯 快速配置命令

一键配置（需要替换 `your_api_key_here`）：

```bash
cd /Users/jojodd/my-tool-platform

# 创建或更新配置
echo "ZHIPU_API_KEY=your_api_key_here" > .env.local

# 或者追加（如果文件已有其他配置）
echo "ZHIPU_API_KEY=your_api_key_here" >> .env.local

# 验证配置
grep "ZHIPU_API_KEY" .env.local

# 重启服务器
npm run dev
```

## 💡 提示

1. **API Key 安全**：
   - `.env.local` 文件已添加到 `.gitignore`，不会被提交到 Git
   - 不要将 API Key 分享给他人
   - 如果泄露，及时在控制台重新生成

2. **免费额度**：
   - 新用户通常有 1 亿 tokens 免费额度
   - 可以在控制台查看使用情况
   - 超出后需要充值

3. **测试建议**：
   - 先用简单文本测试
   - 确认功能正常后再使用复杂文本
   - 注意查看终端日志了解 API 调用情况

配置完成后，你的发音修正功能就会使用真实的大模型了！🎉



