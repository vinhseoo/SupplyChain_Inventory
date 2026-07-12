package com.scim.service;

import com.scim.dto.request.WarehouseRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.WarehouseResponse;
import org.springframework.data.domain.Pageable;

public interface WarehouseService {

    PageResponse<WarehouseResponse> getAll(String search, Pageable pageable);

    WarehouseResponse getById(Long id);

    WarehouseResponse create(WarehouseRequest request);

    WarehouseResponse update(Long id, WarehouseRequest request);

    void delete(Long id);
}
