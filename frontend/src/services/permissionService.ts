import { apiClient } from '@/config/apiClient';
import type { ApiResponse, PermissionResponse } from '@/types';

export const permissionService = {
  getAll: (): Promise<ApiResponse<PermissionResponse[]>> => {
    return apiClient.get('/permissions');
  },
};
