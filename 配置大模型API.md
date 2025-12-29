# 🔧 配置大模型 API

## 📋 说明

当前平台的发音修正功能使用了**模拟逻辑**。要使用真实的大模型进行修正，需要配置大模型 API。

---

## 🎯 支持的大模型

你可以选择以下任一模型：

1. **OpenAI** (GPT-4, GPT-3.5)
2. **Claude** (Anthropic)
3. **文心一言** (百度)
4. **通义千问** (阿里云)
5. **其他兼容 OpenAI API 的模型**

---

## 🔧 配置步骤

### 方法一：使用 OpenAI API（推荐）

1. **获取 API Key**
   - 访问：https://platform.openai.com/api-keys
   - 创建新的 API Key

2. **配置环境变量**
   
   创建 `.env.local` 文件：
   ```bash
   # OpenAI 配置
   OPENAI_API_KEY=your_api_key_here
   OPENAI_BASE_URL=https://api.openai.com/v1
   ```

3. **修改 API 代码**
   
   编辑 `app/api/correct/route.ts`，替换 `callLLM` 函数：

   ```typescript
   async function callLLM(text: string): Promise<CorrectionResponse> {
     const prompt = `你是一个TTS发音修正专家。根据以下规则判断和修正文本：

核心原则：
1. 格式规范：目标(/注音/)。注音置于双斜线 // 内，使用英文半角括号 () 将注音内容括起来。
2. 中文使用拼音+声调（数字标调法：1,2,3,4,5 或符号标调法：ā,á,ǎ,à）
3. 英文使用国际音标（IPA）
4. 最小干预：只修正需要修正的部分

用户输入：${text}

请判断文本是否符合发音规则：
- 如果符合，返回：{"isCompliant": true, "message": "符合规则"}
- 如果不符合，返回修正后的文本，格式：{"isCompliant": false, "correctedText": "修正后的文本", "message": "已修正"}

只返回JSON，不要其他内容。`;

     const response = await fetch('https://api.openai.com/v1/chat/completions', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
       },
       body: JSON.stringify({
         model: 'gpt-4',
         messages: [
           {
             role: 'system',
             content: '你是一个专业的TTS发音修正助手，严格按照规则进行修正。'
           },
           {
             role: 'user',
             content: prompt
           }
         ],
         temperature: 0.3,
       }),
     });

     const data = await response.json();
     const result = JSON.parse(data.choices[0].message.content);
     
     return {
       originalText: text,
       correctedText: result.correctedText || text,
       isCompliant: result.isCompliant,
       message: result.message,
     };
   }
   ```

### 方法二：使用其他大模型

类似地，根据对应模型的 API 文档修改 `callLLM` 函数。

---

## 📝 Prompt 设计建议

大模型的 Prompt 应该包含：

1. **角色定义**：TTS发音修正专家
2. **规则说明**：核心原则、格式规范
3. **示例**：正例和反例
4. **输出格式**：JSON 格式要求

示例 Prompt 模板：

```
你是一个TTS发音修正专家。根据以下规则判断和修正文本：

核心原则：
1. 格式规范：目标(/注音/)
2. 中文：拼音+声调（如：中(/zhong1/) 或 中(/zhōng/)）
3. 英文：IPA音标（如：apple(/ˈæ.pəl/)）
4. 最小干预：只修正需要修正的部分

示例：
- 输入："图中哪个光路图是正确的？"
- 输出："图中(/zhong1/)哪个光路图是正确的？"

用户输入：{text}

请判断并修正，返回JSON格式。
```

---

## ⚠️ 注意事项

1. **API 密钥安全**：不要将 API Key 提交到 Git
2. **成本控制**：注意 API 调用成本
3. **错误处理**：添加完善的错误处理逻辑
4. **速率限制**：注意 API 的速率限制

---

## 🧪 测试

配置完成后，测试步骤：

1. 启动开发服务器：`npm run dev`
2. 访问：http://localhost:3001
3. 进入"发音修正"页面
4. 输入测试文本，查看修正结果

---

**配置完成后，平台就可以使用真实的大模型进行发音修正了！** 🚀

