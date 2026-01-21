/**
 * 豆包（字节跳动）API 调用
 * 文档：https://www.volcengine.com/docs/82379
 */

import { buildCorrectionPrompt } from './prompt';
import { CorrectionResponse } from '@/types';

interface DoubaoResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function callDoubaoAPI(text: string, targetChar?: string): Promise<CorrectionResponse> {
  const apiKey = process.env.DOUBAO_API_KEY;
  
  if (!apiKey) {
    throw new Error('DOUBAO_API_KEY 未配置');
  }

  const prompt = buildCorrectionPrompt(text, targetChar);
  
  // 豆包 API 配置
  // 豆包 API 有两种使用方式：
  // 1. 使用端点ID（ep-开头）：直接使用端点ID作为模型
  // 2. 使用 API Key + 模型名称：需要指定模型名称
  const modelName = process.env.DOUBAO_MODEL;
  
  // 判断 API Key 格式
  let url: string;
  let requestBody: any;
  
  if (apiKey.startsWith('ep-')) {
    // 端点ID格式
    url = `https://ark.cn-beijing.volces.com/api/v3/endpoints/${apiKey}/chat/completions`;
    requestBody = {
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
    };
  } else {
    // API Key 格式（UUID格式），需要模型名称或端点ID
    // 豆包的模型名称可能因账户而异
    // 常见模型名称：doubao-pro-32k, doubao-lite-32k, doubao-lite-4k
    // 或者使用端点ID格式：ep-xxxxxxxxx
    
    // 如果环境变量中指定了模型，使用指定的
    // 否则尝试使用 API Key 本身作为端点ID（如果控制台显示的就是端点ID）
    let useModel: string | undefined;
    
    if (modelName) {
      useModel = modelName;
    } else {
      // 如果没有配置，尝试将 API Key 作为端点ID使用
      // 或者使用默认模型名称
      // 注意：根据豆包控制台，可能需要先创建模型服务
      useModel = 'doubao-pro-32k'; // 默认尝试这个
    }
    
    url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
    requestBody = {
      model: useModel,
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
    };
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || errorData.message || '未知错误';
    
    // 如果是 404 错误（模型不存在），提供更详细的提示
    if (response.status === 404) {
      throw new Error(`豆包 API 错误: ${response.status} - ${errorMsg}。请在豆包控制台查看正确的模型端点或模型名称，然后在 .env.local 中配置 DOUBAO_MODEL=你的模型名称`);
    }
    
    throw new Error(`豆包 API 错误: ${response.status} - ${errorMsg}`);
  }

  const data: DoubaoResponse = await response.json();
  
  if (data.error) {
    throw new Error(`豆包 API 错误: ${data.error.message}`);
  }

  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('豆包 API 返回空内容');
  }

  // 解析 JSON 响应（使用与智谱AI相同的改进解析逻辑）
  let result;
  try {
    result = JSON.parse(content);
  } catch (parseError: any) {
    // 尝试提取 JSON 对象
    let jsonStr = content.trim();
    jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1'); // 移除尾随逗号
      try {
        result = JSON.parse(jsonStr);
      } catch (e: any) {
        const errorMsg = e?.message || parseError?.message || '未知错误';
        throw new Error(`无法解析 API 返回的 JSON: ${errorMsg}`);
      }
    } else {
      throw new Error(`无法找到有效的 JSON 内容`);
    }
  }
  
  return {
    originalText: text,
    correctedText: result.correctedText || text,
    isCompliant: result.isCompliant !== false,
    message: result.message || (result.isCompliant ? '文本符合发音规则' : '已修正'),
    corrections: result.corrections || [],
    model: '豆包 API'
  };
}

