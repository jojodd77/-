/**
 * 文心一言（百度）API 调用
 * 文档：https://cloud.baidu.com/product/wenxinworkshop
 * 注意：文心一言使用百度千帆平台，与 baidu.ts 类似但使用不同的模型
 */

import { buildCorrectionPrompt } from './prompt';
import { CorrectionResponse } from '@/types';

export async function callWenxinAPI(text: string, targetChar?: string): Promise<CorrectionResponse> {
  const apiKey = process.env.WENXIN_API_KEY;
  const secretKey = process.env.WENXIN_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    throw new Error('WENXIN_API_KEY 或 WENXIN_SECRET_KEY 未配置');
  }

  // 获取 access_token
  const tokenResponse = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
    { method: 'POST' }
  );

  const tokenData = await tokenResponse.json();
  
  if (!tokenData.access_token) {
    throw new Error(`文心一言 API 获取 token 失败: ${tokenData.error_description || '未知错误'}`);
  }

  const accessToken = tokenData.access_token;
  const prompt = buildCorrectionPrompt(text, targetChar);

  // 调用文心一言模型（使用 ERNIE-4.0 或 ERNIE-3.5）
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-8k?access_token=${accessToken}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
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
    throw new Error(`文心一言 API 错误: ${response.status} - ${errorData.error_msg || '未知错误'}`);
  }

  const data = await response.json();
  
  if (data.error_code) {
    throw new Error(`文心一言 API 错误: ${data.error_msg || '未知错误'}`);
  }

  const content = data.result;
  
  if (!content) {
    throw new Error('文心一言 API 返回空内容');
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
    model: '文心一言 API'
  };
}


