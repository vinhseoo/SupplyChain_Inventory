package com.scim.dto.response;

import java.time.LocalDateTime;

public record SystemSettingResponse(
    Long id,
    String settingKey,
    String settingVal,
    String description,
    LocalDateTime updatedAt,
    String updatedBy
) {}
