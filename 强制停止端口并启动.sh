#!/bin/bash

echo "🔧 强制停止端口 3001 并启动服务器"
echo "=================================="
echo ""

cd /Users/jojodd/my-tool-platform

# 1. 查找并显示占用端口的进程
echo "1️⃣ 查找占用端口 3001 的进程..."
PIDS=$(lsof -ti :3001 2>/dev/null)
if [ ! -z "$PIDS" ]; then
    echo "找到进程: $PIDS"
    echo "$PIDS" | xargs ps -p
else
    echo "未找到占用端口的进程"
fi
echo ""

# 2. 强制停止所有相关进程
echo "2️⃣ 强制停止所有相关进程..."
lsof -ti :3001 | xargs kill -9 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 node 2>/dev/null
sleep 3
echo "✅ 已停止所有进程"
echo ""

# 3. 验证端口已释放
echo "3️⃣ 验证端口状态..."
if lsof -ti :3001 >/dev/null 2>&1; then
    echo "⚠️  警告：端口 3001 仍被占用"
    echo "尝试使用 sudo 权限..."
    sudo lsof -ti :3001 | xargs sudo kill -9 2>/dev/null
    sleep 2
fi

if lsof -ti :3001 >/dev/null 2>&1; then
    echo "❌ 端口 3001 仍被占用，请手动检查："
    echo "   lsof -i :3001"
    echo "   ps aux | grep next"
    exit 1
else
    echo "✅ 端口 3001 已释放"
fi
echo ""

# 4. 清理缓存
echo "4️⃣ 清理构建缓存..."
rm -rf .next 2>/dev/null
echo "✅ 已清理缓存"
echo ""

# 5. 启动服务器
echo "5️⃣ 启动开发服务器..."
echo ""
echo "正在启动 Next.js 开发服务器..."
echo "访问地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 可以停止服务器"
echo ""

npm run dev



