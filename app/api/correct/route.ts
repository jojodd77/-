import { NextRequest, NextResponse } from 'next/server';
import { buildCorrectionPrompt } from '@/lib/prompt';
import { callBaiduAPI } from '@/lib/baidu';
import { callUMinferAPI } from '@/lib/uminfer';
import { CorrectionResponse, CorrectionRequest } from '@/types';

/**
 * 发音修正 API
 * 接收用户输入的文本，判断是否符合发音规则，不符合则修正
 * 
 * 支持的大模型：
 * - OpenAI (GPT-4, GPT-3.5)
 * - Claude (Anthropic)
 * - 其他兼容 OpenAI API 的模型
 */

/**
 * 调用大模型进行发音修正
 * 
 * 优先级：
 * 1. Modelverse (UMinfer) API（推荐）
 * 2. 百度千帆 ERNIE（免费）
 * 3. OpenAI（付费）
 * 4. 模拟逻辑（未配置时）
 */
export async function callLLM(text: string, targetChar: string, modelId?: string): Promise<CorrectionResponse> {
  // 优先使用 Modelverse (UMinfer) API
  if (process.env.UMINFER_API_KEY) {
    try {
      console.log(`✅ 使用 Modelverse API${modelId ? ` (模型: ${modelId})` : ''}`);
      const result = await callUMinferAPI(text, targetChar, modelId);
      return { ...result, model: 'Modelverse API' };
    } catch (error) {
      console.error('❌ Modelverse API 调用失败:', error);
      // 如果失败，尝试其他 API
    }
  } else {
    console.warn('⚠️ UMINFER_API_KEY 未配置');
  }
  
  // 使用百度千帆（免费）
  if (process.env.BAIDU_API_KEY && process.env.BAIDU_SECRET_KEY) {
    try {
      console.log('✅ 使用百度千帆 API');
      const result = await callBaiduAPI(text, targetChar);
      return { ...result, model: '百度千帆 API' };
    } catch (error) {
      console.error('❌ 百度 API 调用失败:', error);
      // 如果失败，尝试其他 API
    }
  }
  
  // 使用 OpenAI（付费）
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('✅ 使用 OpenAI API');
      const result = await callOpenAI(text, targetChar);
      return { ...result, model: 'OpenAI API' };
    } catch (error) {
      console.error('❌ OpenAI API 调用失败:', error);
      // 如果失败，回退到模拟逻辑
    }
  }
  
  // 如果没有配置任何 API Key，使用模拟逻辑
  console.warn('⚠️ 没有配置任何大模型 API，使用模拟逻辑');
  const result = simulateCorrection(text, targetChar);
  return { ...result, model: '模拟逻辑' };
}

/**
 * 模拟修正逻辑（仅用于演示）
 * 实际应该调用大模型
 */
function simulateCorrection(text: string, targetChar: string): CorrectionResponse {
  // 只检查用户指定的文字
  const chars = targetChar.split(',').map(c => c.trim()).filter(c => c.length > 0);
  
  if (chars.length === 0) {
    return {
      originalText: text,
      correctedText: text,
      isCompliant: true,
      message: '要标注的文字不能为空（模拟结果，仅供参考）。'
    };
  }
  
  // 检查每个字符是否在文本中
  const missingChars = chars.filter(char => !text.includes(char));
  if (missingChars.length > 0) {
    return {
      originalText: text,
      correctedText: text,
      isCompliant: true,
      message: `文本中不包含指定的文字：${missingChars.join('、')}（模拟结果，仅供参考）。`
    };
  }
  
  // 简单的多音字检测（仅用于演示）
  const commonPolyphonicWords: Record<string, string[]> = {
    '中': ['zhong1', 'zhong4'],
    '重': ['chong2', 'zhong4'],
    '长': ['chang2', 'zhang3'],
    '解': ['jie3', 'xie4'],
    '差': ['cha1', 'chai1', 'ci1'],
    '一': ['yi1', 'yi2', 'yi4'],
    '奇': ['qi2', 'ji1']
  };
  
  // 处理用户指定的每个字符
  let needsCorrection = false;
  let correctedText = text;
  const corrections: Array<{position: number, original: string, corrected: string, reason: string}> = [];
  
  for (const char of chars) {
    // 检查是否已经有标注
    if (text.includes(`${char}(/`)) {
      continue; // 已经有标注，跳过
    }
    
    if (commonPolyphonicWords[char]) {
      needsCorrection = true;
      const pronunciations = commonPolyphonicWords[char];
      const firstOccurrence = correctedText.indexOf(char);
      correctedText = correctedText.replace(char, `${char}(/${pronunciations[0]}/)`);
      corrections.push({
        position: firstOccurrence,
        original: char,
        corrected: `${char}(/${pronunciations[0]}/)`,
        reason: `多音字"${char}"需要标注正确读音（模拟结果，仅供参考）`
      });
    }
  }
  
  if (needsCorrection) {
    return {
      originalText: text,
      correctedText: correctedText,
      isCompliant: false,
      message: `已标注用户指定的文字（模拟结果，仅供参考）。`,
      corrections
    };
  }
  
  return {
    originalText: text,
    correctedText: text,
    isCompliant: true,
    message: `用户指定的文字在文本中读音明确，无需修正（模拟判断，仅供参考）。`
  };
}

/**
 * 调用 OpenAI API
 */
async function callOpenAI(text: string, targetChar: string): Promise<CorrectionResponse> {
  const prompt = buildCorrectionPrompt(text, targetChar);
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的TTS发音修正助手，严格按照发音修正规则进行判断和修正。只返回JSON格式，不要其他内容。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API 错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('OpenAI API 返回空内容');
  }

  // 解析 JSON 响应
  let result;
  try {
    result = JSON.parse(content);
  } catch (parseError) {
    // 如果解析失败，尝试提取 JSON
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


export async function POST(request: NextRequest) {
  try {
    const body: CorrectionRequest = await request.json();
    
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的文本内容' },
        { status: 400 }
      );
    }
    
    if (body.text.trim().length === 0) {
      return NextResponse.json(
        { error: '文本内容不能为空' },
        { status: 400 }
      );
    }

    // 验证要标注的文字是否提供
    if (!body.targetChar || typeof body.targetChar !== 'string' || !body.targetChar.trim()) {
      return NextResponse.json(
        { error: '请提供要标注的文字（多个文字用逗号隔开）' },
        { status: 400 }
      );
    }

    const targetChar = body.targetChar.trim();
    // 支持多个字符，用逗号分隔
    const chars = targetChar.split(',').map(c => c.trim()).filter(c => c.length > 0);
    
    if (chars.length === 0) {
      return NextResponse.json(
        { error: '要标注的文字不能为空' },
        { status: 400 }
      );
    }
    
    // 检查每个字符是否在文本中
    const missingChars = chars.filter(char => !body.text.includes(char));
    if (missingChars.length > 0) {
      return NextResponse.json(
        { error: `文本中不包含指定的文字：${missingChars.join('、')}` },
        { status: 400 }
      );
    }
    
    // 获取模型ID（可选）
    const modelId = body.modelId || undefined;
    
    // 调用大模型进行修正
    const result = await callLLM(body.text, targetChar, modelId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('修正API错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
