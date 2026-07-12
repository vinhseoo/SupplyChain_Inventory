import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  ProductResponse, 
  ProductRequest, 
  ProductImportSummary,
  TableParams 
} from '@/types';

export interface ProductTableParams extends TableParams {
  categoryId?: number;
  uomId?: number;
}

export const productService = {
  getAll: (params?: ProductTableParams): Promise<ApiResponse<PageResponse<ProductResponse>>> => {
    return apiClient.get('/products', { params });
  },

  getById: (id: number): Promise<ApiResponse<ProductResponse>> => {
    return apiClient.get(`/products/${id}`);
  },

  create: (data: ProductRequest): Promise<ApiResponse<ProductResponse>> => {
    return apiClient.post('/products', data);
  },

  update: (id: number, data: ProductRequest): Promise<ApiResponse<ProductResponse>> => {
    return apiClient.put(`/products/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/products/${id}`);
  },

  exportExcel: (params?: { search?: string; categoryId?: number; uomId?: number }): Promise<Blob> => {
    return apiClient.get('/products/export', {
      params,
      responseType: 'blob',
    });
  },

  importExcel: (file: File): Promise<ApiResponse<ProductImportSummary>> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
