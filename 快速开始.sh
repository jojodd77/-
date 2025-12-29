#!/bin/bash

# 项目快速启动脚本

echo "🚀 开始设置项目..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"

# 安装依赖
echo ""
echo "📦 正在安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 检查 .env.local
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 创建 .env.local 文件..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✅ 已从 .env.example 创建 .env.local"
        echo "⚠️  请编辑 .env.local 填写你的配置"
    else
        echo "⚠️  未找到 .env.example，请手动创建 .env.local"
    fi
fi

echo ""
echo "✨ 项目设置完成！"
echo ""
echo "下一步："
echo "1. 编辑 .env.local 配置环境变量（如需要）"
echo "2. 运行 'npm run dev' 启动开发服务器"
echo "3. 访问 http://localhost:3001"
echo ""
echo "📚 查看 README.md 和 开发指南.md 了解更多信息"

