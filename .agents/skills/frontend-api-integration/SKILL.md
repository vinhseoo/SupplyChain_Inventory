---
name: frontend-api-integration
description: Skill để tích hợp API backend trong frontend. Bao gồm Axios config, service layer, React Query hooks, và error handling.
---

# Frontend API Integration

## 1. Axios Client Setup
File: `src/config/apiClient.ts`

```typescript
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { message } from 'antd';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - unwrap ApiResponse
apiClient.interceptors.response.use(
  (response) => response.data, // Unwrap: return response.data (ApiResponse)
  async (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || 'An error occurred';

    if (status === 401) {
      // Try refresh token or redirect to login
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } else if (status === 403) {
      message.error('You do not have permission to perform this action');
    } else if (status >= 500) {
      message.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);
```

## 2. Service Layer Pattern
File: `src/services/<entity>Service.ts`

```typescript
import { apiClient } from '@/config/apiClient';
import type { ApiResponse, PageResponse } from '@/types';

// Define all API calls for one entity in one file
export const supplierService = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<PageResponse<SupplierResponse>>>('/suppliers', { params }),

  getById: (id: number) =>
    apiClient.get<ApiResponse<SupplierResponse>>(`/suppliers/${id}`),

  create: (data: SupplierRequest) =>
    apiClient.post<ApiResponse<SupplierResponse>>('/suppliers', data),

  update: (id: number, data: SupplierRequest) =>
    apiClient.put<ApiResponse<SupplierResponse>>(`/suppliers/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/suppliers/${id}`),
};
```

## 3. React Query Integration

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/services/supplierService';
import { message } from 'antd';

// Query keys as constants
const QUERY_KEYS = {
  all: ['suppliers'] as const,
  list: (params: Record<string, unknown>) => ['suppliers', 'list', params] as const,
  detail: (id: number) => ['suppliers', 'detail', id] as const,
};

// Read hooks
export const useSuppliers = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: QUERY_KEYS.list(params ?? {}),
    queryFn: () => supplierService.getAll(params),
  });

// Write hooks
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      message.success('Created successfully');
    },
  });
};
```

## Rules
- Axios interceptor unwraps `ApiResponse` automatically
- Service files: one file per entity/resource
- React Query keys: use constants, structured as arrays
- `staleTime`: master data = 5 min, transactions = 30 sec
- KHÔNG gọi API trực tiếp trong components — qua service + hook
- Error handling: global (interceptor) + local (onError callback)
