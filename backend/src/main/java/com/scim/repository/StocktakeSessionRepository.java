package com.scim.repository;

import com.scim.entity.StocktakeSession;
import com.scim.entity.StocktakeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StocktakeSessionRepository extends JpaRepository<StocktakeSession, Long> {

    boolean existsByCode(String code);

    @EntityGraph(attributePaths = {"warehouse"})
    @Query("SELECT s FROM StocktakeSession s WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(s.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:warehouseId IS NULL OR s.warehouse.id = :warehouseId) " +
           "AND (:status IS NULL OR s.status = :status)")
    Page<StocktakeSession> findWithFilters(@Param("search") String search,
                                           @Param("warehouseId") Long warehouseId,
                                           @Param("status") StocktakeStatus status,
                                           Pageable pageable);

    @EntityGraph(attributePaths = {"warehouse", "items", "items.product", "items.location", "items.batch"})
    @Query("SELECT s FROM StocktakeSession s WHERE s.id = :id")
    Optional<StocktakeSession> findByIdWithDetails(@Param("id") Long id);
}
