import { apiClient } from '@/config/apiClient';
import type { ApiResponse, LoginRequest, LoginResponse } from '@/types';

export const authService = {
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post('/auth/login', data);
  },

  refresh: (refreshToken: string): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  logout: (refreshToken: string): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/logout', { refreshToken });
  },
};
