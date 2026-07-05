import { apiClient } from '@/config/apiClient';
import type { ApiResponse, PageResponse, RoleRequest, RoleResponse, TableParams } from '@/types';

export const roleService = {
  getAll: (params?: TableParams): Promise<ApiResponse<PageResponse<RoleResponse>>> => {
    return apiClient.get('/roles', { params });
  },

  getAllActive: (): Promise<ApiResponse<RoleResponse[]>> => {
    return apiClient.get('/roles/active');
  },

  getById: (id: number): Promise<ApiResponse<RoleResponse>> => {
    return apiClient.get(`/roles/${id}`);
  },

  create: (data: RoleRequest): Promise<ApiResponse<RoleResponse>> => {
    return apiClient.post('/roles', data);
  },

  update: (id: number, data: RoleRequest): Promise<ApiResponse<RoleResponse>> => {
    return apiClient.put(`/roles/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/roles/${id}`);
  },
};
