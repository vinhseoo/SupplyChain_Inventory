package com.scim.repository;

import com.scim.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    Optional<Category> findByCode(String code);

    List<Category> findByParentIdIsNull();

    List<Category> findByParentId(Long parentId);

    @Query("SELECT c FROM Category c WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(c.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:isActive IS NULL OR c.isActive = :isActive)")
    List<Category> findWithFilters(@Param("search") String search, @Param("isActive") Boolean isActive);
}
