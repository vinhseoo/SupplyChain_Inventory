import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  LocationResponse, 
  LocationRequest 
} from '@/types';

export const locationService = {
  getById: (id: number): Promise<ApiResponse<LocationResponse>> => {
    return apiClient.get(`/locations/${id}`);
  },

  create: (data: LocationRequest): Promise<ApiResponse<LocationResponse>> => {
    return apiClient.post('/locations', data);
  },

  update: (id: number, data: LocationRequest): Promise<ApiResponse<LocationResponse>> => {
    return apiClient.put(`/locations/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/locations/${id}`);
  },

  getByWarehouse: (warehouseId: number): Promise<ApiResponse<LocationResponse[]>> => {
    return apiClient.get(`/locations/warehouse/${warehouseId}`);
  },
};
