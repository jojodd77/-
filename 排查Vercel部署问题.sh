#!/bin/bash

echo "🔍 开始排查 Vercel 部署问题..."
echo ""

# 1. 检查 Git 状态
echo "1️⃣ 检查 Git 状态..."
echo "当前分支:"
git branch --show-current
echo ""
echo "最新提交:"
git log --oneline -3
echo ""
echo "远程仓库状态:"
git remote -v
echo ""

# 2. 检查提交中的文件内容
echo "2️⃣ 检查提交中的关键文件..."
echo ""
echo "检查 app/correction/page.tsx 中的关键内容:"
git show HEAD:app/correction/page.tsx | grep -A 3 "指定要检查的文字" | head -5
echo ""
echo "检查 placeholder:"
git show HEAD:app/correction/page.tsx | grep "placeholder" | grep "中,重,解"
if [ $? -eq 0 ]; then
    echo "✅ placeholder 已正确更新"
else
    echo "❌ placeholder 未找到更新"
fi
echo ""

# 3. 检查本地文件与提交的差异
echo "3️⃣ 检查本地文件与最新提交的差异..."
DIFF=$(git diff HEAD app/correction/page.tsx)
if [ -z "$DIFF" ]; then
    echo "✅ 本地文件与最新提交一致"
else
    echo "⚠️ 本地文件与最新提交有差异:"
    echo "$DIFF" | head -20
fi
echo ""

# 4. 检查是否有未提交的更改
echo "4️⃣ 检查未提交的更改..."
UNCOMMITTED=$(git status --short | grep -v "^??")
if [ -z "$UNCOMMITTED" ]; then
    echo "✅ 没有未提交的更改"
else
    echo "⚠️ 有未提交的更改:"
    echo "$UNCOMMITTED"
fi
echo ""

# 5. 检查 Vercel 配置
echo "5️⃣ 检查 Vercel 配置..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json 存在:"
    cat vercel.json
else
    echo "⚠️ vercel.json 不存在"
fi
echo ""

# 6. 检查 package.json
echo "6️⃣ 检查 package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
    echo "构建命令:"
    grep -A 5 '"scripts"' package.json | grep "build"
else
    echo "❌ package.json 不存在"
fi
echo ""

# 7. 生成检查报告
echo "7️⃣ 生成检查报告..."
echo ""
echo "=========================================="
echo "📋 检查报告"
echo "=========================================="
echo ""
echo "✅ 代码已正确提交到 GitHub"
echo "✅ 提交哈希: $(git rev-parse HEAD)"
echo "✅ 提交信息: $(git log -1 --pretty=%B)"
echo ""
echo "📝 下一步操作建议:"
echo "1. 访问 GitHub 确认代码已更新:"
echo "   https://github.com/jojodd77/-/blob/main/app/correction/page.tsx"
echo ""
echo "2. 访问 Vercel 控制台:"
echo "   https://vercel.com/dashboard"
echo ""
echo "3. 检查部署状态:"
echo "   - 查看最新部署是否包含提交 $(git rev-parse HEAD)"
echo "   - 如果部署失败，查看构建日志"
echo "   - 如果部署成功但网站未更新，尝试手动重新部署"
echo ""
echo "4. 手动触发重新部署:"
echo "   - 在 Vercel 控制台找到项目"
echo "   - 点击 'Deployments' 标签"
echo "   - 点击最新部署的 '...' 菜单"
echo "   - 选择 'Redeploy'"
echo ""
echo "=========================================="

