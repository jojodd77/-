/**
 * 类型定义
 */

export interface CorrectionRequest {
  text: string;
}

export interface CorrectionResponse {
  originalText: string;
  correctedText: string;
  isCompliant: boolean;
  corrections?: Correction[];
  message?: string;
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

