/**
 * 规则引擎
 * 基于常见多音字规则，对大模型输出进行验证和修正
 */

interface CorrectionResult {
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
 * 常见多音字规则库
 */
const polyphonicRules: Record<string, Record<string, string>> = {
  '中': {
    '图中': 'zhong1',
    '中间': 'zhong1',
    '中心': 'zhong1',
    '原则中': 'zhong1',
    '选中': 'zhong4',
    '中奖': 'zhong4',
    '中意': 'zhong4',
  },
  '重': {
    '重庆': 'chong2',
    '重复': 'chong2',
    '重新': 'chong2',
    '重要': 'zhong4',
    '重量': 'zhong4',
    '重视': 'zhong4',
    '重点': 'zhong4',
  },
  '长': {
    '长度': 'chang2',
    '长期': 'chang2',
    '长大': 'zhang3',
    '成长': 'zhang3',
  },
  '解': {
    '解渴': 'jie3',
    '解决': 'jie3',
    '解数': 'xie4',
  },
  '差': {
    '差异': 'cha1',
    '差别': 'cha1',
    '差距': 'cha1',
    '出差': 'chai1',
    '参差': 'ci1',
  },
  '一': {
    '一个': 'yi2', // 变调规则
    '第一': 'yi1',
    '统一': 'yi1',
    '方案一': 'yi1',
  },
  '奇': {
    '奇数': 'ji1',
    '奇怪': 'qi2',
    '奇迹': 'qi2',
  },
  '切': {
    '切线': 'qie1',
    '切割': 'qie1',
    '一切': 'qie4',
  },
};

/**
 * 使用规则引擎修正文本
 */
export function correctWithRuleEngine(text: string): CorrectionResult {
  const corrections: Array<{
    position: number;
    original: string;
    corrected: string;
    reason: string;
  }> = [];
  
  let correctedText = text;
  let hasCorrection = false;
  
  // 检查每个多音字
  for (const [char, rules] of Object.entries(polyphonicRules)) {
    if (!text.includes(char)) continue;
    
    // 检查是否已经有标注
    if (text.includes(`${char}(/`)) continue;
    
    // 检查每个规则
    for (const [word, pinyin] of Object.entries(rules)) {
      if (text.includes(word)) {
        // 找到需要修正的位置
        const index = text.indexOf(word);
        const charIndex = word.indexOf(char);
        const position = index + charIndex;
        
        // 检查是否已经修正过
        if (correctedText.substring(position, position + char.length + 10).includes('(/')) {
          continue;
        }
        
        // 进行修正
        const before = correctedText.substring(0, position);
        const after = correctedText.substring(position + char.length);
        correctedText = before + `${char}(/${pinyin}/)` + after;
        
        corrections.push({
          position,
          original: char,
          corrected: `${char}(/${pinyin}/)`,
          reason: `多音字"${char}"在"${word}"中应读作${pinyin}`
        });
        
        hasCorrection = true;
        break; // 只修正第一个匹配的
      }
    }
  }
  
  if (hasCorrection) {
    return {
      originalText: text,
      correctedText,
      isCompliant: false,
      message: `已修正${corrections.length}处发音标注`,
      corrections
    };
  }
  
  return {
    originalText: text,
    correctedText: text,
    isCompliant: true,
    message: '文本符合发音规则，无需修正。'
  };
}

/**
 * 混合使用规则引擎和大模型
 * 优先使用规则引擎，如果规则引擎无法处理，再使用大模型
 */
export function hybridCorrection(
  text: string,
  llmResult: CorrectionResult
): CorrectionResult {
  // 先使用规则引擎
  const ruleResult = correctWithRuleEngine(text);
  
  // 如果规则引擎有修正，使用规则引擎的结果
  if (!ruleResult.isCompliant) {
    console.log('✅ 使用规则引擎修正');
    return ruleResult;
  }
  
  // 如果规则引擎没有修正，使用大模型的结果
  console.log('✅ 使用大模型修正');
  return llmResult;
}

