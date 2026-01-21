/**
 * DeepSeek API 调用
 * 文档：https://platform.deepseek.com/api-docs/
 */

import { buildCorrectionPrompt } from './prompt';
import { CorrectionResponse } from '@/types';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function callDeepSeekAPI(text: string, targetChar?: string): Promise<CorrectionResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 未配置');
  }

  const prompt = buildCorrectionPrompt(text, targetChar);
  
  // DeepSeek API 端点
  const url = 'https://api.deepseek.com/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是专业的TTS发音修正专家，严格按照《TTS小模型发音修正用户手册2》的规则进行修正。你的任务是准确识别多音字并根据上下文判断正确读音。只返回JSON格式，不要添加任何其他文字。重要规则：1) 只使用新方案（注音格式：字(/拼音/)），绝对禁止使用旧方案（汉字替换）；2) 必须使用英文半角括号()，不能使用中文括号（）；3) 优先使用数字标调法（zhong1, chong2等）；4) 必须仔细分析上下文，确保读音判断100%准确。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.0,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`DeepSeek API 错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
  }

  const data: DeepSeekResponse = await response.json();
  
  if (data.error) {
    throw new Error(`DeepSeek API 错误: ${data.error.message}`);
  }

  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('DeepSeek API 返回空内容');
  }

  // 解析 JSON 响应
  let result;
  try {
    result = JSON.parse(content);
  } catch (parseError) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('无法解析 API 返回的 JSON');
    }
  }
  
  return {
    originalText: text,
    correctedText: result.correctedText || text,
    isCompliant: result.isCompliant !== false,
    message: result.message || (result.isCompliant ? '文本符合发音规则' : '已修正'),
    corrections: result.corrections || [],
    model: 'DeepSeek API'
  };
}

