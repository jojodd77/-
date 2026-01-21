#!/bin/bash

# 项目交付脚本
# 用于快速准备和交付项目

echo "🚀 项目交付准备脚本"
echo "===================="
echo ""

# 检查 Git 状态
echo "📋 检查 Git 状态..."
cd "$(dirname "$0")"
git status --short

echo ""
echo "📦 准备交付文件..."
echo ""

# 显示文件位置
echo "✅ 压缩包位置:"
echo "   $(cd .. && pwd)/my-tool-platform-v1.0.0.tar.gz"
echo ""

echo "✅ 项目目录:"
echo "   $(pwd)"
echo ""

echo "✅ Git 标签:"
git tag -l | tail -1
echo ""

# 检查是否已推送到远程
echo "🔍 检查远程仓库状态..."
if git ls-remote --tags origin | grep -q "v1.0.0"; then
    echo "   ✅ 标签 v1.0.0 已推送到远程"
else
    echo "   ⚠️  标签 v1.0.0 尚未推送"
    echo "   运行以下命令推送："
    echo "   git push origin main"
    echo "   git push origin v1.0.0"
fi

echo ""
echo "📄 交付文档："
echo "   - 项目交接文档.md"
echo "   - 交接清单.md"
echo "   - 交付指南.md"
echo "   - README.md"
echo ""

echo "🎯 下一步操作："
echo "   1. 推送代码到 GitHub（如未推送）"
echo "   2. 在 GitHub 上创建 Release 并上传压缩包"
echo "   3. 或使用云盘/邮件方式分享"
echo ""
echo "   详细步骤请查看：交付指南.md"
echo ""
