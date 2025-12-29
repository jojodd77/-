/**
 * 智谱清言 ChatGLM API 调用
 * 免费额度：新用户 1 亿 tokens
 * 文档：https://open.bigmodel.cn/
 */

import { buildCorrectionPrompt } from './prompt';
import { validateCorrection } from './validation';
import { hybridCorrection } from './ruleEngine';

interface ZhipuResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function callZhipuAPI(text: string): Promise<any> {
  const apiKey = process.env.ZHIPU_API_KEY;
  
  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY 未配置');
  }

  const prompt = buildCorrectionPrompt(text);
  
  // 调试：输出发送的 Prompt（仅前500字符）
  console.log('=== 发送给大模型的 Prompt（前500字符）===');
  console.log(prompt.substring(0, 500) + '...');
  console.log('==========================================');
  
  // 智谱清言 API 端点
  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4-flash', // 使用更快的模型，也可以改为 'glm-4' 提高准确性
      messages: [
        {
          role: 'system',
          content: '你是专业的TTS发音修正专家，严格按照《TTS小模型发音修正用户手册2》的规则进行修正。只返回JSON格式：{"isCompliant": true/false, "correctedText": "文本", "message": "说明", "corrections": []}。重要：只使用新方案（注音格式：字(/拼音/)），绝对禁止使用旧方案（汉字替换）。必须使用英文半角括号，不能使用中文括号。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.0, // 设置为0，确保输出更稳定、更准确
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`智谱清言 API 错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
  }

  const data: ZhipuResponse = await response.json();
  
  if (data.error) {
    throw new Error(`智谱清言 API 错误: ${data.error.message}`);
  }

  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('智谱清言 API 返回空内容');
  }

  // 调试：输出大模型返回的原始内容
  console.log('=== 大模型返回的原始内容 ===');
  console.log(content);
  console.log('==========================');

  // 解析 JSON 响应
  let result;
  try {
    result = JSON.parse(content);
  } catch (parseError) {
    console.error('JSON 解析失败:', parseError);
    console.error('原始内容:', content);
    // 如果解析失败，尝试提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('无法解析 API 返回的 JSON: ' + content.substring(0, 200));
    }
  }
  
  // 调试：输出解析后的结果
  console.log('=== 解析后的结果 ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('==================');
  
  const rawResult = {
    originalText: text,
    correctedText: result.correctedText || text,
    isCompliant: result.isCompliant !== false,
    message: result.message || (result.isCompliant ? '文本符合发音规则' : '已修正'),
    corrections: result.corrections || []
  };
  
  // 验证修正结果，防止明显错误
  const validatedResult = validateCorrection(rawResult, text);
  
  // 混合使用规则引擎和大模型（优先使用规则引擎）
  return hybridCorrection(text, validatedResult);
}

