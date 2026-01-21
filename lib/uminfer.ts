/**
 * Modelverse (UMinfer) API 调用
 * OpenAI 兼容 API
 * 文档: https://www.compshare.cn/docs/modelverse/models/text_api/openai_compatible
 * API Key: DFN859JlG5PARHhu09Cc65C0-4A9D-4c85-8641-73F6F76e
 * Model ID: uminferapikey-1lczbs8ftfbc
 */

import { buildCorrectionPrompt } from './prompt';
import { CorrectionResponse } from '@/types';

interface ModelverseResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function callUMinferAPI(text: string, targetChar: string, modelId?: string): Promise<CorrectionResponse> {
  const apiKey = process.env.UMINFER_API_KEY || 'DFN859JlG5PARHhu09Cc65C0-4A9D-4c85-8641-73F6F76e';
  // 优先使用传入的模型ID，其次使用环境变量，最后使用默认值
  const finalModelId = modelId || process.env.UMINFER_API_ID || 'qwen-turbo';

  if (!apiKey) {
    throw new Error('UMINFER_API_KEY 未配置');
  }

  const prompt = buildCorrectionPrompt(text, targetChar);

  // Modelverse API 端点 (OpenAI 兼容)
  const url = 'https://api.modelverse.cn/v1/chat/completions';

  const requestBody = {
    model: finalModelId,
    messages: [
      {
        role: 'system',
        content: `你是一个专业的中文发音修正助手。请**仔细阅读并严格遵守**用户提供的所有规则和示例。

⚠️ **核心要求**：
1. **必须严格按照prompt中的多音字规则判断读音**：prompt中提供了常见多音字的详细规则（如"重"、"中"、"量"、"长"、"行"、"为"等），必须严格按照这些规则判断，不能随意猜测
2. **必须按照判断流程执行**：先识别位置→分析词语→判断读音→确定声调→添加标注
3. **必须参考示例**：prompt中提供了多个示例，每个示例都有分析说明，必须仔细学习这些示例的判断方法
4. **准确判断音调**：使用数字标调法（1=阴平, 2=阳平, 3=上声, 4=去声, 5=轻声），必须根据词语组合和上下文语境准确判断
5. **常见错误避免**：
   - "重要"中的"重"必须读zhong4（去声），不是chong2
   - "重复"中的"重"必须读chong2（阳平），不是zhong4
   - "重量"中的"量"必须读liang4（去声），不是liang2
   - "测量"中的"量"必须读liang2（阳平），不是liang4

**请先仔细阅读和理解prompt中的所有规则、多音字读音规则和示例，严格按照规则判断，然后再进行标注。音调标注的准确性非常重要！**

直接输出标注后的完整文本，不解释、不额外说明。`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.0,
  };

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
    const errorMsg = errorData.error?.message || '未知错误';
    throw new Error(`Modelverse API 错误: ${response.status} - ${errorMsg}`);
  }

  const data: ModelverseResponse = await response.json();

  if (data.error) {
    throw new Error(`Modelverse API 错误: ${data.error.message || '未知错误'}`);
  }

  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Modelverse API 返回空内容');
  }

  // 尝试解析 JSON（如果模型返回了 JSON 格式）
  let correctedText = content.trim();
  try {
    const jsonMatch = correctedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.correctedText) {
        correctedText = parsed.correctedText;
      }
    }
  } catch (e) {
    // 如果不是 JSON 格式，直接使用原内容
  }
  
  // 检查是否有标注（通过检查是否包含 (/拼音/) 格式）
  const hasAnnotation = /\(\/[^)]+\)/.test(correctedText);
  
  // 提取所有标注信息用于corrections数组
  const corrections: any[] = [];
  if (hasAnnotation) {
    const annotationRegex = /([^()]+)\(\/([^)]+)\)/g;
    let match;
    let position = 0;
    while ((match = annotationRegex.exec(correctedText)) !== null) {
      const originalChar = match[1];
      const pinyin = match[2];
      corrections.push({
        position: correctedText.indexOf(match[0], position),
        original: originalChar,
        corrected: `${originalChar}(/${pinyin}/)`,
        reason: `根据上下文判断读音为${pinyin}`
      });
      position = match.index + match[0].length;
    }
  }

  console.log(`✅ 成功使用模型: ${finalModelId}`);
  return {
    originalText: text,
    correctedText: correctedText,
    isCompliant: !hasAnnotation,
    message: hasAnnotation ? '已标注' : '文本符合发音规则',
    corrections: corrections,
    model: `Modelverse API (${finalModelId})`
  };
}
