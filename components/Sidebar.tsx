'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { 
      href: '/correction', 
      label: '发音判断修正',
      icon: '🔍',
      isMain: true
    },
    { 
      href: '/history', 
      label: '历史记录',
      icon: '📜',
      isMain: false
    },
    { 
      href: '/rules', 
      label: '规则查看',
      icon: '📖',
      isMain: false
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            🎙️ 发音修正平台
          </h1>
          <p className="text-xs text-gray-500">
            TTS 发音修正工具
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            // 首页和 /correction 都算作发音修正页面
            const isActive = pathname === item.href || 
                           (item.href === '/correction' && (pathname === '/' || pathname === '/correction'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${item.isMain ? 'font-semibold' : ''}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

