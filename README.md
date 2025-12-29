# 发音修正平台

一个现代化的发音修正工具平台，用于TTS（文本转语音）发音修正和优化。

**GitHub 仓库**: https://github.com/jojodd77/-

## ✨ 功能特性

- 🔍 **发音判断修正**：智能判断文本是否符合发音规则，不符合则自动修正
- 📜 **历史记录**：查看用户的输入历史记录
- 📖 **规则查看**：提供规则文档，方便用户查看发音规则
- 🚀 基于 Next.js 14+ 的全栈框架
- TypeScript 类型安全
- 🎨 Tailwind CSS 样式系统
- 📱 响应式设计

## 🛠️ 技术栈

- **前端框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: (待配置)
- **部署**: Vercel (推荐)

## 📦 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3001](http://localhost:3001) 查看结果。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
my-tool-platform/
├── app/                # Next.js App Router 页面
│   ├── api/           # API 路由
│   ├── (routes)/      # 页面路由
│   └── layout.tsx     # 根布局
├── components/         # React 组件
├── lib/               # 工具函数和配置
├── public/            # 静态资源
├── types/             # TypeScript 类型定义
└── styles/            # 全局样式
```

## 🔧 环境变量

复制 `.env.example` 为 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

## 📝 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 提交信息使用 Conventional Commits 规范
- 功能开发使用 feature 分支

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请提交 Issue。

