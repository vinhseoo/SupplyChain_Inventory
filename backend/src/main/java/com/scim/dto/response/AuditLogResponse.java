package com.scim.dto.response;

import java.time.LocalDateTime;

public record AuditLogResponse(
    Long id,
    String entityName,
    Long entityId,
    String action,
    String oldValue,
    String newValue,
    LocalDateTime createdAt,
    String createdBy
) {}
