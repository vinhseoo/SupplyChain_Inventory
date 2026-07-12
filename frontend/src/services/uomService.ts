import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  UnitOfMeasureResponse, 
  UnitOfMeasureRequest, 
  TableParams 
} from '@/types';

export const uomService = {
  getAll: (params?: TableParams): Promise<ApiResponse<PageResponse<UnitOfMeasureResponse>>> => {
    return apiClient.get('/units-of-measure', { params });
  },

  getById: (id: number): Promise<ApiResponse<UnitOfMeasureResponse>> => {
    return apiClient.get(`/units-of-measure/${id}`);
  },

  create: (data: UnitOfMeasureRequest): Promise<ApiResponse<UnitOfMeasureResponse>> => {
    return apiClient.post('/units-of-measure', data);
  },

  update: (id: number, data: UnitOfMeasureRequest): Promise<ApiResponse<UnitOfMeasureResponse>> => {
    return apiClient.put(`/units-of-measure/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/units-of-measure/${id}`);
  },
};
