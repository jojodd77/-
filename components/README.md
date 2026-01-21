# Components 目录

这里存放可复用的 React 组件。

## 组件规范

- 使用 TypeScript
- 使用函数式组件
- 组件文件使用 PascalCase 命名
- 每个组件应该有明确的 Props 类型定义

## 示例

```typescript
// Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};
```



