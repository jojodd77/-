'use client';

import { useState } from 'react';
import { CorrectionResponse } from '@/types';

export default function CorrectionPage() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<CorrectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError('请输入文本内容');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
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
      setError(err instanceof Error ? err.message : '处理失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            发音判断修正
          </h1>
          <p className="text-gray-600 mb-8">
            输入文本，系统会自动判断是否符合发音规则，不符合则自动修正
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
                支持中文和英文文本，系统会自动检测并修正发音
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

