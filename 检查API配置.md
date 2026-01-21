# 🔍 检查 API 配置状态

## 检查方法

### 方法 1：查看环境变量文件

```bash
cd /Users/jojodd/my-tool-platform
cat .env.local
```

或者只查看 API Key 相关配置：

```bash
grep -E "ZHIPU|BAIDU|OPENAI" .env.local
```

### 方法 2：查看服务器启动日志

启动开发服务器时，查看终端输出：

- 如果看到 `✅ 使用智谱清言 API`，说明配置正确
- 如果看到 `⚠️ ZHIPU_API_KEY 未配置`，说明未配置或配置错误
- 如果看到 `⚠️ 没有配置任何大模型 API，使用模拟逻辑`，说明没有配置任何 API Key

### 方法 3：测试 API 调用

访问 http://localhost:3001/correction，输入测试文本，然后查看：
1. 终端输出 - 会显示使用了哪个 API
2. 修正结果 - 大模型的结果会更准确

## 常见问题

### 问题 1：配置了但服务器未识别

**原因**：环境变量文件修改后，需要重启服务器

**解决**：
```bash
# 停止服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 问题 2：API Key 格式错误

**检查**：
- API Key 前后不能有空格
- 不能有多余的引号
- 格式应该是：`ZHIPU_API_KEY=your_key_here`

**正确格式**：
```bash
ZHIPU_API_KEY=abc123def456ghi789
```

**错误格式**：
```bash
ZHIPU_API_KEY="abc123def456ghi789"  # 不要引号
ZHIPU_API_KEY = abc123def456ghi789   # 不要空格
```

### 问题 3：API Key 无效

**检查**：
1. 确认 API Key 是否正确复制
2. 确认 API Key 是否还有额度
3. 查看终端错误信息

## 验证配置

### 快速验证脚本

```bash
cd /Users/jojodd/my-tool-platform

# 检查配置
if grep -q "ZHIPU_API_KEY" .env.local 2>/dev/null; then
    echo "✅ ZHIPU_API_KEY 已配置"
else
    echo "❌ ZHIPU_API_KEY 未配置"
fi

if grep -q "BAIDU_API_KEY" .env.local 2>/dev/null; then
    echo "✅ BAIDU_API_KEY 已配置"
else
    echo "❌ BAIDU_API_KEY 未配置"
fi

if grep -q "OPENAI_API_KEY" .env.local 2>/dev/null; then
    echo "✅ OPENAI_API_KEY 已配置"
else
    echo "❌ OPENAI_API_KEY 未配置"
fi
```

## 重新配置

如果需要重新配置或修改 API Key：

```bash
cd /Users/jojodd/my-tool-platform

# 编辑 .env.local 文件
nano .env.local
# 或使用其他编辑器，如 vim, code, 等

# 添加或修改配置
ZHIPU_API_KEY=your_new_api_key_here

# 保存后重启服务器
npm run dev
```

## 查看当前使用的 API

启动服务器后，在终端中会显示：
- `✅ 使用智谱清言 API` - 使用智谱清言
- `✅ 使用百度千帆 API` - 使用百度千帆  
- `✅ 使用 OpenAI API` - 使用 OpenAI
- `⚠️ 没有配置任何大模型 API，使用模拟逻辑` - 使用模拟逻辑



