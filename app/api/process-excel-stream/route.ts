import { NextRequest } from 'next/server';
import * as XLSX from 'xlsx';
import { callLLM } from '@/app/api/correct/route';
import { CorrectionResponse } from '@/types';

/**
 * 流式处理Excel文件（使用Server-Sent Events）
 * 实时返回处理进度
 */
export async function POST(request: NextRequest) {
  // 设置SSE响应头
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const modelId = formData.get('modelId') as string | null;

        if (!file) {
          send({ type: 'error', message: '未上传文件' });
          controller.close();
          return;
        }

        // 检查文件类型
        const uploadedFileName = file.name.toLowerCase();
        if (!uploadedFileName.endsWith('.xlsx') && !uploadedFileName.endsWith('.xls') && !uploadedFileName.endsWith('.csv')) {
          send({ type: 'error', message: '只支持 Excel 文件 (.xlsx, .xls) 或 CSV 文件 (.csv)' });
          controller.close();
          return;
        }

        send({ type: 'progress', message: '正在读取文件...', progress: 0 });

        // 读取文件内容
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (jsonData.length === 0) {
          send({ type: 'error', message: 'Excel 文件为空' });
          controller.close();
          return;
        }

        // 检查第一行是否是表头
        const firstRow = jsonData[0] as any[];
        const hasHeader = firstRow && (
          (firstRow[0] && typeof firstRow[0] === 'string' && (firstRow[0].toLowerCase().includes('id') || firstRow[0].toLowerCase().includes('样本'))) ||
          (firstRow[1] && typeof firstRow[1] === 'string' && (firstRow[1].toLowerCase().includes('input') || firstRow[1].toLowerCase().includes('输入')))
        );

        const startIndex = hasHeader ? 1 : 0;
        const totalRows = jsonData.length - startIndex;
        const processedData: any[][] = [];

        // 如果有表头，保留表头；如果没有，创建标准表头
        if (hasHeader) {
          // 确保表头有5列（用户要求5列，不包含模型列）
          const headerRow = [...firstRow];
          while (headerRow.length < 5) {
            headerRow.push('');
          }
          // 如果缺少某些列，补充标准列名
          if (headerRow.length >= 1 && !headerRow[0]) headerRow[0] = '样本ID';
          if (headerRow.length >= 2 && !headerRow[1]) headerRow[1] = '输入文本';
          if (headerRow.length >= 3 && !headerRow[2]) headerRow[2] = '需要改写文本';
          if (headerRow.length >= 4 && !headerRow[3]) headerRow[3] = '期望文本';
          if (headerRow.length >= 5 && !headerRow[4]) headerRow[4] = '输出文本';
          processedData.push(headerRow);
        } else {
          processedData.push(['样本ID', '输入文本', '需要改写文本', '期望文本', '输出文本']);
        }

        send({ type: 'progress', message: `开始处理 ${totalRows} 行数据...`, progress: 0, total: totalRows, current: 0 });

        // 处理每一行数据
        for (let i = startIndex; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          // 读取5列数据：样本ID、输入文本、需要改写文本、期望文本、输出文本
          const sampleId = row[0] ? String(row[0]).trim() : (i - startIndex + 1).toString();
          const input = row[1] ? String(row[1]).trim() : '';
          const targetChars = row[2] ? String(row[2]).trim() : ''; // 需要改写文本（要标注的文字）
          const expected = row[3] ? String(row[3]).trim() : '';
          let output = row[4] ? String(row[4]).trim() : ''; // 输出文本（第5列）

          const currentRow = i - startIndex + 1;
          const progress = Math.round((currentRow / totalRows) * 100);

          if (!input) {
            // 如果输入为空，保留原行（确保有5列）
            processedData.push([sampleId, input, targetChars, expected, output]);
            send({ 
              type: 'progress', 
              message: `处理中: ${currentRow}/${totalRows} (跳过空行)`, 
              progress, 
              total: totalRows, 
              current: currentRow 
            });
            continue;
          }

          // 如果输出为空，调用API进行修正
          if (!output) {
            try {
              send({ 
                type: 'progress', 
                message: `处理中: ${currentRow}/${totalRows} - "${input.substring(0, 20)}${input.length > 20 ? '...' : ''}"`, 
                progress, 
                total: totalRows, 
                current: currentRow 
              });

              // 检查是否有需要改写的文字
              if (!targetChars) {
                // 如果没有指定要标注的文字，保持原文本
                output = input;
              } else {
                // 使用 callLLM 函数，支持自动降级到其他 API
                const result: CorrectionResponse = await callLLM(input, targetChars, modelId || undefined);
                
                // 使用修正后的文本
                output = result.correctedText || input;
              }
              
              // 减少延迟到200ms（如果API支持更高的速率）
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (err: any) {
              console.error(`处理样本 ${sampleId} 时出错:`, err.message);
              // 如果API失败，保留原始输入文本
              output = input;
            }
          }

          // 确保每行都有5列
          processedData.push([sampleId, input, targetChars, expected, output]);
        }

        send({ type: 'progress', message: '正在生成Excel文件...', progress: 95, total: totalRows, current: totalRows });

        // 创建新的工作簿
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.aoa_to_sheet(processedData);
        
        // 设置列宽
        newWorksheet['!cols'] = [
          { wch: 15 }, // 样本ID
          { wch: 50 }, // 输入文本
          { wch: 30 }, // 需要改写文本
          { wch: 50 }, // 期望文本
          { wch: 50 }  // 输出文本
        ];

        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Result');

        // 生成Excel文件
        const excelBuffer = XLSX.write(newWorkbook, { 
          type: 'array', 
          bookType: 'xlsx',
          cellStyles: false
        });

        const buffer = Buffer.from(excelBuffer);
        const base64 = buffer.toString('base64');

        send({ 
          type: 'complete', 
          message: '处理完成！', 
          progress: 100, 
          total: totalRows, 
          current: totalRows,
          file: base64,
          fileName: `result_${Date.now()}.xlsx`
        });

        controller.close();
      } catch (error: any) {
        console.error('处理 Excel 文件失败:', error);
        send({ type: 'error', message: `处理失败: ${error.message}` });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

