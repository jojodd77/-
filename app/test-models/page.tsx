'use client';

import { useState, useEffect } from 'react';

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

export default function TestModelsPage() {
  // 单文本测试
  const [testText, setTestText] = useState('');
  const [singleTestLoading, setSingleTestLoading] = useState(false);
  const [singleTestResults, setSingleTestResults] = useState<any[] | null>(null);
  const [singleTestError, setSingleTestError] = useState<string | null>(null);
  
  // Excel批量处理
  const [processingExcel, setProcessingExcel] = useState(false);
  const [processExcelError, setProcessExcelError] = useState<string | null>(null);
  const [processProgress, setProcessProgress] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [models, setModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // 加载模型列表
  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const response = await fetch('/api/get-models');
        const data = await response.json();
        if (data.success && data.models) {
          setModels(data.models);
          // 设置默认模型为 qwen-turbo 或第一个模型
          const defaultModel = data.models.find((m: any) => m.id === 'qwen-turbo') || data.models[0];
          if (defaultModel) {
            setSelectedModel(defaultModel.id);
          }
        }
      } catch (err) {
        console.error('加载模型列表失败:', err);
      } finally {
        setLoadingModels(false);
      }
    };
    loadModels();
  }, []);

  // 处理Excel文件（批量修正并下载）- 使用流式处理
  const handleProcessExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessingExcel(true);
    setProcessExcelError(null);
    setProcessProgress('正在上传文件...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      // 如果选择了模型，添加到请求中
      if (selectedModel) {
        formData.append('modelId', selectedModel);
      }

      // 使用流式处理API
      const response = await fetch('/api/process-excel-stream', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('处理失败');
      }

      // 使用EventSource读取SSE流
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let buffer = '';
      let fileData: { file: string; fileName: string } | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setProcessProgress(`${data.message} (${data.progress}%)`);
              } else if (data.type === 'complete') {
                setProcessProgress('处理完成！正在下载文件...');
                fileData = { file: data.file, fileName: data.fileName };
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (e) {
              console.error('解析SSE消息失败:', e);
            }
          }
        }
      }

      // 下载文件
      if (fileData) {
        const binaryString = atob(fileData.file);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileData.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setProcessProgress('处理完成！文件已下载。');
      }
    } catch (err: any) {
      setProcessExcelError(err.message || '处理失败');
      setProcessProgress('');
    } finally {
      setProcessingExcel(false);
      // 清空文件输入
      event.target.value = '';
    }
  };


  const runSingleTest = async () => {
    if (!testText.trim()) {
      setSingleTestError('请输入测试文本');
      return;
    }

    setSingleTestLoading(true);
    setSingleTestError(null);
    setSingleTestResults(null);

    try {
      const response = await fetch('/api/test-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: testText }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '测试失败');
      }

      setSingleTestResults(data.results);
    } catch (err: any) {
      setSingleTestError(err.message);
    } finally {
      setSingleTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            大模型测试
          </h1>
          <p className="text-gray-600 mb-8">
            测试多个大模型的发音修正效果
          </p>

          {/* 单文本测试 */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              单文本测试
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              输入一段文本，测试三个模型（智谱AI、DeepSeek、豆包）的修正效果
            </p>
            <div className="space-y-4">
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="例如：在物理课上，我们学习了物体的重量与质量的关系。"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <button
                onClick={runSingleTest}
                disabled={singleTestLoading || !testText.trim()}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {singleTestLoading ? '测试中...' : '测试这段文本'}
              </button>
            </div>

            {singleTestError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {singleTestError}
              </div>
            )}

            {singleTestResults && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">测试结果</h3>
                {singleTestResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-lg ${
                        result.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.success ? '✅' : '❌'}
                      </span>
                      <span className="font-medium text-gray-900">
                        {result.model}
                        {result.success && ` (${result.time}ms)`}
                      </span>
                    </div>
                    {result.success ? (
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">修正结果:</span> {result.result}
                        </p>
                        <p>
                          <span className="font-medium">消息:</span> {result.message}
                        </p>
                        {result.corrections && result.corrections.length > 0 && (
                          <p>
                            <span className="font-medium">修正数量:</span> {result.corrections.length} 处
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-red-600">
                        <span className="font-medium">错误:</span> {result.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Excel批量处理 */}
          <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Excel批量处理
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              上传Excel文件，系统会根据输入文本的语境，给需要改写的文本加上标注，然后将结果填入表格供您下载
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="excel-model-select" className="block text-sm font-medium text-gray-700 mb-2">
                  选择模型
                </label>
                <select
                  id="excel-model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={loadingModels || processingExcel}
                  className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {loadingModels ? (
                    <option>加载模型中...</option>
                  ) : models.length === 0 ? (
                    <option>暂无可用模型</option>
                  ) : (
                    models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.id}
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  选择用于批量处理的大模型。推荐使用 qwen-turbo、deepseek-ai/DeepSeek-V3.2 或 Qwen/Qwen3-Max
                </p>
              </div>
              <div className="flex gap-4 flex-wrap items-center">
                <label className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-block">
                  {processingExcel ? '处理中...' : '上传并处理Excel文件'}
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleProcessExcel}
                    disabled={processingExcel}
                    className="hidden"
                  />
                </label>
                {processingExcel && (
                  <span className="text-sm text-gray-600">{processProgress}</span>
                )}
              </div>
              
              {processExcelError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {processExcelError}
                </div>
              )}
              
              <div className="text-xs text-gray-500 bg-white p-3 rounded border border-gray-200">
                <p className="font-medium mb-2">Excel文件格式要求：</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>第一列：</strong>样本ID（可以是数字或文本）</li>
                  <li><strong>第二列：</strong>输入文本（需要标注的文本）</li>
                  <li><strong>第三列：</strong>需要改写文本（要标注的文字，多个用逗号隔开，例如：重,量）</li>
                  <li><strong>第四列：</strong>期望文本（可选，用于对比）</li>
                  <li><strong>第五列：</strong>输出文本（如果为空则自动填充标注结果）</li>
                  <li>第一行可以是表头，也可以直接是数据</li>
                  <li>支持 .xlsx、.xls、.csv 格式</li>
                </ul>
                <p className="mt-2 text-orange-600">
                  ⚠️ 注意：处理大量数据时可能需要较长时间，请耐心等待
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

