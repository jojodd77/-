#!/bin/bash

echo "🔧 正在解决端口 3001 占用问题..."
echo ""

# 停止所有可能占用端口的进程
echo "1️⃣ 停止占用端口 3001 的进程..."
lsof -ti :3001 | xargs kill -9 2>/dev/null && echo "   ✅ 已停止端口 3001 上的进程" || echo "   ℹ️  端口 3001 未被占用"

echo ""
echo "2️⃣ 停止所有 Next.js 开发服务器..."
pkill -9 -f "next dev" 2>/dev/null && echo "   ✅ 已停止 Next.js 进程" || echo "   ℹ️  未找到 Next.js 进程"

echo ""
echo "3️⃣ 等待进程完全停止..."
sleep 3

echo ""
echo "4️⃣ 验证端口状态..."
if lsof -ti :3001 >/dev/null 2>&1; then
    echo "   ⚠️  端口 3001 仍被占用"
    echo "   请手动检查：lsof -i :3001"
    exit 1
else
    echo "   ✅ 端口 3001 已释放"
fi

echo ""
echo "✅ 修复完成！现在可以启动开发服务器："
echo ""
echo "   cd /Users/jojodd/my-tool-platform"
echo "   npm run dev"
echo ""



