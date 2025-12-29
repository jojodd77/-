#!/bin/bash

# 发音修正平台 - 快速启动脚本

echo "🚀 启动发音修正平台开发服务器..."
echo ""

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    echo "   项目位置: /Users/jojodd/my-tool-platform"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 检测到依赖未安装，正在安装..."
    echo "   这可能需要几分钟时间..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ 依赖安装失败"
        echo "   请手动运行: npm install"
        exit 1
    fi
    echo "✅ 依赖安装完成"
    echo ""
fi

# 启动开发服务器
echo "🌟 启动开发服务器..."
echo "   访问地址: http://localhost:3001"
echo ""
echo "   按 Ctrl + C 停止服务器"
echo ""

npm run dev

