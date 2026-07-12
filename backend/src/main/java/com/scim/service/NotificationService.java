package com.scim.service;

import com.scim.dto.response.NotificationResponse;
import com.scim.dto.response.PageResponse;
import com.scim.entity.NotificationType;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    NotificationResponse create(Long userId, String title, String content, NotificationType type);
    PageResponse<NotificationResponse> getMyNotifications(Boolean isRead, Pageable pageable);
    long getMyUnreadCount();
    void markAsRead(Long id);
    void markAllAsRead();
}
