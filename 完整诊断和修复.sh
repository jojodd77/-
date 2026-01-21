#!/bin/bash

echo "🔍 完整诊断和修复脚本"
echo "========================"
echo ""

cd /Users/jojodd/my-tool-platform

# 1. 停止所有相关进程
echo "1️⃣ 停止所有相关进程..."
pkill -9 -f "next dev" 2>/dev/null
pkill -9 node 2>/dev/null
lsof -ti :3001 | xargs kill -9 2>/dev/null
sleep 2
echo "✅ 已完成"
echo ""

# 2. 清理构建缓存
echo "2️⃣ 清理构建缓存..."
rm -rf .next
echo "✅ 已清理 .next 目录"
echo ""

# 3. 检查环境变量
echo "3️⃣ 检查环境变量..."
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "✅ 已创建 .env.local"
else
    echo "✅ .env.local 已存在"
fi
echo ""

# 4. 检查依赖
echo "4️⃣ 检查依赖..."
if [ ! -d node_modules ]; then
    echo "⚠️  node_modules 不存在，正在安装..."
    npm install
else
    echo "✅ node_modules 已存在"
fi
echo ""

# 5. 检查 TypeScript 编译
echo "5️⃣ 检查 TypeScript 编译..."
npx tsc --noEmit 2>&1 | head -20
if [ $? -eq 0 ]; then
    echo "✅ TypeScript 编译检查通过"
else
    echo "⚠️  TypeScript 编译有错误（见上方）"
fi
echo ""

# 6. 验证端口
echo "6️⃣ 验证端口 3001..."
if lsof -ti :3001 >/dev/null 2>&1; then
    echo "⚠️  端口 3001 仍被占用"
    lsof -i :3001
else
    echo "✅ 端口 3001 可用"
fi
echo ""

# 7. 启动开发服务器
echo "7️⃣ 启动开发服务器..."
echo ""
echo "正在启动 Next.js 开发服务器..."
echo "请等待服务器启动完成..."
echo ""
echo "启动成功后，访问: http://localhost:3001"
echo ""
echo "按 Ctrl+C 可以停止服务器"
echo ""

npm run dev



