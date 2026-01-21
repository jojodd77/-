import { NextResponse } from 'next/server';
import testData50 from '@/test-data-50.json';

export async function GET() {
  try {
    // 将50条测试数据的input字段提取出来，每行一条
    const texts = (testData50 as Array<{ id: number; input: string; expected: string }>)
      .map(item => item.input)
      .join('\n');
    
    return NextResponse.json({
      success: true,
      count: testData50.length,
      texts
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


