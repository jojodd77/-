#!/bin/bash

echo "🔧 快速配置智谱清言 API Key"
echo "=============================="
echo ""

cd /Users/jojodd/my-tool-platform

# 检查 .env.local 是否存在
if [ ! -f .env.local ]; then
    echo "📝 创建 .env.local 文件..."
    cp env.example .env.local
    echo "✅ 已创建 .env.local 文件"
else
    echo "✅ .env.local 文件已存在"
fi

echo ""
echo "请按照以下步骤操作："
echo ""
echo "1️⃣  访问 https://open.bigmodel.cn/"
echo "2️⃣  注册/登录账号"
echo "3️⃣  在控制台创建 API Key"
echo "4️⃣  复制 API Key"
echo ""
read -p "请输入你的智谱清言 API Key: " api_key

if [ -z "$api_key" ]; then
    echo "❌ API Key 不能为空"
    exit 1
fi

# 检查是否已存在配置
if grep -q "ZHIPU_API_KEY" .env.local 2>/dev/null; then
    echo ""
    echo "⚠️  检测到已有 ZHIPU_API_KEY 配置"
    read -p "是否覆盖现有配置？(y/n): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "❌ 已取消"
        exit 0
    fi
    # 删除旧配置
    sed -i '' '/^ZHIPU_API_KEY=/d' .env.local
fi

# 添加新配置
echo "" >> .env.local
echo "# 智谱清言 API Key" >> .env.local
echo "ZHIPU_API_KEY=$api_key" >> .env.local

echo ""
echo "✅ API Key 已配置到 .env.local"
echo ""
echo "📋 配置内容（隐藏部分）："
grep "ZHIPU_API_KEY" .env.local | sed 's/=.*/=***/'
echo ""
echo "⚠️  重要：需要重启开发服务器才能生效"
echo ""
echo "请执行："
echo "  1. 停止当前服务器（Ctrl+C）"
echo "  2. 重新启动：npm run dev"
echo ""
echo "启动后，终端应该显示：✅ 使用智谱清言 API"
echo ""



