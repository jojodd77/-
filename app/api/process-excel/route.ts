import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { callUMinferAPI } from '@/lib/uminfer';

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
    const uploadedFileName = file.name.toLowerCase();
    if (!uploadedFileName.endsWith('.xlsx') && !uploadedFileName.endsWith('.xls') && !uploadedFileName.endsWith('.csv')) {
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
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

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
    const processedData: any[][] = [];

    // 如果有表头，保留表头
    if (hasHeader) {
      processedData.push(firstRow);
    } else {
      // 如果没有表头，添加英文表头避免编码问题
      processedData.push(['ID', 'Input', 'Expected', 'Output']);
    }

    // 处理每一行数据
    for (let i = startIndex; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.length === 0) continue;

      const sampleId = row[0] ? String(row[0]).trim() : (i - startIndex + 1).toString();
      const input = row[1] ? String(row[1]).trim() : '';
      const expected = row[2] ? String(row[2]).trim() : '';
      let output = row[3] ? String(row[3]).trim() : '';

      if (!input) {
        // 如果输入为空，保留原行
        processedData.push([sampleId, input, expected, output]);
        continue;
      }

      // 如果输出为空，调用API进行修正
      if (!output) {
        try {
          console.log(`处理样本 ${sampleId}: 输入="${input}"`);
          // 使用 Modelverse (UMinfer) API
          const result = await callUMinferAPI(input);
          console.log(`处理样本 ${sampleId}: 结果=`, {
            correctedText: result.correctedText,
            isCompliant: result.isCompliant,
            message: result.message,
            correctionsCount: result.corrections?.length || 0
          });
          
          // 优先使用修正后的文本
          output = result.correctedText || input;
          
          // 如果修正后的文本和原始文本一样，检查是否有修正记录
          if (output === input) {
            if (result.corrections && result.corrections.length > 0) {
              // 如果有修正记录但correctedText和input一样，说明API可能有问题
              console.warn(`样本 ${sampleId}: API返回了修正记录但correctedText未变化，修正记录:`, result.corrections);
              // 尝试根据修正记录手动构建correctedText
              let correctedText = input;
              const corrections = result.corrections.sort((a: any, b: any) => b.position - a.position);
              for (const correction of corrections) {
                const before = correctedText.substring(0, correction.position);
                const after = correctedText.substring(correction.position + correction.original.length);
                correctedText = before + correction.corrected + after;
              }
              if (correctedText !== input) {
                output = correctedText;
                console.log(`样本 ${sampleId}: 根据修正记录手动构建correctedText="${output}"`);
              }
            } else {
              console.warn(`样本 ${sampleId}: API判断文本符合规则，未进行修正`);
            }
          }
          
          // 添加延迟，避免API限流（减少到200ms以提高速度）
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err: any) {
          console.error(`处理样本 ${sampleId} 时出错:`, err.message);
          // 如果API失败，保留原始输入文本，避免显示错误信息（可能包含非ASCII字符）
          output = input;
        }
      }

      processedData.push([sampleId, input, expected, output]);
    }

    // 创建新的工作簿
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.aoa_to_sheet(processedData);
    
    // 设置列宽
    newWorksheet['!cols'] = [
      { wch: 15 }, // 样本ID
      { wch: 50 }, // 输入文本
      { wch: 50 }, // 期望文本
      { wch: 50 }  // 输出文本
    ];

    // 使用英文工作表名称避免编码问题
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Result');

    // 生成Excel文件 - 使用array类型避免编码问题
    const excelBuffer = XLSX.write(newWorkbook, { 
      type: 'array', 
      bookType: 'xlsx',
      cellStyles: false
    });

    // 将ArrayBuffer转换为Buffer
    const buffer = Buffer.from(excelBuffer);

    // 返回文件 - 使用英文文件名避免编码问题
    const fileName = `result_${Date.now()}.xlsx`;
    
    // 创建响应头，确保所有值都是ASCII字符
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return new NextResponse(buffer, {
      headers: headers,
    });
  } catch (error: any) {
    console.error('处理 Excel 文件失败:', error);
    return NextResponse.json(
      { success: false, error: `处理失败: ${error.message}` },
      { status: 500 }
    );
  }
}

