import { NextRequest, NextResponse } from 'next/server';
import { callBaiduAPI } from '@/lib/baidu';
import { callDoubaoAPI } from '@/lib/doubao';
import { callDeepSeekAPI } from '@/lib/deepseek';
import { callWenxinAPI } from '@/lib/wenxin';
import { callUMinferAPI } from '@/lib/uminfer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: '请输入测试文本' },
        { status: 400 }
      );
    }

    const results: any[] = [];

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
        const startTime = Date.now();
        const result = await model.func(text);
        const time = Date.now() - startTime;

        results.push({
          model: model.name,
          success: true,
          result: result.correctedText,
          message: result.message,
          isCompliant: result.isCompliant,
          corrections: result.corrections || [],
          time
        });
      } catch (err: any) {
        results.push({
          model: model.name,
          success: false,
          error: err.message || '未知错误'
        });
      }
    }

    return NextResponse.json({
      success: true,
      input: text,
      results
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

