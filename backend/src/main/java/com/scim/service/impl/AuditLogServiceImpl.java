package com.scim.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scim.dto.response.ActivityLogResponse;
import com.scim.dto.response.AuditLogResponse;
import com.scim.dto.response.PageResponse;
import com.scim.entity.ActivityLog;
import com.scim.entity.AuditLog;
import com.scim.mapper.ActivityLogMapper;
import com.scim.mapper.AuditLogMapper;
import com.scim.repository.ActivityLogRepository;
import com.scim.repository.AuditLogRepository;
import com.scim.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ActivityLogRepository activityLogRepository;
    private final AuditLogMapper auditLogMapper;
    private final ActivityLogMapper activityLogMapper;
    private final ObjectMapper objectMapper;
    private final HttpServletRequest request;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logChange(String entityName, Long entityId, String action, Object oldValue, Object newValue) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityName(entityName)
                    .entityId(entityId)
                    .action(action)
                    .oldValue(toJson(oldValue))
                    .newValue(toJson(newValue))
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to log change for entity {}: {}", entityName, e.getMessage(), e);
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logActivity(String description) {
        try {
            ActivityLog activityLog = ActivityLog.builder()
                    .description(description)
                    .ipAddress(getClientIp())
                    .build();
            activityLogRepository.save(activityLog);
        } catch (Exception e) {
            log.error("Failed to log activity: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogs(String entityName, Long entityId, String action, Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findWithFilters(entityName, entityId, action, pageable);
        Page<AuditLogResponse> responsePage = page.map(auditLogMapper::toResponse);
        return PageResponse.of(
                responsePage.getContent(),
                responsePage.getNumber(),
                responsePage.getSize(),
                responsePage.getTotalElements(),
                responsePage.getTotalPages()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ActivityLogResponse> getActivityLogs(String search, Pageable pageable) {
        Page<ActivityLog> page = activityLogRepository.findWithFilters(search, pageable);
        Page<ActivityLogResponse> responsePage = page.map(activityLogMapper::toResponse);
        return PageResponse.of(
                responsePage.getContent(),
                responsePage.getNumber(),
                responsePage.getSize(),
                responsePage.getTotalElements(),
                responsePage.getTotalPages()
        );
    }

    private String getClientIp() {
        if (request == null) return "SYSTEM";
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("Failed to serialize audit log object: {}", e.getMessage());
            return obj.toString();
        }
    }
}
