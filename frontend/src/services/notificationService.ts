import { apiClient } from '@/config/apiClient';
import type { ApiResponse, PageResponse, TableParams } from '@/types';

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

export interface NotificationResponse {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  createdBy: string;
}

export interface NotificationFilterParams extends TableParams {
  isRead?: boolean;
}

export const notificationService = {
  getNotifications: (params?: NotificationFilterParams): Promise<ApiResponse<PageResponse<NotificationResponse>>> => {
    return apiClient.get('/notifications', { params });
  },

  getUnreadCount: (): Promise<ApiResponse<number>> => {
    return apiClient.get('/notifications/unread-count');
  },

  markAsRead: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: (): Promise<ApiResponse<void>> => {
    return apiClient.put('/notifications/read-all');
  },
};
