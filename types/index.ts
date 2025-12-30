/**
 * 类型定义
 */

export interface CorrectionRequest {
  text: string;
  targetChar?: string; // 可选：指定要检查的文字，如果提供则只检查这个文字
}

export interface CorrectionResponse {
  originalText: string;
  correctedText: string;
  isCompliant: boolean;
  corrections?: Correction[];
  message?: string;
  model?: string; // 使用的大模型名称，如 "智谱清言 API"、"百度千帆 API"、"OpenAI API" 或 "模拟逻辑"
}

export interface Correction {
  position: number;
  original: string;
  corrected: string;
  reason: string;
}

export interface HistoryRecord {
  id: string;
  originalText: string;
  correctedText: string;
  isCompliant: boolean;
  timestamp: Date;
}

export interface RuleSection {
  title: string;
  content: string;
  examples?: string[];
}

