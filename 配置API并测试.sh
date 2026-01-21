#!/bin/bash

echo "🔧 配置 API Keys 并开始测试..."
echo ""

# 创建或更新 .env.local 文件
ENV_FILE=".env.local"

# 检查文件是否存在
if [ -f "$ENV_FILE" ]; then
    echo "📝 更新现有的 .env.local 文件..."
    # 备份原文件
    cp "$ENV_FILE" "$ENV_FILE.backup"
else
    echo "📝 创建新的 .env.local 文件..."
fi

# 写入 API Keys
cat > "$ENV_FILE" << 'EOF'
# 智谱AI
ZHIPU_API_KEY=dff3af0865ac4a75b7511dd22d6188b8.JBxKqerah1FuJVba

# DeepSeek
DEEPSEEK_API_KEY=sk-72e5d982a449445cad031d7ed2980775

# 豆包（字节跳动）
DOUBAO_API_KEY=3a80a3f6-4cf0-430a-bb28-274dde2ace11

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
EOF

echo "✅ API Keys 已配置完成！"
echo ""
echo "📋 配置的 API Keys:"
echo "  - 智谱AI: ✅"
echo "  - DeepSeek: ✅"
echo "  - 豆包: ✅"
echo ""
echo "🚀 现在可以："
echo "  1. 启动开发服务器: npm run dev"
echo "  2. 访问测试页面: http://localhost:3001/test-models"
echo "  3. 点击'开始测试'按钮"
echo ""


