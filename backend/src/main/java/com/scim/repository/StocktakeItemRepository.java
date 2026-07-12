package com.scim.repository;

import com.scim.entity.StocktakeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StocktakeItemRepository extends JpaRepository<StocktakeItem, Long> {

    @Query("SELECT i FROM StocktakeItem i WHERE i.session.id = :sessionId " +
           "AND i.product.id = :productId " +
           "AND i.location.id = :locationId " +
           "AND ((:batchId IS NULL AND i.batch IS NULL) OR i.batch.id = :batchId)")
    Optional<StocktakeItem> findBySessionAndDetails(@Param("sessionId") Long sessionId,
                                                    @Param("productId") Long productId,
                                                    @Param("locationId") Long locationId,
                                                    @Param("batchId") Long batchId);
}
