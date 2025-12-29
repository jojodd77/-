#!/bin/bash

# GitHub 仓库连接脚本
# 仓库地址: https://github.com/jojodd77/-

echo "🔗 开始连接 GitHub 仓库..."
echo "仓库地址: https://github.com/jojodd77/-"
echo ""

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 初始化 Git（如果还没有）
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
    git branch -M main
    echo "✅ Git 初始化完成"
else
    echo "✅ Git 已初始化"
fi

# 检查远程仓库
if git remote get-url origin &> /dev/null; then
    echo ""
    echo "⚠️  已存在远程仓库配置:"
    git remote -v
    echo ""
    read -p "是否要更新为新的仓库地址? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin https://github.com/jojodd77/-.git
        echo "✅ 远程仓库地址已更新"
    else
        echo "跳过更新远程仓库"
    fi
else
    echo "🔗 添加远程仓库..."
    git remote add origin https://github.com/jojodd77/-.git
    echo "✅ 远程仓库已添加"
fi

# 添加所有文件
echo ""
echo "📝 添加文件到 Git..."
git add .

# 检查是否有未提交的更改
if git diff --staged --quiet; then
    echo "ℹ️  没有需要提交的更改"
else
    echo "💾 提交更改..."
    git commit -m "chore: 初始化项目"
    echo "✅ 提交完成"
fi

# 显示状态
echo ""
echo "📊 当前 Git 状态:"
git status

echo ""
echo "✨ 准备完成！"
echo ""
echo "下一步操作:"
echo "1. 推送到 GitHub:"
echo "   git push -u origin main"
echo ""
echo "2. 如果遇到错误（仓库不为空），可以强制推送:"
echo "   git push -u origin main --force"
echo ""
echo "⚠️  注意: 强制推送会覆盖远程仓库的内容，请确认远程仓库是空的或可以覆盖"

