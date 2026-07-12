import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  SupplierResponse, 
  SupplierRequest, 
  TableParams 
} from '@/types';

export const supplierService = {
  getAll: (params?: TableParams): Promise<ApiResponse<PageResponse<SupplierResponse>>> => {
    return apiClient.get('/suppliers', { params });
  },

  getById: (id: number): Promise<ApiResponse<SupplierResponse>> => {
    return apiClient.get(`/suppliers/${id}`);
  },

  create: (data: SupplierRequest): Promise<ApiResponse<SupplierResponse>> => {
    return apiClient.post('/suppliers', data);
  },

  update: (id: number, data: SupplierRequest): Promise<ApiResponse<SupplierResponse>> => {
    return apiClient.put(`/suppliers/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/suppliers/${id}`);
  },

  exportExcel: (search?: string): Promise<Blob> => {
    return apiClient.get('/suppliers/export', {
      params: { search },
      responseType: 'blob',
    });
  },
};
