import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  UserResponse, 
  UserCreateRequest, 
  UserUpdateRequest, 
  ChangePasswordRequest, 
  ResetPasswordRequest,
  TableParams 
} from '@/types';

export const userService = {
  getAll: (params?: TableParams): Promise<ApiResponse<PageResponse<UserResponse>>> => {
    return apiClient.get('/users', { params });
  },

  getMe: (): Promise<ApiResponse<UserResponse>> => {
    return apiClient.get('/users/me');
  },

  getById: (id: number): Promise<ApiResponse<UserResponse>> => {
    return apiClient.get(`/users/${id}`);
  },

  create: (data: UserCreateRequest): Promise<ApiResponse<UserResponse>> => {
    return apiClient.post('/users', data);
  },

  update: (id: number, data: UserUpdateRequest): Promise<ApiResponse<UserResponse>> => {
    return apiClient.put(`/users/${id}`, data);
  },

  updateMe: (data: { fullName: string; phone?: string }): Promise<ApiResponse<UserResponse>> => {
    return apiClient.put('/users/me', data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/users/${id}`);
  },

  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    return apiClient.post('/users/change-password', data);
  },

  resetPassword: (id: number, data: ResetPasswordRequest): Promise<ApiResponse<void>> => {
    return apiClient.post(`/users/${id}/reset-password`, data);
  },

  uploadAvatar: (file: File): Promise<ApiResponse<UserResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
