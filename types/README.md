# Types 目录

这里存放 TypeScript 类型定义。

## 规范

- 使用 `.ts` 文件（不是 `.tsx`）
- 类型定义使用 PascalCase
- 接口使用 `interface`，类型别名使用 `type`
- 导出类型以便在其他文件中使用

## 示例

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export type UserRole = 'admin' | 'user' | 'guest';
```

