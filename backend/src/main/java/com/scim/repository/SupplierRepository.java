package com.scim.repository;

import com.scim.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    Optional<Supplier> findByCode(String code);

    @Query("SELECT s FROM Supplier s WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(s.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(s.phone) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(s.contactName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:isActive IS NULL OR s.isActive = :isActive)")
    Page<Supplier> findWithFilters(@Param("search") String search,
                                   @Param("isActive") Boolean isActive,
                                   Pageable pageable);
}
