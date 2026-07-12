package com.scim.repository;

import com.scim.entity.InventoryTransaction;
import com.scim.entity.TransactionStatus;
import com.scim.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("SELECT t FROM InventoryTransaction t WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(t.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(t.note) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate)")
    Page<InventoryTransaction> findWithFilters(@Param("search") String search,
                                               @Param("type") TransactionType type,
                                               @Param("status") TransactionStatus status,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate,
                                               Pageable pageable);
}
