#!/bin/bash

echo "🔍 开始诊断和修复 500 错误..."
echo ""

# 1. 检查环境变量文件
echo "📝 步骤 1: 检查环境变量配置..."
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local 不存在，正在创建..."
    cp env.example .env.local
    echo "✅ 已创建 .env.local 文件"
else
    echo "✅ .env.local 已存在"
fi
echo ""

# 2. 停止当前开发服务器
echo "🛑 步骤 2: 停止当前开发服务器..."
PID=$(lsof -ti :3001 2>/dev/null)
if [ ! -z "$PID" ]; then
    echo "找到进程 PID: $PID"
    kill $PID
    echo "✅ 已停止开发服务器"
    sleep 2
else
    echo "ℹ️  没有找到运行中的开发服务器"
fi
echo ""

# 3. 清理构建缓存
echo "🧹 步骤 3: 清理构建缓存..."
if [ -d .next ]; then
    rm -rf .next
    echo "✅ 已删除 .next 目录"
else
    echo "ℹ️  .next 目录不存在"
fi
echo ""

# 4. 检查依赖
echo "📦 步骤 4: 检查依赖..."
if [ ! -d node_modules ]; then
    echo "⚠️  node_modules 不存在，正在安装依赖..."
    npm install
else
    echo "✅ node_modules 已存在"
fi
echo ""

# 5. 检查 TypeScript 编译
echo "🔨 步骤 5: 检查 TypeScript 编译..."
npx tsc --noEmit 2>&1 | head -20
if [ $? -eq 0 ]; then
    echo "✅ TypeScript 编译检查通过"
else
    echo "⚠️  TypeScript 编译有错误（见上方）"
fi
echo ""

# 6. 重新启动开发服务器
echo "🚀 步骤 6: 启动开发服务器..."
echo ""
echo "正在启动 Next.js 开发服务器..."
echo "启动后请访问: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev



