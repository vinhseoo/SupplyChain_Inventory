package com.scim.repository;

import com.scim.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("SELECT sm FROM StockMovement sm WHERE " +
           "(:productId IS NULL OR sm.product.id = :productId) " +
           "AND (:warehouseId IS NULL OR sm.warehouse.id = :warehouseId) " +
           "AND (:locationId IS NULL OR sm.location.id = :locationId) " +
           "AND (:startDate IS NULL OR sm.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR sm.createdAt <= :endDate) " +
           "ORDER BY sm.createdAt DESC, sm.id DESC")
    Page<StockMovement> findStockCard(@Param("productId") Long productId,
                                      @Param("warehouseId") Long warehouseId,
                                      @Param("locationId") Long locationId,
                                      @Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate,
                                      Pageable pageable);
}
