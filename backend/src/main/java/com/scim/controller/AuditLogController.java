package com.scim.controller;

import com.scim.dto.response.ActivityLogResponse;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.AuditLogResponse;
import com.scim.dto.response.PageResponse;
import com.scim.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "APIs for querying user activity and data changes audit logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/activity")
    @Operation(summary = "Get user activity logs", description = "Retrieve list of high-level user actions with optional search filter")
    public ResponseEntity<ApiResponse<PageResponse<ActivityLogResponse>>> getActivityLogs(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(auditLogService.getActivityLogs(search, pageable)));
    }

    @GetMapping("/data")
    @Operation(summary = "Get data audit logs", description = "Retrieve list of detailed field modifications for master data entities")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) String action,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(auditLogService.getAuditLogs(entityName, entityId, action, pageable)));
    }
}
