import { apiClient } from '@/config/apiClient';
import type { ApiResponse, PageResponse, TableParams } from '@/types';

export interface ActivityLogResponse {
  id: number;
  description: string;
  ipAddress: string;
  createdAt: string;
  createdBy: string;
}

export interface AuditLogResponse {
  id: number;
  entityName: string;
  entityId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  oldValue: string; // JSON string
  newValue: string; // JSON string
  createdAt: string;
  createdBy: string;
}

export interface ActivityLogFilterParams extends TableParams {
  search?: string;
}

export interface AuditLogFilterParams extends TableParams {
  entityName?: string;
  entityId?: number;
  action?: string;
}

export const auditService = {
  getActivityLogs: (params?: ActivityLogFilterParams): Promise<ApiResponse<PageResponse<ActivityLogResponse>>> => {
    return apiClient.get('/audit-logs/activity', { params });
  },

  getAuditLogs: (params?: AuditLogFilterParams): Promise<ApiResponse<PageResponse<AuditLogResponse>>> => {
    return apiClient.get('/audit-logs/data', { params });
  },
};
