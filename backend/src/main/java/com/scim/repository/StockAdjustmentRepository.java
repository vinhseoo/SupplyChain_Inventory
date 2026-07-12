package com.scim.repository;

import com.scim.entity.StockAdjustment;
import com.scim.entity.StockAdjustmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {

    boolean existsByCode(String code);

    @EntityGraph(attributePaths = {"warehouse"})
    @Query("SELECT a FROM StockAdjustment a WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(a.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:warehouseId IS NULL OR a.warehouse.id = :warehouseId) " +
           "AND (:status IS NULL OR a.status = :status)")
    Page<StockAdjustment> findWithFilters(@Param("search") String search,
                                          @Param("warehouseId") Long warehouseId,
                                          @Param("status") StockAdjustmentStatus status,
                                          Pageable pageable);

    @EntityGraph(attributePaths = {"warehouse", "items", "items.product", "items.location", "items.batch"})
    @Query("SELECT a FROM StockAdjustment a WHERE a.id = :id")
    Optional<StockAdjustment> findByIdWithDetails(@Param("id") Long id);
}
