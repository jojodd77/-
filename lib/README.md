# Lib 目录

这里存放工具函数、配置文件和第三方库的封装。

## 目录结构建议

```
lib/
├── utils/          # 通用工具函数
├── constants/      # 常量定义
├── config/         # 配置文件
└── api/            # API 客户端封装
```

## 示例

```typescript
// lib/utils/format.ts
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN').format(date);
};

// lib/constants/index.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

