# 🆓 免费大模型 API 配置指南

## 🎯 推荐的免费大模型

### 1. 智谱清言 ChatGLM（推荐）⭐

**优势**：
- ✅ 新用户免费 1 亿 tokens
- ✅ 中文支持优秀
- ✅ 国内访问速度快
- ✅ API 简单易用

**获取方式**：
1. 访问：https://open.bigmodel.cn/
2. 注册账号
3. 在控制台获取 API Key

**配置**：
```env
ZHIPU_API_KEY=your_api_key_here
```

---

### 2. 百度千帆大模型（ERNIE）

**优势**：
- ✅ 免费额度：ERNIE-Speed-8K（300 RPM）
- ✅ 中文优化
- ✅ 国内访问

**获取方式**：
1. 访问：https://cloud.baidu.com/product/wenxinworkshop
2. 注册并创建应用
3. 获取 API Key 和 Secret Key

**配置**：
```env
BAIDU_API_KEY=your_api_key
BAIDU_SECRET_KEY=your_secret_key
```

---

### 3. 讯飞星火大模型（Spark-Lite）

**优势**：
- ✅ 免费版本：无限 tokens
- ✅ QPS: 2
- ✅ 中文支持好

**获取方式**：
1. 访问：https://xinghuo.xfyun.cn/
2. 注册账号
3. 获取 API Key

**配置**：
```env
XUNFEI_APPID=your_app_id
XUNFEI_API_KEY=your_api_key
XUNFEI_API_SECRET=your_api_secret
```

---

### 4. 腾讯混元大模型（Hunyuan-Lite）

**优势**：
- ✅ 免费版本
- ✅ 最多 5 个并发请求
- ✅ 中文支持

**获取方式**：
1. 访问：https://cloud.tencent.com/product/hunyuan
2. 注册并获取密钥

---

## 🚀 快速配置（推荐：智谱清言）

### 第一步：注册并获取 API Key

1. 访问：https://open.bigmodel.cn/
2. 注册账号
3. 在控制台获取 API Key

### 第二步：配置环境变量

创建 `.env.local` 文件：

```env
# 智谱清言 ChatGLM（推荐）
ZHIPU_API_KEY=your_zhipu_api_key_here

# 或使用百度千帆
# BAIDU_API_KEY=your_baidu_api_key
# BAIDU_SECRET_KEY=your_baidu_secret_key
```

### 第三步：重启服务器

```bash
npm run dev
```

---

## 📊 免费额度对比

| 模型 | 免费额度 | 限制 | 中文支持 |
|------|---------|------|---------|
| 智谱清言 | 1亿 tokens | 新用户 | ⭐⭐⭐⭐⭐ |
| 百度千帆 | 300 RPM | ERNIE-Speed | ⭐⭐⭐⭐⭐ |
| 讯飞星火 | 无限 tokens | QPS: 2 | ⭐⭐⭐⭐⭐ |
| 腾讯混元 | 免费版 | 5并发 | ⭐⭐⭐⭐ |

---

## 💡 使用建议

1. **开发测试**：使用智谱清言（免费额度大）
2. **生产环境**：根据需求选择合适的模型
3. **中文任务**：优先选择国内模型

---

**推荐：智谱清言 ChatGLM，免费额度大，中文支持好！** 🎉



