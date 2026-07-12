package com.scim.dto.response;

import java.time.LocalDateTime;

public record ActivityLogResponse(
    Long id,
    String description,
    String ipAddress,
    LocalDateTime createdAt,
    String createdBy
) {}
