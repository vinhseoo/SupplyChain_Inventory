package com.scim.repository;

import com.scim.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT r FROM Role r WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(r.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:isActive IS NULL OR r.isActive = :isActive)")
    Page<Role> findWithFilters(@Param("search") String search,
                               @Param("isActive") Boolean isActive,
                               Pageable pageable);
}
