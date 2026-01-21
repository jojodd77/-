/**
 * 智谱清言 ChatGLM API 调用
 * 免费额度：新用户 1 亿 tokens
 * 文档：https://open.bigmodel.cn/
 */

import { buildCorrectionPrompt } from './prompt';
import { correctWithRuleEngine } from './ruleEngine';
import { Correction } from '@/types';

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
    const chars = targetChar.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
    
    if (chars.length === 0) {
      return {
        originalText: text,
        correctedText: text,
        isCompliant: true,
        message: '指定的文字不能为空。'
      };
    }
    
    // 检查每个字符是否在文本中
    const missingChars = chars.filter((char: string) => !text.includes(char));
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
      model: 'glm-4', // 使用更准确的模型
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

  // 修复JSON字符串中的未转义双引号
  // 处理类似 "correctedText": "这句话的"吗(/ma5)"读作轻声。" 的情况
  function fixUnescapedQuotes(jsonStr: string): string {
    // 使用状态机方法：逐字符处理，识别字符串值中的未转义双引号
    let result = '';
    let inString = false;
    let escapeNext = false;
    let stringStart = -1;
    
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      const prevChar = i > 0 ? jsonStr[i - 1] : '';
      const nextChar = i < jsonStr.length - 1 ? jsonStr[i + 1] : '';
      
      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        result += char;
        continue;
      }
      
      if (char === '"') {
        // 判断这是字符串的开始还是结束
        // 检查前面是否有冒号（表示这是值）或逗号/左大括号（表示这是键）
        const before = jsonStr.substring(Math.max(0, i - 20), i);
        const after = jsonStr.substring(i + 1, Math.min(jsonStr.length, i + 10));
        
        // 如果前面有冒号，可能是字符串值的开始
        const isValueStart = /:\s*$/.test(before);
        // 如果后面是逗号、右大括号或换行，可能是字符串的结束
        const isValueEnd = /^\s*[,}\]]/.test(after);
        
        if (isValueStart && !inString) {
          // 字符串值的开始
          inString = true;
          stringStart = i;
          result += char;
        } else if (inString && isValueEnd) {
          // 字符串值的结束
          inString = false;
          stringStart = -1;
          result += char;
        } else if (inString) {
          // 在字符串值内部的双引号，需要转义
          result += '\\"';
        } else {
          // 其他情况（可能是键名）
          result += char;
        }
      } else {
        result += char;
      }
    }
    
    return result;
  }

  // 解析 JSON 响应
  let result;
  try {
    // 先尝试直接解析
    result = JSON.parse(content);
  } catch (parseError: any) {
    console.error('JSON 解析失败:', parseError);
    console.error('原始内容:', content);
    
    // 尝试提取 JSON 对象（更宽松的匹配）
    let jsonStr = content.trim();
    
    // 移除可能的 markdown 代码块标记
    jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    
    // 尝试找到第一个 { 到最后一个 } 之间的内容
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      
      try {
        result = JSON.parse(jsonStr);
      } catch (e) {
        // 如果还是失败，尝试修复常见的JSON错误
        // 1. 移除可能的尾随逗号
        jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
        
        // 2. 修复字符串值中的未转义双引号
        jsonStr = fixUnescapedQuotes(jsonStr);
        
        try {
          result = JSON.parse(jsonStr);
        } catch (e2: any) {
          // 如果还是失败，尝试更激进的方法：逐字符分析并修复
          // 这是一个更复杂的修复方法，用于处理嵌套的引号问题
          let fixed = '';
          let inString = false;
          let escapeNext = false;
          
          for (let i = 0; i < jsonStr.length; i++) {
            const char = jsonStr[i];
            const prevChar = i > 0 ? jsonStr[i - 1] : '';
            const nextChar = i < jsonStr.length - 1 ? jsonStr[i + 1] : '';
            
            if (escapeNext) {
              fixed += char;
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              escapeNext = true;
              fixed += char;
              continue;
            }
            
            if (char === '"') {
              // 判断这是字符串的开始/结束，还是字符串内的引号
              // 如果前面是冒号和空格，或者是逗号/左大括号后的空格，可能是字符串开始
              // 如果后面是逗号/右大括号/冒号，可能是字符串结束
              const isStringStart = /[:{\[,]\s*$/.test(fixed);
              const isStringEnd = /^\s*[,}\]:]/.test(jsonStr.substring(i + 1));
              
              if (inString && !isStringEnd) {
                // 在字符串内部，且不是字符串结束，需要转义
                fixed += '\\"';
              } else {
                fixed += char;
                if (isStringStart || (inString && isStringEnd)) {
                  inString = !inString;
                }
              }
            } else {
              fixed += char;
              if (char === ':' && /"\s*$/.test(fixed)) {
                inString = true;
              }
            }
          }
          
          try {
            result = JSON.parse(fixed);
          } catch (e3: any) {
            const errorMsg = e3?.message || e2?.message || (parseError as any)?.message || '未知错误';
            throw new Error(`无法解析 API 返回的 JSON: ${errorMsg}. 原始内容: ${content.substring(0, 300)}`);
          }
        }
      }
    } else {
      throw new Error(`无法找到有效的 JSON 内容. 原始内容: ${content.substring(0, 300)}`);
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
    const chars = targetChar.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
    
    if (chars.length > 0 && rawResult.corrections && rawResult.corrections.length > 0) {
      // 过滤修正，只保留指定文字的修正
      const filteredCorrections = rawResult.corrections.filter((c: Correction) => chars.includes(c.original));
      
      if (filteredCorrections.length > 0) {
        // 重新构建修正后的文本，只包含指定文字的修正
        let correctedText = text;
        // 从后往前替换，避免位置偏移
        filteredCorrections.sort((a: Correction, b: Correction) => b.position - a.position);
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
          message: `已修正文字${chars.map((c: string) => `"${c}"`).join('、')}的发音标注`
        };
      } else {
        // 如果没有找到指定文字的修正，判断为符合规则
        rawResult = {
          ...rawResult,
          isCompliant: true,
          message: `文字${chars.map((c: string) => `"${c}"`).join('、')}在文本中读音正确，无需修正。`,
          corrections: []
        };
      }
    } else if (!rawResult.isCompliant && chars.length > 0) {
      // 如果大模型返回了修正但没有指定文字的修正，判断为符合规则
      rawResult = {
        ...rawResult,
        isCompliant: true,
        message: `文字${chars.map((c: string) => `"${c}"`).join('、')}在文本中读音正确，无需修正。`,
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
    const chars = targetChar.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
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

