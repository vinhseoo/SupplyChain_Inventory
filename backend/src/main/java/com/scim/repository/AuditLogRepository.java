package com.scim.repository;

import com.scim.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:entityName IS NULL OR LOWER(a.entityName) = LOWER(:entityName)) AND " +
           "(:entityId IS NULL OR a.entityId = :entityId) AND " +
           "(:action IS NULL OR a.action = :action)")
    Page<AuditLog> findWithFilters(@Param("entityName") String entityName,
                                   @Param("entityId") Long entityId,
                                   @Param("action") String action,
                                   Pageable pageable);
}
