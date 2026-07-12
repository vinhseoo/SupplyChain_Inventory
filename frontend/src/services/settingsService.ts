import { apiClient } from '@/config/apiClient';
import type { ApiResponse } from '@/types';

export interface SystemSettingResponse {
  id: number;
  settingKey: string;
  settingVal: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SystemSettingRequest {
  settingVal: string;
}

export const settingsService = {
  getSettings: (): Promise<ApiResponse<SystemSettingResponse[]>> => {
    return apiClient.get('/system-settings');
  },

  getSettingByKey: (key: string): Promise<ApiResponse<SystemSettingResponse>> => {
    return apiClient.get(`/system-settings/${key}`);
  },

  updateSetting: (key: string, data: SystemSettingRequest): Promise<ApiResponse<SystemSettingResponse>> => {
    return apiClient.put(`/system-settings/${key}`, data);
  },
};
