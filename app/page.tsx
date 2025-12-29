export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          欢迎使用工具平台 🚀
        </h1>
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-600">
            这是一个基于 Next.js 14+ 的全栈项目模板
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h2 className="font-semibold mb-2">⚡ 快速开发</h2>
              <p className="text-sm text-gray-600">使用 Next.js App Router</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h2 className="font-semibold mb-2">🎨 现代 UI</h2>
              <p className="text-sm text-gray-600">Tailwind CSS 样式系统</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h2 className="font-semibold mb-2">🔒 类型安全</h2>
              <p className="text-sm text-gray-600">TypeScript 支持</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

