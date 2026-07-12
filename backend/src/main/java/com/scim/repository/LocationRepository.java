package com.scim.repository;

import com.scim.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    Optional<Location> findByCode(String code);

    List<Location> findByWarehouseId(Long warehouseId);

    List<Location> findByWarehouseIdAndParentIdIsNull(Long warehouseId);

    List<Location> findByParentId(Long parentId);
}
