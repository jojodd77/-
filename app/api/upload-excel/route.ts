import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未上传文件' },
        { status: 400 }
      );
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: '只支持 Excel 文件 (.xlsx, .xls) 或 CSV 文件 (.csv)' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // 获取第一个工作表
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // 转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // 解析数据，支持格式：
    // 第一列：样本ID
    // 第二列：输入文本
    // 第三列：期望文本（可选）
    // 第四列：输出文本（可选，通常为空）
    let testData: Array<{ id: string | number; input: string; expected?: string; output?: string }> = [];

    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel 文件为空' },
        { status: 400 }
      );
    }

    // 检查第一行是否是表头
    const firstRow = jsonData[0] as any[];
    const hasHeader = firstRow && (
      (firstRow[0] && typeof firstRow[0] === 'string' && (firstRow[0].toLowerCase().includes('id') || firstRow[0].toLowerCase().includes('样本'))) ||
      (firstRow[1] && typeof firstRow[1] === 'string' && (firstRow[1].toLowerCase().includes('input') || firstRow[1].toLowerCase().includes('输入')))
    );

    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.length === 0) continue;

      const sampleId = row[0] ? String(row[0]).trim() : (i - startIndex + 1).toString();
      const input = row[1] ? String(row[1]).trim() : '';
      const expected = row[2] ? String(row[2]).trim() : undefined;
      const output = row[3] ? String(row[3]).trim() : undefined;

      if (!input) continue; // 跳过空行

      testData.push({
        id: sampleId,
        input,
        expected,
        output
      });
    }

    if (testData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel 文件中没有有效数据' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: testData,
      count: testData.length,
      message: `成功解析 ${testData.length} 条测试数据`
    });
  } catch (error: any) {
    console.error('解析 Excel 文件失败:', error);
    return NextResponse.json(
      { success: false, error: `解析失败: ${error.message}` },
      { status: 500 }
    );
  }
}

