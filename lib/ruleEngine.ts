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
export function correctWithRuleEngine(text: string, targetChar?: string): CorrectionResult {
  const corrections: Array<{
    position: number;
    original: string;
    corrected: string;
    reason: string;
  }> = [];
  
  let correctedText = text;
  let hasCorrection = false;
  
  // 如果指定了要检查的文字，只检查这个文字
  const charsToCheck = targetChar ? [targetChar] : Object.keys(polyphonicRules);
  
  // 检查每个多音字
  for (const char of charsToCheck) {
    if (!text.includes(char)) continue;
    
    // 检查是否已经有标注
    if (text.includes(`${char}(/`)) continue;
    
    const rules = polyphonicRules[char];
    if (!rules) {
      // 如果字符不在规则库中，跳过（不是多音字）
      continue;
    }
    
    // 检查每个规则
    let foundMatch = false;
    for (const [word, pinyin] of Object.entries(rules)) {
      if (text.includes(word)) {
        foundMatch = true;
        // 找到需要修正的位置（处理多个出现的情况）
        let searchIndex = 0;
        while (true) {
          const index = text.indexOf(word, searchIndex);
          if (index === -1) break;
          
          const charIndex = word.indexOf(char);
          const position = index + charIndex;
          
          // 检查是否已经修正过
          if (!correctedText.substring(position, position + char.length + 10).includes('(/')) {
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
          }
          
          searchIndex = index + 1;
        }
        
        if (hasCorrection) break; // 找到匹配后跳出
      }
    }
    
    // 如果是多音字但没有匹配到规则，仍然需要修正（由大模型判断读音）
    // 这里标记为需要修正，但具体读音由大模型确定
    if (!foundMatch && rules) {
      // 找到所有该字符出现的位置
      let searchIndex = 0;
      while (true) {
        const index = text.indexOf(char, searchIndex);
        if (index === -1) break;
        
        // 检查是否已经修正过
        if (!correctedText.substring(index, index + char.length + 10).includes('(/')) {
          // 标记为需要修正，但具体读音由大模型确定
          // 这里不进行实际修正，只是标记需要修正
          hasCorrection = true;
          // 注意：这里不添加 corrections，因为不知道正确读音，需要大模型判断
        }
        
        searchIndex = index + 1;
      }
    }
    
    if (targetChar && hasCorrection) break; // 如果指定了文字，找到后立即返回
  }
  
  if (hasCorrection) {
    // 如果有修正，返回修正结果
    // 如果有多音字但没有匹配到规则，corrections 可能为空，需要大模型判断读音
    return {
      originalText: text,
      correctedText: correctedText,
      isCompliant: false,
      message: corrections.length > 0
        ? (targetChar 
          ? `已修正文字"${targetChar}"的发音标注`
          : `已修正${corrections.length}处发音标注`)
        : (targetChar
          ? `文字"${targetChar}"是多音字，需要标注读音`
          : '文本中包含多音字，需要标注读音'),
      corrections: corrections.length > 0 ? corrections : undefined
    };
  }
  
  return {
    originalText: text,
    correctedText: text,
    isCompliant: true,
    message: targetChar 
      ? `文字"${targetChar}"在文本中读音明确，无需修正。`
      : '文本符合发音规则，无需修正。'
  };
}

/**
 * 混合使用规则引擎和大模型
 * 优先使用大模型的结果（更准确），规则引擎作为补充和验证
 */
export function hybridCorrection(
  text: string,
  llmResult: CorrectionResult
): CorrectionResult {
  // 优先使用大模型的结果（更准确，能理解上下文）
  if (!llmResult.isCompliant && llmResult.corrections && llmResult.corrections.length > 0) {
    console.log('✅ 使用大模型修正结果');
    return llmResult;
  }
  
  // 如果大模型没有修正，使用规则引擎作为补充
  const ruleResult = correctWithRuleEngine(text);
  if (!ruleResult.isCompliant) {
    console.log('✅ 使用规则引擎补充修正');
    return ruleResult;
  }
  
  // 如果都没有修正，返回大模型的结果（可能判断为符合规则）
  console.log('✅ 使用大模型判断结果');
  return llmResult;
}

