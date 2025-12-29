export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          发音修正平台 🎙️
        </h1>
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-600">
            TTS（文本转语音）发音修正和优化工具
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h2 className="font-semibold mb-2">🔍 发音判断修正</h2>
              <p className="text-sm text-gray-600">智能判断文本是否符合发音规则，自动修正</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h2 className="font-semibold mb-2">📜 历史记录</h2>
              <p className="text-sm text-gray-600">查看用户的输入历史记录</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h2 className="font-semibold mb-2">📖 规则查看</h2>
              <p className="text-sm text-gray-600">提供规则文档，方便查看发音规则</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

