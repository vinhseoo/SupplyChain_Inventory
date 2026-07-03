---
name: frontend-component
description: Skill để tạo reusable component trong frontend React. Bao gồm props typing, composition pattern, và best practices.
---

# Frontend Component — Reusable Components

## Cấu trúc component

```tsx
import { type FC } from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending';
  size?: 'small' | 'default';
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, size = 'default' }) => {
  const config = {
    active:   { color: '#52C41A', text: 'Hoạt động' },
    inactive: { color: '#FF4D4F', text: 'Ngừng hoạt động' },
    pending:  { color: '#FAAD14', text: 'Chờ duyệt' },
  };

  const { color, text } = config[status];

  return <Tag color={color}>{text}</Tag>;
};
```

## Shared Components Location

```
src/components/
├── ui/           # Design system primitives
│   ├── StatusBadge.tsx
│   └── StatCard.tsx
├── layout/       # Layout components
│   ├── AppLayout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── PageContainer.tsx
└── common/       # Reusable business components
    ├── DataTable.tsx
    ├── FormModal.tsx
    └── SearchInput.tsx
```

## Rules
- Props interface PHẢI được type rõ ràng (KHÔNG dùng `any`)
- Dùng `FC<Props>` hoặc function declaration
- Named exports only (KHÔNG default export)
- Mỗi file chỉ export 1 component chính
- Dùng `React.memo()` cho components nhận complex props
- Destructure props trong function signature
- Default values trong destructuring, KHÔNG dùng `defaultProps`
