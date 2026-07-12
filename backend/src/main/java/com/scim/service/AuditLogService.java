package com.scim.service;

import com.scim.dto.response.ActivityLogResponse;
import com.scim.dto.response.AuditLogResponse;
import com.scim.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {
    void logChange(String entityName, Long entityId, String action, Object oldValue, Object newValue);
    void logActivity(String description);
    
    PageResponse<AuditLogResponse> getAuditLogs(String entityName, Long entityId, String action, Pageable pageable);
    PageResponse<ActivityLogResponse> getActivityLogs(String search, Pageable pageable);
}
