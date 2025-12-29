# 🆓 免费大模型 API 快速配置

## ⭐ 推荐：智谱清言 ChatGLM

### 为什么推荐？

- ✅ **免费额度大**：新用户免费 1 亿 tokens
- ✅ **中文支持优秀**：专门优化中文
- ✅ **国内访问快**：无需科学上网
- ✅ **API 简单**：配置容易

---

## 🚀 3 步完成配置

### 第一步：注册并获取 API Key

1. 访问：https://open.bigmodel.cn/
2. 注册账号（使用手机号或邮箱）
3. 登录后进入控制台
4. 创建应用，获取 API Key

### 第二步：配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
cd /Users/jojodd/my-tool-platform
```

创建文件并添加：

```env
ZHIPU_API_KEY=your_api_key_here
```

**创建方法**：

```bash
# 使用编辑器
code .env.local

# 或使用 nano
nano .env.local
```

然后粘贴你的 API Key。

### 第三步：重启服务器

```bash
# 停止当前服务器（Ctrl + C）
# 重新启动
npm run dev
```

---

## ✅ 验证配置

1. 访问：http://localhost:3001
2. 进入"发音修正"页面
3. 输入测试文本：`图中哪个光路图是正确的？`
4. 点击"判断并修正"
5. 应该能看到使用真实大模型的修正结果

---

## 📊 其他免费选项

### 选项2：百度千帆（ERNIE）

**配置**：
```env
BAIDU_API_KEY=your_api_key
BAIDU_SECRET_KEY=your_secret_key
```

**获取方式**：
1. 访问：https://cloud.baidu.com/product/wenxinworkshop
2. 注册并创建应用
3. 获取 API Key 和 Secret Key

---

## 💡 提示

- **智谱清言**：推荐用于开发和生产
- **百度千帆**：备选方案
- **免费额度**：通常足够开发和小规模使用

---

## 🔗 相关链接

- 智谱清言：https://open.bigmodel.cn/
- 百度千帆：https://cloud.baidu.com/product/wenxinworkshop
- 详细配置：查看 `免费大模型API配置.md`

---

**推荐使用智谱清言，免费额度大，配置简单！** 🎉

