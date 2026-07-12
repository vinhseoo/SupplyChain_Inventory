package com.scim.service.impl;

import com.scim.dto.request.WarehouseRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.WarehouseResponse;
import com.scim.entity.Warehouse;
import com.scim.exception.DuplicateResourceException;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.WarehouseMapper;
import com.scim.repository.WarehouseRepository;
import com.scim.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WarehouseResponse> getAll(String search, Pageable pageable) {
        Page<Warehouse> page = warehouseRepository.findWithFilters(search, null, pageable);
        List<WarehouseResponse> content = warehouseMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        return warehouseMapper.toResponse(warehouse);
    }

    @Override
    @Transactional
    public WarehouseResponse create(WarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Warehouse", "code", request.getCode());
        }
        Warehouse warehouse = warehouseMapper.toEntity(request);
        if (request.getIsActive() != null) {
            warehouse.setIsActive(request.getIsActive());
        }
        warehouse = warehouseRepository.save(warehouse);
        log.info("Created warehouse: {}", warehouse.getCode());
        return warehouseMapper.toResponse(warehouse);
    }

    @Override
    @Transactional
    public WarehouseResponse update(Long id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        if (warehouseRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Warehouse", "code", request.getCode());
        }

        warehouseMapper.updateEntity(request, warehouse);
        if (request.getIsActive() != null) {
            warehouse.setIsActive(request.getIsActive());
        }
        warehouse = warehouseRepository.save(warehouse);
        log.info("Updated warehouse: {}", warehouse.getCode());
        return warehouseMapper.toResponse(warehouse);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        warehouse.setIsActive(false);
        warehouseRepository.save(warehouse);
        log.info("Soft deleted warehouse: {}", warehouse.getCode());
    }
}
