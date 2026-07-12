package com.scim.dto.response;

import com.scim.entity.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    String title,
    String content,
    NotificationType type,
    Boolean isRead,
    LocalDateTime createdAt,
    String createdBy
) {}
