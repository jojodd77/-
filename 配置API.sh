#!/bin/bash

cd /Users/jojodd/my-tool-platform

API_KEY="dff3af0865ac4a75b7511dd22d6188b8.JBxKqerah1FuJVba"

echo "🔧 正在配置智谱清言 API Key..."

# 备份原文件
if [ -f .env.local ]; then
    cp .env.local .env.local.bak
    echo "✅ 已备份原 .env.local 文件"
fi

# 如果文件不存在，从示例文件创建
if [ ! -f .env.local ]; then
    cp env.example .env.local 2>/dev/null || touch .env.local
    echo "✅ 已创建 .env.local 文件"
fi

# 删除旧的 ZHIPU_API_KEY 配置（如果存在）
if grep -q "^ZHIPU_API_KEY=" .env.local 2>/dev/null; then
    sed -i '' '/^ZHIPU_API_KEY=/d' .env.local
    echo "✅ 已删除旧的 ZHIPU_API_KEY 配置"
fi

# 添加新的配置
echo "" >> .env.local
echo "# 智谱清言 API Key" >> .env.local
echo "ZHIPU_API_KEY=$API_KEY" >> .env.local

echo "✅ API Key 已配置"
echo ""
echo "📋 配置验证："
grep "ZHIPU_API_KEY" .env.local | sed 's/=.*/=***/'
echo ""
echo "⚠️  重要：请重启开发服务器才能生效"
echo "   1. 停止当前服务器（Ctrl+C）"
echo "   2. 重新启动：npm run dev"
echo ""



