package com.scim.repository;

import com.scim.entity.UnitOfMeasure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UnitOfMeasureRepository extends JpaRepository<UnitOfMeasure, Long> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    Optional<UnitOfMeasure> findByCode(String code);

    @Query("SELECT u FROM UnitOfMeasure u WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(u.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:isActive IS NULL OR u.isActive = :isActive)")
    Page<UnitOfMeasure> findWithFilters(@Param("search") String search,
                                        @Param("isActive") Boolean isActive,
                                        Pageable pageable);
}
