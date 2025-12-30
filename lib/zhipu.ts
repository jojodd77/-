/**
 * 智谱清言 ChatGLM API 调用
 * 免费额度：新用户 1 亿 tokens
 * 文档：https://open.bigmodel.cn/
 */

import { buildCorrectionPrompt } from './prompt';
import { correctWithRuleEngine } from './ruleEngine';

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

export async function callZhipuAPI(text: string, targetChar?: string): Promise<any> {
  // 如果指定了要检查的文字，验证它是否在文本中
  if (targetChar && targetChar.trim()) {
    // 支持多个字符，用逗号分隔
    const chars = targetChar.split(',').map(c => c.trim()).filter(c => c.length > 0);
    
    if (chars.length === 0) {
      return {
        originalText: text,
        correctedText: text,
        isCompliant: true,
        message: '指定的文字不能为空。'
      };
    }
    
    // 检查每个字符是否在文本中
    const missingChars = chars.filter(char => !text.includes(char));
    if (missingChars.length > 0) {
      return {
        originalText: text,
        correctedText: text,
        isCompliant: true,
        message: `文本中不包含指定的文字：${missingChars.join('、')}。`
      };
    }
  }
  const apiKey = process.env.ZHIPU_API_KEY;
  
  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY 未配置');
  }

  const prompt = buildCorrectionPrompt(text, targetChar);
  
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
      model: 'glm-4', // 使用更准确的模型（glm-4 比 glm-4-flash 更准确）
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
      temperature: 0.0, // 设置为0，确保输出稳定和准确
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
  
  let rawResult = {
    originalText: text,
    correctedText: result.correctedText || text,
    isCompliant: result.isCompliant !== false,
    message: result.message || (result.isCompliant ? '文本符合发音规则' : '已修正'),
    corrections: result.corrections || []
  };
  
  // 如果指定了要检查的文字，过滤修正结果，只保留这些文字的修正
  if (targetChar && targetChar.trim()) {
    // 支持多个字符，用逗号分隔
    const chars = targetChar.split(',').map(c => c.trim()).filter(c => c.length > 0);
    
    if (chars.length > 0 && rawResult.corrections && rawResult.corrections.length > 0) {
      // 过滤修正，只保留指定文字的修正
      const filteredCorrections = rawResult.corrections.filter(c => chars.includes(c.original));
      
      if (filteredCorrections.length > 0) {
        // 重新构建修正后的文本，只包含指定文字的修正
        let correctedText = text;
        // 从后往前替换，避免位置偏移
        filteredCorrections.sort((a, b) => b.position - a.position);
        for (const correction of filteredCorrections) {
          const before = correctedText.substring(0, correction.position);
          const after = correctedText.substring(correction.position + correction.original.length);
          correctedText = before + correction.corrected + after;
        }
        
        rawResult = {
          ...rawResult,
          correctedText,
          corrections: filteredCorrections,
          isCompliant: false,
          message: `已修正文字${chars.map(c => `"${c}"`).join('、')}的发音标注`
        };
      } else {
        // 如果没有找到指定文字的修正，判断为符合规则
        rawResult = {
          ...rawResult,
          isCompliant: true,
          message: `文字${chars.map(c => `"${c}"`).join('、')}在文本中读音正确，无需修正。`,
          corrections: []
        };
      }
    } else if (!rawResult.isCompliant && chars.length > 0) {
      // 如果大模型返回了修正但没有指定文字的修正，判断为符合规则
      rawResult = {
        ...rawResult,
        isCompliant: true,
        message: `文字${chars.map(c => `"${c}"`).join('、')}在文本中读音正确，无需修正。`,
        corrections: []
      };
    }
  }
  
  // 直接使用大模型的结果，不进行验证（大模型更准确）
  // 如果大模型返回了修正结果，直接使用
  if (!rawResult.isCompliant && rawResult.corrections && rawResult.corrections.length > 0) {
    console.log('✅ 直接使用大模型修正结果（不经过验证）');
    return rawResult;
  }
  
  // 如果指定了要检查的文字，且大模型判断为符合规则，使用规则引擎作为补充检查
  if (targetChar && targetChar.trim()) {
    // 支持多个字符，用逗号分隔
    const chars = targetChar.split(',').map(c => c.trim()).filter(c => c.length > 0);
    if (chars.length > 0) {
      // 对每个字符分别检查
      for (const char of chars) {
        const ruleResult = correctWithRuleEngine(text, char);
        if (!ruleResult.isCompliant) {
          // 如果规则引擎返回需要修正但没有修正内容，说明检测到多音字但不知道读音
          // 这种情况下，应该要求大模型修正，但大模型已经判断为符合规则了
          // 根据用户需求，所有多音字都必须修正，所以返回需要修正的标记
          if (!ruleResult.corrections || ruleResult.corrections.length === 0) {
            console.log(`⚠️ 检测到多音字"${char}"但不知道读音，需要大模型修正`);
            // 返回一个标记，表示需要修正但不知道读音
            return {
              originalText: text,
              correctedText: text,
              isCompliant: false,
              message: `文字"${char}"是多音字，需要标注读音（请重新检查）`,
              corrections: []
            };
          }
          console.log(`✅ 大模型判断符合规则，使用规则引擎补充检查文字"${char}"`);
          return ruleResult;
        }
      }
    }
  } else {
    // 如果没有指定文字，使用规则引擎作为补充检查
    const ruleResult = correctWithRuleEngine(text);
    if (!ruleResult.isCompliant) {
      // 如果规则引擎返回需要修正但没有修正内容，说明检测到多音字但不知道读音
      if (!ruleResult.corrections || ruleResult.corrections.length === 0) {
        console.log('⚠️ 检测到多音字但不知道读音，需要大模型修正');
        // 返回一个标记，表示需要修正但不知道读音
        return {
          originalText: text,
          correctedText: text,
          isCompliant: false,
          message: '文本中包含多音字，需要标注读音（请重新检查）',
          corrections: []
        };
      }
      console.log('✅ 大模型判断符合规则，使用规则引擎补充检查');
      return ruleResult;
    }
  }
  
  // 如果都没有修正，返回大模型的结果
  console.log('✅ 使用大模型判断结果（无需修正）');
  return rawResult;
}

