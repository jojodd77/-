#!/bin/bash

echo "🔍 查找占用端口 3001 的进程..."
echo ""

# 方法 1: 使用 lsof
PID=$(lsof -ti :3001 2>/dev/null)
if [ ! -z "$PID" ]; then
    echo "找到进程 PID: $PID"
    echo "正在停止进程..."
    kill -9 $PID 2>/dev/null
    sleep 1
    echo "✅ 已停止进程 $PID"
else
    echo "ℹ️  使用 lsof 未找到进程"
fi

# 方法 2: 使用 pkill
echo ""
echo "🔍 查找所有 Next.js 相关进程..."
pkill -f "next dev" 2>/dev/null && echo "✅ 已停止 Next.js 开发服务器进程" || echo "ℹ️  未找到 Next.js 进程"

# 方法 3: 使用 killall (macOS)
echo ""
echo "🔍 查找所有 node 进程..."
killall -9 node 2>/dev/null && echo "✅ 已停止所有 node 进程" || echo "ℹ️  未找到 node 进程"

# 等待一下
sleep 2

# 验证端口是否已释放
echo ""
echo "🔍 验证端口 3001 状态..."
if lsof -ti :3001 >/dev/null 2>&1; then
    echo "⚠️  警告：端口 3001 仍被占用"
    echo "请手动检查："
    echo "  lsof -i :3001"
    echo "  ps aux | grep next"
else
    echo "✅ 端口 3001 已释放，可以启动开发服务器了"
    echo ""
    echo "现在可以运行："
    echo "  cd /Users/jojodd/my-tool-platform"
    echo "  npm run dev"
fi



