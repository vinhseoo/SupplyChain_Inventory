import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  WarehouseResponse, 
  WarehouseRequest, 
  LocationNodeResponse,
  TableParams 
} from '@/types';

export const warehouseService = {
  getAll: (params?: TableParams): Promise<ApiResponse<PageResponse<WarehouseResponse>>> => {
    return apiClient.get('/warehouses', { params });
  },

  getById: (id: number): Promise<ApiResponse<WarehouseResponse>> => {
    return apiClient.get(`/warehouses/${id}`);
  },

  create: (data: WarehouseRequest): Promise<ApiResponse<WarehouseResponse>> => {
    return apiClient.post('/warehouses', data);
  },

  update: (id: number, data: WarehouseRequest): Promise<ApiResponse<WarehouseResponse>> => {
    return apiClient.put(`/warehouses/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/warehouses/${id}`);
  },

  getLocationTree: (id: number): Promise<ApiResponse<LocationNodeResponse[]>> => {
    return apiClient.get(`/warehouses/${id}/locations/tree`);
  },
};
