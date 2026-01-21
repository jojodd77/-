/**
 * 大模型测试脚本
 * 用于批量测试多个大模型的发音修正效果
 */

import { callZhipuAPI } from '../lib/zhipu';
import { callBaiduAPI } from '../lib/baidu';
import { callDoubaoAPI } from '../lib/doubao';
import { callDeepSeekAPI } from '../lib/deepseek';
import { callWenxinAPI } from '../lib/wenxin';
import testData from '../test-data.json';

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
  // 提取所有 字(/拼音/) 格式的标注
  const matches = text.match(/\S+\(\/[^)]+\)/g);
  return matches ? matches.join(' ') : '';
}

// 比较两个结果是否相同（忽略空格和格式差异）
function compareResults(expected: string, actual: string): boolean {
  const expectedNorm = extractAnnotations(expected).replace(/\s+/g, '');
  const actualNorm = extractAnnotations(actual).replace(/\s+/g, '');
  return expectedNorm === actualNorm;
}

// 测试单个模型
async function testModel(
  modelName: string,
  testFunction: (text: string) => Promise<any>
): Promise<ModelTestResult> {
  console.log(`\n开始测试模型: ${modelName}`);
  console.log('='.repeat(50));
  
  const results: TestResult[] = [];
  let totalTime = 0;
  
  for (const testCase of testData) {
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
      
      const status = isCorrect ? '✅' : '❌';
      console.log(`${status} 测试 ${testCase.id}: ${isCorrect ? '通过' : '失败'} (${time}ms)`);
      
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
      
      console.log(`❌ 测试 ${testCase.id}: 错误 - ${error}`);
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

// 生成测试报告
function generateReport(allResults: ModelTestResult[]): string {
  let report = '\n' + '='.repeat(80) + '\n';
  report += '大模型测试报告\n';
  report += '='.repeat(80) + '\n\n';
  
  // 汇总表格
  report += '模型性能汇总:\n';
  report += '-'.repeat(80) + '\n';
  report += '模型名称'.padEnd(20) + '准确率'.padEnd(15) + '平均耗时(ms)'.padEnd(15) + '通过/总数\n';
  report += '-'.repeat(80) + '\n';
  
  allResults.sort((a, b) => b.accuracy - a.accuracy);
  
  for (const result of allResults) {
    report += `${result.model.padEnd(20)}${result.accuracy.toFixed(2)}%`.padEnd(15);
    report += `${result.averageTime.toFixed(0)}`.padEnd(15);
    report += `${result.correct}/${result.total}\n`;
  }
  
  report += '\n' + '='.repeat(80) + '\n';
  report += '详细测试结果\n';
  report += '='.repeat(80) + '\n\n';
  
  // 每个模型的详细结果
  for (const modelResult of allResults) {
    report += `\n模型: ${modelResult.model}\n`;
    report += '-'.repeat(80) + '\n';
    
    for (const test of modelResult.results) {
      const status = test.isCorrect ? '✅' : '❌';
      report += `${status} 测试 ${test.testId}: ${test.isCorrect ? '通过' : '失败'} (${test.time}ms)\n`;
      report += `  输入: ${test.input}\n`;
      report += `  期望: ${test.expected}\n`;
      report += `  实际: ${test.actual}\n`;
      if (test.error) {
        report += `  错误: ${test.error}\n`;
      }
      report += '\n';
    }
  }
  
  return report;
}

// 主函数
async function main() {
  console.log('开始大模型测试...\n');
  
  const allResults: ModelTestResult[] = [];
  
  // 测试各个模型
  const models = [
    { name: '智谱AI', func: callZhipuAPI },
    { name: '百度千帆', func: callBaiduAPI },
    { name: '豆包', func: callDoubaoAPI },
    { name: 'DeepSeek', func: callDeepSeekAPI },
    { name: '文心一言', func: callWenxinAPI },
  ];
  
  for (const model of models) {
    try {
      const result = await testModel(model.name, model.func);
      allResults.push(result);
    } catch (err: any) {
      console.error(`测试模型 ${model.name} 时出错:`, err.message);
    }
  }
  
  // 生成报告
  const report = generateReport(allResults);
  console.log(report);
  
  // 保存报告到文件
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '../test-report.txt');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n测试报告已保存到: ${reportPath}`);
  
  // 保存JSON结果
  const jsonPath = path.join(__dirname, '../test-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`测试结果JSON已保存到: ${jsonPath}`);
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

export { testModel, generateReport };


