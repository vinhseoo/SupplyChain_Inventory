package com.scim.repository;

import com.scim.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE (n.user.id = :userId OR n.user IS NULL) AND (:isRead IS NULL OR n.isRead = :isRead)")
    Page<Notification> findByUserIdOrUserIsNull(@Param("userId") Long userId, @Param("isRead") Boolean isRead, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.user.id = :userId OR n.user IS NULL) AND n.isRead = false")
    long countUnread(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE (n.user.id = :userId OR n.user IS NULL) AND n.isRead = false")
    void markAllAsRead(@Param("userId") Long userId);

    boolean existsByTitleAndContentAndCreatedAtAfter(String title, String content, java.time.LocalDateTime dateTime);
}
