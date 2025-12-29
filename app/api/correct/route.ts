import { NextRequest, NextResponse } from 'next/server';
import { buildCorrectionPrompt } from '@/lib/prompt';
import { callZhipuAPI } from '@/lib/zhipu';
import { callBaiduAPI } from '@/lib/baidu';

/**
 * 发音修正 API
 * 接收用户输入的文本，判断是否符合发音规则，不符合则修正
 * 
 * 支持的大模型：
 * - OpenAI (GPT-4, GPT-3.5)
 * - Claude (Anthropic)
 * - 其他兼容 OpenAI API 的模型
 */

interface CorrectionRequest {
  text: string;
}

interface CorrectionResponse {
  originalText: string;
  correctedText: string;
  isCompliant: boolean;
  message: string;
  corrections?: Array<{
    position: number;
    original: string;
    corrected: string;
    reason: string;
  }>;
}

/**
 * 调用大模型进行发音修正
 * 
 * 优先级：
 * 1. 智谱清言 ChatGLM（免费，推荐）
 * 2. 百度千帆 ERNIE（免费）
 * 3. OpenAI（付费）
 * 4. 模拟逻辑（未配置时）
 */
async function callLLM(text: string): Promise<CorrectionResponse> {
  // 优先使用智谱清言（免费，中文支持好）
  if (process.env.ZHIPU_API_KEY) {
    try {
      return await callZhipuAPI(text);
    } catch (error) {
      console.error('智谱清言 API 调用失败:', error);
      // 如果失败，尝试其他 API
    }
  }
  
  // 使用百度千帆（免费）
  if (process.env.BAIDU_API_KEY && process.env.BAIDU_SECRET_KEY) {
    try {
      return await callBaiduAPI(text);
    } catch (error) {
      console.error('百度 API 调用失败:', error);
      // 如果失败，尝试其他 API
    }
  }
  
  // 使用 OpenAI（付费）
  if (process.env.OPENAI_API_KEY) {
    try {
      return await callOpenAI(text);
    } catch (error) {
      console.error('OpenAI API 调用失败:', error);
      // 如果失败，回退到模拟逻辑
    }
  }
  
  // 如果没有配置任何 API Key，使用模拟逻辑
  return simulateCorrection(text);
}

/**
 * 模拟修正逻辑（仅用于演示）
 * 实际应该调用大模型
 */
function simulateCorrection(text: string): CorrectionResponse {
  // 检查文本中是否已经包含发音标注格式
  const hasPronunciationMarkers = /[\u4e00-\u9fa5]\(\/[^)]+\/\)|[\w]+\(\/[^)]+\/\)/.test(text);
  
  if (hasPronunciationMarkers) {
    // 如果已经有标注，检查格式是否正确
    const isValidFormat = /[\u4e00-\u9fa5]\(\/[a-z0-9āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+[1-5]?\/\)|[\w]+\(\/[ˈˌ]?[^)]+\/\)/.test(text);
    
    if (isValidFormat) {
      return {
        originalText: text,
        correctedText: text,
        isCompliant: true,
        message: "文本符合发音规则格式。"
      };
    } else {
      return {
        originalText: text,
        correctedText: text,
        isCompliant: false,
        message: "检测到发音标注格式不正确，需要修正。",
        corrections: [{
          position: 0,
          original: text,
          corrected: text,
          reason: "格式修正（需要配置大模型 API 才能自动修正）"
        }]
      };
    }
  }
  
  // 简单的多音字检测（仅用于演示）
  const commonPolyphonicWords = {
    '中': ['zhong1', 'zhong4'],
    '重': ['chong2', 'zhong4'],
    '长': ['chang2', 'zhang3'],
    '解': ['jie3', 'xie4'],
    '差': ['cha1', 'chai1', 'ci1'],
    '一': ['yi1', 'yi2', 'yi4'],
    '奇': ['qi2', 'ji1']
  };
  
  let needsCorrection = false;
  let correctedText = text;
  const corrections: Array<{position: number, original: string, corrected: string, reason: string}> = [];
  
  // 简单的多音字检测（实际应该使用大模型判断正确读音）
  for (const [word, pronunciations] of Object.entries(commonPolyphonicWords)) {
    if (text.includes(word) && !text.includes(`${word}(/`)) {
      needsCorrection = true;
      // 注意：这里只是示例，实际应该调用大模型判断正确的读音
      const firstOccurrence = text.indexOf(word);
      correctedText = correctedText.replace(
        word,
        `${word}(/${pronunciations[0]}/)`
      );
      corrections.push({
        position: firstOccurrence,
        original: word,
        corrected: `${word}(/${pronunciations[0]}/)`,
        reason: `多音字"${word}"需要标注正确读音（当前为模拟结果，需配置大模型 API 获得准确判断）`
      });
      break;
    }
  }
  
  if (needsCorrection) {
    return {
      originalText: text,
      correctedText: correctedText,
      isCompliant: false,
      message: "检测到可能需要发音修正的内容（当前为模拟结果，请配置免费大模型 API 获得准确判断）。",
      corrections
    };
  }
  
  return {
    originalText: text,
    correctedText: text,
    isCompliant: true,
      message: "文本符合发音规则，无需修正（当前为模拟判断，请配置免费大模型 API 获得准确判断）。"
  };
}

/**
 * 调用 OpenAI API
 */
async function callOpenAI(text: string): Promise<CorrectionResponse> {
  const prompt = buildCorrectionPrompt(text);
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
    
    // 调用大模型进行修正
    const result = await callLLM(body.text);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('修正API错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
