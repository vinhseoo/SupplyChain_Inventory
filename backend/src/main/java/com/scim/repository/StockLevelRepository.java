package com.scim.repository;

import com.scim.entity.StockLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface StockLevelRepository extends JpaRepository<StockLevel, Long> {

    @Query("SELECT sl FROM StockLevel sl WHERE sl.product.id = :productId " +
           "AND sl.warehouse.id = :warehouseId " +
           "AND sl.location.id = :locationId " +
           "AND ((:batchId IS NULL AND sl.batch IS NULL) OR sl.batch.id = :batchId)")
    Optional<StockLevel> findStockLevel(@Param("productId") Long productId,
                                        @Param("warehouseId") Long warehouseId,
                                        @Param("locationId") Long locationId,
                                        @Param("batchId") Long batchId);

    @Query("SELECT SUM(sl.quantity) FROM StockLevel sl WHERE sl.product.id = :productId")
    Optional<BigDecimal> getTotalStockByProduct(@Param("productId") Long productId);

    @Query("SELECT SUM(sl.quantity) FROM StockLevel sl WHERE sl.product.id = :productId AND sl.warehouse.id = :warehouseId")
    Optional<BigDecimal> getTotalStockByProductAndWarehouse(@Param("productId") Long productId,
                                                            @Param("warehouseId") Long warehouseId);

    @Query("SELECT sl FROM StockLevel sl WHERE " +
           "(:warehouseId IS NULL OR sl.warehouse.id = :warehouseId) " +
           "AND (:productId IS NULL OR sl.product.id = :productId) " +
           "AND (:locationId IS NULL OR sl.location.id = :locationId) " +
           "AND (:search IS NULL OR LOWER(sl.product.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(sl.product.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(sl.product.sku) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<StockLevel> findWithFilters(@Param("warehouseId") Long warehouseId,
                                     @Param("productId") Long productId,
                                     @Param("locationId") Long locationId,
                                     @Param("search") String search,
                                     Pageable pageable);

    @Query("SELECT sl FROM StockLevel sl WHERE sl.product.id = :productId " +
           "AND sl.warehouse.id = :warehouseId " +
           "AND sl.quantity > 0 " +
           "ORDER BY sl.batch.expiryDate ASC NULLS LAST, sl.batch.productionDate ASC NULLS LAST, sl.quantity DESC")
    List<StockLevel> findAvailableStockFEFO(@Param("productId") Long productId,
                                            @Param("warehouseId") Long warehouseId);

    @Query("SELECT sl FROM StockLevel sl WHERE sl.product.id = :productId " +
           "AND sl.warehouse.id = :warehouseId " +
           "AND sl.quantity > 0 " +
           "ORDER BY sl.batch.createdAt ASC NULLS LAST, sl.id ASC")
    List<StockLevel> findAvailableStockFIFO(@Param("productId") Long productId,
                                            @Param("warehouseId") Long warehouseId);
}
