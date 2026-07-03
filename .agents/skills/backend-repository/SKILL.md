---
name: backend-repository
description: Skill để viết Repository layer. Bao gồm custom queries, pagination, và performance patterns.
---

# Backend Repository — Data Access Layer

## Cấu trúc chuẩn

```java
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    // Simple queries - Spring Data auto-generates
    boolean existsByCode(String code);
    Optional<Supplier> findByCode(String code);
    List<Supplier> findByIsActiveTrue();

    // Search with pagination
    Page<Supplier> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);

    // Custom JPQL query
    @Query("SELECT s FROM Supplier s WHERE " +
           "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:isActive IS NULL OR s.isActive = :isActive)")
    Page<Supplier> findWithFilters(@Param("search") String search,
                                   @Param("isActive") Boolean isActive,
                                   Pageable pageable);

    // EntityGraph to avoid N+1
    @EntityGraph(attributePaths = {"warehouse", "location"})
    @Query("SELECT t FROM InventoryTransaction t WHERE t.id = :id")
    Optional<InventoryTransaction> findByIdWithDetails(@Param("id") Long id);
}
```

## Rules
- Extends `JpaRepository<Entity, Long>`
- Ưu tiên derived query methods cho simple queries
- Dùng `@Query` với JPQL cho complex queries
- Native query chỉ khi JPQL không đủ (analytics, aggregation)
- Dùng `@EntityGraph` để tránh N+1 cho associations
- Pagination: dùng `Page<Entity>` return type + `Pageable` parameter
- KHÔNG viết business logic trong Repository
