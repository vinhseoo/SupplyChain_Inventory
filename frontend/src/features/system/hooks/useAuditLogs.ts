import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/auditService';
import type { ActivityLogFilterParams, AuditLogFilterParams } from '@/services/auditService';

export const useActivityLogs = (params?: ActivityLogFilterParams) => {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: () => auditService.getActivityLogs(params).then(res => res.data),
  });
};

export const useAuditLogs = (params?: AuditLogFilterParams) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditService.getAuditLogs(params).then(res => res.data),
  });
};
