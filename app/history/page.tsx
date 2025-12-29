'use client';

import { useState, useEffect } from 'react';
import { HistoryRecord } from '@/types';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('correctionHistory');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setHistory(parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          })));
        } catch (e) {
          console.error('解析历史记录失败:', e);
        }
      }
      setLoading(false);
    }
  }, []);

  const handleClear = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      localStorage.removeItem('correctionHistory');
      setHistory([]);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                历史记录
              </h1>
              <p className="text-gray-600">
                查看你的发音修正历史记录
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
              >
                清空记录
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📜</div>
              <p className="text-gray-600 mb-4">暂无历史记录</p>
              <Link
                href="/correction"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                去进行发音修正 →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      record.isCompliant
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.isCompliant ? '符合规则' : '已修正'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(record.timestamp)}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">原始文本</p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {record.originalText}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">修正后文本</p>
                      <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded">
                        {record.correctedText}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

