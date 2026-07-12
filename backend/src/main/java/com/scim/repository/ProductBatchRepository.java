package com.scim.repository;

import com.scim.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {

    Optional<ProductBatch> findByProductIdAndBatchNumber(Long productId, String batchNumber);

    @Query("SELECT pb FROM ProductBatch pb WHERE pb.product.id = :productId " +
           "AND pb.remainingQuantity > 0 " +
           "ORDER BY pb.expiryDate ASC NULLS LAST, pb.productionDate ASC NULLS LAST, pb.id ASC")
    List<ProductBatch> findAvailableBatchesFEFO(@Param("productId") Long productId);

    @Query("SELECT pb FROM ProductBatch pb WHERE pb.product.id = :productId " +
           "AND pb.remainingQuantity > 0 " +
           "ORDER BY pb.createdAt ASC, pb.id ASC")
    List<ProductBatch> findAvailableBatchesFIFO(@Param("productId") Long productId);
}
