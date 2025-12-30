/**
 * 百度千帆大模型 API 调用
 * 免费额度：ERNIE-Speed-8K（300 RPM）
 * 文档：https://cloud.baidu.com/product/wenxinworkshop
 */

import { buildCorrectionPrompt } from './prompt';

export async function callBaiduAPI(text: string, targetChar?: string): Promise<any> {
  const apiKey = process.env.BAIDU_API_KEY;
  const secretKey = process.env.BAIDU_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    throw new Error('BAIDU_API_KEY 或 BAIDU_SECRET_KEY 未配置');
  }

  // 获取 access_token
  const tokenResponse = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
    { method: 'POST' }
  );

  const tokenData = await tokenResponse.json();
  
  if (!tokenData.access_token) {
    throw new Error(`百度 API 获取 token 失败: ${tokenData.error_description || '未知错误'}`);
  }

  const accessToken = tokenData.access_token;
  const prompt = buildCorrectionPrompt(text, targetChar);

  // 调用 ERNIE 模型
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_speed?access_token=${accessToken}`;
  
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
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`百度 API 错误: ${response.status} - ${errorData.error_msg || '未知错误'}`);
  }

  const data = await response.json();
  
  if (data.error_code) {
    throw new Error(`百度 API 错误: ${data.error_msg || '未知错误'}`);
  }

  const content = data.result;
  
  if (!content) {
    throw new Error('百度 API 返回空内容');
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
    corrections: result.corrections || []
  };
}

