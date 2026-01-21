import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.UMINFER_API_KEY || 'DFN859JlG5PARHhu09Cc65C0-4A9D-4c85-8641-73F6F76e';

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'UMINFER_API_KEY 未配置' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.modelverse.cn/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: `获取模型列表失败: ${response.status} - ${errorData.error?.message || '未知错误'}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      models: data.data || [],
      message: '成功获取模型列表'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `获取模型列表失败: ${error.message}` },
      { status: 500 }
    );
  }
}


