import { NextResponse } from 'next/server';
import { callBaiduAPI } from '@/lib/baidu';
import { callDoubaoAPI } from '@/lib/doubao';
import { callDeepSeekAPI } from '@/lib/deepseek';
import { callWenxinAPI } from '@/lib/wenxin';
import { callUMinferAPI } from '@/lib/uminfer';
import testData50Raw from '@/test-data-50.json';
const testData50 = testData50Raw as Array<{ id: number; input: string; expected: string }>;

interface TestResult {
  model: string;
  testId: number;
  input: string;
  expected: string;
  actual: string;
  isCorrect: boolean;
  error?: string;
  time: number;
}

interface ModelTestResult {
  model: string;
  total: number;
  correct: number;
  accuracy: number;
  averageTime: number;
  results: TestResult[];
}

// 提取标注内容（用于比较）
function extractAnnotations(text: string): string {
  const matches = text.match(/\S+\(\/[^)]+\)/g);
  return matches ? matches.join(' ') : '';
}

// 比较两个结果是否相同
function compareResults(expected: string, actual: string): boolean {
  const expectedNorm = extractAnnotations(expected).replace(/\s+/g, '');
  const actualNorm = extractAnnotations(actual).replace(/\s+/g, '');
  return expectedNorm === actualNorm;
}

// 测试单个模型
async function testModel(
  modelName: string,
  testFunction: (text: string) => Promise<any>,
  testDataArray: Array<{ id: number; input: string; expected: string }>
): Promise<ModelTestResult> {
  const results: TestResult[] = [];
  let totalTime = 0;
  
  for (const testCase of testDataArray) {
    const startTime = Date.now();
    let actual = '';
    let error = '';
    let isCorrect = false;
    
    try {
      const result = await testFunction(testCase.input);
      actual = result.correctedText || testCase.input;
      isCorrect = compareResults(testCase.expected, actual);
      
      const time = Date.now() - startTime;
      totalTime += time;
      
      results.push({
        model: modelName,
        testId: testCase.id,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        isCorrect,
        time
      });
      
      // 添加延迟，避免API限流
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err: any) {
      const time = Date.now() - startTime;
      totalTime += time;
      error = err.message || '未知错误';
      
      results.push({
        model: modelName,
        testId: testCase.id,
        input: testCase.input,
        expected: testCase.expected,
        actual: '',
        isCorrect: false,
        error,
        time
      });
    }
  }
  
  const correct = results.filter(r => r.isCorrect).length;
  const accuracy = (correct / results.length) * 100;
  const averageTime = totalTime / results.length;
  
  return {
    model: modelName,
    total: results.length,
    correct,
    accuracy,
    averageTime,
    results
  };
}

export async function GET(request: Request) {
  try {
    // 检查是否使用50条数据
    // 只使用50条预设数据
    const currentTestData = testData50;
    const allResults: ModelTestResult[] = [];
    
    // 测试各个模型
    const models = [
      { name: 'Modelverse', func: callUMinferAPI, enabled: !!process.env.UMINFER_API_KEY },
      // 暂时不测试这些模型
      // { name: 'DeepSeek', func: callDeepSeekAPI, enabled: !!process.env.DEEPSEEK_API_KEY },
      // { name: '豆包', func: callDoubaoAPI, enabled: !!process.env.DOUBAO_API_KEY },
      // { name: '百度千帆', func: callBaiduAPI, enabled: !!(process.env.BAIDU_API_KEY && process.env.BAIDU_SECRET_KEY) },
      // { name: '文心一言', func: callWenxinAPI, enabled: !!(process.env.WENXIN_API_KEY && process.env.WENXIN_SECRET_KEY) },
    ];
    
    for (const model of models) {
      if (!model.enabled) {
        console.log(`跳过模型 ${model.name}（未配置API Key）`);
        continue;
      }
      
      try {
        const result = await testModel(model.name, model.func, currentTestData);
        allResults.push(result);
      } catch (err: any) {
        console.error(`测试模型 ${model.name} 时出错:`, err.message);
      }
    }
    
    // 按准确率排序
    allResults.sort((a, b) => b.accuracy - a.accuracy);
    
    return NextResponse.json({
      success: true,
      summary: allResults.map(r => ({
        model: r.model,
        accuracy: r.accuracy,
        averageTime: r.averageTime,
        correct: r.correct,
        total: r.total
      })),
      details: allResults
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


