package com.scim.repository;

import com.scim.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query("SELECT a FROM ActivityLog a WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(a.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(a.createdBy) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<ActivityLog> findWithFilters(@Param("search") String search, Pageable pageable);
}
