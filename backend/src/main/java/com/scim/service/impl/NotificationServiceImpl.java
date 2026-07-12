package com.scim.service.impl;

import com.scim.dto.response.NotificationResponse;
import com.scim.dto.response.PageResponse;
import com.scim.entity.Notification;
import com.scim.entity.NotificationType;
import com.scim.entity.User;
import com.scim.exception.ResourceNotFoundException;
import com.scim.exception.UnauthorizedException;
import com.scim.mapper.NotificationMapper;
import com.scim.repository.NotificationRepository;
import com.scim.repository.UserRepository;
import com.scim.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional
    public NotificationResponse create(Long userId, String title, String content, NotificationType type) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        }

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type(type)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Created notification: {} (User: {})", title, userId != null ? userId : "All");
        return notificationMapper.toResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(Boolean isRead, Pageable pageable) {
        User currentUser = getCurrentUser();
        Page<Notification> page = notificationRepository.findByUserIdOrUserIsNull(currentUser.getId(), isRead, pageable);
        Page<NotificationResponse> responsePage = page.map(notificationMapper::toResponse);
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
    public long getMyUnreadCount() {
        try {
            User currentUser = getCurrentUser();
            return notificationRepository.countUnread(currentUser.getId());
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        
        // Ensure user owns this notification or it is broadcast
        User currentUser = getCurrentUser();
        if (notification.getUser() != null && !notification.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to modify this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        notificationRepository.markAllAsRead(currentUser.getId());
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", auth.getName()));
    }
}
