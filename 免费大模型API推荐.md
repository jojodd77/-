# 🆓 免费大模型 API 推荐

## 当前已接入的免费 API

### 1. 智谱AI（智谱清言）✅ 推荐
- **免费额度**：新用户 1 亿 tokens
- **API 文档**：https://open.bigmodel.cn/
- **状态**：✅ 已测试成功
- **特点**：
  - 中文支持好
  - 响应速度快
  - 免费额度充足
  - 文档完善

### 2. 百度千帆（文心一言）✅
- **免费额度**：ERNIE-Speed-8K（300 RPM）
- **API 文档**：https://cloud.baidu.com/product/wenxinworkshop
- **状态**：已接入
- **特点**：
  - 中文支持好
  - 免费额度充足
  - 需要配置 API Key 和 Secret Key

### 3. 豆包（字节跳动）⚠️
- **免费额度**：部分模型提供免费额度
- **API 文档**：https://www.volcengine.com/docs/82379
- **状态**：已接入，需要配置正确的模型端点
- **特点**：中文支持好

## 其他推荐的免费 API

### 4. 通义千问（阿里云）
- **免费额度**：新用户可能有免费试用额度
- **API 文档**：https://help.aliyun.com/zh/model-studio/
- **特点**：中文支持好，阿里云服务稳定

### 5. 月之暗面（Kimi）
- **免费额度**：可能有免费额度
- **API 文档**：https://platform.moonshot.cn/
- **特点**：长文本支持好，中文支持好

### 6. 零一万物（Yi）
- **免费额度**：可能有免费额度
- **API 文档**：https://platform.01.ai/
- **特点**：开源模型，性能好

### 7. 腾讯混元
- **免费额度**：可能有免费试用
- **API 文档**：https://cloud.tencent.com/product/hunyuan
- **特点**：腾讯服务，中文支持好

### 8. OpenRouter（聚合平台）
- **免费额度**：提供多个免费模型
- **API 文档**：https://openrouter.ai/
- **特点**：聚合多个模型，统一接口

### 9. Groq（高速推理）
- **免费额度**：Llama 3 免费，超高速推理
- **API 文档**：https://console.groq.com/
- **特点**：速度极快，兼容 OpenAI API

## 💡 推荐优先级

### 第一优先级（已接入且可用）
1. **智谱AI** ⭐⭐⭐⭐⭐
   - ✅ 已测试成功
   - ✅ 免费额度充足
   - ✅ 中文支持好

### 第二优先级（需要配置）
2. **百度千帆** ⭐⭐⭐⭐
   - ✅ 免费额度充足
   - ⚠️ 需要配置 API Key

3. **豆包** ⭐⭐⭐
   - ⚠️ 需要配置正确的模型端点
   - ✅ 中文支持好

### 第三优先级（可考虑接入）
4. **通义千问** ⭐⭐⭐⭐
5. **月之暗面** ⭐⭐⭐⭐
6. **Groq** ⭐⭐⭐（速度快，但主要是英文）

## 📝 接入新 API 的步骤

1. **获取 API Key**
   - 注册账户
   - 获取 API Key

2. **创建 API 调用文件**
   - 在 `lib/` 目录下创建新文件
   - 参考 `lib/zhipu.ts` 的实现

3. **添加到测试列表**
   - 在 `app/api/test-models/route.ts` 中添加
   - 在 `app/api/test-single/route.ts` 中添加

4. **配置环境变量**
   - 在 `.env.local` 中添加 API Key

5. **测试**
   - 使用单文本测试功能

## 🔗 快速链接

- 智谱AI：https://open.bigmodel.cn/
- 百度千帆：https://cloud.baidu.com/product/wenxinworkshop
- 豆包：https://console.volcengine.com/
- 通义千问：https://help.aliyun.com/zh/model-studio/
- 月之暗面：https://platform.moonshot.cn/
- Groq：https://console.groq.com/
- OpenRouter：https://openrouter.ai/


