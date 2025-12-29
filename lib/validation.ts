/**
 * 验证修正结果的正确性
 * 防止大模型做出明显错误的修正
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
 * 常见词汇的正确读音（用于验证）
 */
const commonWordPronunciations: Record<string, string> = {
  // 侧字
  '侧重点': 'ce4', // 侧重点中的"侧"读 ce4，不是 zhai1
  '侧面': 'ce4',
  '侧身': 'ce4',
  '侧目': 'ce4',
  
  // 中字
  '图中': 'zhong1',
  '中间': 'zhong1',
  '选中': 'zhong4',
  '中奖': 'zhong4',
  
  // 重字（重要：必须标注）
  '重复': 'chong2',
  '重庆': 'chong2',
  '重新': 'chong2',
  '重要': 'zhong4',
  '重量': 'zhong4',
  '重视': 'zhong4',
  '重点': 'zhong4',
  
  // 解字
  '解渴': 'jie3',
  '解决': 'jie3',
  '解数': 'xie4',
  
  // 差字
  '差异': 'cha1',
  '差别': 'cha1',
  '出差': 'chai1',
  '参差': 'ci1',
  
  // 一字
  '一个': 'yi2',
  '第一': 'yi1',
  '统一': 'yi1',
  
  // 奇字
  '奇数': 'ji1',
  '奇怪': 'qi2',
  '奇迹': 'qi2',
};

/**
 * 验证修正结果
 */
export function validateCorrection(result: CorrectionResult, originalText: string): CorrectionResult {
  // 检查是否有明显错误的修正
  if (result.corrections && result.corrections.length > 0) {
    const validatedCorrections = [];
    
    for (const correction of result.corrections) {
      const original = correction.original;
      const corrected = correction.corrected;
      
      // 提取修正后的拼音
      const pinyinMatch = corrected.match(/\((\/[^)]+\/)\)/);
      if (pinyinMatch) {
        const pinyin = pinyinMatch[1].replace(/\//g, '');
        
        // 检查常见词汇（只验证明显错误，不阻止正确修正）
        let isValid = true;
        for (const [word, expectedPinyin] of Object.entries(commonWordPronunciations)) {
          if (originalText.includes(word) && word.includes(original)) {
            // 检查拼音是否匹配（支持数字和符号标调）
            const normalizedPinyin = normalizePinyin(pinyin);
            const normalizedExpected = normalizePinyin(expectedPinyin);
            
            // 只拒绝明显错误的修正
            if (normalizedPinyin !== normalizedExpected) {
              // 特殊处理：明显错误的读音
              const isObviousError = 
                (original === '侧' && (pinyin.includes('zhai') || pinyin.includes('zhāi'))) ||
                (original === '重' && word === '重庆' && (pinyin.includes('zhong') || pinyin.includes('zhòng'))) ||
                (original === '重' && word === '重要' && (pinyin.includes('chong') || pinyin.includes('chóng')));
              
              if (isObviousError) {
                console.warn(`⚠️ 检测到错误修正: "${word}" 中的 "${original}" 应该是 ${expectedPinyin}，但大模型返回了 ${pinyin}`);
                isValid = false;
              }
              // 其他情况允许，因为大模型可能根据更复杂的上下文判断
            }
          }
        }
        
        if (isValid) {
          validatedCorrections.push(correction);
        } else {
          // 如果修正明显错误，拒绝这个修正
          console.warn(`❌ 拒绝错误的修正: ${correction.original} → ${correction.corrected}`);
        }
      } else {
        validatedCorrections.push(correction);
      }
    }
    
    // 如果没有有效的修正，返回原文本
    if (validatedCorrections.length === 0) {
      return {
        originalText: originalText,
        correctedText: originalText,
        isCompliant: true,
        message: '检测到可能的错误修正，已拒绝。文本保持原样。',
        corrections: []
      };
    }
    
    // 重新构建修正后的文本
    let correctedText = originalText;
    for (const correction of validatedCorrections) {
      // 简单替换（实际应该更精确）
      correctedText = correctedText.replace(correction.original, correction.corrected);
    }
    
    return {
      ...result,
      correctedText,
      corrections: validatedCorrections,
      message: `已修正${validatedCorrections.length}处（已过滤${result.corrections.length - validatedCorrections.length}处可疑修正）`
    };
  }
  
  return result;
}

/**
 * 标准化拼音（用于比较）
 */
function normalizePinyin(pinyin: string): string {
  // 移除声调符号，转换为数字
  return pinyin
    .replace(/[āáǎà]/g, 'a1')
    .replace(/[ēéěè]/g, 'e1')
    .replace(/[īíǐì]/g, 'i1')
    .replace(/[ōóǒò]/g, 'o1')
    .replace(/[ūúǔù]/g, 'u1')
    .replace(/[ǖǘǚǜ]/g, 'v1')
    .toLowerCase();
}

