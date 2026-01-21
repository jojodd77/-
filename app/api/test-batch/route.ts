import { NextRequest, NextResponse } from 'next/server';
import { callBaiduAPI } from '@/lib/baidu';
import { callDoubaoAPI } from '@/lib/doubao';
import { callDeepSeekAPI } from '@/lib/deepseek';
import { callWenxinAPI } from '@/lib/wenxin';
import { callUMinferAPI } from '@/lib/uminfer';

interface TestResult {
  model: string;
  testId: number;
  input: string;
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

// 测试单个模型
async function testModel(
  modelName: string,
  testFunction: (text: string) => Promise<any>,
  testCases: string[]
): Promise<ModelTestResult> {
  const results: TestResult[] = [];
  let totalTime = 0;
  let successCount = 0;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i].trim();
    if (!testCase) continue; // 跳过空行
    
    const startTime = Date.now();
    let actual = '';
    let error = '';
    let isCorrect = true;
    
    try {
      const result = await testFunction(testCase);
      actual = result.correctedText || testCase;
      isCorrect = true; // 对于自定义测试，只要没有错误就算成功
      successCount++;
      
      const time = Date.now() - startTime;
      totalTime += time;
      
      results.push({
        model: modelName,
        testId: i + 1,
        input: testCase,
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
      isCorrect = false;
      
      results.push({
        model: modelName,
        testId: i + 1,
        input: testCase,
        actual: '',
        isCorrect: false,
        error,
        time
      });
    }
  }
  
  const accuracy = testCases.length > 0 ? (successCount / testCases.length) * 100 : 0;
  const averageTime = results.length > 0 ? totalTime / results.length : 0;
  
  return {
    model: modelName,
    total: results.length,
    correct: successCount,
    accuracy,
    averageTime,
    results
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texts } = body;

    if (!texts || !texts.trim()) {
      return NextResponse.json(
        { success: false, error: '请输入测试文本（每行一条）' },
        { status: 400 }
      );
    }

    // 按换行符分割，每行作为一条测试数据
    const testCases = texts
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0); // 过滤空行

    if (testCases.length === 0) {
      return NextResponse.json(
        { success: false, error: '请输入至少一条测试文本' },
        { status: 400 }
      );
    }

    const allResults: ModelTestResult[] = [];

    // 测试各个模型
    const models = [
      { name: 'Modelverse', func: callUMinferAPI, enabled: !!process.env.UMINFER_API_KEY },
      // 暂时不测试这些模型
      // { name: 'DeepSeek', func: callDeepSeekAPI, enabled: !!process.env.DEEPSEEK_API_KEY },
      // { name: '豆包', func: callDoubaoAPI, enabled: !!process.env.DOUBAO_API_KEY },
    ];

    for (const model of models) {
      if (!model.enabled) {
        continue;
      }

      try {
        const result = await testModel(model.name, model.func, testCases);
        allResults.push(result);
      } catch (err: any) {
        console.error(`测试模型 ${model.name} 时出错:`, err.message);
      }
    }

    // 按平均耗时排序
    allResults.sort((a, b) => a.averageTime - b.averageTime);

    return NextResponse.json({
      success: true,
      total: testCases.length,
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

