package com.scim.repository;

import com.scim.entity.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    Optional<Warehouse> findByCode(String code);

    @Query("SELECT w FROM Warehouse w WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(w.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(w.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(w.address) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:isActive IS NULL OR w.isActive = :isActive)")
    Page<Warehouse> findWithFilters(@Param("search") String search,
                                    @Param("isActive") Boolean isActive,
                                    Pageable pageable);
}
