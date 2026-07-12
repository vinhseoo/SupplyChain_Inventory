package com.scim.mapper;

import com.scim.dto.response.AuditLogResponse;
import com.scim.entity.AuditLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface AuditLogMapper {
    AuditLogResponse toResponse(AuditLog auditLog);
}
