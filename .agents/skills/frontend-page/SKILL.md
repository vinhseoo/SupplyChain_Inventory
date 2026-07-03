---
name: frontend-page
description: Skill để tạo page mới trong frontend React. Bao gồm route setup, layout integration, data fetching, và permission check.
---

# Frontend Page — Tạo Page Mới

## Quy trình tạo page mới

### Step 1: Tạo feature folder
```
src/features/<feature-name>/
├── components/        # Components riêng cho feature
├── pages/             # Page components
│   ├── <Feature>ListPage.tsx
│   └── <Feature>DetailPage.tsx
├── hooks/             # Custom hooks (optional)
├── types.ts           # Types riêng (optional)
└── index.ts           # Public exports
```

### Step 2: Tạo API service
File: `src/services/<feature>Service.ts`

```typescript
import { apiClient } from '@/config/apiClient';
import type { PageResponse, SupplierResponse, SupplierRequest } from '@/types';

const BASE_URL = '/suppliers';

export const supplierService = {
  getAll: (params?: { page?: number; size?: number; search?: string }) =>
    apiClient.get<PageResponse<SupplierResponse>>(BASE_URL, { params }),

  getById: (id: number) =>
    apiClient.get<SupplierResponse>(`${BASE_URL}/${id}`),

  create: (data: SupplierRequest) =>
    apiClient.post<SupplierResponse>(BASE_URL, data),

  update: (id: number, data: SupplierRequest) =>
    apiClient.put<SupplierResponse>(`${BASE_URL}/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`${BASE_URL}/${id}`),
};
```

### Step 3: Tạo React Query hook
File: `src/features/<feature>/hooks/use<Feature>.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/services/supplierService';
import { message } from 'antd';

export const useSuppliers = (params?: { page?: number; size?: number; search?: string }) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => supplierService.getAll(params),
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      message.success('Tạo nhà cung cấp thành công');
    },
    onError: () => {
      message.error('Tạo nhà cung cấp thất bại');
    },
  });
};
```

### Step 4: Tạo page component
File: `src/features/<feature>/pages/<Feature>ListPage.tsx`

```tsx
import { useState } from 'react';
import { Button, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import { useSuppliers } from '../hooks/useSuppliers';

export const SupplierListPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const { data, isLoading } = useSuppliers({ page, search });

  return (
    <PageContainer
      title="Quản lý Nhà cung cấp"
      extra={<Button type="primary" icon={<PlusOutlined />}>Thêm mới</Button>}
    >
      <DataTable
        loading={isLoading}
        dataSource={data?.data?.content}
        columns={columns}
        pagination={{
          current: page + 1,
          total: data?.data?.totalElements,
          onChange: (p) => setPage(p - 1),
        }}
      />
    </PageContainer>
  );
};
```

### Step 5: Thêm route
File: `src/App.tsx` (hoặc router config)

```tsx
import { SupplierListPage } from '@/features/supplier/pages/SupplierListPage';

// Trong routes config:
{ path: '/suppliers', element: <SupplierListPage /> }
```

### Step 6: Thêm menu item
Thêm vào sidebar menu config.

## Rules
- Page component chỉ dùng cho routing — logic trong hooks
- Data fetching qua React Query hooks
- Loading state: dùng DataTable built-in loading hoặc Skeleton
- Error state: handled by Axios interceptor (global) hoặc React Query onError
- Page title phải descriptive (cho SEO nếu cần)
