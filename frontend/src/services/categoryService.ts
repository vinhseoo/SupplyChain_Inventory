import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  CategoryResponse, 
  CategoryRequest 
} from '@/types';

export const categoryService = {
  getAll: (search?: string): Promise<ApiResponse<CategoryResponse[]>> => {
    return apiClient.get('/categories', { params: { search } });
  },

  getById: (id: number): Promise<ApiResponse<CategoryResponse>> => {
    return apiClient.get(`/categories/${id}`);
  },

  create: (data: CategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
    return apiClient.post('/categories', data);
  },

  update: (id: number, data: CategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
    return apiClient.put(`/categories/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/categories/${id}`);
  },
};
