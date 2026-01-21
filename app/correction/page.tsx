'use client';

import { useState, useEffect } from 'react';
import { CorrectionResponse } from '@/types';

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export default function CorrectionPage() {
  const [inputText, setInputText] = useState('');
  const [targetChar, setTargetChar] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [result, setResult] = useState<CorrectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          const defaultModel = data.models.find((m: Model) => m.id === 'qwen-turbo') || data.models[0];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError('请输入文本内容');
      return;
    }

    if (!targetChar.trim()) {
      setError('请输入要标注的文字（多个文字用逗号隔开）');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const requestBody: { text: string; targetChar: string; modelId?: string } = { 
        text: inputText,
        targetChar: targetChar.trim()
      };
      
      // 如果选择了模型，添加到请求中
      if (selectedModel) {
        requestBody.modelId = selectedModel;
      }

      const response = await fetch('/api/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const data: CorrectionResponse = await response.json();
      setResult(data);

      // 保存到历史记录（本地存储）
      if (typeof window !== 'undefined') {
        const history = JSON.parse(localStorage.getItem('correctionHistory') || '[]');
        history.unshift({
          id: Date.now().toString(),
          originalText: data.originalText,
          correctedText: data.correctedText,
          isCompliant: data.isCompliant,
          timestamp: new Date().toISOString(),
        });
        // 只保留最近50条记录
        localStorage.setItem('correctionHistory', JSON.stringify(history.slice(0, 50)));
      }
    } catch (err) {
      // 尝试获取更详细的错误信息
      let errorMessage = '处理失败，请稍后重试';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('API 调用错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTargetChar('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            发音标注修正
          </h1>
          <p className="text-gray-600 mb-8">
            输入文本和要标注的文字，系统会根据上下文语境给出正确的拼音标注
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                输入文本
              </label>
              <textarea
                id="text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="例如：图中哪个光路图是正确的？"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                输入需要标注的文本内容
              </p>
            </div>

            <div>
              <label htmlFor="target-char-input" className="block text-sm font-medium text-gray-700 mb-2">
                要标注的文字 <span className="text-red-500">*</span>
              </label>
              <input
                id="target-char-input"
                type="text"
                value={targetChar}
                onChange={(e) => setTargetChar(e.target.value)}
                placeholder="例如：中,重,解（多个文字用逗号隔开，按顺序输入）"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                输入要标注的文字，多个文字用逗号隔开。系统会根据上下文语境判断这些文字的正确读音并添加标注。例如：中,重,解
              </p>
            </div>

            <div>
              <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
                选择模型
              </label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loadingModels}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                选择用于标注的大模型。推荐使用 qwen-turbo、deepseek-ai/DeepSeek-V3.2 或 Qwen/Qwen3-Max
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '处理中...' : '判断并修正'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                清空
              </button>
            </div>
          </form>

          {result && (
            <div className="mt-8 space-y-4">
              <div className={`p-4 rounded-lg ${
                result.isCompliant 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg font-semibold ${
                    result.isCompliant ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {result.isCompliant ? '✓ 符合规则' : '⚠ 已修正'}
                  </span>
                </div>
                <p className={`text-sm ${
                  result.isCompliant ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {result.message}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">原始文本</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{result.originalText}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">修正后文本</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{result.correctedText}</p>
                  </div>
                </div>
              </div>

              {result.corrections && result.corrections.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">修正详情</h3>
                  <div className="space-y-2">
                    {result.corrections.map((correction, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">位置 {correction.position}:</span>{' '}
                          <span className="line-through text-red-600">{correction.original}</span>{' '}
                          → <span className="text-green-600 font-medium">{correction.corrected}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{correction.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 显示使用的大模型信息（仅在使用真实大模型时显示） */}
              {result.model && result.model !== '模拟逻辑' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    {result.model === '智谱清言 API' && '✅ 使用智谱清言 API'}
                    {result.model === '百度千帆 API' && '✅ 使用百度千帆 API'}
                    {result.model === 'OpenAI API' && '✅ 使用 OpenAI API'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

