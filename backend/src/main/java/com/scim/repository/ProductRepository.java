package com.scim.repository;

import com.scim.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    Optional<Product> findByCode(String code);

    Optional<Product> findBySku(String sku);

    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.uom " +
           "WHERE (CAST(:search AS string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(p.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(p.sku) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:uomId IS NULL OR p.uom.id = :uomId) " +
           "AND (:isActive IS NULL OR p.isActive = :isActive)")
    Page<Product> findWithFilters(@Param("search") String search,
                                  @Param("categoryId") Long categoryId,
                                  @Param("uomId") Long uomId,
                                  @Param("isActive") Boolean isActive,
                                  Pageable pageable);
}
